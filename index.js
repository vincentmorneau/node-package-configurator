"use strict";

const fs = require('fs');
const path = require('path');
const opn = require('opn');
const objectAssign = require('object-assign');
const bodyParser = require('body-parser');
const portscanner = require('portscanner');
const express = require('express');
const handlebars = require('./lib/handlebars');
const util = require('./lib/util');

const app = express();

const localhost = '127.0.0.1';

const writeConfig = function (module, config) {
	const modulePath = util.getLocalUserConfigPath(module);
    // Ensure that the config directory exists
	util.makeDirectoryStructure(modulePath);
    // Writing to config with the new data
	fs.writeFileSync(modulePath, JSON.stringify(config, null, 4));
};

const validate = function (opts) {
	let exit = false;

	if (opts.module === undefined) {
		console.trace('module\' is a required argument.');
		exit = true;
	}

	if (opts.jsonSchema === undefined) {
		console.trace('jsonSchema\' is a required argument.');
		exit = true;
	}

	if (opts.project === undefined) {
		opts.project = 'Default';
	}

	if (exit) {
		throw new Error();
	}

	return opts;
};

module.exports = {
	init(opts) {
        // Set defaults
		opts = objectAssign({
			project: 'Default'
		}, opts);

        // Validate the options
		opts = validate(opts);

        // Support json encoded bodies
		app.use(bodyParser.json());
        // Support encoded bodies
		app.use(bodyParser.urlencoded({extended: true}));
        // Serve static files
		app.use(express.static(path.join(__dirname, 'lib/src')));

		const userConfig = util.getLocalUserConfig(opts.module);
		const result = handlebars.compile(userConfig, opts);

        // Get json form
		app.get('/', (req, res) => {
			res.writeHead(200, {
				'Content-Type': 'text/html',
				'Content-Length': result.length
			});
			res.write(result);
			res.end();
		});

        // Get project data
		app.get('/project/:projectName', (req, res) => {
			try {
				res.send({
					success: true,
					config: userConfig[req.params.projectName],
					buttons: handlebars.buttons(userConfig[req.params.projectName])
				});
			} catch (err) {
				res.send({success: false, message: err});
			}
		});

        // Save project
		app.post('/save', (req, res) => {
			try {
                // Overwritting the current project in the main config object
				userConfig[req.body.project] = req.body.config;
				writeConfig(opts.module, userConfig);
				res.send({success: true});
			} catch (err) {
				res.send({success: false, message: err});
			}
		});

        // Delete project
		app.post('/delete', (req, res) => {
			try {
				delete userConfig[req.body.project];
				writeConfig(opts.module, userConfig);
				res.send({
					success: true,
					buttons: handlebars.buttons()
				});
			} catch (err) {
				console.error(err);
				res.send({success: false, message: err});
			}
		});

        // Listen and open express server with an available port
		portscanner.findAPortNotInUse(3000, 3999, localhost, (error, port) => {
			app.listen(port, () => {
				opn('http://localhost:' + port);
			});
		});
	},

	getConfig(module, project) {
		const config = util.getLocalUserConfig(module);

		if (project) {
			return config[project];
		}
		return config;
	},

	getProjects(module) {
		const config = util.getLocalUserConfig(module);
		return Object.keys(config);
	}
};
