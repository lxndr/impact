'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      ''
    ],

    eslint: {
      files: 'app/**/*.js'
    },

    stylus: {
      compile: {
        files: {
          'app/styles/all.css': 'app/styles/all.styl'
        },
        options: {
          compress: false
        }
      }
    }
  });

  grunt.registerTask('default', ['stylus']);
  grunt.registerTask('lint', ['eslint']);
};
