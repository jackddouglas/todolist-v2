const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/todolistDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

const itemsSchema = {
  name: String,
};

const Item = mongoose.model("Item", itemsSchema);

const item1 = new Item({
  name: "This is an item.",
});

const item2 = new Item({
  name: "Click the checkbox to cross it out.",
});

const item3 = new Item({
  name: "Write your own below.",
});

const defaultItems = [item1, item2, item3];

app.get("/", (req, res) => {
  Item.find({}, (err, items) => {
    if (items.length === 0) {
      Item.insertMany(defaultItems, (err) => {
        if (err) {
          console.log(err);
        } else {
          console.log("Succesfully updated Item collection");
        }
      });

      res.redirect("/");
    } else {
      res.render("list", {
        listTitle: "Personal List",
        newListItems: items,
      });
    }
  });
});

app.get("/work", (req, res) => {
  res.render("list", {
    listTitle: "Work List",
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
    const itemName = req.body.newItem;

    const item = new Item({
      name: itemName,
    });

    item.save();
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
