# APEX Publish Static Files

Receives a JSON Schema, deploys an HTML form and saves it locally.

![demo](/docs/demo.png)

## Install
```
npm install json-local-configurator
```

## Usage
```javascript
var configurator = require("json-local-configurator"),
    schema = require('../templates/schema');

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

## Project Team
- [Vincent Morneau](https://github.com/vincentmorneau)
