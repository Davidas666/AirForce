const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../index');

let response;

Given('the user wants forecast for city {string}', function (city) {
  this.city = city;
});

When('the user filters forecast by endpoint {string}', async function (endpoint) {
  response = await request(app).get(endpoint);
  this.responseBody = response.body;
});

Then('the filtered response status should be {int}', function (expectedStatus) {
  if (response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus}, got ${response.status}`);
  }
});

Then('the filtered response should include {string}', function (expectedField) {
  // Convert object keys to string to search for the field
  const responseBodyKeys = Object.keys(this.responseBody).join(',');
  
  if (!responseBodyKeys.includes(expectedField)) {
    throw new Error(`Expected response to include field "${expectedField}", but got: ${JSON.stringify(this.responseBody)}`);
  }
});
