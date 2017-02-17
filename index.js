const opn = require("opn");
const localhost = "127.0.0.1";
const objectAssign = require("object-assign");

var bodyParser = require("body-parser"),
    express = require("express"),
    handlebars = require("./lib/handlebars"),
    fs = require("fs"),
    path = require("path"),
    portscanner = require("portscanner"),
    util = require("./lib/util"),
    app = express();

var writeConfig = function(module, config) {
    let modulePath = util.getLocalUserConfigPath(module);
    // ensure that the config directory exists
    util.makeDirectoryStructure(modulePath);
    // writing to config with the new data
    fs.writeFileSync(modulePath, JSON.stringify(config, null, 4));
};

var defaults = function(opts) {
    if (opts.project == undefined) {
        opts.project = "Default"
    }

    return opts;
}

var validate = function(opts) {
    let exit = false;

    if (opts.module == undefined) {
        console.trace("module' is a required argument.");
        exit = true;
    }

    if (opts.jsonSchema == undefined) {
        console.trace("jsonSchema' is a required argument.");
        exit = true;
    }

    if (opts.project == undefined) {
        opts.project = "Default"
    }

    if (exit) {
        process.exit();
    }

    return opts;
}

module.exports = {
    init: function(opts) {
        // set defaults
        opts = objectAssign({
            project: "Default"
        }, opts);

        // validate the options
        opts = validate(opts);

        // support json encoded bodies
        app.use(bodyParser.json());
        // support encoded bodies
        app.use(bodyParser.urlencoded({extended: true}));
        // serve static files
        app.use(express.static(path.join(__dirname, 'lib/src')));

        let userConfig = util.getLocalUserConfig(opts.module);
        let result = handlebars.compile(userConfig, opts);

        // get json form
        app.get('/', function(req, res) {
            res.writeHead(200, {
                'Content-Type': 'text/html',
                'Content-Length': result.length
            });
            res.write(result);
            res.end();
        });

        // get project data
        app.get('/project/:projectName', function(req, res) {
            try {
                res.send({
                    success: true,
                    config: userConfig[req.params.projectName],
                    buttons: handlebars.buttons(userConfig[req.params.projectName])
                });
            } catch (e) {
                res.send({success: false, message: e});
            }
        });

        // save project
        app.post('/save', function(req, res) {
            try {
                // overwritting the current project in the main config object
                userConfig[req.body.project] = req.body.config;
                writeConfig(opts.module, userConfig);
                res.send({success: true});
            } catch (e) {
                res.send({success: false, message: e});
            }
        });

        // delete project
        app.post('/delete', function(req, res) {
            try {
                delete userConfig[req.body.project];
                writeConfig(opts.module, userConfig);
                res.send({
                    success: true,
                    buttons: handlebars.buttons()
                });
            } catch (e) {
                console.error(e);
                res.send({success: false, message: e});
            }
        });

        // listen and open express server with an available port
        portscanner.findAPortNotInUse(3000, 3999, localhost, function(error, port) {
            app.listen(port, function() {
                opn('http://localhost:' + port);
            });
        });
    },

    getConfig: function(module, project) {
        let config = util.getLocalUserConfig(module);

        if (project) {
            return config[project];
        } else {
            return config;
        }
    },

    getProjects: function(module) {
        let config = util.getLocalUserConfig(module);
        return Object.keys(config);
    }
}
