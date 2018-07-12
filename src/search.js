import * as detailed from './detailed-plot.js';
import * as parse from './parse.js';
import * as storage from './storage.js';

// Called when user searches for a single page
// Generates detailed plot (horizontal bar chart) in new tab
function SearchForPage(){
  let page = document.getElementById('page').value;

  const options = {
    shouldSort: true,
    includeScore: true,
    includeMatches: true,
    threshold: 0.3,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
  };

  var pages = Array.from(parse.PAGE_NAMES);
  let fuse = new Fuse(pages, options);
  let result = fuse.search(page);

  let error = document.getElementById('error_page');
  if (result.length < 1){
    error.innerHTML = 'Could not find that page!'
    return;
  }
  error.innerHTML = '';

  // Store data for closest match to use for detailed plot
  let index = result[0].item;
  let data = []
  for (let i = 0; i < parse.TRACES.length; ++i){
    data.push(parse.TRACES[i].y[index]);
  }
  storage.StoreDataPoint(pages[index], data);
  
  detailed.OpenDetailedPlot();
}

export{
  SearchForPage
}