// Declare global variables
const API_URL = "https://jservice.io/api/";
const NUM_CATEGORIES = 6;
const QUESTIONS_PER_CAT = 5;
let categories = [];

// Mix up the categories
function getRandom(min, max) {
  return Math.floor(Math.random() * (max - min) + min);
}

// Get categories IDs from JService API
/* get category IDs by iterating 
  through each catefory push each
  id into the categoryIds array */
// use lodash to grab 6 random categories
async function getCategoryIds() {
  const response = await axios.get(`${API_URL}categories?count=100`, {
    params: {
      offset: getRandom(0, 18500),
    },
  });
  let categoryIds = [];
  for (let data of response.data) {
    categoryIds.push(data.id);
  }

  return _.sampleSize(categoryIds, NUM_CATEGORIES);
}

/*Extract specific data from each category
call for the 6 categorie's data
use lodash to randomize and grab 5 clues
use map method to create a new array 
of extracted clue's answers, questions, and a null val*/
async function getCategory(catId) {
  const eachCat = await axios.get(`${API_URL}category?id=${catId}`);
  let clues = _.sampleSize(eachCat.data.clues, QUESTIONS_PER_CAT);
  let clue = clues.map((data) => {
    return [
      {
        answer: data.answer,
        question: data.question,
        showing: null,
      },
    ];
  });

  return {
    title: eachCat.data.title,
    clues_array: clue,
  };
}

// Create rows and cells for categories in the table
// Create a new row for header cells
// Loop through number of categories
// Create header cell with category title
// Append header cell to row
// Loop through number of questions per category
// Create a row for cells
// Loop through number of categories
// Create a body cell with image
// add id according to index
// Append cells to row
async function fillTable() {
  $("thead").empty();
  let $cell = $("<tr>");
  for (let c = 0; c < NUM_CATEGORIES; c++) {
    let $thead = $("<th>")
      .attr("class", `category-header`)
      .text(categories[c].title);
    $cell.append($thead);
  }
  $("thead").append($cell);

  $("tbody").empty();
  for (let i = 0; i < QUESTIONS_PER_CAT; i++) {
    let $row = $("<tr>");
    for (let j = 0; j < NUM_CATEGORIES; j++) {
      let $tdata = $(`<td>`)
        .attr("id", `${j}-${i}`)
        .append(
          "<img id='theImg' src='https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRdMBkW2ffO61lRqwJfITB4HXAjg0k-r3iT9A&usqp=CAU'/>"
        );
      $row.append($tdata);
      $("tbody").append($row);
    }
  }
}

// split each id number in to variables
// return categories by j idx and clues arr by i idx
// if its not null from clue arr
// when click show clue question
// reassign value of showing to "question"
//if question is showing click = clue answer
// return nothing to disbable click
// add fade animation on each click
function handleClick(evt) {
  const target = evt.currentTarget;
  const [j, i] = target.id.split("-");
  const clue = categories[j].clues_array[i][0];

  if (!clue.showing) {
    target.innerHTML = clue.question;
    clue.showing = "question";
  } else if (clue.showing === "question") {
    target.innerHTML = clue.answer;
    clue.showing = "answer";
  } else {
    return;
  }

  $(this).fadeOut(1);
  $(this).fadeIn(600);
}

/** Wipe the current Jeopardy board,
  show the loading spinner,
  and update the button used to fetch data.
 */

function showLoadingView() {
  $("#spin-container").show();
}

/** Remove the loading spinner and update 
    the button used to fetch data. */

function hideLoadingView() {
  $("#spin-container").hide();
}
// set up and start the game by fetching the category IDs, getting the categories,
// filling the table with the categories, and hiding the loading view
// Loop through each category ID and fetch the category data
// push category data to empty array
async function setupAndStart() {
  let categoryIds = await getCategoryIds();

  categories = [];
  for (let catId of categoryIds) {
    categories.push(await getCategory(catId));
  }
  fillTable();
  hideLoadingView();
}

/** On click of start / restart button, set up game. */
$("#start").click(function () {
  showLoadingView();
  setupAndStart();
});

/*
Calls the showLoadingView function to display a loading view to the user.
Calls the setupAndStart function to set up and start the game by fetching
the category IDs, getting the categories, filling the table with the categories,
and hiding the loading view.
 Registers a click event listener on elements with the class 
.clues that are children of the element with the id #jeopardy.
*/
$(async function () {
  showLoadingView();
  setupAndStart();
  $("#jeopardy").on("click", "td", handleClick);
});
