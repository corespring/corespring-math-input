/*global module:false*/
module.exports = function(grunt) {

  var failOnJsHintErrors = grunt.option('failOnJsHintErrors') === true;

  // Project configuration.
  var config = {
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),

    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author %>;' +
      ' Licensed <%= pkg.license %> */\n',

    // Task configuration.
    clean: {
      css: ['dist/*.css'],
      js: ['dist/*.js']
    },

    less: {
      development: {
        options: {
          paths: ['src/css'],
          compress: true
        },
        files: {
          'dist/<%= pkg.name %>.css': 'src/css/math-input.less'
        }
      }
    },

    jshint: {
      options: {
        jshintrc: '.jshintrc',
        force: !failOnJsHintErrors
      },
      main: ['src/js/**/*.js']
    },

    concat: {
      options: {
        stripBanners: true,
        banner: '<%= banner %>'
      },
      dist: {
        src: ['src/js/**/*.js'],
        dest: 'dist/<%= pkg.name %>.js'
      }
    },

    uglify: {
      options: {
        // the banner is inserted at the top of the output
        banner: '<%= banner %>'
      },
      dist: {
        files: {
          'dist/<%= pkg.name %>.min.js': ['<%= concat.dist.dest %>']
        }
      }
    },
  };

  grunt.initConfig(config);

  // These plugins provide necessary tasks.
  var npmTasks = [
    'grunt-contrib-clean',
    'grunt-contrib-less',
    'grunt-contrib-jshint',
    'grunt-contrib-concat',
    'grunt-contrib-uglify'
  ];

  npmTasks.forEach(grunt.loadNpmTasks);

  // Custom tasks.
  grunt.registerTask('default', ['build']);
  grunt.registerTask('build', ['js', 'css']);
  grunt.registerTask('css', ['clean:css', 'less']);
  grunt.registerTask('js', ['clean:js', 'jshint', 'concat', 'uglify']);

};
