const express = require("express");
const bcrypt = require("bcryptjs");
var cookieSession = require('cookie-session');
const app = express();
const PORT = 8080; // default port 8080

const { generateRandomString, findUserByEmail } = require('./tinyAppHelper');

app.set("view engine", "ejs");


//MIDDLEWARE
app.use(express.urlencoded({ extended: true })); //change to express.urlencoded
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const users = {};

const urlDatabase = {};


/// Routes

// renders the default page and redirects users to the appropriate page
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


// renders the urls_index template with the urlDatabase and user object passed as template variables;
app.get('/urls', (req, res) => {
  if (req.session.user_id) {
    const userUrls = urlsForUser(req.session.user_id);
    const user = users[req.session.user_id];
    const templateVars = {
      urls: userUrls,
      user: user
    };
    res.render('urls_index', templateVars);
  } else {
    return res.status(401).send("Please log in to access URLS. Click <a href='/login'>here</a> to login");
  }
});


// generates a random short url,
// assigns the long url to the short url in the urlDatabase and redirects to the "/urls/shortURL"
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: req.session.user_id };
  res.redirect(`/urls`);
});


app.get('/urls/new', (req, res) => {
  if (req.session.user_id) {
    const user = users[req.session.user_id];
    const templateVars = { user: user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
});


// renders the urls_show template with the url id, long url and user object passed as template variables
app.get('/urls/:id', (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[req.params.id] && urlDatabase[req.params.id].longURL, user: user, urlDatabase: urlDatabase
  };
  res.render('urls_show', templateVars);
});


//redirects the short url to the corresponding long url
app.get("/u/:id", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Please log in to access URLS. Click <a href='/login'>here</a> to login");
  }
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url || url.userID !== req.session.user_id) {
    return res.status(401).send("Shortened URL not found. Click <a href='/urls'>here</a> to go back to URLS");
  }
  const longURL = urlDatabase[req.params.id] && urlDatabase[req.params.id].longURL;
  if (!longURL) {
    return res.status(404).send("Shortened URL not found. Click <a href='/urls'>here</a> to go back to URLS");
  }
  res.redirect(longURL);
});


//deletes a short url from the urlDatabase
app.post("/urls/:id/delete", (req, res) => {
  if (!req.session.user_id) {
    return res.status(401).send("Please log in to access URLS. Click <a href='/login'>here</a> to login");
  }
  const shortURL = req.params.id;
  const url = urlDatabase[shortURL];
  if (!url || url.userID !== req.session.user_id) {
    return res.status(401).send("You do not have permission to delete this URL");
  }
  delete urlDatabase[req.params.id];
  res.redirect("/urls");
});


// updates the long url of a short url in the urlDatabase
app.post("/urls/:id/update", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = urlsForUser(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.id)) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    res.status(401).send("You do not have authorization to edit this short URL.");
  }
});


app.get("/register", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if (req.session.user_id) {
    res.redirect("urls");
  } else {
    res.render("register", templateVars);
  }
});


app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email or password cannot be empty.");
  }
  let existingUser = findUserByEmail(email);

  if (existingUser) {
    return res.status(400).send("Email already registered. Please choose a different <a href='/register'>email</a> or <a href='/login'>login</a>");
  }
  const hashedPassword = bcrypt.hashSync(password, 10);
  let userId = generateRandomString();
  users[userId] = {
    id: userId,
    email: email,
    password: hashedPassword
  };
  req.session.user_id = userId;
  res.redirect("/urls");
});


app.get("/login", (req, res) => {
  const user = users[req.session.user_id];
  const templateVars = { user: user };
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// Sets a user_id cookie
app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send("A user with that email cannot be found. Click <a href='/register'>here</a> to register.");
  }
  if (!bcrypt.compareSync(req.body.password, user.password)) {
    return res.status(403).send("Incorrect password. Click <a href='/login'>here</a> to try again.");
  }
  req.session.user_id = user.id;
  res.redirect("/urls");
});


// Clears the "user_id" cookie, then redirects the user back to the "/urls" page
app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect("/login");
});


// returns the urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});



// Function to filter URLs by user ID
function urlsForUser(id) {
  const filteredURLs = {};
  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      filteredURLs[shortURL] = urlDatabase[shortURL];
    }
  }
  return filteredURLs;
}