const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
//write code to check is the username is valid
}

const authenticatedUser = (username,password)=>{ //returns boolean
//write code to check if username and password match the one we have in records.
}
// Register a new user
regd_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  // Check if both username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }

  // Check if username already exists
  const userExists = users.some(user => user.username === username);
  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });

  return res.status(201).json({ message: "User registered successfully" });
});

//only registered users can login

regd_users.post("/login", (req,res) => {
  //Write your code here
  const { username, password } = req.body;

  // Check if username and password are provided
  if (!username || !password) {
    return res.status(400).json({ message: "Both username and password are required" });
  }

  // Find the user by username
  const user = users.find(user => user.username === username);

  // If the user doesn't exist or password doesn't match
  if (!user || user.password !== password) {
    return res.status(401).json({ message: "Invalid username or password" });
  }

  // Create a JWT token (use a secret key, you can replace "secretKey" with a real secret)
  const token = jwt.sign({ username }, "secretKey", { expiresIn: '1h' });
  
  return res.status(200).json({message: "login successful", token});
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  //Write your code here
    const isbn = req.params.isbn;
    const review = req.query.review;
    const username = req.user?.username;  // Assuming you set `req.user` after JWT validation
  
    if (!username) {
      return res.status(401).json({ message: "You must be logged in to post a review." });
    }
  
    if (!review) {
      return res.status(400).json({ message: "Review text is required." });
    }
  
    if (books[isbn]) {
      // If no reviews exist for this ISBN, initialize an empty object
      if (!books[isbn].reviews) {
        books[isbn].reviews = {};
      }
  
      // Add or overwrite the user's review
      books[isbn].reviews[username] = review;
  
      return res.status(200).json({ 
        message: `Review for book ${isbn} has been added/updated by ${username}.`,
        reviews: books[isbn].reviews
      });
    } else {
      return res.status(404).json({ message: "Book not found." });
    }
  });
  
//   return res.status(300).json({message: "Yet to be implemented"});
// });

regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.user.username;  // fetched from the decoded JWT token

  if (books[isbn]) {
    let reviews = books[isbn].reviews;

    if (reviews[username]) {
      delete reviews[username];  // delete the user's review
      return res.status(200).json({ message: "Review deleted successfully!" });
    } else {
      return res.status(404).json({ message: "No review found for this user on this book." });
    }
  } else {
    return res.status(404).json({ message: "Book not found." });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
