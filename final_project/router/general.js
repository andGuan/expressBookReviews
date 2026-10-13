const express = require('express');
const axios = require('axios').default;
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const bookApiBaseUrl = (process.env.BOOKSHOP_API_BASE_URL || 'http://localhost:5000').replace(/\/$/, '');

const getBooks = async () => {
  const response = await axios.get(`${bookApiBaseUrl}/`);
  return response.data;
};

const getBookByISBN = async (isbn) => {
  const response = await axios.get(`${bookApiBaseUrl}/isbn/${encodeURIComponent(isbn)}`);
  return response.data;
};

const getBooksByAuthor = async (author) => {
  const response = await axios.get(`${bookApiBaseUrl}/author/${encodeURIComponent(author)}`);
  return response.data;
};

const getBooksByTitle = async (title) => {
  const response = await axios.get(`${bookApiBaseUrl}/title/${encodeURIComponent(title)}`);
  return response.data;
};


public_users.post("/register", (req,res) => {
  const { username, password } = req.body || {};

  if (!username || !password) {
    return res.status(404).json({ message: "Unable to register user." });
  }

  if (isValid(username)) {
    return res.status(404).json({ message: "User already exists!" });
  }

  users.push({ username, password });
  return res.status(200).json({
    message: "User successfully registered. You can now login."
  });
});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.send(JSON.stringify(books, null, 2));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  return res.send(books[isbn]);
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author;
  const matchingBooks = [];
  const bookKeys = Object.keys(books);

  for (const key of bookKeys) {
    if (books[key].author === author) {
      matchingBooks.push(books[key]);
    }
  }

  return res.send(matchingBooks);
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title;
  const matchingBooks = [];
  const bookKeys = Object.keys(books);

  for (const key of bookKeys) {
    if (books[key].title === title) {
      matchingBooks.push(books[key]);
    }
  }

  return res.send(matchingBooks);
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const book = books[req.params.isbn];
  if (!book) {
    return res.status(404).json({ message: "Book not found" });
  }

  return res.send(book.reviews);
});

module.exports.general = public_users;
module.exports.getBooks = getBooks;
module.exports.getBookByISBN = getBookByISBN;
module.exports.getBooksByAuthor = getBooksByAuthor;
module.exports.getBooksByTitle = getBooksByTitle;
