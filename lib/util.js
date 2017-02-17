var path = require('path');
var fs = require('fs');

module.exports = {
    // returns the local path for the user config (windows, mac, linux)
    getLocalUserConfigPath: function(module) {
        let localPath =
            // use process.env.APPDATA for Windows (default)
            process.env.APPDATA
            // process.env.APPDATA is undefined, then use darwin platform (Mac)
            || (process.platform == 'darwin' ?
                process.env.HOME + '/Library/Preferences'
                // if process.platform is not darwin, then it's Linux, use root
                : process.env.HOME);
        return path.resolve(localPath + `/.${module}/config.json`);
    },

    // returns the local path for the user config (windows, mac, linux)
    getLocalUserConfig: function(module) {
        try {
            var userConfig = require(this.getLocalUserConfigPath(module));
        } catch (e) {
            var userConfig = {};
        }

        return userConfig;
    },

    // ensures that the directory structure exists for a given file
    makeDirectoryStructure: function(filePath) {
        let dirname = path.dirname(filePath);

        if (fs.existsSync(dirname)) {
            return true;
        }

        this.makeDirectoryStructure(dirname);
        fs.mkdirSync(dirname);
    }
};
