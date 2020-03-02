import { Given, When, Then } from 'cucumber';
import helper from '../functions/genericFunctions';
import googlePage from '../functions/googlePage'

Given(/^I navigate to google search with key \"(.*)\"$/, function(searchKey){
  helper.openUrl("Google");
  googlePage.validateGooglePageTitle();
  googlePage.enterSearchInputBox(searchKey);
});

Then(/^I fetch all search links for \"(.*)\"$/, function(linkToFetch){
  googlePage.getAllSearchLinkForKey(linkToFetch);
})

Then(/^I validate link title and result count$/, function(){
  googlePage.validateLinksTitleAndSearchResultCount();
})
