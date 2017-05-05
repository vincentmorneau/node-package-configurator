'use strict';

const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

const getButtons = function(deleteFlag) {
	let buttons = ``;

	if (deleteFlag) {
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

const helpers = function() {
	// If value is null then ...
	handlebars.registerHelper('nvl', (value, defaultValue) => {
		const out = value || defaultValue;
		return new handlebars.SafeString(out);
	});

	// Buttons partial to include the delete button or not
	handlebars.registerPartial('buttons', () => {
		return getButtons(false);
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
	compile(config, opts) {
		// Read template html
		const index = fs.readFileSync(path.resolve(__dirname, 'index.html'), 'utf8');

		helpers();

		// Compile template html
		const template = handlebars.compile(index);

		// Compile body html
		const result = template({
			module: opts.module,
			project: opts.project,
			projectArray: Object.keys(config),
			jsonSchema: JSON.stringify(opts.jsonSchema),
			initialData: JSON.stringify(config[opts.project])
		});

		return result;
	},

	buttons(config) {
		return getButtons(config);
	}
};
