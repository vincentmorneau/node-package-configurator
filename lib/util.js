'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {
	// Returns the local path for the user config (windows, mac, linux)
	getLocalUserConfigPathV1(module, filename = 'config.json') {
		const localPath =
			// Use process.env.APPDATA for Windows (default)
			process.env.APPDATA ||
			// Process.env.APPDATA is undefined, then use darwin platform (Mac)
			(process.platform === 'darwin' ?
				process.env.HOME + '/Library/Preferences' :
				// If process.platform is not darwin, then it's Linux, use root
				process.env.HOME);
		return path.resolve(localPath, `.${module}`, filename);
	},

	// Returns the local path for the user config
	getLocalUserConfigPath(module, filename = 'config.json') {
		const localPath =
			// Use process.env.APPDATA for Windows (default)
			process.env.APPDATA ||
			// Process.env.APPDATA is undefined, then use process.env.HOME
			process.env.HOME;
		return path.resolve(localPath, `.${module}`, filename);
	},

	// Returns the config file for a given module (windows, mac, linux)
	getLocalUserConfig(modules, filename = 'config.json') {
		let userConfig;

		Object.keys(modules).forEach(key => {
			if (userConfig === undefined) {
				try {
					userConfig = require(this.getLocalUserConfigPath(modules[key], filename));
				} catch (error) {
					try {
						userConfig = require(this.getLocalUserConfigPathV1(modules[key], filename));
					} catch (error) {} // Do nothing when the path could not be read
				}
			}
		});

		return userConfig || {};
	},

	// Ensures that the directory structure exists for a given file
	makeDirectoryStructure(filePath) {
		const dirname = path.dirname(filePath);

		if (fs.existsSync(dirname)) {
			return true;
		}

		this.makeDirectoryStructure(dirname);
		fs.mkdirSync(dirname);
	},

	getMenu(data, project) {
		let menu = `
			<li><a class="subheader">Actions</a></li>
			<li><a class="create"><i class="material-icons">add</i>Add new project</a></li>
			<li><a class="import"><i class="material-icons">cloud_download</i>
				<div class="file-field input-field">
				  <div class="">
					<span>Import</span>
					<input id="import" type="file">
				  </div>
				  <div class="file-path-wrapper">
					<input class="file-path validate" type="text">
				  </div>
				</div>
			</a></li>
			<li><a class="export"><i class="material-icons">cloud_upload</i>Export</a></li>
			<li><div class="divider"></div></li>
			<li><a class="subheader">Available Projects</a></li>`;

		data.sort();
		Object.keys(data).forEach(key => {
			const active = (data[key] === project ? 'active' : '');
			menu += `<li class="${active}"><a href="javascript:void(0);" class="project" data-project="${data[key]}">${data[key]}</a></li>`;
		});

		return menu;
	},

	write(module, content, filename = 'config.json') {
		// Gets the local path for where to save the config
		const modulePath = this.getLocalUserConfigPath(module, filename);
		// Ensure that the config directory exists
		this.makeDirectoryStructure(modulePath);
		// Writing to config with the new data
		fs.writeFileSync(modulePath, JSON.stringify(content, null, 2));
	}
};
