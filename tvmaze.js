"use strict";

// HTML Elements
const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $modalCloseButton = $(".btn-close");
const $modal = $(".modal");

// URLs
const missingImage = "https://tinyurl.com/missing-tv";
const tvmazeApiUrl = "https://api.tvmaze.com/";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

// this function sends a GET request and saves the response to a variable
// term is the user input 
async function getShowsByTerm(term) {
  // request
  const response = await axios( {
    // uses the base URL + end point, adds the get method and uses the user's input as the query string
    baseURL: tvmazeApiUrl,
    url: "search/shows",
    method: "GET",
    params: {
      q: term,
    },
  });

  // return the response data as an object with the show ID, name, summary and image
  return response.data.map(response => {
    const show = response.show;
    return {
      id: show.id,
      name: show.name,
      summary: show.summary,
      image: show.image ? show.image.medium : missingImage,
    };
  });
}


/** Given list of shows, create markup for each and to DOM */
function populateShows(shows) {
  // empty any shows currently rendered
  $showsList.empty();

  // loop through each show 
  for (let show of shows) {
    // if summary is null, notify the user
    if (show.summary === null) {
      show.summary = "<p>Summary not available.</p>";
    }

    // create the HTML for each show using the show ID, image, name and summary
    const $show = $(
      `<div data-show-id="${show.id}" class="Show col-md-12 col-lg-6 mb-4">
         <div class="media">
           <img
              src=${show.image}
              alt=${show.name}
              class="w-25 me-3">
           <div class="media-body">
             <h5 class="text-primary mt-3">${show.name}</h5>
             <div>${show.summary}</div>
             <button class="btn btn-secondary btn-md Show-getEpisodes">
               Episodes
             </button>
           </div>
         </div>
       </div>
      `);
    
    // append the show to the showsList seection
    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */
// handle the request with an async/await function
async function searchForShowAndDisplay() {
  // the user input
  const term = $("#searchForm-term").val();
  // the response from the tvmaze server
  const shows = await getShowsByTerm(term);

  // hide the episodes modal 
  $episodesArea.hide();
  // add the shows to the DOM
  populateShows(shows);
}

// when the search form is submitted, request and return the data asynchronously without refreshing the page 
$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */
// send a request for the episodes of a show by its ID
async function getEpisodesOfShow(id) {
  const response = await axios({
    baseURL: tvmazeApiUrl,
    url: `shows/${id}/episodes`,
    method: "GET",
  });

  // return the data as an object 
  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
  // empty any existing episodes from the DOM
  $episodesList.empty();

  // if there are no episodes, notify the user
  if (episodes.length === 0) {
    const noEpisodes = $(
      `<p>No episodes available.</p>`
    );
    $episodesList.append(noEpisodes);
  }

  // loop through the episodes and create an li for each with the name, season, and episode number
  for (let episode of episodes) {
    const $item = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>
      `);
    // append each li to the episodesList ul
    $episodesList.append($item);
  }

  // make the episodesArea modal visible
  $episodesArea.show();

  // add functionality to the close button on the modal, hide it when clicked
  $modalCloseButton.on("click", function() {
    $episodesArea.hide();
  });
}

// this function finds the closest div with the show class when the user clicks the episodes button
async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

// this handles the click on the episodes button and runs the above function
$showsList.on("click", (".Show-getEpisodes"), getEpisodesAndDisplay);




