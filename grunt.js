/*global config:true, task:true*/
config.init({
	pkg: '<json:package.json>',
	meta: {
		banner: '/*! <%= pkg.name %> - v<%= pkg.version %> - ' +
			'<%= template.today("m/d/yyyy") %>\n' +
			'<%= pkg.homepage ? "* " + pkg.homepage + "\n" : "" %>' +
			'* Copyright (c) <%= template.today("yyyy") %> <%= pkg.author.name %>;' +
			' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %>\n' +
			'* Credits: <%= _.pluck(pkg.contributors, "name").join(", ") %> */'
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
		index: ['test/testrunner.html']
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
	},
	uglify: {}
});

// Default task.
task.registerTask('default', 'lint qunit concat min');