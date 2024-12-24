const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const session = require('express-session');
const expressLayouts = require("express-ejs-layouts");
const userRoute = require('./routes/user');  // Ensure you have this route
const adminRoutes = require('./routes/adminRoutes');
const cookieParser = require('cookie-parser');
const URL = require("./models/url");
const urlRoute = require("./controllers/url");
const {restrictToLoggedinUserOnly, checkAuth} = require('./middlewares/auth');

//const myMiddleware = require('./middleware');

// MongoDB Connection
const connectionString = "mongodb://127.0.0.1:27017/temp";
mongoose
  .connect(connectionString, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    console.log(`Connected to MongoDB: ${connectionString}`);
  })
  .catch((err) => {
    console.error("Database connection error:", err.message);
    process.exit(1);
  });

  // Middleware
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(expressLayouts); 
app.use(cookieParser());
app.use(session({
  secret: 'your_secret_key',
  resave: false,
  saveUninitialized: true
}));

//app.use("/url", restrictToLoggedinUserOnly, urlRoute);
//app.use("/", checkAuth, staticRoute);
//app.use(myMiddleware); 

app.get("/home", (req, res) => {
  res.render("user/home", { layout: 'homeLayout', user: req.session.user });
});

app.use("/user", userRoute);

app.get('/', (req, res) => {
  // Pass the `user` object (from session) to the template
  res.render('home', { user: req.session.user });
});

app.use((req, res, next) => {
  res.locals.user = req.session.user || null;  // Add `user` to locals for all views
  next();
});

app.get("/url/:shortId", async (req, res) => {
  const shortId = req.params.shortId;
  const entry = await URL.findOneAndUpdate(
    {
      shortId,
    },
    {
      $push: {
        visitHistory: {
          timestamp: Date.now(),
        },
      },
    }
  );
  res.redirect(entry.redirectURL);
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Authenticate the user (replace this with your actual authentication logic)
    const user = { username: username };  // Example of a user object

    // Store the user object in the session
    req.session.user = user;

    // Redirect to home page or wherever you want
    res.redirect('/home');
});

// View Engine Setup
app.set("view engine", "ejs");

// Routes
productcontroller = require("./routes/adminRoutes") ;
app.use(productcontroller);

// Home Route
app.get("/", (req, res) => {
  res.render("/admin/dashboard", {layout : 'layout'});
});

app.get("/home", (req, res) => {
  res.render("user/home",  {layout : 'homeLayout'});
});

app.get("/about_us.ejs", (req, res) => {
  res.render("user/about_us.ejs",  {layout : 'homeLayout'});
});

app.get("/contact_us.ejs", (req, res) => {
  res.render("user/contact_us.ejs",  {layout : 'homeLayout'});
});

app.get("/products.ejs", (req, res) => {
  res.render("user/products.ejs",  {layout : 'homeLayout'});
});

app.get("/single_product.ejs", (req, res) => {
  res.render("user/single_product.ejs",  {layout : 'homeLayout'});
});

// Error Handling Middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send("Something went wrong!");
});

// Start the Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

// Graceful Shutdown for Database Connection
process.on("SIGINT", async () => {
  await mongoose.connection.close();
  console.log("Database connection closed.");
  process.exit(0);
});




