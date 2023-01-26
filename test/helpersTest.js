const { assert } = require('chai');

const { findUserByEmail, generateRandomString } = require('../tinyAppHelper');

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

describe('getUserByEmail', function() {
  it('should return a user with valid email', function() {
    const user = findUserByEmail("user@example.com", testUsers);
    const expectedUserID = "userRandomID";
    assert.equal(user, expectedUserID);
  });

  it('should return null when no user exists for a given email', function() {
    const user = findUserByEmail('hello@hotmail.com', testUsers);
    const expectedUserID = null;
    assert.equal(user, expectedUserID);
  });
});


describe('generateRandomString', function() {

  it('should return a string with six characters', function() {
    const randomStringLength = generateRandomString().length;
    const expectedOutput = 6;
    assert.equal(randomStringLength, expectedOutput);
  });

  it('should not return the same string if called again', function() {
    const firstRanString = generateRandomString();
    const secondRanString = generateRandomString();
    assert.notEqual(firstRanString, secondRanString);
  });
});
