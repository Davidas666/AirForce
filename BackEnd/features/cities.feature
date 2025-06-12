Feature: City Search Suggestions

  Scenario: Partial city name returns matching suggestions
    Given the user enters city fragment "vi"
    When the user calls the city suggestions endpoint "/api/cities?q=vi"
    Then the response status should be 200
    And the response should include city suggestions like "Vilnius" and "Vienna"
