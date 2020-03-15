import arg from 'arg';
import inquirer from 'inquirer';
import { createApp } from './main';

function parseArgumentsIntoOptions(rawArgs) {
  const args = arg(
    {
      '--git': Boolean,
      '--yes': Boolean,
      '--install': Boolean,
      '-g': '--git',
      '-y': '--yes',
      '-i': '--install'
    },
    {
      argv: rawArgs.slice(2)
    }
  );
  return {
    skipPrompts: args['--yes'] || false,
    git: args['--git'] || false,
    template: args._[0],
    runInstall: args['--install'] || false
  };
}

async function promptForMissingOptions(options) {
  const defaultTemplate = 'default';
  const initialGitValue = 'true';
  const initialRuninstallValue = 'true';
  if (options.skipPrompts) {
    return {
      ...options,
      template: options.template || defaultTemplate,
      git: options.git || initialGitValue,
      runInstall: options.runInstall || initialRuninstallValue
    };
  }

  const questions = [];
  if (!options.template) {
    questions.push({
      type: 'list',
      name: 'template',
      message: 'Please choose which app template to use',
      choices: ['default', 'basic'],
      default: defaultTemplate
    });
  }

  if (!options.git) {
    questions.push({
      type: 'confirm',
      name: 'git',
      message: 'Would you like to initialize as a git repository?',
      default: true
    });
  }

  if (!options.runInstall) {
    questions.push({
      type: 'confirm',
      name: 'runInstall',
      message: 'Would you like to install all dependencies(Recommended)',
      default: true
    });
  }

  const answers = await inquirer.prompt(questions);
  return {
    ...options,
    template: options.template || answers.template,
    git: options.git || answers.git,
    runInstall: options.runInstall || answers.runInstall
  };
}

export async function cli(args) {
  let options = parseArgumentsIntoOptions(args);
  options = await promptForMissingOptions(options);
  await createApp(options);
}
