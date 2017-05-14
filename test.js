import test from 'ava';
import _app from '.';

test('configurator', t => {
	_app.init({
		modules: ['apex-nitro', 'afeb'],
		project: 'demo',
		jsonSchema: {
			$schema: 'http://json-schema.org/draft-04/schema#',
			type: 'object',
			title: 'Root',
			description: 'Configuration for a project',
			properties: {
				appURL: {
					type: 'string',
					title: 'Application URL',
					description: 'This is the URL to your APEX application homepage.',
					placeholder: 'Example: https://apex.oracle.com/pls/apex/f?p=12192'
				},
				srcFolder: {
					type: 'string',
					title: 'Source Folder',
					description: 'This is where you do the coding. It should point to a local directory.',
					placeholder: 'Example: C:\\project\\src'
				},
				distFolder: {
					type: 'string',
					title: 'Distributable Folder',
					description: 'This is where the files will be compiled. It should point to a local directory.',
					placeholder: 'Example: C:\\project\\dist'
				}
			},
			required: [
				'appURL',
				'srcFolder',
				'distFolder'
			]
		}
	});

	t.pass();
});
