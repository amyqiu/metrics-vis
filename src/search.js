import DetailedPlot from './detailed-plot.js';
import Storage from './storage.js';

export default class Search{
  constructor(div, pageNames, processedData) {
    this.div = div;
    this.pageNames = pageNames;
    this.processedData = processedData;
    this.storage = new Storage();
    this.detailedPlot = new DetailedPlot();

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
    this.fuse = new Fuse(Array.from(this.pageNames), options);
  }

  // Called when user searches for a single page
  // Generates detailed plot (horizontal bar chart) in new tab
  searchForPage(){
    let page = this.div.querySelector('#page').value;
    let result = this.fuse.search(page);

    let error = this.div.querySelector('#error-page');
    if (result.length < 1){
      error.innerHTML = 'Could not find that page!'
      return;
    }
    error.innerHTML = '';

    // Store data for closest match to use for detailed plot
    let index = result[0].item;
    let info = this.processedData[index];

    this.storage.storeDataPoint(info);
    
    this.detailedPlot.open();
  }
}