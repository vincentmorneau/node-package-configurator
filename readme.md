# Node Package Configurator

[![npm](https://img.shields.io/npm/v/node-package-configurator.svg)]() [![Build Status](https://travis-ci.org/vincentmorneau/node-package-configurator.svg?branch=master)](https://travis-ci.org/vincentmorneau/node-package-configurator) [![Dependency Status](https://david-dm.org/vincentmorneau/node-package-configurator.svg)](https://david-dm.org/vincentmorneau/node-package-configurator) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Store local configuration for your npm packages.

![demo](/docs/demo.png)

Sometimes your npm packages require developers to provide options or personal preferences. If those options are bundled with the npm package, you losse any changes upon updates the npm package.

Node Package Configurator generates a dynamic form which can be filled easily and then saved locally for persistent storage.

## Install
```
npm install node-package-configurator
```

## Usage
```javascript
const npc = require('node-package-configurator');
const schema = require('../templates/schema');

npc.init({
    modules: ["my-module"],
    logo: "url",
    project: "my-project",
    jsonSchema: schema
});
```

## Options
Name | Type | Default | Description
--- | --- | --- | ---
module | array | | List of module names, in order of priority.
logo | string | | URL to your project logo (optional)
project | string | | Name of the project
jsonSchema | object | | JSON Schema to use in the form

## Methods
Name | Type | Returns | Description
--- | --- | --- | ---
init | function | | Initializes the HTML form
getConfig | function | object | Returns the configuration object of the given project
getProjects | function | array | Returns an array of available project names

## Changelog
[See changelog.](changelog.md)

## Special thanks to
[Brutusin json-forms](https://github.com/brutusin/json-forms)

## License
MIT © [Vincent Morneau](http://vmorneau.me)
