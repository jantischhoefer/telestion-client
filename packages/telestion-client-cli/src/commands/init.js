const path = require('path');
const fs = require('fs');
const inquirer = require('inquirer');
const dirTree = require('directory-tree');
const { Spinner } = require('clui');

const debug = require('debug')('init');
const logger = require('../lib/logger')('init');

const makePromiseLastAtLeast = require('../lib/promise-minimum-time');

const normalize = require('../lib/init/normalize-module-name');
const processTemplateTree = require('../lib/init/process-template-tree');
const npmInstall = require('../lib/init/npm-install');
const initializeGitRepository = require('../lib/init/git-init');
const initEpilogue = require('../lib/init/init-epilogue');

const spinner = new Spinner('', ['⣾', '⣽', '⣻', '⢿', '⡿', '⣟', '⣯', '⣷']);

// yargs defs
const command = ['init [name]', 'i'];
const desc = 'Initializes a new Telestion Frontend Project';

function builder(yargs) {
	return yargs
		.positional('name', {
			describe: 'Name of the Telestion Frontend Project',
			type: 'string'
		})
		.option('commit', {
			alias: 'c',
			describe: 'Commits project initialization on finish',
			type: 'boolean',
			default: true
		})
		.option('skipGit', {
			alias: 's',
			describe: 'Skips project initialization as git repository',
			type: 'boolean',
			default: false
		})
		.option('skipInstall', {
			alias: 'i',
			describe: 'Skips installation of dependencies',
			type: 'boolean',
			default: false
		})
		.option('template', {
			alias: 't',
			describe: 'Specify a template module',
			type: 'string',
			default: '@wuespace/telestion-client-template'
		});
}

async function getTemplateDirTree(templatePath) {
	// Create template tree, all files have their file name + an .ejs extension
	debug('Build template directory tree');
	const tree = await makePromiseLastAtLeast(
		(async () => {
			return dirTree(templatePath);
		})(),
		5000
	);
	debug('Parsed template directory tree:', tree);
	return tree;
}

async function askProjectName() {
	const answers = await inquirer.prompt({
		type: 'input',
		name: 'name',
		message: "What's the name of your new project?",
		validate: input => {
			if (!input) return 'Please provide a name for your project';
			if (input !== path.basename(input))
				return 'Please provide a valid name for your project';
			return true;
		}
	});
	debug('Inquirer name answers:', answers);
	return answers['name'];
}

function normalizeAndExtractNames(projectName, templateModuleName) {
	let moduleName;
	try {
		moduleName = normalize(projectName);
	} catch (err) {
		logger.error(...err);
		process.exit(1);
	}
	debug('Project Name:', projectName);
	debug('Module Name:', moduleName);

	const projectPath = path.join(process.cwd(), moduleName);

	try {
		const { templateDir } = require(`${templateModuleName}/package.json`);

		if (typeof templateDir !== 'string') {
			logger.error("Template module package.json missing key 'templateDir'");
			process.exit(1);
		}

		const templateModulePath = path.dirname(
			require.resolve(`${templateModuleName}/package.json`)
		);
		const templatePath = path.join(templateModulePath, templateDir);

		return { moduleName, projectPath, templateModulePath, templatePath };
	} catch (err) {
		logger.error(`Template module '${templateModuleName}' was not found`);
		logger.info(
			`Please check the module name or install with npm install -g ${templateModuleName}`
		);
		process.exit(404);
	}
}

async function preprocessArgv(argv) {
	if (!argv['name']) {
		try {
			argv['name'] = await askProjectName();
		} catch (error) {
			if (error['isTtyError']) {
				logger.error('Prompt could not be rendered in the current environment');
			}
			throw error;
		}
	}

	const projectName = argv['name'];
	const templateModuleName = argv['template'];

	let {
		moduleName,
		projectPath,
		templatePath,
		templateModulePath
	} = normalizeAndExtractNames(projectName, templateModuleName);

	debug('Template path:', templatePath);
	debug('Project path:', projectPath);

	logger.info('Your project will be installed to:', projectPath);
	if (fs.existsSync(projectPath)) {
		logger.error('The project installation path already exists.');
		logger.info(
			'Please remove any files from the installation path before continue.'
		);
		process.exit(1);
	}
	return {
		projectName,
		moduleName,
		projectPath,
		templatePath,
		templateModulePath
	};
}

function getReplacers({ templateModulePath, moduleName, projectName }) {
	debug('Read template package.json');
	const templatePackageJson = require(`${templateModulePath}/package.json`);
	debug('Template package.json:', templatePackageJson);

	const replacers = {
		moduleName,
		projectName,
		dependencies: JSON.stringify(templatePackageJson.dependencies, null, '\t'),
		devDependencies: JSON.stringify(
			templatePackageJson.devDependencies,
			null,
			'\t'
		)
	};
	debug('Final replacers:', replacers);
	return replacers;
}

async function handler(argv) {
	// gathering information
	debug('Arguments:', argv);
	let {
		projectName,
		moduleName,
		projectPath,
		templatePath,
		templateModulePath
	} = await preprocessArgv(argv);

	try {
		spinner.message('Parse template project ...');
		spinner.start();
		let tree = await getTemplateDirTree(templatePath);
		spinner.stop();
		logger.success('Parsed template project');

		spinner.message('Initialize new project with template ...');
		spinner.start();
		await new Promise(resolve => setTimeout(resolve, 2000));
		spinner.stop();
		const replacers = getReplacers({
			templateModulePath,
			moduleName,
			projectName
		});

		// Process the root node of the template into the target dir
		debug('Process and copy template directory to new project');
		await processTemplateTree(tree, projectPath, replacers);

		if (!argv['skipInstall']) {
			await npmInstall(projectPath, spinner, logger, debug);
		}

		if (!argv['skipGit']) {
			await initializeGitRepository(projectPath, argv, spinner, logger, debug);
		}

		logger.success('Project initialized');
	} catch (err) {
		spinner.stop();
		logger.error(err);
		process.exit(1);
	}

	// print epilogue
	console.log(initEpilogue(projectPath));
}

module.exports = {
	command,
	desc,
	builder,
	handler
};