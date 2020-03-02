import helper from './genericFunctions';

let userData = require('../support/globalTestData');

class googlePage {
  googlePageTitle = "//head/title[contains(text(),'Google')]";
  searchInputBox = "//input[@title='Search']";
  linkLocator = "//h3/ancestor::a[contains(@ping,'xxxx')]";
  gumtreeTitle = "//head/title[contains(text(),'Gumtree')]";
  resultsFoundLocator = "//header[@id='srpResultsHeader']//h1";

  validateGooglePageTitle(){
    assert.equal(helper.elementExist(this.googlePageTitle),true, "Google Page Title");
  }

  enterSearchInputBox(searchKey){
    helper.enterValue(this.searchInputBox,searchKey);
    helper.pressEnter(this.searchInputBox);
  }

  getAllSearchLinkForKey(linkKey){
    var linkArray = browser.$$(this.linkLocator.replace('xxxx',linkKey));
    console.log("No of Gumtree Links present: ",linkArray.length);
    userData.setField('GumTreeLinks',linkArray);

  }


  validateLinksTitleAndSearchResultCount() {
    let links = userData.getField('GumTreeLinks');
    links.forEach(link => {
      console.log("Links" , link.getText());
      link.click();
      let eleExist = helper.elementExist(this.gumtreeTitle);
      assert.equal(eleExist,true,"Gumtree page not loaded may be due to Captcha");
      let resultText = browser.$(this.resultsFoundLocator).getText();
      let resultsCount = resultText.split('ads')[0].trim().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
      assert.equal(true,resultsCount>0, "Result count is not greater than zero");
     
    })
  }


  answerkillerQuestionsSwitch(options = {}) {
    const { ukResident, solelyResidential, criticalIllness, armedForces, none, standardOwnership } = {
      ukResident: 'Yes',
      solelyResidential: 'Yes',
      standardOwnership: 'Yes',
      ...options,
    };

    if (ukResident !== '')
      browser.$(`${this.ukResidentKillerQuestion}/following-sibling::*//label[contains(text(),'${ukResident}')]`).click();
    if (solelyResidential !== '')
      browser
        .$(`${this.solelyResidentialQuestion}/following-sibling::*//label[contains(text(),'${solelyResidential}')]`)
        .click();
    if (solelyResidential === 'No') {
      if (criticalIllness) browser.$(this.exceptionCriticalIllnessQuestion).click();
      else if (armedForces) browser.$(this.exceptionArmedForcesQuestion).click();
      else if (none) browser.$(this.exceptionNoneQuestion).click();
    }
    if (standardOwnership !== '')
      browser
        .$(`${this.standardOwnershipQuestion}/following-sibling::*//label[contains(text(),'${standardOwnership}')]`)
        .click();
  }

  remoAnswerkillerQuestions(options = {}) {
    const { ukResident, appointSolicitor, solelyResidential, mainResidence, standardOwnership, onlySecondCharge } = {
      ukResident: 'Yes',
      appointSolicitor: 'Yes',
      solelyResidential: 'Yes',
      mainResidence: 'Yes',
      standardOwnership: 'Yes',
      onlySecondCharge: 'Yes',
      ...options,
    };

    if (ukResident !== '')
      browser.$(`${this.ukResidentKillerQuestion}/following-sibling::*//label[text()='${ukResident}']`).click();
    if (appointSolicitor !== '')
      browser
        .$(`${this.appointSolicitorQuestion}/following-sibling::*//label[contains(text(),'${appointSolicitor}')]`)
        .click();
    if (solelyResidential !== '')
      browser
        .$(`${this.solelyResidentialQuestion}/following-sibling::*//label[contains(text(),'${solelyResidential}')]`)
        .click();
    if (mainResidence !== '')
      browser.$(`${this.mainResidenceQuestion}/following-sibling::*//label[contains(text(),'${mainResidence}')]`).click();
    if (standardOwnership !== '')
      browser
        .$(`${this.standardOwnershipQuestion}/following-sibling::*//label[contains(text(),'${standardOwnership}')]`)
        .click();
    if (onlySecondCharge !== '')
      browser
        .$(`${this.onlySecondChargeQuestion}/following-sibling::*//label[contains(text(),'${onlySecondCharge}')]`)
        .click();
  }

  confirmDisclosure() {
    browser.$(this.firstdisclosurelink).click();
    browser.$(this.disclosureAgreeButton).click();
    browser.$(this.seconddisclosureink).click();
    browser.$(this.disclosureAgreeButton).click();
  }

