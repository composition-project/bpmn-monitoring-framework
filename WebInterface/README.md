# Web interface for BPMN monitoring framework

## Building instructions

You need a [NodeJS](http://nodejs.org) development stack with [npm](https://npmjs.org) and [grunt](http://gruntjs.com) installed to build the project.

To install all project dependencies execute

```
npm install
```

Build the code using [browserify](http://browserify.org) via

```
grunt
```

You may also spawn a development setup by executing

```
grunt auto-build
```

You may deploy the code with the following command, which will also minify the JavaScript

```
grunt deploy
```

All tasks generate the distribution ready client-side modeler application into the `dist` folder. To change the directory, modify the `dist` variable from the following section in `Gruntfile.js`. 

```javascript
grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // The source dir and the target dir
    config: {
      sources: 'app',
      dist: 'dist' // Change this to deploy in other directory
    },
    ...
});
```