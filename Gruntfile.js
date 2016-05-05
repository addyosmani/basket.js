module.exports = function( grunt ) {
	'use strict';

	function getHandleModuleBundleComplete(start, end) {
		return function handleModuleBundleComplete (data) {
			var fs = require('fs'),
				amdclean = require('amdclean'),
				outputFile = data.path;

			fs.writeFileSync(outputFile, amdclean.clean({
				filePath: outputFile,
				prefixMode: 'camelCase',
				'wrap': {
					'start': start,
					'end': end
				}
			}));
		};
	}

	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		requirejs : {
			dist : {
				options : {
					baseUrl: '.',
					include: 'lib/basket.js',
					out: 'dist/basket.js',
					optimize : 'none',
					onModuleBundleComplete: getHandleModuleBundleComplete(';(function(){','return libBasketjs})();')
				}
			},
			full: {
				options : {
					paths: {
						'lib/RSVP.wrapper': 'bower_components/compact-promise/src/Defer'
					},
					baseUrl: '.',
					include: 'lib/basket.js',
					out: 'dist/basket.full.js',
					optimize : 'none',
					onModuleBundleComplete: getHandleModuleBundleComplete('', '')
				}
			}
		},
		umd: {
			full: {
				options: {
					src: 'dist/basket.full.js',
					dest: 'dist/basket.full.js',
					globalAlias: 'basket',
					objectToExport: 'libBasketjs'
				}
			}
		},
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
					'* Uses rsvp.js, https://github.com/tildeio/rsvp.js or compact-promise\n' +
					'*/',
				stripBanners: true
			},
			dist: {
				src: ['dist/basket.js'],
				dest: 'dist/basket.js'
			},
			full: {
				src: ['dist/basket.full.js'],
				dest: 'dist/basket.full.js'
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
					'dist/basket.full.min.js': ['dist/basket.full.js']
				}
			}
		},
		qunit: {
			modular: {
				options: {
					urls: ['http://localhost:8080/test/modular.html']
				}
			},
			bundled: {
				options: {
					urls: ['http://localhost:8081/test/bundled.html']
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
			modular: {
				options: {
					base: '.',
					port: 8080
				}
			},
			bundled: {
				options: {
					base: '.',
					port: 8081
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
	grunt.loadNpmTasks('grunt-contrib-requirejs');
	grunt.loadNpmTasks('grunt-umd');

	// Dev - default
	grunt.registerTask('default', ['test']);

	// Release
	grunt.registerTask('release', ['test', 'requirejs', 'umd', 'concat', 'uglify', 'test:bundled']);

	//Tests
	grunt.registerTask('test', function(type){
		if (typeof type === 'undefined') {
			type = 'modular';
		}
		grunt.task.run('jshint');
		// can only use universal port once this ticket is solved:
		// https://github.com/gruntjs/grunt-contrib-connect/pull/217
		grunt.task.run('connect:' + type);
		grunt.task.run('qunit:' + type);
		// grunt.task.run('disconnect');
	});
};