  selectMainResidence(index) {
    const pathForElement = "//div[@data-ref='propertySelectRadio']/label";

    if (browser.$$(pathForElement).length !== 0) {
      const indexOnPage = index === 0 ? index + 1 : index;
      browser.$(this.mainResidencePropertyLocator.replace('INDEX', indexOnPage)).click();
    }
  }

  selectSecondPersonIfPresent(options = {}) {
    const { present } = { present: 'Yes', ...options };
    if (browser.element(`${this.secondCustomerPresent}/following-sibling::label[text()='${present}']`).isExisting()) {
      browser.$(`${this.secondCustomerPresent}/following-sibling::label[text()='${present}']`).click();
    }
  }

  createSwitchCase(index = 0, applicantCount = 1) {
    this.selectMainResidence(index);
    this.selectSecondPersonIfPresent();
    this.answerkillerQuestionsSwitch();
    this.confirmDisclosure();
    utils.takeScreenShot(browser);
    browser.$(this.continueButtonLocator).click();
    generic.waitForSpinner();
    generic.setCaseNumber();
  }

  createSwitchCaseWithMainresidentNo(index = 0, applicantCount = 1) {
    this.selectMainResidence(index);
    this.selectSecondPersonIfPresent();
    this.answerkillerQuestionsSwitch({ solelyResidential: 'No', criticalIllness: 'Yes' });
    this.confirmDisclosure();
    utils.takeScreenShot(browser);
    browser.$(this.continueButtonLocator).click();
    generic.waitForSpinner();
  }

  createRemoCase(options = {}) {
    const { secondApplicantCriteria, propertyAddressSource, postCode, pafAddress, subTransactionType } = {
      propertyAddressSource: 'first',
      subTransactionType: 'standalone remortgage',
      ...options,
    };

    this.selectSubTransaction(subTransactionType);
    if (secondApplicantCriteria) {
      this.remoSelectPropertyOwnership('Joint');
      let secondCustomer = userData.getField('nbs_Test_Data')[secondApplicantCriteria]['CISNumber'];
      userData.setField('secondCustomerCriteria', secondApplicantCriteria);
      this.remoSearchSecondCustomer(secondCustomer);
      this.remoAnswerPresenceOfSecondCustomer();
    } else {
      this.remoSelectPropertyOwnership('Sole');
    }
    if (['first', 'second'].includes(propertyAddressSource)) {
      this.remoClickCTAUsingApplicantAddress(propertyAddressSource);
    }

    if (propertyAddressSource === 'PAF') {
      this.remoSelectPropertyAddressByString('Address is not listed');
      this.remoSearchPAF(postCode);
      this.remoClickFinder();
      this.remoSelectPropertyAddressByFinder(pafAddress);
      this.clickContinue();
    }

    if (propertyAddressSource === 'manual') {
      this.remoClickManualAddressflg();
      //steps for manual needs to be added
      this.clickContinue();
    }
    this.submitPreEligibility();
    generic.setCaseNumber();
  }

  submitPreEligibility() {
    this.remoAnswerkillerQuestions();
    this.confirmDisclosure();
    this.clickContinue();
    browser.pause(3000);
  }

  answerPresenceOfSecondCustomer(options = {}) {
    const { secondPresent, haveConsent } = { secondPresent: 'Yes', ...options };
    if (secondPresent && secondPresent !== '')
      browser.$(`${this.secondCustomerPresent}/following-sibling::label[text()='${secondPresent}']`).click();
    if (haveConsent && haveConsent !== '')
      browser.$(`${this.haveConsentQuestion}/following-sibling::label[text()='${haveConsent}']`).click();
  }

  remoSelectPropertyOwnership(jointOrSingle) {
    browser
      .$(`${this.remoLoc.PropertyOwnerShipQuestionLocator}/following-sibling::label[contains(text(),'${jointOrSingle}')]`)
      .click();
    utils.debug(' Property ownership selected');
    utils.takeScreenShot(browser);
  }

  remoSearchSecondCustomer(customerNumber) {
    browser.$(`${this.remoLoc.SecondCustomerSearchBox}`).setValue(customerNumber);
    browser.$(`${this.remoLoc.SecondCustomerSearchButton}`).click();
    browser.pause(3000); //TODO
    generic.waitForSpinner();
  }

  remoGetSecondMemberDisplayedDetails() {
    return browser.$(`${this.remoLoc.Applicant2NameAgeloc}`).getText();
  }

  getSecondMemberDisplayedDetails() {
    return browser.$(`${this.secondMemberDetailLabel}`).getText();
  }

