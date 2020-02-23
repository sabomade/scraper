var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var BeautySchema = new Schema({
  // `link` must be of type String
  link: {
    type: String
  },
  // `title` must be of type String
  title: String,
  // `title` must be of type String
  date: String,
  // `body` must be of type String
  author: String
});

// This creates our model from the above schema, using mongoose's model method
var BeautyArticle = mongoose.model("BeautyArticle", BeautySchema);

// Export the Note model
module.exports = BeautyArticle;
