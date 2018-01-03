# Node Package Configurator

[![npm](https://img.shields.io/npm/v/node-package-configurator.svg)](https://www.npmjs.com/package/node-package-configurator) [![Build Status](https://travis-ci.org/vincentmorneau/node-package-configurator.svg?branch=master)](https://travis-ci.org/vincentmorneau/node-package-configurator) [![Dependency Status](https://david-dm.org/vincentmorneau/node-package-configurator.svg)](https://david-dm.org/vincentmorneau/node-package-configurator) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

![demo](/docs/demo.png)

Node Package Configurator (npc) generates a dynamic web form out of a JSON schema. The user fills the forms, npc resolves the JSON schema into a JSON object, and saves the result locally for persistent storage.

On Windows, npc saves the config file in the user App Data. Example: `C:\users\vmorneau\App Data\yourModuleName`  
On MacOS, npc saves the file in the library preference folder. Example: `~/Library/Preferences/yourModuleName`  
On Linux, npc saves the file in the root folder. Example: `~/yourModuleName`  

You can retrieve this file (your project configuration) at any time.

## Install
```
npm install node-package-configurator
```

## Usage

#### Launch the form
```javascript
const npc = require('node-package-configurator');
const schema = require('path_to_your_json_schema');

npc.init({
    modules: ["my-module"],
    logo: "url",
    project: "my-project",
    jsonSchema: schema
});
```

#### Getting the config
```javascript
const npc = require('node-package-configurator');

npc.getConfig({
    modules: ["my-module"],
    project: "my-project"
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
