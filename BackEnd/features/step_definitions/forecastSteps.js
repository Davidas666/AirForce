const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../index');

Given('the city {string}', function (city) {
  this.city = city;
});

When('the user calls the endpoint {string}', async function (endpoint) {
  this.response = await request(app).get(endpoint);
});

Then('the response should include {string}', function (text) {
  const body = JSON.stringify(this.response.body);
  if (!body.includes(text)) {
    throw new Error(`Expected response to include "${text}", but got: ${body}`);
  }
});
