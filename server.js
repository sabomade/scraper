// Dependencies
var express = require("express");
var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

//set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect to Mongodb
// const db = require("./config/keys").mongoURI;

// mongoose
//   .connect(db, { useNewUrlParser: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// Database configuration
var dbUrl = "scraper";
var collections = ["onion", "beauty"];

//Hook for mongojs
var db = mongojs(dbUrl, collections);
db.on("error", function(error) {
  console.log("Database Error:", error);
});

//Main route
app.get("/", function(req, res) {
  res.send("Hello World");
});

//Retrieve data from DB
app.get("/all", function(req, res) {
  db.beauty.find({}, function(error, found) {
    if (error) {
      console.log(error);
    } else {
      res.json(found);
    }
  });
});

//Scrape data from a site & save in mongo db
app.get("/scrape", function(req, res) {
  axios.get("https://sokoglam.com/blogs/news").then(function(response) {
    var $ = cheerio.load(response.data);
    //article class
    $(".article-content").each(function(i, element) {
      //save link & title of current element
      var link = $(element)
        .children("h2")
        .children("a")
        .attr("href");
      var title = $(element)
        .children("h2")
        .children("a")
        .text();
      var date = $(element)
        .children("span")
        .text()
        .split("\n")[1]
        .trim();
      var author = $(element)
        .children("span")
        .children("span")
        .text();

      //if both were found
      if (link && title && date && author) {
        db.beauty.insert(
          {
            title,
            link,
            date,
            author
          },
          function(err, inserted) {
            if (err) {
              console.log(err);
            } else {
              console.log(inserted);
              res.json(inserted);
            }
          }
        );
      }
    });
  });
});

app.get("/date", function(req, res) {
  db.beauty.find().sort({ date: 1 }, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});

app.get("/author", function(req, res) {
  db.beauty.find().sort({ author: 1 }, function(err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});

//listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port", PORT);
});
