Feature: E2E Automation
  Validate Gumtree ads through google search

Scenario: Validate Gumtree ads through google search and the following links
    Given I navigate to google search with key "Cars in London"
    Then I fetch all search links for "gumtree" 
    Then I validate link title and result count