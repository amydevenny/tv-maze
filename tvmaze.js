"use strict";

const $showsList = $("#showsList");
const $episodesList = $("#episodesList");
const $episodesArea = $("#episodesArea");
const $searchForm = $("#searchForm");
const $modalCloseButton = $(".btn-close");
const $modal = $(".modal");

const missingImage = "https://tinyurl.com/missing-tv";
const tvmazeApiUrl = "http://api.tvmaze.com/";

/** Given a search term, search for tv shows that match that query.
 *
 *  Returns (promise) array of show objects: [show, show, ...].
 *    Each show object should contain exactly: {id, name, summary, image}
 *    (if no image URL given by API, put in a default image URL)
 */

async function getShowsByTerm(term) {
  const response = await axios( {
    baseURL: tvmazeApiUrl,
    url: "search/shows",
    method: "GET",
    params: {
      q: term,
    },
  });

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
  $showsList.empty();

  for (let show of shows) {
    if (show.summary === null) {
      show.summary = "<p>Summary not available.</p>";
    }

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
    

    $showsList.append($show);
  }
}


/** Handle search form submission: get shows from API and display.
 *    Hide episodes area (that only gets shown if they ask for episodes)
 */

async function searchForShowAndDisplay() {
  const term = $("#searchForm-term").val();
  const shows = await getShowsByTerm(term);

  $episodesArea.hide();
  populateShows(shows);
}

$searchForm.on("submit", async function (evt) {
  evt.preventDefault();
  await searchForShowAndDisplay();
});


/** Given a show ID, get from API and return (promise) array of episodes:
 *      { id, name, season, number }
 */

async function getEpisodesOfShow(id) {
  const response = await axios({
    baseURL: tvmazeApiUrl,
    url: `shows/${id}/episodes`,
    method: "GET",
  });

  return response.data.map(e => ({
    id: e.id,
    name: e.name,
    season: e.season,
    number: e.number,
  }));
}

/** Write a clear docstring for this function... */

function populateEpisodes(episodes) { 
  $episodesList.empty();

  console.log(episodes);

  if (episodes.length === 0) {
    const noEpisodes = $(
      `<p>No episodes available.</p>`
    );
    $episodesList.append(noEpisodes);
  }

  for (let episode of episodes) {
    const $item = $(
      `<li>
        ${episode.name}
        (season ${episode.season}, episode ${episode.number})
      </li>
      `);
    $episodesList.append($item);
  }

  $episodesArea.show();

  $modalCloseButton.on("click", function() {
    $episodesArea.hide();
  });
}

async function getEpisodesAndDisplay(evt) {
  const showId = $(evt.target).closest(".Show").data("show-id");
  const episodes = await getEpisodesOfShow(showId);
  populateEpisodes(episodes);
}

$showsList.on("click", (".Show-getEpisodes"), getEpisodesAndDisplay);




