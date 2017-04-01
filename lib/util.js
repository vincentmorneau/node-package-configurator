'use strict';

const path = require('path');
const fs = require('fs');

module.exports = {
    // Returns the local path for the user config (windows, mac, linux)
	getLocalUserConfigPath(module) {
		const localPath =
            // Use process.env.APPDATA for Windows (default)
            process.env.APPDATA ||
            // Process.env.APPDATA is undefined, then use darwin platform (Mac)
            (process.platform === 'darwin' ?
                process.env.HOME + '/Library/Preferences' :
                // If process.platform is not darwin, then it's Linux, use root
                process.env.HOME);
		return path.resolve(localPath + `/.${module}/config.json`);
	},

    // Returns the local path for the user config (windows, mac, linux)
	getLocalUserConfig(module) {
		let userConfig;

		try {
			userConfig = require(this.getLocalUserConfigPath(module));
		} catch (err) {
			userConfig = {};
		}

		return userConfig;
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
		let menu = '';

		Object.keys(data).forEach(function(key) {
			let active = (data[key] === project ? "active" : "");
			menu += `<li class="${active}"><a href="javascript:void(0);" class="project" data-project="${data[key]}">${data[key]}</a></li>`;
		});

		return menu;
	}
};
