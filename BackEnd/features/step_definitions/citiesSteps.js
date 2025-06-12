const { Given, When, Then } = require('@cucumber/cucumber');
const request = require('supertest');
const app = require('../../index');

Given('the user enters city fragment {string}', function (fragment) {
  this.cityFragment = fragment;
});

When('the user calls the city suggestions endpoint {string}', async function (endpoint) {
  this.response = await request(app).get(endpoint);
});

Then('the response should include city suggestions like {string} and {string}', function (city1, city2) {
  const body = JSON.stringify(this.response.body).toLowerCase();
  if (!body.includes(city1.toLowerCase()) || !body.includes(city2.toLowerCase())) {
    throw new Error(`Expected suggestions to include "${city1}" and "${city2}", got: ${body}`);
  }
});
