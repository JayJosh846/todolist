const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");
//const date = require(__dirname + "/date.js");

const app = express();



app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

// connecting to the mongoose servers
mongoose.connect("mongodb+srv://admin-jesudara:Test123@cluster0-apwfl.mongodb.net/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

// Creating a Schema for fruitDB - (Adding a table to the fruitsDB)
const itemSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, "Item name is required"]
        }
    }
);


// Creating a Model for the fruits Collection (table) taking two parameters (collection name and Schema)
const Item = mongoose.model("Item", itemSchema);


//Adding (Inserting) a fruit (Apple) data into the "Fruit" collection
const item1 = new Item(
    {
        name: "Welcome to you todo List"
    }
);

const item2 = new Item(
    {
        name: "Hit the  + button to add a new item"
    }
);


const item3 = new Item(
    {
        name: "<-- Hit this to delete an item"
    }
);

//Creating an Array of Items and storing the collections
const defaultItems = [item1, item2, item3];


const listSchema = new mongoose.Schema(
    {
        name: String,
        items: [itemSchema]
    }
);

const List = mongoose.model("List", listSchema);



//How to deleteMany records in collections
// Item.deleteMany({__v: 0}, function(err)
// {
//     if (err)
//     {
//         console.log(err);
//     }

//     else {
//         console.log("Successfully deleted");
        
//     }
// });

app.get("/", function(req, res)
{

    Item.find({}, function(err, founditems)
    {
        if (founditems.length === 0)
        {
            //Inserting Item collections with insertMany()
            Item.insertMany(defaultItems, function(err)
            {
                if (err)
                {
                    console.log(err)
                }

                else {
                    console.log("Successfully saved default items into DB");   
                } 
            });

            res.redirect("/");
        }

        else{
        res.render("list", {listTitle: "Today", newListItems: founditems});
        }
    });
});

app.get("/:customListName", function(req, res)
{
    const customListName = _.capitalize(req.params.customListName);

    List.findOne({name:customListName}, function(err, foundList)
    {
        if (!err)
        {
            if (!foundList)
            {
                //Create a new list
                const list = new List(
                    {
                        name: customListName,
                        items: defaultItems
                    }); 
            
                    list.save();
                    res.redirect("/" +customListName);
            }
            else{
                //Show an existing list
                res.render("list", {listTitle: foundList.name, newListItems: foundList.items});
            }
        }
    });

    
});

app.post("/", function(req, res)
{
    const itemName = req.body.newItem; 
    const listName = req.body.list;

    const item = new Item(
        {
            name: itemName
        });

        if(listName === "Today")
        {
            item.save();
            res.redirect("/");
        }

        else{
            List.findOne({name: listName}, function(err, foundList)
            {
                foundList.items.push(item);
                foundList.save();
                res.redirect("/" +listName);
            });
        }
        
});

app.post("/delete", function (req, res)
{
    const checkedItemId = req.body.checkbox;
    const listName = req.body.listName;

    if (listName === "Today")
    {
        Item.findByIdAndRemove(checkedItemId, function(err)
        {
            if (!err)
            {
                console.log("Successfully deleted checked Item");
                res.redirect("/");
            } 
        });
    }

    else{
        List.findOneAndUpdate({name: listName}, {$pull: {items:{_id: checkedItemId}}}, function(err, foundList)
        {
            if (!err)
            {
                res.redirect("/" +listName);
            }
        });
    }

   
});

app.get("/work", function(req, res)
{
    res.render("list", {listTitle: "Work List", newListItems: workItems})
});



app.get("/about", function(req, res)
{
    res.render("about");
})

app.listen(3000, function()
{
    console.log("Server running on port 3000");
});
