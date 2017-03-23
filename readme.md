# JSON Schema Local Configurator

[![Build Status](https://travis-ci.org/vincentmorneau/json-local-configurator.svg?branch=master)](https://travis-ci.org/vincentmorneau/json-local-configurator) [![Dependency Status](https://david-dm.org/vincentmorneau/json-local-configurator.svg)](https://david-dm.org/vincentmorneau/json-local-configurator) [![XO code style](https://img.shields.io/badge/code_style-XO-5ed9c7.svg)](https://github.com/sindresorhus/xo)

Receives a JSON Schema, deploys an HTML form and saves it locally.

![demo](/docs/demo.png)

## Install
```
npm install json-local-configurator
```

## Usage
```javascript
const configurator = require('json-local-configurator');
const schema = require('../templates/schema');

configurator.init({
    module: "my-module",
    project: "my-project",
    jsonSchema: schema
});
```

## Options
Name | Type | Default | Description
--- | --- | --- | ---
module | string | | Name of the module
project | string | Default | Name of the project
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