  remoGetFirstMemberDetails() {
    return browser.$(this.remoLoc.linkMemberDetails).getText();
  }

  remoAnswerPresenceOfSecondCustomer(options = {}) {
    const { secondPresent, haveConsent } = { secondPresent: 'Yes', ...options };
    if (secondPresent && secondPresent !== '')
      browser
        .$(`${this.remoLoc.SecondApplicantPresentQuestion}/following-sibling::label[text()='${secondPresent}']`)
        .click();
    if (haveConsent && haveConsent !== '')
      browser.$(`${this.remoLoc.SecondApplConsent}/following-sibling::label[text()='${haveConsent}']`).click();
  }

  remoGetPropertyAddressesDisplayed() {
    const addressDisplayed = browser.$$(`${this.remoLoc.PropertAddressLocator}`).map(item => item.getText());
    console.debug(addressDisplayed);
    return addressDisplayed;
  }

  remoSelectPropertyAddressByString(addressString) {
    generic.waitForElement(this.remoLoc.PropertAddressLocator, 40);
    browser.$(`${this.remoLoc.PropertAddressLocator}/label[contains(text(),'${addressString}')]`).click();
    userData.setField(
      'PropertyAddress',
      browser.$(`${this.remoLoc.PropertAddressLocator}/label[contains(text(),'${addressString}')]`).getText()
    );
  }

  remoSelectPropertyAddressByFinder(newAddress) {
    generic.waitForElement(this.remoLoc.PAFAddressDropDown, 40);
    browser.$(this.remoLoc.PAFAddressDropDown).click();
    browser.pause(500);
    browser.$(`${this.remoLoc.PAFAddressDropDown}//span[contains(text(),'${newAddress}')]`).click();
    userData.setField('PropertyAddress', browser.$(`${this.remoLoc.PAFAddressCard}`).getText());

    utils.takeScreenShot(browser);
  }

  remoSelectPropertyByIndex(index) {
    generic.waitForElement(this.remoLoc.PropertAddressLocator);
    browser.$(`${this.remoLoc.PropertAddressLocator}[${index}]`).click();
    userData.setField('PropertyAddress', browser.$(`${this.remoLoc.PropertAddressLocator}[${index}]`).getText());
  }

  remoSearchPAF(postCode) {
    generic.waitForElement(this.remoLoc.postCodeField);
    generic.clearTextbox(this.remoLoc.postCodeField);
    browser.$(this.remoLoc.postCodeField).setValue(postCode);
  }

  clickContinue() {
    helper.waitForElement(this.continueButtonLocator, 40);
    browser.$(this.continueButtonLocator).click();
    generic.waitForSpinner();
  }

  remoClickCTAUsingApplicantAddress(firstOrSecond) {
    if (firstOrSecond === 'first') {
      this.remoSelectPropertyByIndex(1);
    }
    if (firstOrSecond === 'second') {
      this.remoSelectPropertyByIndex(2);
    }
    this.clickContinue();
  }

  remoClickFinder(successExpected = true) {
    browser.$(this.remoLoc.postcodeFinderButton).click();
    if (successExpected) generic.waitForElement(this.remoLoc.PAFAddressDropDown, 40);
  }

  remoAnswerPropertyOwnedAddress = remoPropertyDetails => {
    const { propertyOwned, propertyAddress } = { ...remoPropertyDetails };
    if (propertyOwned) this.remoSelectPropertyOwnership(propertyOwned);
    if (propertyAddress) this.remoSelectPropertyAddressByString(propertyAddress);
    utils.takeScreenShot(browser);
  };

  remoPostcodeInvalidMessage() {
    generic.waitForElement(this.remoLoc.postCodeMessage);
    return browser.$(this.remoLoc.postCodeMessage).getText();
  }

  remoClickChange() {
    generic.waitForElement(this.remoLoc.postcodeChangeButton);
    browser.$(this.remoLoc.postcodeChangeButton).click();
    generic.waitForSpinner();
    utils.takeScreenShot(browser);
  }

  remoClickManualAddressflg() {
    generic.waitForElement(this.remoLoc.manualPostcodeflag);
    browser.$(this.remoLoc.manualPostcodeflag).click();
  }

  remoEnterOwnerShipAndAddressByName = options => {
    const { secondPresent, haveConsent, propertyOwned, propertyAddress } = { secondPresent: 'Yes', ...options };

    this.remoSelectPropertyOwnership(propertyOwned);
    if (propertyOwned === 'Joint') {
      this.remoAnswerPresenceOfSecondCustomer({ secondPresent, haveConsent });
    }

    if (propertyAddress) this.remoSelectPropertyAddressByString(propertyAddress);
    utils.takeScreenShot(browser);
  };

