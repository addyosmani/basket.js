/*global config:true, task:true*/
config.init({
	pkg: '<json:package.json>',
	meta: {
		banner: '/*! <%= pkg.name %>\n' +
			'* v<%= pkg.version %> - ' +
			'<%= template.today("yyyy-mm-dd") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
			'* (c) <%= pkg.author.name %>;' +
			' <%= _.pluck(pkg.licenses, "type").join(", ") %> License\n' +
			'* Created by: <%= _.pluck(pkg.maintainers, "name").join(", ") %>\n' +
			'* Contributors: <%= _.pluck(pkg.contributors, "name").join(", ") %> */'
	},
	concat: {
		'dist/basket.js': ['<banner>', '<file_strip_banner:lib/basket.js>']
	},
	min: {
		'dist/basket.min.js': ['<banner>', 'dist/basket.js']
	},
	lint: {
		files: ['grunt.js', 'lib/**/*.js']
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
			curly: true,
			eqeqeq: true,
			immed: true,
			latedef: true,
			newcap: true,
			noarg: true,
			sub: true,
			undef: true,
			boss: true,
			eqnull: true,
			expr: true
		}
	}
});

// Dev - default
task.registerTask('default', 'lint qunit');

// Release
task.registerTask('release', 'lint qunit concat min');