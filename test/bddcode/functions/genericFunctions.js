import Page from './page';
import multipleCucumberHtmlReporter from 'wdio-multiple-cucumber-html-reporter';

// import utils from './utils';

const { assert } = require('chai');

let userData = require('../../bddcode/support/globalTestData');
const fs = require('graceful-fs');
const yaml = require('js-yaml');
const axios = require('axios');
let moment = require('moment');
let pageLoadMsg = '';
let startTime = '';
var chalk = require('chalk');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

function tryCatchWithScreenshot(assertfunction) {
  try {
    assertfunction();
  } catch (err) {
    browser.saveDocumentScreenshot('./test/reports/errorShots/Scr-' + Date.now() + '.png');
    throw err;
  }
}

class GenericFunctions extends Page {
  openUrl(url) {
    let urlval;
    browser.execute(function() {
      window.onbeforeunload = null;
    });
    let baseUrl = this.getValueFromEnv(process.env.EnvironmentVar, 'url');
    switch (url) {
      case 'Google':
        urlval = baseUrl;
        break;
      default:
        console.log('Url not mapped for value:' + url);
        assert.fail('Url not mapped for value:' + url);
    }
    this.open(urlval);
    browser.pause(1000);
  }

  getValueFromEnv(env, key) {
    if (!env) {
      env = global.browser.options.serverUrls.environment;
    }
    let environment_Data = yaml.load(fs.readFileSync('test/config/environmentdetails.yml'));
    let envData = environment_Data[env];
    return envData[key];
  }

  
  getElement(xPathVal) {
    console.log('xpath', xPathVal);
    this.waitForElement(xPathVal);

    // browser.element(xPathVal).waitForVisible(browser.options.waitforTimeout);
    return browser.element(xPathVal);
  }

  

  pressEnter(selector) {
    browser.$(selector).keys('Enter')
  }
 

  getOSAndBrowserString() {
    let getOSAndBrowserString = '';

    let devicename = global.browser.desiredCapabilities.deviceName;
    let browsername = global.browser.desiredCapabilities.browserName;
    let browserversion = global.browser.desiredCapabilities.version;
    let platformname = global.browser.desiredCapabilities.platform;

    if (typeof devicename != 'undefined') {
      getOSAndBrowserString = 'Device Name: ' + devicename + ' ' + '</br>';
    }
    if (typeof browsername != 'undefined') {
      getOSAndBrowserString = getOSAndBrowserString + 'Browser Name: ' + browsername + ' ' + '</br>';
    }
    if (typeof browserversion != 'undefined') {
      getOSAndBrowserString = getOSAndBrowserString + 'Browser Version: ' + browserversion + ' ' + '</br>';
    }
    if (typeof platformname != 'undefined') {
      getOSAndBrowserString = getOSAndBrowserString + 'Plateform Name: ' + platformname + ' ' + '</br>';
    }

    return getOSAndBrowserString;
  }

  enterGlobalData(value, selector) {
    console.log('GLOBAL VALUES :', userData.getField(value));
    // this.waitForElemReady(selector);
    this.clearElement(selector);
    this.getSelector(selector).setValue(userData.getField(value));
    browser.keys('Tab');
  }

  enterTestData(testDataField, selector) {
    let setValue = userData.getField('scenariosData')[testDataField];
    console.log('testdata: ' + setValue);
    this.getSelector(selector).setValue(setValue);
    if (testDataField === 'CISNumber') multipleCucumberHtmlReporter.attach(`Customer Number:  ${setValue}`);
    browser.keys('Tab');
  }

  enterValue(selector, value) {
    console.log('selector: ' + selector);
    console.log('value: ' + value);

    browser.pause(1000);
    browser.$(selector).click();
    browser.$(selector).keys(value);

  }

  elementExist(element) {
    return browser.$(element).isExisting();
  }

  elementExistXPath(xPathVal) {
    return browser.element(xPathVal).waitForVisible(browser.options.waitforTimeout).isExisting;
  }

  validateElementText(fieldName, expValue) {
    console.log(fieldName);
    var actValue = browser.$(fieldName).getText();
    console.log(fieldName);
    console.log('Exp:' + expValue + '| Act:' + actValue);
    assert.equal(actValue.toString(), expValue.toString());
  }

  getTestDataValue(key) {
    return userData.getField('scenariosData')[key];
  }

  clearTextbox(selector) {
    let element = browser.$(selector);
    let x = element.getValue();
    for (let i = 0; i < x.length; i++) {
      element.setValue('\ue003');
      browser.pause(100);
    }
  }

 
}

export default new GenericFunctions();
