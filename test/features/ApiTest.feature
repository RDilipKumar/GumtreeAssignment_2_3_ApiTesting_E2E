Feature: API Testing
  Validate UserId, posts, comments and post a message

Scenario: Validate UserId associated posts and post a new message for the same UserId
    When Get a random UserId and Print Email Address of the user
    Then Get associated posts of stored userID
    Then Validate PostIds for the stored userid
    Then Post a message using stored userId