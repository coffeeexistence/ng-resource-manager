
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),

    concat: {
      options: { 
        // separator: ';' 
      },
      module: {
        src: [
          'src/**.module.js',
          'src/components/**.js'
          ],
        dest: 'dist/ng-resource-manager.js'
      }
    },

    uglify: {
        options: { mangle: true },
        my_target: {
          files: {
            'dist/ng-resource-manager.min.js': ['dist/ng-resource-manager.js']
          }
        }
      },
      
      jshint: {
        all: {
          src: 'src/**.js',
        },
      }

  });


  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-concat');
  grunt.loadNpmTasks('grunt-contrib-jshint');


  grunt.registerTask('default', ['jshint', 'concat:module', 'uglify']);

};
