'use strict';

module.exports = function (grunt) {
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    clean: [
      ''
    ],

    eslint: {
      files: 'src/**/*.js'
    },

    stylus: {
      compile: {
        files: {
          'src/ui/styles/all.css': 'src/ui/styles/all.styl'
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
