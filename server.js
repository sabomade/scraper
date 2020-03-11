// Dependencies
var express = require("express");
// var mongojs = require("mongojs");
// Require axios and cheerio. This makes the scraping possible
var axios = require("axios");
var cheerio = require("cheerio");
var exphbs = require("express-handlebars");
var mongoose = require("mongoose");

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

//set up handlebars
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars");

//connect to Mongodb
// const db = require("./config/keys").mongoURI;

// mongoose
//   .connect(db, { useNewUrlParser: true })
//   .then(() => console.log("MongoDB Connected"))
//   .catch(err => console.log(err));

// Connect to the Mongo DB
mongoose.connect("mongodb://localhost/scraper", { useNewUrlParser: true });

//Retrieve data from DB /all
app.get("/", function(req, res) {
  res.render("articles");
});

//Scrape data from a site & save in mongo db
app.get("/scrape-beauty", function(req, res) {
  axios.get("https://sokoglam.com/blogs/news").then(async function(response) {
    var $ = cheerio.load(response.data);
    //article class
    await $(".article-content").each(function(i, element) {
      //save an empty result object
      var result = {};

      //add link, title, date, & author of current element to result obj
      result.link = $(this)
        .children("h2")
        .children("a")
        .attr("href");
      result.title = $(this)
        .children("h2")
        .children("a")
        .text();
      result.date = $(this)
        .children("span")
        .text()
        .split("\n")[1]
        .trim();
      result.author = $(this)
        .children("span")
        .children("span")
        .text();

      //if both were found
      if (result.link && result.title && result.date && result.author) {
        //console.log("result", result);

        //check if results already exist in db, only insert if they don't exist
        db.BeautyArticle.findOne({ link: result.link })
          .then(function(found) {
            //if not in db, add to db & render to DOM
            if (!found) {
              db.BeautyArticle.create(result)
                .then(function(inserted) {
                  console.log("new articles found and added to db", inserted);

                  res.render("kblog", { blogPost: inserted });
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
    });
    //res.status(200).finish();
  });
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
            res.json(found);
          }
        });
      }
    );
    // res.status(200).finish();
  });
});

app.get("/date", function(req, res) {
  db.BeautyArticle.find({})
    .sort({ date: 1 })
    .exec(function(err, found) {
      if (err) {
        console.log(err);
      } else {
        //res.json(found);
        res.render("index", { blogPost: found });
      }
    });
});

app.get("/author", function(req, res) {
  db.BeautyArticle.find({})
    .sort({ author: 1 })
    .exec(function(err, found) {
      if (err) {
        console.log(err);
      } else {
        //res.json(found);
        res.render("index", { blogPost: found });
      }
    });
});

//listen on port 3000
app.listen(PORT, function() {
  console.log("App running on port", PORT);
});
