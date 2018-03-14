'use strict';

module.exports = function (grunt) {

  require('load-grunt-tasks')(grunt);

  var path = require('path');

  /**
   * Resolve external project resource as file path
   */
  function resolvePath(project, file) {
    return path.join(path.dirname(require.resolve(project)), file);
  }

  // project configuration
  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    // The source dir and the target dir
    config: {
      sources: 'app',
      //dist: 'dist'
      dist: '../BackEnd/src/main/resources/public' // Change this to deploy in other directory
    },

    jshint: {
      src: [
        ['<%=config.sources %>']
      ],
      options: {
        jshintrc: true
      }
    },

    // Browserify js files and put them into dist folder; Also watch for JS files changes
    browserify: {
      options: {
        browserifyOptions: {
          debug: true,
          list: true,
          // make sure we do not include browser shims unnecessarily
          insertGlobalVars: {
            process: function () {
              return 'undefined';
            },
            Buffer: function () {
              return 'undefined';
            }
          }
        },
        transform: ['brfs']
      },
      watch: {
        options: {
          watch: true
        },
        files: {
          '<%= config.dist %>/modeller/index.js': ['<%= config.sources %>/modeller/*.js'],
          '<%= config.dist %>/viewer/index.js': ['<%= config.sources %>/viewer/*.js']
        }
      },
      app: {
        files: {
          '<%= config.dist %>/modeller/index.js': ['<%= config.sources %>/modeller/*.js'],
          '<%= config.dist %>/viewer/index.js': ['<%= config.sources %>/viewer/*.js']
        }
      }
    },

    uglify: {
      modeller: { 
        expand: true,
        src: ['<%= config.dist %>/modeller/index.js'],
        dest: ''
      },
      viewer: {
        expand: true,
        src: ['<%= config.dist %>/viewer/index.js'],
        dest: ''
      }
    },

    // Copy asset files from node modules. Also copy html file from sources to dist
    copy: {

      // Copy css file for diagram_js
      diagram_js: {
        files: [
          {
            src: resolvePath('diagram-js', 'assets/diagram-js.css'),
            dest: '<%= config.dist %>/vendor/diagram-js/css/diagram-js.css'
          }
        ]
      },

      // Copy css files for bpmn_js
      bpmn_js: {
        files: [
          {
            expand: true,
            cwd: resolvePath('bpmn-js', 'assets'),
            src: ['**/*.*', '!**/*.js'],
            dest: '<%= config.dist %>/vendor'
          }
        ]
      },

      // Copy html files to dist dir
      app: {
        files: [
          {
            expand: true,
            cwd: '<%= config.sources %>/',
            src: ['**/*.html', '!**/*.js'],
            dest: '<%= config.dist %>'
          }
        ]
      }
    },

    // Compile less files and turn them into css
    less: {
      options: {
        dumpLineNumbers: 'comments',
        paths: [
          'node_modules'
        ]
      },

      styles: {
        files: {
          '<%= config.dist %>/modeller/style.css': '<%= config.sources %>/modeller/style.less',
          '<%= config.dist %>/viewer/style.css': '<%= config.sources %>/viewer/style.less'
        }
      }
    },

    // Only watch for changes in html and less files. Changes in JS files are watched in browserify task
    watch: {
      options: {
        livereload: true
      },

      // Just to trigger the page refresh
      js: {
        files: ['<%= config.sources %>/**/*.js'],
        tasks: []
      },

      html: {
        files: ['<%= config.sources %>/**/*.html'],
        tasks: ['copy:app']
      },


      less: {
        files: ['<%= config.sources %>/**/*.less'],
        tasks: ['less']
      },
    },

    // Run a web server which refresh automatically
    connect: {
      livereload: {
        options: {
          port: 9013,
          livereload: true,
          hostname: 'localhost',
          open: "http://localhost:9013/modeller/",
          base: [
            '<%= config.dist %>'
          ]
        }
      }
    }
  });

  // tasks
  grunt.registerTask('build', ['copy', 'less', 'browserify:app']);

  grunt.registerTask('auto-build', [
    'copy',
    'less',
    'browserify:watch',
    'connect:livereload',
    'watch'
  ]);

  grunt.registerTask('deploy', [
    'copy',
    'less',
    'browserify:app',
    'uglify'
  ]);

  grunt.registerTask('default', ['jshint', 'build']);
};
