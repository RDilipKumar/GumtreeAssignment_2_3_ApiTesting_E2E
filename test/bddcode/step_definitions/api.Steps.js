import { Given, When, Then } from 'cucumber';
import testapi from '../functions/testapi';

let postMessage = {
  "userId": 1,
  "title": "test title",
  "body": "test body"
}


Given(/^Get a random UserId and Print Email Address of the user$/, async function(){
  let userId = Math.floor((Math.random() * 10) + 1);
  await testapi.getEmailAddressOfUserId(userId);
});

Then(/^Get associated posts of stored userID$/, async function(){
  await testapi.getAssociatedPostsOfUserId();
});

Then(/^Validate PostIds for the stored userid$/, async function(){
  await testapi.validatePostIdsOfUserId();
})
Then(/^Post a message using stored userId$/, async function(){
  await testapi.postMessageUsingStoredId(postMessage);
})