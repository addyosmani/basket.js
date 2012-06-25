module.exports = function( grunt ) {
	'use strict';

	grunt.initConfig({
		pkg: '<json:package.json>',
		meta: {
			banner: '/*!\n' +
				'* <%= pkg.name %>\n' +
				'* v<%= pkg.version %> - ' +
				'<%= grunt.template.today("yyyy-mm-dd") %>\n' +
				'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
				'* (c) <%= pkg.author.name %>;' +
				' <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n' +
				'* Created by: <%= _.pluck(pkg.maintainers, "name").join(", ") %>\n' +
				'* Contributors: <%= _.pluck(pkg.contributors, "name").join(", ") %>\n*/'
		},
		concat: {
			'dist/basket.js': [
				'<banner>',
				'<file_strip_banner:lib/basket.js>'
			]
		},
		min: {
			'dist/basket.min.js': [
				'<banner>',
				'dist/basket.js'
			]
		},
		lint: {
			files: [
				'grunt.js',
				'lib/**/*.js'
			]
		},
		qunit: {
			index: ['test/index.html']
		},
		watch: {
			files: '<config:lint.files>',
			tasks: 'lint test'
		},
		jshint: {
			options: {
				es5: true,
				esnext: true,
				bitwise: true,
				curly: true,
				eqeqeq: true,
				newcap: true,
				noarg: true,
				noempty: true,
				regexp: true,
				undef: true,
				strict: true,
				trailing: true,
				smarttabs: true,
				browser: true,
				node: true,
				nonstandard: true,
				expr: true
			}
		}
	});

	// Dev - default
	grunt.registerTask('default', 'lint concat min');

	// Release
	grunt.registerTask('release', 'lint qunit concat min');

};