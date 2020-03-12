// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in 'beauty' (JSON) and creates a table body
function displayResults(onion) {
  // console.log("display running");

  $("#article-parent").empty();
  onion.forEach(function(tip) {
    var card = $("<div>").addClass("card");
    var cardBody = $("<div>").addClass("card-body");
    var cardText = $("<div>").addClass("text");
    var title = $("<h4>")
      .addClass("card-title")
      .text(tip.title);
    var aTag = $("<a>").attr("href", tip.link);
    var pTag = $("<p>")
      .addClass("card-text")
      .text(tip.description);
    aTag.append(title);
    cardText.append(aTag, pTag);
    cardBody.append(cardText);
    card.append(cardBody);
    $("#article-parent").append(card);
  });
}

// 1: On Load
// ==========
// First thing: ask the back end for json with all articles
// $.getJSON("/", function(data) {
//   // Call our function to generate a table body
//   displayResults(data);
// });

// 2: Button Interactions
// ======================
// When user clicks the scrape new articles button, update table with new articles if any
$("#scrape-onion").on("click", function() {
  // Do an api call to the back end for json with all animals sorted by name
  $.getJSON("/getonion", function(data) {
    // console.log(data);
    displayResults(data);
    // location.reload();
  });
});

// When user clicks the name sort button, display the table sorted by name
$("#saved-articles").on("click", function() {
  // Do an api call to the back end for json with all animals sorted by name
  // $.getJSON("/author", function(data) {
  //   // Call our function to generate a table body
  //   displayResults(data);
  // });
});
