const path = require('path');

module.exports = {
	root: true,
	parserOptions: {
		tsconfigRootDir: __dirname,
		project: [path.join(__dirname, 'tsconfig.json')]
	},
	extends: [
		path.join(__dirname, '..', '..', 'base-configs', 'eslint.react.js')
	],
	rules: {
		'react/jsx-props-no-spreading': [
			'error',
			{
				exceptions: ['AuthRoute', 'UnAuthRoute']
			}
		]
	}
};
