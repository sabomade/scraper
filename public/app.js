// We'll be rewriting the table's data frequently, so let's make our code more DRY
// by writing a function that takes in 'beauty' (JSON) and creates a table body
function displayResults(beauty) {
  console.log("display running");
  // First, empty the table
  $("tbody").empty();
  // Then, for each entry of that json...
  beauty.forEach(function(tip) {
    // Append each of the animal's properties to the table
    var tr = $("<tr>").append(
      $("<td>").text(tip.date),
      $("<td>").text(tip.title),
      $("<td>").text(tip.author)
    );
    $("tbody").append(tr);
  });
}

// Bonus function to change "active" header
function setActive(selector) {
  // remove and apply 'active' class to distinguish which column we sorted by
  $("th").removeClass("active");
  $(selector).addClass("active");
}

// 1: On Load
// ==========

// First thing: ask the back end for json with all beauty articles
$.getJSON("/all", function(req, res) {
  // Call our function to generate a table body
  displayResults(data);
});

// 2: Button Interactions
// ======================

// When user clicks the weight sort button, display table sorted by weight
$("#date-sort").on("click", function() {
  // Set new column as currently-sorted (active)
  setActive("#beauty-date");

  // Do an api call to the back end for json with all animals sorted by weight
  $.getJSON("/date", function(data) {
    // Call our function to generate a table body
    displayResults(data);
  });
});

// When user clicks the name sort button, display the table sorted by name
$("#author-sort").on("click", function() {
  // Set new column as currently-sorted (active)
  setActive("#beauty-author");

  // Do an api call to the back end for json with all animals sorted by name
  $.getJSON("/author", function(data) {
    // Call our function to generate a table body
    displayResults(data);
  });
});
