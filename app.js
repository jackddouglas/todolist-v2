const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
const { get } = require("lodash");

const app = express();
app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

mongoose.connect(
  "mongodb+srv://admin:Test123@cluster0.fdap6.mongodb.net/todolistDB",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);
mongoose.set("useFindAndModify", false);

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

const listSchema = {
  name: String,
  items: [itemsSchema],
};

const List = mongoose.model("List", listSchema);

app.get("/", (req, res) => {
  List.find({}, (err, results) => {
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
        const temp = [];
        results.forEach((e) => {
          temp.push(e.name);

          if (e.name === "Favicon.ico") {
            List.deleteOne({ name: e.name }, (err) => {});
          }
        });
        const lists = [...new Set(temp)];

        res.render("list", {
          listTitle: "Today",
          newListItems: items,
          lists: lists,
        });
      }
    });
  });
});

app.get("/about", (req, res) => {
  res.render("about");
});

app.get("/:list", (req, res) => {
  const customListName = _.capitalize(req.params.list);

  List.find({}, (err, results) => {
    List.findOne({ name: customListName }, (err, result) => {
      if (err) {
        console.log(err);
      } else {
        const temp = [];
        results.forEach((e) => {
          temp.push(e.name);
        });
        const lists = [...new Set(temp)];

        if (result) {
          res.render("list", {
            listTitle: result.name,
            newListItems: result.items,
            lists: lists,
          });
        } else {
          const list = new List({
            name: customListName,
            items: defaultItems,
          });
          list.save();
          res.redirect("/" + customListName);
        }
      }
    });
  });
});

app.post("/", (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName,
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({ name: listName }, (err, results) => {
      results.items.push(item);
      results.save();
      res.redirect("/" + listName);
    });
  }
});

app.post("/delete", (req, res) => {
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId, (err) => {
      if (err) {
        console.log(err);
      } else {
        console.log("Succesfully deleted checked item.");
        res.redirect("/");
      }
    });
  } else {
    List.findOneAndUpdate(
      { name: listName },
      { $pull: { items: { _id: checkedItemId } } },
      (err) => {
        if (err) {
        } else {
          res.redirect("/" + listName);
        }
      }
    );
  }
});

app.post("/create", (req, res) => {
  const listName = req.body.newList;
  res.redirect("/" + listName);
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, () => {
  console.log("Server has started succesfully.");
});
