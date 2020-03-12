var mongoose = require("mongoose");

// Save a reference to the Schema constructor
var Schema = mongoose.Schema;

// Using the Schema constructor, create a new NoteSchema object
// This is similar to a Sequelize model
var OnionSchema = new Schema({
  // `link` must be of type String
  link: {
    type: String
  },
  // `title` must be of type String
  title: String,
  // `description` must be of type String
  description: String,
  saved: {
    type: Boolean,
    default: false
  },
  note: {
    type: Schema.Types.ObjectId,
    ref: "Note"
  }
});

// This creates our model from the above schema, using mongoose's model method
var OnionArticle = mongoose.model("OnionArticle", OnionSchema);

// Export the Note model
module.exports = OnionArticle;
