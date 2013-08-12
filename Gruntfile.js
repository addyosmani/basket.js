module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		concat: {
			options: {
				banner: '/*!\n' +
					'* <%= pkg.name %>\n' +
					'* v<%= pkg.version %> - ' +
					'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
					'<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
					'* (c) <%= pkg.author.name %>;' +
					' <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n' +
					'* Created by: <%= _.pluck(pkg.maintainers, "name").join(", ") %>\n' +
					'* Contributors: <%= _.pluck(pkg.contributors, "name").join(", ") %>\n' +
					'* Uses rsvp.js, https://github.com/tildeio/rsvp.js\n' +
					'*/',
				stripBanners: true
			},
			dist: {
				src: ['lib/basket.js'],
				dest: 'dist/basket.js'
			}
		},
		uglify: {
			options: {
				report: 'gzip',
				banner: '<%= concat.options.banner %>'
			},
			dist: {
				options: {
					sourceMap: 'dist/basket.min.map'
				},
				files: {
					'dist/basket.min.js': ['dist/basket.js']
				}
			},
			full: {
				options: {
					sourceMap: 'dist/basket.full.map'
				},
				files: {
					'dist/basket.full.min.js': ['bower_components/rsvp/rsvp.min.js', 'dist/basket.js']
				}
			}
		},
		qunit: {
			all: {
				options: {
					urls: ['http://localhost:8080/test/index.html']
				}
			}
		},
		watch: {
			scripts: {
				files: '<%= jshint.all %>',
				tasks: ['test']
			}
		},
		connect: {
			server: {
				options: {
					base: '.',
					port: 8080
				}
			}
		},
		jshint: {
			options: {
				jshintrc: '.jshintrc'
			},
			all: ['Gruntfile.js', 'lib/basket.js', 'test/tests.js']
		}
	});

	grunt.loadNpmTasks('grunt-contrib-concat');
	grunt.loadNpmTasks('grunt-contrib-jshint');
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-qunit');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-watch');

	// Dev - default
	grunt.registerTask('default', ['test']);

	// Release
	grunt.registerTask('release', ['test', 'concat', 'uglify']);

	//Tests
	grunt.registerTask('test', ['jshint', 'connect', 'qunit']);
};
