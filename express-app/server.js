const express = require("express");
let app = express();
var expressLayouts = require("express-ejs-layouts");
app.use(express.static("public"));

app.set("view engine", "ejs");
app.use(expressLayouts);

app.get("/views/Assignment", (req, res) => {
  res.render("Assignment");
});

app.get("/views/cv", (req, res) => {
  res.render("cv");
});


app.listen(5000, () => {
  console.log("Server started at localhost:5000");
});
