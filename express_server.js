const express = require("express");
const { generateRandomString, findUserByEmail, users } = require('./tinyAppHelper');
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
app.use(cookieParser());
app.use(express.urlencoded({ extended: true })); //change to express.urlencoded


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};


// renders the default page
app.get("/", (req, res) => {
  res.send("Hello!");
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
  const userId = req.cookies.user_id;
  if (userId && users[userId]) {
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("You must be logged in to shorten URLs. Please <a href='/login'>log in</a>.");
  }

});

app.get('/urls/new', (req, res) => {
  if (req.cookies.user_id) {
    const user = users[req.cookies.user_id];
    const templateVars = { user: user };
    res.render('urls_new', templateVars);
  } else {
    res.redirect("/login");
  }
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
  if (!longURL) {
    return res.status(404).send("Shortened URL not found. Click <a href='/urls'>here</a> to go back to URLS");
  }
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


app.get("/register", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user };
  if (req.cookies.user_id) {
    res.redirect("urls");
  } else {
    res.render("register", templateVars);
  }
});


//Endpoint for handling registration form data
app.post("/register", (req, res) => {
  let email = req.body.email;
  let password = req.body.password;

  // check if email or password is empty
  if (!email || !password) {
    return res.status(400).send("Email or password cannot be empty.");
  }
  // check if email already exists in users object
  let existingUser = findUserByEmail(email);
  if (existingUser) {
    return res.status(400).send("Email already registered. Please choose a different <a href='/register'>email</a> or <a href='/login'>login</a>");
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

app.get("/login", (req, res) => {
  const user = users[req.cookies.user_id];
  const templateVars = { user: user };
  if (req.cookies.user_id) {
    res.redirect("/urls");
  } else {
    res.render("login", templateVars);
  }
});

// listens for a post request to /login and sets a user_id cookie
app.post("/login", (req, res) => {
  const user = findUserByEmail(req.body.email);
  if (!user) {
    return res.status(403).send("A user with that email cannot be found. Click <a href='/register'>here</a> to register.");
  }
  if (user.password !== req.body.password) {
    return res.status(403).send("Incorrect password. Click <a href='/login'>here</a> to try again.");
  }
  res.cookie("user_id", user.id);
  res.redirect("/urls");
});


// listens for a POST request to the path "/logout" and clears the "user_id" cookie, then redirects the user back to the "/urls" page
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect("/login");
});



// returns the urlDatabase as a JSON object
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



// renders an html page with the message "Hello World"
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});




app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});
