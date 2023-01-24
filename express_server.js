const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.use(express.urlencoded({ extended: true }));

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

// renders the urls_index template with the urlDatabase passed as a template variable
app.get('/urls', (req, res) => {
  const templateVars = { urls: urlDatabase };
  res.render('urls_index', templateVars);
});

// renders the urls_new template
app.get('/urls/new', (req, res) => {
  res.render('urls_new');
});

// listens for a post request to the "/urls" path, generates a random short url,
// assigns the long url to the short url in the urlDatabase and redirects to the "/urls/shortURL"
app.post("/urls", (req, res) => {
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// renders the urls_show template with the url id and long url passed as a template variable
app.get('/urls/:id', (req, res) => {
  const templateVars = { id: req.params.id, longURL: urlDatabase[req.params.id] };
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