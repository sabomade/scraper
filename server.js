// Dependencies
var express = require("express");
// var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");
var path = require("path");

// Require all models
var db = require("./models");

// Initialize Express
var app = express();
var PORT = process.env.PORT || 3000;

// Sets up the Express app to handle data parsing
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Static directory
app.use(express.static("public"));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

//Retrieve data from DB /all
app.get("/", function(req, res) {
  res.sendFile(path.join(__dirname, "../public/index.html"));
});

//Scrape data from a site & save in mongo db
app.get("/scrape-onion", function(req, res) {
  //remove any articles that were not saved in the previous scrape
  db.OnionArticle.find({ saved: false }).remove();

  //scrape articles
  axios.get("https://www.theonion.com/").then(async function(response) {
    var $ = cheerio.load(response.data);

    //article class
    await $(".fwjlmD").each(function(i, element) {
      //save an empty result object
      var result = {};
      //add link, title, date, & author of current element to result obj
      result.link = $(this).attr("href");
      result.title = $(this)
        .children("h4")
        .text();
      result.description = $(this)
        .children("p")
        .text();

      //if all were found
      if (result.link && result.title && result.description) {
        // console.log("result", result);
        db.OnionArticle.create(result)
          .then(function(inserted) {
            // console.log("new articles found and added to db", inserted);
          })
          .catch(function(err) {
            console.log(err);
          });
      }
    });
  });
});

app.get("/getonion", function(req, res) {
  db.OnionArticle.find({}).exec(function(err, found) {
    if (err) {
      console.log(err);
    } else {
      res.json(found);
    }
  });
});

app.get("/saved", function(req, res) {
  db.OnionArticle.find({ saved: true }).exec(function(err, found) {
    if (err) {
      console.log("err", err);
    } else {
      res.json(found);
    }
  });
});

//listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port", PORT);
});
