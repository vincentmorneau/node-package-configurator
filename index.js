'use strict';

const fs = require('fs');
const path = require('path');
const opn = require('opn');
const bodyParser = require('body-parser');
const portscanner = require('portscanner');
const express = require('express');
const jsonMapping = require('json-mapping');
const handlebars = require('./lib/handlebars');
const util = require('./lib/util');

const app = express();

const localhost = '127.0.0.1';
const portStart = 3000;
const portEnd = 3999;

const writeConfig = function (module, config) {
	// Gets the local path for where to save the config
	const modulePath = util.getLocalUserConfigPath(module);
	// Ensure that the config directory exists
	util.makeDirectoryStructure(modulePath);
	// Writing to config with the new data
	fs.writeFileSync(modulePath, JSON.stringify(config, null, 4));
};

module.exports = {
	init(opts) {
		// Set defaults
		const defaults = {
			project: 'Default',
			mapping: []
		};
		opts = Object.assign(defaults, opts);

		// Validate arguments
		if (typeof opts.module === 'undefined') {
			throw new TypeError('module is required.');
		}

		if (typeof opts.jsonSchema === 'undefined') {
			throw new TypeError('jsonSchema is required.');
		}

		if (typeof opts.project === 'undefined') {
			opts.project = 'Default';
		}

		// Support json encoded bodies
		app.use(bodyParser.json());
		// Support encoded bodies
		app.use(bodyParser.urlencoded({
			extended: true
		}));
		// Serve static files
		app.use(express.static(path.join(__dirname, 'lib/src')));

		// Get json form
		app.get('/', (req, res) => {
			const configs = this.getConfig({
				module: opts.module
			});
			const result = handlebars.compile(configs, opts);

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
				const config = this.getConfig({
					module: opts.module,
					project: req.params.projectName,
					mapping: opts.mapping
				});

				res.send({
					success: true,
					config,
					buttons: handlebars.buttons(true)
				});
			} catch (err) {
				res.send({
					success: false,
					message: err
				});
			}
		});

		// Save project
		app.post('/save', (req, res) => {
			try {
				const configs = this.getConfig({
					module: opts.module
				});
				// Overwritting the current project in the main config object
				configs[req.body.project] = req.body.config;
				writeConfig(opts.module, configs);
				res.send({
					success: true,
					buttons: handlebars.buttons(true),
					menu: util.getMenu(this.getProjects({
						module: opts.module
					}), req.body.project)
				});
			} catch (err) {
				res.send({
					success: false,
					message: err
				});
			}
		});

		// Delete project
		app.post('/delete', (req, res) => {
			try {
				const configs = this.getConfig({
					module: opts.module
				});
				delete configs[req.body.project];
				writeConfig(opts.module, configs);
				res.send({
					success: true,
					buttons: handlebars.buttons(false),
					menu: util.getMenu(this.getProjects({
						module: opts.module
					}), req.body.project)
				});
			} catch (err) {
				console.error(err);
				res.send({
					success: false,
					message: err
				});
			}
		});

		// Listen and open express server with an available port
		portscanner.findAPortNotInUse(portStart, portEnd, localhost, (error, port) => {
			app.listen(port, () => {
				opn('http://localhost:' + port);
			});
		});
	},

	getConfig(opts) {
		// Set defaults
		const defaults = {
			mapping: []
		};
		opts = Object.assign(defaults, opts);

		// Validate arguments
		if (typeof opts.module === 'undefined') {
			throw new TypeError('module is required.');
		}

		// Get the local config
		const configs = util.getLocalUserConfig(opts.module);

		// If project is provided, let's return this project config
		// otherwise let's return all projects configs
		if (opts.project) {
			// Verifies if given project exists
			if (typeof configs[opts.project] === 'undefined') {
				throw new TypeError(`Project ${opts.project} doesn't exist in your configuration.`);
			}

			return jsonMapping.map(configs[opts.project], opts.mapping);
		}
		return configs;
	},

	getProjects(opts) {
		// Validate arguments
		if (typeof opts.module === 'undefined') {
			throw new TypeError('module is required.');
		}

		const configs = util.getLocalUserConfig(opts.module);

		return Object.keys(configs);
	}
};
