var multipleCucumberHtmlReporter = require('wdio-multiple-cucumber-html-reporter');

var getSpecs = require('./config-helper').getSpecs;
var checkInProcessArgs = require('./config-helper').checkInProcessArgs;
var reportingOptions = require('./config-helper').reportingOptions;
const defaultTimeoutInterval = checkInProcessArgs('--tags') ? 60 * 60 * 500 : 90000;
let chalk = require('chalk');
let fs = require('fs');
var path = require('path');
exports.config = {
  execArgv: checkInProcessArgs('--debug') ? ['--inspect=127.0.0.1:5859'] : [],
  serverUrls: {
    environment: checkInProcessArgs('--env') || 'local',
  },
  host: checkInProcessArgs('--remote') || 'localhost',
  port: checkInProcessArgs('--port') || '4444',
  consuleValues: '@regression',
  specs: checkInProcessArgs('--features') ? getSpecs(checkInProcessArgs('--features')) : ['./test/features/*.feature'],
  // Patterns to exclude.
  exclude: [
    // 'path/to/excluded/files'
  ],
  dbValidation: checkInProcessArgs('--dbValidation') || false,
  
  maxInstances: checkInProcessArgs('--instances') || 1,

  capabilities: [
    {
      browserName: 'chrome',
      chromeOptions: {
        prefs: {
          'download.default_directory': path.resolve('chromeDownloads'),
        },
      },
      // platform: 'Windows 10',
      // version: '50.0',
    },
  ],
  sync: true,
  coloredLogs: true, // Enables colors for log output.
  screenshotPath: './test/reports/errorShots/', // Saves a screenshot to a given path if a command fails.

  baseUrl: 'http://localhost:8080',
  waitforTimeout: 150000, // Default timeout for all waitFor* commands.
  connectionRetryTimeout: 90000, // Default timeout in milliseconds for request  if Selenium Grid doesn't send response
  connectionRetryCount: 3, // Default request retries count

  
  services: ['docker','selenium-standalone'],
  framework: 'cucumber',
  reporters: ['spec', 'json', 'multiple-cucumber-html', 'junit'],

  reporterOptions: reportingOptions(),

  // If you are using Cucumber you need to specify the location of your step definitions.
  cucumberOpts: {
    timeout: checkInProcessArgs('--debug') ? 150000 : 90000,
    require: ['./test/bddcode/step_definitions/*.js', './test/bddcode/support/*js'], // <string[]> (file/dir) require files before executing features
    backtrace: true, // <boolean> show full backtrace for errors
    compiler: ['js:@babel/register'], // <string[]> filetype:compiler used for processing required features
    failAmbiguousDefinitions: true, // <boolean< Treat ambiguous definitions as errors
    dryRun: checkInProcessArgs('--dryRun') || false, // <boolean> invoke formatters without executing steps
    failFast: false, // <boolean> abort the run on first failure
    ignoreUndefinedDefinitions: true, // <boolean> Enable this config to treat undefined definitions as warnings
    name: checkInProcessArgs('--name') || [], // <string[]> ("extension:module") require files with the given EXTENSION after requiring MODULE (repeatable)
    format: ['json'], // <string[]> (type[:path]) specify the output format, optionally supply PATH to redirect formatter output (repeatable)
    colors: true, // <boolean> disable colors in formatter output
    snippets: false, // <boolean> hide step definition snippets for pending steps
    source: false, // <boolean> hide source uris
    profile: [], // <string[]> (name) specify the profile to use
    strict: true, // <boolean> fail if there are any undefined or pending steps
    tagExpression: checkInProcessArgs('--tagExpression')
      ? checkInProcessArgs('--tagExpression')
      : checkInProcessArgs('--tags') ||
        'not(@manual or @exclude or @wp or @wip or @executelocally or @sitonly or @training)', // <string> (expression) only execute the features or scenarios with tags matching the expression, see https://docs.cucumber.io/tag-expressions/
    tagsInTitle: false, // <boolean> add cucumber tags to feature or scenario name
    snippetSyntax: undefined, // <string> specify a custom snippet syntax
  },
  
  dockerOptions: {
    image: 'selenium/standalone-chrome',
    healthCheck: 'http://localhost:4444',
    options: {
        p: ['4444:4444'],
        shmSize: '2g'
    }
  },
  healthCheck: {
    url: 'http://localhost:4444',
    maxRetries: 3,
    inspectInterval: 1000,
    startDelay: 2000
  },
  logLevel: checkInProcessArgs('--loglevel') || 'silent',
  //
  // =====
  // Hooks
  // =====
  // WedriverIO provides several hooks you can use to interfere with the test process in order to enhance
  // it and to build services around it. You can either apply a single function or an array of
  // methods to it. If one of them returns with a promise, WebdriverIO will wait until that promise got
  // resolved to continue.
  //
  // Gets executed before test execution begins. At this point you can access all global
  // variables, such as `browser`. It is the perfect place to define custom commands.
  before: function() {
    /**
     * Setup the Chai assertion framework
     */
    const chai = require('chai');
    global.expect = chai.expect;
    global.assert = chai.assert;
    global.should = chai.should();
  },

  onError: function(message) {
    console.log('Error occured');
    // if (!message.shotTaken) multipleCucumberHtmlReporter.attach(browser.saveDocumentScreenshot(), 'image/png');
  },

  beforeScenario: function(scenario) {
    console.log('------------------------------------------------------');
    console.log('SCENARIO NAME:' + scenario.name);
    browser.pause(2000);
  },

  afterStep: function(step) {
    switch (step.status) {
      case 'passed':
        console.log(chalk.green('STEP PASSED :' + step.keyword + ' ' + step.text));
        break;
      case 'failed':
        // multipleCucumberHtmlReporter.attach(
          // browser.saveDocumentScreenshot('./test/reports/errorShots/Error-' + Date.now() + '.png'),
          // 'image/png'
        // );

        console.log(chalk.red('STEP FAILED :' + step.keyword + ' ' + step.text));
        break;
      case 'skipped':
        console.log(chalk.yellow('STEP SKIPPED :' + step.keyword + ' ' + step.text));
        break;
    }
  },

  plugins: {
    'wdio-screenshot': {},
  },

  afterScenario: function(scenario) {
    browser.deleteCookie();
    console.log('------------------------------------------------------');
    console.log('FINISHED SCENARIO NAME:' + scenario.name);
  },
};
