var express = require("express");
var bodyParser = require("body-parser");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require("express-handlebars");
var request = require("request");

// Scraping tools
// Axios is a promised-based http library, similar to jQuery's Ajax method
// It works on the client and on the server
var axios = require("axios");
var cheerio = require("cheerio");

// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

// Configure middleware
// Use morgan logger for logging requests
app.use(logger("dev"));

// Use body-parser for handling form submissions
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to the Mongo DB
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost:27017/nytHeadlines";
mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI);

app.engine("handlebars", exphbs({
  defaultLayout: "main"}));
app.set("view engine", "handlebars");

// Use express.static to serve the public folder as a static directory
app.use(express.static("public"));

// *** ROUTES ***
// Home 
app.get("/", function(req, res) {
  db.Article.find()
    .exec()
    .then(function (doc) {
      res.render("index", { article: doc});
    });
});

// All Articles
app.get("/all", function(req, res) {
  db.Article.find()
    .exec()
    .then(function (doc) {
      res.send(doc);
    });
});

// Scrape Articles
app.get('/scrape', function (req, res) {
  request('http://www.nytimes.com', function (err, response, html) {
      var $ = cheerio.load(html);
      var array = [];

      $('.story-heading').each(function () {
          var title = $(this).children('a').text();
          var link = $(this).children('a').attr('href');
          var summary = $(this).siblings('p').text();

          console.log(title);
          console.log(link);
          console.log(summary);

          if (title && link && summary) {
              array.push({ title: title, link: link, summary: summary });
              var article = new db.Article({
                  title: title,
                  link: link,
                  summary: summary
              });
              // console.log('TITLE = ' + article.title);
              // console.log('LINK = ' + article.link);
              // console.log('SUMMARY = ' + article.summary);
              article.save();
          };
      });
      res.send(array);
  });
});

// clear all scraped articles
app.get('/clear', function (req, res) {
  db.Article.remove({})
      .exec()
      .then(function (result) {
          res.send(result);
      });
});

// // Scrape Articles
// app.get("/scrape", function(req, res) {
//   // First, we grab the body of the html with request
//   axios.get("http://www.nytimes.com/").then(function(response) {
//     // Then, we load that into cheerio and save it to $ for a shorthand selector
//     var $ = cheerio.load(response.data);

//     // Now, we grab every h2 within an article tag, and do the following:
//     $("article h2").each(function(i, element) {
//       // Save an empty result object
//       var result = {};

//       // console.log(result.title);

//       // Add the text and href of every link, and save them as properties of the result object
//       result.title = $(this)
//         .children("a")
//         .text();
//       result.link = $(this)
//         .children("a")
//         .attr("href");
//       result.summary = $(this)
//         .siblings("p")
//         .text();

//       // Create a new Article using the `result` object built from scraping
//       db.Article.create(result)
//         .then(function(dbArticle) {
//           // View the added result in the console
//           console.log(dbArticle);
//         })
//         .catch(function(err) {
//           // If an error occurred, send it to the client
//           return res.json(err);
//         });
//     });
//     // If we were able to successfully scrape and save an Article, send a message to the client
//     res.send("Scrape Complete");
//   });
// });

// Route to get all Articles from the db
app.get("/articles", function(req, res) {
  // Grab every document in the Articles collection
  db.Article.find({})
    .then(function(dbArticle) {
      // If we were able to successfully find Articles, send them back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route to get specific Articles by id, populate it with it's note
app.get("/articles/:id", function(req, res) {
  console.log(req.params.id);
  // Using the id passed in the id parameter, prepare a query that finds the matching one in our db...
  db.Article.findOne({ _id: req.params.id })
    // ..and populate all of the notes associated with it
    // .populate("note")
    .then(function(dbArticle) {
      // If we were able to successfully find an Article with the given id, send it back to the client
      res.json(dbArticle);
    })
    .catch(function(err) {
      // If an error occurred, send it to the client
      res.json(err);
    });
});

// Route to save an Article's Note
app.post("/articles/:id", function(req, res) {
  var id = req.params.id;
  console.log("hello", id);

  db.Article.findByIdAndUpdate({_id: req.params.id},{$set: {saved: true}})

  .then(function(dbArticle) {
      console.log("saved an article")
  }).catch(function(err) {
  
    res.json(err);
  });
  console.log("HIT");
})


// Route to Save Articles
app.put("/saved/:id", function(req, res) {
  db.Article
      .findByIdAndUpdate({_id: req.params.id},{$set: {isSaved: true}})
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          return res.json(err);
      });
});

// Post article to db
app.post("/saved", function(req,res) {
  console.log("Saved button clicked");
  db.Article
  .findByIdAndUpdate({_id: req.params.id},{$set: {saved: true}})
  .then(function(dbArticle) {
      console.log("article saved")
  })
  .catch(function(err) {
      return res.json(err);
  });
})

// Routes to get Saved Article
app.get("/saved", function(req,res) {
  db.Article
      .find({isSaved: true})
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          return res.json(err);
      });
});

// Route to delete/update a saved article
app.put("/delete/:id", function(req,res) {
  db.Article
      .findByIdAndUpdate({_id:req.params.id}, {$set: {isSaved: false}})
      .then(function(dbArticle) {
          res.json(dbArticle);
      })
      .catch(function(err) {
          return res.json(err);
      });
});

// Route for retrieving all Notes from the db
app.get("/notes", function(req, res) {
  // Find all Notes
  db.Note.find({})
    .then(function(dbNote) {
      // If all Notes are successfully found, send them back to the client
      res.json(dbNote);
    })
    .catch(function(err) {
      // If an error occurs, send the error back to the client
      res.json(err);
    });
});

// Start the server
app.listen(PORT, function() {
  console.log("App running on port " + PORT + "!");
});
