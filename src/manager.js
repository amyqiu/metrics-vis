import Parser from './parser.js';
import Plot from './plot.js';
import Search from './search.js';
import Storage from './storage.js';

let $script = require('scriptjs');

export default class Manager {
  constructor(div, data, dataSource, plotHeight, plotWidth) {
    this.div = div;
    this.data = data;
    this.dataSource = dataSource;
    this.plotHeight = plotHeight;
    this.plotWidth = plotWidth;

    this.parser = new Parser(this.data);
    this.storage = new Storage();
    this.plot = null;

    this.storage.storeDataSource(this.dataSource);

    this.scripts = [
      'https://cdn.plot.ly/plotly-latest.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.0.4/fuse.min.js'
    ];

    this.template = '<div class="metrics-vis">' +
      '  <div>' +
      '    <input type="number" id="start" placeholder="Start %ile">' +
      '    <input type="number" id="end" placeholder="End %ile">' +
      '    <span class="button" id="submit">Submit</span>' +
      '    <input type="text" id="page" placeholder="Page Name">' +
      '    <span class="button green" id="submit-page">Detailed Plot</span>' +
      '    <p id="error-page"></p>' +
      '  </div>' +
      '  <div>' +
      '    <div id="plots">' +
      '    </div>' +
      '  </div>' +
      '</div>';

    this.div.innerHTML += this.template;

    $script(this.scripts, ()=>{
      this.createPlot(this.data, this.dataSource);
    });
  }

  createPlot(data, dataSource){
    // Parse data based on its dataSource (formats are different)
    let parser = new Parser(data);
    if (dataSource == "CT"){
      parser.parseCTData(data);
    } else{
      parser.parsePinpointData(data);
    }

    // Create new Plotly plot
    this.plot = new Plot(this.div, parser.pageNames, parser.processedData, 
      parser.traces, this.plotHeight, this.plotWidth);
    this.plot.draw();

    let search = new Search(this.div, parser.pageNames, parser.processedData);
    this.initializeElements(search);
  }

  filterByPercentile(){
    // Add slight delay to allow loading animation to start
    setTimeout(()=>{
      this.plot.draw();
    }, 10);
  }

  initializeElements(search){
    this.div.querySelector('#submit').addEventListener('click', ()=>{
      this.filterByPercentile();
    });
    this.div.querySelector('#end').addEventListener('keyup', (e)=>{
      if(e.keyCode==13){
        this.filterByPercentile();
      }
    });

    this.div.querySelector('#submit-page').addEventListener('click', ()=>{
      search.searchForPage();
    });
    this.div.querySelector('#page').addEventListener('keyup', (e)=>{
      if(e.keyCode==13){
        search.searchForPage();
      }
    });        
  }
}