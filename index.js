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

module.exports = {
	init(opts) {
		// Set defaults
		const defaults = {
			mapping: []
		};

		opts = Object.assign(defaults, opts);

		if (!Array.isArray(opts.modules)) {
			throw new TypeError('opts.modules should be an array.');
		}

		if (opts.modules.length === 0) {
			throw new Error('opts.modules should contain at least one value.');
		}

		if (typeof opts.jsonSchema === 'undefined') {
			throw new TypeError('opts.jsonSchema is required.');
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
				modules: opts.modules
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
					modules: opts.modules,
					project: req.params.projectName,
					mapping: opts.mapping
				});

				// Send the response back
				res.send({
					success: true,
					config,
					buttons: handlebars.buttons({
						deleteFlag: true
					})
				});
			} catch (error) {
				res.send({
					success: false,
					message: error
				});
			}
		});

		// Save project
		app.post('/save', (req, res) => {
			try {
				const configs = this.getConfig({
					modules: opts.modules
				});

				// If the project name has changed, delete the original entry
				if (req.body.originalProject !== req.body.project) {
					delete configs[req.body.originalProject];
				}

				// Overwritting the current project in the main config object
				configs[req.body.project] = req.body.config;

				// Write the config to disk
				util.write(opts.modules[0], configs);

				// Send the response back
				res.send({
					success: true,
					buttons: handlebars.buttons({
						deleteFlag: true
					}),
					menu: util.getMenu(this.getProjects({
						modules: opts.modules
					}), req.body.project)
				});
			} catch (error) {
				res.send({
					success: false,
					message: error
				});
			}
		});

		// Delete project
		app.post('/delete', (req, res) => {
			try {
				const configs = this.getConfig({
					modules: opts.modules
				});

				// Delete both original project and active project
				delete configs[req.body.originalProject];
				delete configs[req.body.project];

				// Write the config to disk
				util.write(opts.modules[0], configs);

				// Send the response back
				res.send({
					success: true,
					buttons: handlebars.buttons({
						deleteFlag: false
					}),
					menu: util.getMenu(this.getProjects({
						modules: opts.modules
					}), req.body.project)
				});
			} catch (error) {
				console.error(error);
				res.send({
					success: false,
					message: error
				});
			}
		});

		// Listen and open express server with an available port
		portscanner.findAPortNotInUse(portStart, portEnd, localhost, (error, port) => {
			app.listen(port, () => {
				opn('http://localhost:' + port);
				console.log('You can configure your project here: http://localhost:' + port);
			});
		});
	},

	getProjects(opts) {
		if (!Array.isArray(opts.modules)) {
			throw new TypeError('opts.modules should be an array.');
		}

		if (opts.modules.length === 0) {
			throw new Error('opts.modules should contain at least one value.');
		}

		const configs = util.getLocalUserConfig(opts.modules);

		return Object.keys(configs);
	},

	getConfig(opts) {
		// Set defaults
		const defaults = {
			mapping: []
		};
		opts = Object.assign(defaults, opts);

		if (!Array.isArray(opts.modules)) {
			throw new TypeError('opts.modules should be an array.');
		}

		if (opts.modules.length === 0) {
			throw new Error('opts.modules should contain at least one value.');
		}

		// Get the local config
		const configs = util.getLocalUserConfig(opts.modules);

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

	getFile(opts) {
		// Set defaults
		const defaults = {
			mapping: []
		};
		opts = Object.assign(defaults, opts);

		if (!Array.isArray(opts.modules)) {
			throw new TypeError('opts.modules should be an array.');
		}

		if (opts.modules.length === 0) {
			throw new Error('opts.modules should contain at least one value.');
		}

		if (typeof opts.filename === 'undefined') {
			throw new TypeError('opts.filename is required.');
		}

		// Get the local config
		const filePath = path.resolve(util.getLocalUserConfigPath(opts.modules[0], opts.filename));

		try {
			const fileContent = fs.readFileSync(filePath, 'utf8');
			return fileContent;
		} catch (error) {
			return '';
		}
	},

	setFile(opts) {
		// Set defaults
		const defaults = {
			mapping: []
		};
		opts = Object.assign(defaults, opts);

		if (!Array.isArray(opts.modules)) {
			throw new TypeError('opts.modules should be an array.');
		}

		if (opts.modules.length === 0) {
			throw new Error('opts.modules should contain at least one value.');
		}

		if (typeof opts.content === 'undefined') {
			throw new TypeError('opts.content is required.');
		}

		if (typeof opts.filename === 'undefined') {
			throw new TypeError('opts.filename is required.');
		}

		// Write the content to disk
		util.write(opts.modules[0], opts.content, opts.filename);
	}
};
