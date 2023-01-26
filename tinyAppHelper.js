// function to generate a random string
function generateRandomString() {
  let randomString = "";
  const possibleChars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 6; i++) {
    randomString += possibleChars.charAt(Math.floor(Math.random() * possibleChars.length));
  }
  return randomString;
}

//function for finding a user by email
function findUserByEmail(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user].id;
    }
  }
  return null;
}



module.exports = { generateRandomString, findUserByEmail };