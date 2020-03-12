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
  axios.get("https://www.theonion.com/").then(async function(response) {
    var $ = cheerio.load(response.data);
    //article class
    await $(".fwjlmD").each(
      function(i, element) {
        //push each inserted item into array to send to DOM
        var resultArr = [];
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

          // check if results already exist in db, only insert if they don't exist
          db.OnionArticle.findOne({ link: result.link })
            .then(function(found) {
              //if not in db, add to db & render to DOM
              if (!found) {
                db.OnionArticle.create(result)
                  .then(function(inserted) {
                    // console.log("new articles found and added to db", inserted);
                    resultArr.push(inserted);
                    // res.json(inserted);
                  })
                  .catch(function(err) {
                    console.log(err);
                  });
              }
            })
            .catch(function(err) {
              res.json(err);
            });
        }
      },
      function() {
        db.OnionArticle.find({}, function(error, found) {
          if (error) {
            console.log("error", error);
          } else {
            // console.log(found);
            res.json(found);
          }
        });
      }
    );
  });
});

app.get("/getonion", function(req, res) {
  db.OnionArticle.find({})
    .sort({ title: 1 })
    .exec(function(err, found) {
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
