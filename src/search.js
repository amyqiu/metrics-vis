import DetailedPlot from './detailed-plot.js';
import Storage from './storage.js';

export default class Search{
  constructor(div, page_names, processed_data) {
    this.div = div;
    this.page_names = page_names;
    this.processed_data = processed_data;
    this.storage = new Storage();
    this.detailed_plot = new DetailedPlot();

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
    this.fuse = new Fuse(Array.from(this.page_names), options);
  }

  // Called when user searches for a single page
  // Generates detailed plot (horizontal bar chart) in new tab
  SearchForPage(){
    let page = this.div.querySelector('#page').value;
    let result = this.fuse.search(page);

    let error = this.div.querySelector('#error_page');
    if (result.length < 1){
      error.innerHTML = 'Could not find that page!'
      return;
    }
    error.innerHTML = '';

    // Store data for closest match to use for detailed plot
    let index = result[0].item;
    let info = this.processed_data[index];

    this.storage.StoreDataPoint(info);
    
    this.detailed_plot.Open();
  }
}