const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser"); // remove this line

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true })); //change to express.urlencoded

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

//Object for storing users
const users = {};

//Endpoint for handling registration form data
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be empty.");
  }

  // check if email already exists in users object
  for (let userId in users) {
    if (users[userId].email === email) {
      return res.status(400).send("Email already registered. Please choose a different email or log in.");
    }
  }

  // create new user object
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: password
  };

  res.cookie("user_id", userId);
  res.redirect("/urls");
});

// renders the urls_index template with the urlDatabase and user object passed as template variables
app.get('/urls', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    urls: urlDatabase,
    user: user
  };
  res.render('urls_index', templateVars);
});

// listens for a post request to the "/urls" path, generates a random short url,
// assigns the long url to the short url in the urlDatabase and redirects to the "/urls/shortURL"
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// listens for a post request to /login and sets a user_id cookie
app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (user && user.password === req.body.password) {
    res.cookie("user_id", user.id);
    res.redirect("/urls");
  } else {
    res.status(401).send("Invalid email or password");
  }
});

// listens for a POST request to the path "/logout" and clears the "user_id" cookie, then redirects the user back to the "/urls" page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/urls");
});

app.get("/register", (req, res) => {
  res.render("register");
});

app.get('/urls/new', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user };
  res.render('urls_new', templateVars);
});

// renders the urls_show template with the url id, long url and user object passed as template variables
app.get('/urls/:id', (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id],
    user: user
  };
  res.render('urls_show', templateVars);
});

//redirects the short url to the corresponding long url
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id];
  res.redirect(longURL);
});

//deletes a short url from the urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  delete urlDatabase[shortURL];
  res.redirect("/urls");
});

//updates the long url of a short url in the urlDatabase
app.post("/urls/:id/update", (req, res) => {
  const shortURL = req.params.id;
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect("/urls");
});

// renders the default page
app.get("/", (req, res) => {
  res.send("Hello!");
});

// returns the urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// renders an html page with the message "Hello World"
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

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
function findUserByEmail(email) {
  for (const id in users) {
    if (users[id].email === email) {
      return users[id];
    }
  }
  return null;
}
