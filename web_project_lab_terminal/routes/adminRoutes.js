
// Import Models
const Product = require("../models/Products");
const Category = require("../models/Category");
const User = require('../models/User');
const userRoute = require('./user');
const expressEjsLayouts = require("express-ejs-layouts");

const express = require('express');
const router = express.Router();  

const bcrypt = require('bcryptjs');
const { check, validationResult } = require('express-validator');

router.get("/admin/dashboard", async (req, res) => {
  try {
    res.render("admin/dashboard", { layout: "layout" });
  } catch (error) {
    console.log(error);
    res.status(500).send("Error rendering admin page");
  }
});

// Login route
router.get('/login', (req, res) => {
  res.render('user/login');
});

// Login POST route
router.post('/login', [
  check('username').notEmpty().withMessage('Username is required'),
  check('password').notEmpty().withMessage('Password is required')
], async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.render('user/login', {
      errors: errors.array(),
      layout: 'homeLayout'
    });
  }

  const { username, password } = req.body;

  try {
    const user = await User.findOne({ username });
    if (!user) {
      return res.render('user/login', { error: 'Invalid credentials', layout: 'homeLayout' });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.render('user/login', { error: 'Invalid credentials', layout: 'homeLayout' });
    }

    // Store user ID in session
    req.session.userId = user._id;
    req.session.username = user.username; // Store the username

    res.redirect('/home');  // Redirect to home after login
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// Logout route
router.get('/logout', (req, res) => {
  req.session.destroy((err) => {
    if (err) return res.status(500).send('Failed to log out');
    res.redirect('/home');
  });
});

// Get all products
router.get("/admin/products", async (req, res) => {
  let page = req.query.page ? Number(req.query.page) : 1;
  let pageSize = 5;

  // Get search, filter, and sort parameters
  let searchQuery = req.query.search || "";
  let sortField = req.query.sort || "name"; // Default sorting field
  let sortOrder = req.query.order === "desc" ? -1 : 1; // Ascending or descending
  let priceFilter = req.query.price || ""; // Optional price filter

  // Build the filter object for MongoDB
  let filter = {};
  if (searchQuery.trim()) {
    filter.name = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
  }
  if (priceFilter) {
    filter.price = { $lte: Number(priceFilter) }; // Filter by price (less than or equal to)
  }

  // Count total records
  let totalRecords = await Product.countDocuments(filter);
  let totalPages = Math.ceil(totalRecords / pageSize);

  // Handle out-of-bounds pages
  if (page > totalPages) page = totalPages;
  if (page < 1) page = 1;

  // Fetch filtered, sorted, and paginated products
  let products = await Product.find(filter)
    .sort({ [sortField]: sortOrder }) // Dynamic sorting
    .limit(pageSize)
    .skip((page - 1) * pageSize);

  // Render products page
  return res.render("admin/products", {
    pageTitle: "Manage Your Products",
    products,
    page,
    pageSize,
    totalPages,
    totalRecords,
    searchQuery,
    sortField,
    sortOrder: req.query.order || "asc",
    priceFilter,
  });
});

// Get all categories with pagination, sorting, and search
router.get("/admin/category", async (req, res) => {
  let page = req.query.page ? Number(req.query.page) : 1;
  let pageSize = 5;

  let searchQuery = req.query.search || "";
  let sortField = req.query.sort || "title";
  let sortOrder = req.query.order === "desc" ? -1 : 1;

  let filter = {};
  if (searchQuery.trim()) {
    filter.title = { $regex: searchQuery, $options: "i" }; // Case-insensitive search
  }

  try {
    // Count total records
    let totalRecords = await Category.countDocuments(filter);
    let totalPages = Math.ceil(totalRecords / pageSize);

    if (page > totalPages) page = totalPages;
    if (page < 1) page = 1;

    // Fetch categories
    let categories = await Category.find(filter)
      .sort({ [sortField]: sortOrder })
      .limit(pageSize)
      .skip((page - 1) * pageSize);

    return res.render("admin/category", {
      pageTitle: "Manage Your Categories",
      categories,
      page,
      pageSize,
      totalPages,
      totalRecords,
      searchQuery,
      sortField,
      sortOrder: req.query.order || "asc",
    });
  } catch (err) {
    console.error("Error fetching categories:", err);  // Log the error to console
    res.status(500).send("Server error while fetching categories.");  // Send a detailed error message
  }
});


// Create a new product
router.post("/products", async (req, res) => {
  try {
    await Product.create(req.body);
    res.redirect("/admin/products");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to add product.");
  }
});

router.get("/admin/products/delete/:id", async (req, res) => {
  await Product.findByIdAndDelete(req.params.id);
  return res.redirect("back");
});

router.get("/admin/products/edit/:id", async (req, res) => {
  let product = await Product.findById(req.params.id);
  return res.render("admin/products-edit-form", {
    product,
    layout: "admin/admin-layout",
  });
});

// Render edit category form
router.get("/admin/category/edit/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send("Category not found.");
    }
    res.render("admin/editCategory", { category });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch category details.");
  }
});

// Update a category
router.post("/admin/category/edit/:id", async (req, res) => {
  try {
    const { name } = req.body;

    // Validate required fields
    if (!name) {
      return res.status(400).send("Name is required.");
    }

    const updatedCategory = await Category.findByIdAndUpdate(
      req.params.id,
      { title: name },
      { new: true } // Return the updated document
    );

    if (!updatedCategory) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/admin/category");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update category.");
  }
});

// CRUD for category
// Get all categories
router.get("/category", async (req, res) => {
  try {
    const category = await Category.find();
    res.render("admin/category", { category });
  } catch (err) {
    console.error("Error fetching categories:", err);
    res.status(500).render("admin/error", { message: "Failed to load categories." });
  }
});

// Create a new category
router.post("/category", async (req, res) => {
  try {
    const { title } = req.body;
    if (!title) {
      return res.status(400).send("Category name is required.");
    }
    await Category.create({ title });
    res.redirect("/admin/category");
  } catch (err) {
    console.error("Error adding category:", err);
    res.status(500).render("admin/error", { message: "Failed to add category." });
  }
});

router.get("/admin/category/delete/:id", async (req, res) => {
  await Categories.findByIdAndDelete(req.params.id);
  return res.redirect("back");
});
// router.get("/category/delete/:id", async (req, res) => {
//   try {
//     const category = await Category.findByIdAndDelete(req.params.id);
//     if (!category) {
//       return res.status(404).send("category not found.");
//     }
//     res.redirect("back");
//   } catch (err) {
//     console.error(err);
//     res.status(500).send("Failed to delete product.");
//   }
// });

// Render update category form
router.get("/category/edit/:id", async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);
    if (!category) {
      return res.status(404).send("Category not found.");
    }
    res.render("admin/editCategory", { category });
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to fetch category details.");
  }
});

// Update a category
router.post("/category/edit/:id", async (req, res) => {
  try {
    const categoryId = req.params.id;
    const { title } = req.body; // Use title instead of name
    const updatedCategory = await Category.findByIdAndUpdate(categoryId, { title }, { new: true });

    if (!updatedCategory) {
      return res.status(404).send("Category not found.");
    }

    res.redirect("/admin/category");
  } catch (err) {
    console.error(err);
    res.status(500).send("Failed to update category.");
  }
});

module.exports = router;
