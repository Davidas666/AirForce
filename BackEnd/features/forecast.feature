Feature: Forecast API

  Scenario: Valid city returns forecast
    Given the city "Vilnius"
    When the user calls the endpoint "/api/forecast/Vilnius"
    Then the response status should be 200
    And the response should include "temp"

  Scenario: Invalid city returns 404 with error message
    Given the city "grybas"
    When the user calls the endpoint "/api/forecast/grybas"
    Then the response status should be 404
    And the response should include "City not found"

