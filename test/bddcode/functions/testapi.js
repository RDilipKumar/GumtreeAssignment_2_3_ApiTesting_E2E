import { AssertionError } from 'assert';
import { resolve } from 'path';

const axios = require('axios');
let globalData = require('../support/globalTestData')
process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
let actualStatusCode;

class testapi {

  apiURL = "https://jsonplaceholder.typicode.com/";
  usersEndPoint = this.apiURL + "users";
  postEndpoint = this.apiURL + "posts";
  commentsEndpoint = this.apiURL + "comments";
  
      async getEmailAddressOfUserId(userId) {
        console.log(this.usersEndPoint + "/" + userId);
        await axios.get(this.usersEndPoint + "/" + userId)
        .then(function(response) {
          console.log(response.status);
          console.log(response.data);
          console.log(response.data.email);
          globalData.setField('Email',response.data.email);
          globalData.setField('UserId',userId);
          console.log("EmailId: ", globalData.getField('Email'));
        })
        .catch(function(error) {
          console.log('Error while fetching User end point: ',error.response.status);
        })
      }

      async getAssociatedPostsOfUserId() {
        console.log(this.postEndpoint + "?userId=" + globalData.getField('UserId'));
        var uniqueIds = [];
        await axios.get(this.postEndpoint + "?userId=" + globalData.getField('UserId'))
        .then(function(response) {
          console.log(response.status);
          response.data.forEach(data => {
            console.log("Title: ", data.title);
            console.log("Body: ", data.body);
            uniqueIds.push(data.id);
          })

          globalData.setField('Ids',uniqueIds);
        })
        .catch(function(error) {
          console.log('Error while fetching Post end point: ',error.response.status);
        })
      }

      async validatePostIdsOfUserId() {
        let uniqueIds = globalData.getField('Ids');
        var promises = [];
        uniqueIds.forEach(function(id){
          promises.push(axios.get(this.commentsEndpoint + "?id=" + id))
        }.bind(this));

        await axios.all(promises).then(function(results) {
            results.forEach(function(response) {
                let postId = response.data[0].postId;
                console.log("PostId: ", postId);
                if (isNaN(postId) || postId < 1 || postId > 100) {
                  console.log("Invalid PostId: ", postId);
                }
            })
        })
        .catch(function(error) {
          console.log('Error while fetching Comments end point: ',error.response.status);
        });
      }

      async postMessageUsingStoredId(postMessage) {
        postMessage.userId = globalData.getField('UserId');
        await axios.post(this.postEndpoint, postMessage)
        .then(function(response) {
          assert.equal(201, response.status);
          console.log("Posted Data: ", response.data);
        })
        .catch(function(error) {
          console.log('Error while posting message:', error);
        })
      }
}

export default new testapi();
