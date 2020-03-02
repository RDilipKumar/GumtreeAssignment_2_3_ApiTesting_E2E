var fs = require('fs');
var featureDir = 'test/features';
var path = require('path');

function inList(name, list) {
  for (var i = 0; i < list.length; i++) {
    if (name.indexOf(list[i]) !== -1) {
      return true;
    }
  }
  return false;
}

var processArgs = function processArgs(argString) {
  var argToReturn;
  process.argv.forEach(function(arg) {
    if (arg.includes(argString)) {
      argToReturn = arg.split('=')[1];
      if (argString === '--features') argToReturn = argToReturn.split(',') ? argToReturn.split(',') : argToReturn;
      if (argString === '--name') argToReturn = argToReturn.split(',') ? argToReturn.split(',') : argToReturn;
    }
  });
  console.log(argString + ' ' + argToReturn);
  return argToReturn;
};
exports.checkInProcessArgs = processArgs;

var checkForTags = function(file) {
  var tag = processArgs('--tags');
  var tagFound = false;
  if (tag) {
    var data = fs.readFileSync(file);
    if (data.indexOf(tag) >= 0) {
      tagFound = true;
    }
    return tagFound;
  } else {
    return true;
  }
};

exports.getSpecs = function getSpecs(listOfFeatureFile) {
  var matchingFiles;
  var features = fs.readdirSync(featureDir);

  matchingFiles = features
    .map(function(file) {
      return path.join(featureDir, file);
    })
    .filter(function(file) {
      return inList(file, listOfFeatureFile);
    })
    .filter(function(file) {
      return checkForTags(file);
    });
  console.log('Matching files');
  console.log(matchingFiles);
  return matchingFiles;
};

exports.reportingOptions = function reportingOptions() {
  return {
    json: { outputDir: './test/reports/json-results/' },
    allure: {
      outputDir: './test/reports/allure-results/',
      disableWebdriverStepsReporting: true,
      useCucumberStepReporter: true,
    },
    htmlReporter: {
      jsonFolder: './test/reports/cucumber-json-results',
      reportFolder: './test/reports/cucumber-json-results/report',
    },
    junit: {
      outputDir: './test/reports/junit',
      outputFileFormat: function(opts) {
        // optional
        return `results-${opts.cid}.${opts.capabilities}.xml`;
      },
      errorOptions: {
        error: 'message',
        failure: 'message',
        stacktrace: 'stack',
      },
    },
  };
};
