const { Then } = require('@cucumber/cucumber');

Then('the response status should be {int}', function (expectedStatus) {
  if (this.response.status !== expectedStatus) {
    throw new Error(`Expected ${expectedStatus}, got ${this.response.status}`);
  }
});