  submitInputManualAddressDetails(options = {}) {
    let {
      SubBuildingOrFlatName,
      SubBuildingOrFlatNo,
      BuildingName,
      BuildingNo,
      Street,
      Area,
      County,
      TownOrCity,
      PostCode,
    } = {
      ...options,
    };

    if (SubBuildingOrFlatName !== '') {
      generic.clearTextbox(this.remoLoc.SubBuildingNameLoc);
      browser.pause(200);
      utils.debug('Answering sub building name');
      browser.$(this.remoLoc.SubBuildingNameLoc).setValue(SubBuildingOrFlatName);
    }

    console.log('done sub building');

    if (SubBuildingOrFlatNo !== '') {
      generic.clearTextbox(this.remoLoc.SubBuildingNameLoc);
      browser.pause(200);
      utils.debug('Answering sub building number');
      browser.$(this.remoLoc.SubBuildingNoLoc).setValue(SubBuildingOrFlatNo);
      browser.pause(200);
    }

    if (BuildingName !== '') {
      generic.clearTextbox(this.remoLoc.BuildingNameLoc);
      browser.pause(200);
      utils.debug('Answering building/flat name');
      browser.$(this.remoLoc.BuildingNameLoc).setValue(BuildingName);
      browser.pause(200);
    }

    if (BuildingNo !== '') {
      generic.clearTextbox(this.remoLoc.BuildingNoLoc);

      browser.pause(200);
      utils.debug('Answering building/flat number');
      browser.$(this.remoLoc.BuildingNoLoc).setValue(BuildingNo);
      browser.pause(200);
    }

    if (Street !== '') {
      generic.clearTextbox(this.remoLoc.StreetLoc);
      browser.pause(200);
      utils.debug('Answering street');
      browser.$(this.remoLoc.StreetLoc).setValue(Street);
      browser.pause(200);
    }

    if (Area !== '') {
      generic.clearTextbox(this.remoLoc.AreaLoc);
      browser.pause(200);
      utils.debug('Answering area');
      browser.$(this.remoLoc.AreaLoc).setValue(Area);
      browser.pause(200);
    }

    if (County !== '') {
      generic.clearTextbox(this.remoLoc.CountyLoc);
      browser.pause(200);
      utils.debug('Answering area');
      browser.$(this.remoLoc.CountyLoc).setValue(County);
      browser.pause(200);
    }

    if (TownOrCity !== '') {
      generic.clearTextbox(this.remoLoc.TownOrCityLoc);
      browser.pause(200);
      utils.debug('Answering area');
      browser.$(this.remoLoc.TownOrCityLoc).setValue(TownOrCity);
      browser.pause(200);
    }

    if (PostCode !== '') {
      generic.clearTextbox(this.remoLoc.PostCodeLoc);
      browser.pause(200);
      utils.debug('Answering area');
      browser.$(this.remoLoc.PostCodeLoc).setValue(PostCode);

      browser.pause(500);
      utils.takeScreenShot(browser);
    }
  }

  clickUseThisAddressButton() {
    // helper.waitForElementClickable(this.remoLoc.useThisAddress);
    utils.debug('Clicking Use this address button');
    // helper.waitForElement(this.remoLoc.useThisAddress, 40)
    browser.$(this.remoLoc.useThisAddress).click();
    utils.takeScreenShot(browser);
  }

  cancelUseThisAddress() {
    utils.debug('Canceling Use this address button');
    browser.$(this.remoLoc.CancelAddress).click();
  }

  remoPropertyAddressUsed() {
    generic.waitForElement(this.remoLoc.propertyAddressUsed);
    return browser.$(this.remoLoc.propertyAddressUsed).getText();
    utils.takeScreenShot();
  }

  remoManualAddressInvalidMessage() {
    generic.waitForElement(this.remoLoc.manualAddressPostCodeMsg);
    return browser.$(this.remoLoc.manualAddressPostCodeMsg).getText();
    utils.takeScreenShot(browser);
  }

  selectSubTransaction(subTransactionType) {
    let subTransactionTypeRadioButton = `//div[contains(@class,'subTran')]//label[contains(text(),'${subTransactionType}')]`;
    generic.waitForElement(subTransactionTypeRadioButton);
    browser.$(subTransactionTypeRadioButton).click();
  }

}

export default new googlePage();
