// jshint esversion:6
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const https = require("https");
const port = process.env.PORT || 3000;
const ejs = require("ejs");
const _ = require("lodash");
const mongoose = require("mongoose");

////// Server initials /////////
app.listen(port, function () {
  console.log(`Server started at port ${port}`);
});
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
//// Mongoose ////
mongoose.connect("mongodb://localhost:27017/Wiki-API", {
  useNewUrlParser: true,
});
mongoose.set("strictQuery", true);
/// Schema mongoose
const articlesSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Add title"],
  },
  content: {
    type: String,
    required: [true, "Add content"],
  },
});
const Article = mongoose.model("Article", articlesSchema);

/////////////////////
/// Вместо того, чтобы повторять каждый раз route, их можно зачейнить как показано ниже через начало app.route('/').get().post().delete()
/////////////////////// Request targeting all articles ///////

app
  .route("/articles")
  .get(function (req, res) {
    Article.find({}, function (err, result) {
      if (!err) {
        console.log(`Received GET action`);
        res.send(result);
      }
    });
  })
  .post(function (req, res) {
    console.log(req.body.title);
    console.log(req.body.content);
    let newArticle = new Article({
      title: req.body.title,
      content: req.body.content,
    });
    newArticle.save(function (err) {
      if (!err) {
        res.send("Successfully added a new article!");
      } else {
        res.send(err);
      }
    });
  })
  .delete(function (req, res) {
    Article.deleteMany({}, function (err) {
      if (!err) {
        res.send("All deleted!");
      } else {
        res.send(err);
      }
    });
  });

/////////////////////// Request targeting specific article ///////

app
  .route("/articles/:random")
  .get(function (req, res) {
    console.log(`Received GET action to random route`);
    console.log(req.params.random);
    Article.findOne({ title: req.params.random }, (err, result) => {
      if (result) {
        console.log(result);
        res.send(result);
      } else {
        res.send("No such articles was found");
      }
    });
  })
  /// Put полностью поменяет существующий документ (даже если не ввел оба аргумента)
  .put(function (req, res) {
    Article.replaceOne(
      { title: req.params.random },
      {
        title: req.body.title,
        content: req.body.content,
      },
      function (err, result) {
        if (!err) {
          res.send(`Succesesfully updated article!`);
        }
      }
    );
  })
  //// Patch может заменить входящие параметры документа
  .patch(function (req, res) {
    Article.updateOne(
      { title: req.params.random },
      { $set: req.body },
      function (err) {
        if (!err) {
          res.send(`Patch made successfully!`);
        } else {
          res.send(err);
        }
      }
    );
  })
  .delete(function (req, res) {
    Article.deleteOne({ title: req.params.random }, function (err) {
      if (!err) {
        res.send(`Article deleted successfully`);
      } else {
        res.send(err);
      }
    });
  });
