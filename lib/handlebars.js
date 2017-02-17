var path = require('path');
var fs = require('fs');
var handlebars = require('handlebars');

var getButtons = function(config){
    let buttons = "";

    if (config) {
        buttons += `
        <button class="btn waves-effect waves-light red lighten-1 delete" type="button">
            <i class="material-icons">delete_forever</i>
        </button>`;
    }

    buttons += `
    <button class="btn waves-effect waves-light secondary-color-bg save" type="button">
        <i class="material-icons">save</i>
    </button>`;

    return buttons;
};

var helpers = function(config) {
    // if value is null then ...
    handlebars.registerHelper('nvl', function(value, defaultValue) {
        var out = value || defaultValue;
        return new handlebars.SafeString(out);
    });

    // buttons partial to include the delete button or not
    handlebars.registerPartial('buttons', function() {
        return getButtons(config);
    });

    // From http://stackoverflow.com/questions/8853396/logical-operator-in-a-handlebars-js-if-conditional
    handlebars.registerHelper('ifCond', function(v1, operator, v2, options) {
        switch (operator) {
            case '==':
                return (v1 == v2) ? options.fn(this) : options.inverse(this);
            case '===':
                return (v1 === v2) ? options.fn(this) : options.inverse(this);
            case '<':
                return (v1 < v2) ? options.fn(this) : options.inverse(this);
            case '<=':
                return (v1 <= v2) ? options.fn(this) : options.inverse(this);
            case '>':
                return (v1 > v2) ? options.fn(this) : options.inverse(this);
            case '>=':
                return (v1 >= v2) ? options.fn(this) : options.inverse(this);
            case '&&':
                return (v1 && v2) ? options.fn(this) : options.inverse(this);
            case '||':
                return (v1 || v2) ? options.fn(this) : options.inverse(this);
            default:
                return options.inverse(this);
        }
    });
};

module.exports = {
    compile: function(config, options) {
        // read template html
        let index = fs.readFileSync(path.resolve(__dirname, "index.html"), 'utf8');

        helpers(config[options.project]);

        // compile template html
        let template = handlebars.compile(index);

        // compile body html
        let result = template({
            module: options.module,
            project: options.project,
            projectArray: Object.keys(config),
            jsonSchema: JSON.stringify(options.jsonSchema),
            initialData: JSON.stringify(config[options.project])
        });

        return result;
    },

    buttons: function(config) {
        return getButtons(config);
    }
};
