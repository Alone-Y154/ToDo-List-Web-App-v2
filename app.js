//jshint esversion:6

const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require("lodash");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// mongoose.connect("mongodb://localhost:27017/todolistDB",{useNewUrlParser: true});
// because we need to connect it to the database using mongodb atlas we no longer need "mongod"
// password for the database is "test123"
mongoose.connect("mongodb+srv://admin-yo:test123@cluster0.rtp4w.mongodb.net/todolistDB",{useNewUrlParser: true});
const itemsSchema = ({
  name:String
});

const Item = mongoose.model("Item",itemsSchema);
// const items = ["Buy Food", "Cook Food", "Eat Food"];
// const workItems = [];

const item1 = new Item({
  name: "Welcome to the todolist!"
});

const item2 = new Item({
  name: "Hit the + button to add a new item"
});

const item3 = new Item({
  name: "<-- Hit this to delete an item"
});

const defaultItems = [item1,item2,item3];


const listSchema = {
  name:String,
  items: [itemsSchema]
};

const List = mongoose.model("List", listSchema);


app.get("/", function(req, res) {

  Item.find({}, (err,foundItems) => {

    if (foundItems.length === 0) {
      Item.insertMany(defaultItems,(err)=>{
        if (err) {
          console.log(err);
        }
        else {
          console.log("sucessfully saved the default array");
        }
      });
      res.redirect("/");
    }
    else {
    res.render("list", {listTitle: "Today", newListItems: foundItems});
  }
});
// const day = date.getDate();

});

app.get("/:customName",(req,res)=>{
  const customName = _.capitalize(req.params.customName);

List.findOne({name: customName},(err,foundList) => {
  if (!err) {
    if (!foundList) {
      // create a new list
      const list = new List({
        name: customName,
        items: defaultItems
      });
      list.save();
      res.redirect("/"+ customName);

    }else {
      // if list already exist
      res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
    }
  }

});


});

app.post("/", function(req, res){

  const itemName = req.body.newItem;
  const listName = req.body.list;

  const item = new Item({
    name: itemName
  });

  if (listName === "Today") {
    item.save();
    res.redirect("/");
  } else {
    List.findOne({name:listName},(err,foundList)=>{
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+ listName);
    });
  }


  // if (req.body.list === "Work") {
  //   workItems.push(item);
  //   res.redirect("/work");
  // } else {
  //   items.push(item);
  //   res.redirect("/");
  // }
});

app.post("/delete",(req,res)=>{
  const checkedItemId = req.body.checkbox;
  const listName = req.body.listName;

  if (listName === "Today") {
    Item.findByIdAndRemove(checkedItemId,(err)=> {
      if (!err) {
        console.log("sucessfully removed the item by id");
        res.redirect("/");
      }

    });
  } else {
    List.findOneAndUpdate({name:listName},{$pull:{items: {_id: checkedItemId}}},(err,foundList)=>{
      if (!err) {
        res.redirect("/"+ listName);
      }
    });
  }

});

// app.get("/work", function(req,res){
//   res.render("list", {listTitle: "Work List", newListItems: workItems});
// });


app.get("/about", function(req, res){
  res.render("about");
});

app.listen(process.env.PORT || 3000, function() {
  console.log("Server started sucessfully");
});
