Feature: Filtered forecast responses

  Scenario: Get limited number of hourly forecasts
    Given the user wants forecast for city "Vilnius"
    When the user filters forecast by endpoint "/api/forecast/hourly/Vilnius/limited"
    Then the filtered response status should be 200
    And the filtered response should include "list"

  Scenario: Get limited number of daily forecasts
    Given the user wants forecast for city "Vilnius"
    When the user filters forecast by endpoint "/api/forecast/daily/Vilnius"
    Then the filtered response status should be 200
    And the filtered response should include "list"
