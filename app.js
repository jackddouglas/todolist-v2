const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

const items = ["Buy Food", "Cook Food", "Eat Food"];
const workItems = [];
const day = date.getDate();

app.get("/", (req, res) => {
  res.render("list", {
    listTitle: "Personal List",
    kindOfDay: day,
    newListItems: items,
  });
});

app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
    kindOfDay: day,
    newListItems: workItems,
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.post("/", (req, res) => {
  if (req.body.list === "Work") {
    workItems.push(req.body.newItem);
    res.redirect("/work");
  } else {
    items.push(req.body.newItem);
    res.redirect("/");
  }
});

app.post("/work", (req, res) => {
  workItems.push(req.body.newItem);

  res.redirect("/work");
});

app.listen(3000, () => {
  console.log("Server started on port 3000");
});
