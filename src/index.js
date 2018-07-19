import Parser from './parser.js';
import Plot from './plot.js';
import Search from './search.js';
import Storage from './storage.js';
import './css/styles.css';

let $script = require('scriptjs');

export default class MetricsVisualizer {
  constructor(div, data, dataSource, plotHeight, plotWidth) {
    this.div = div;
    this.data = data;
    this.dataSource = dataSource;
    this.plotHeight = plotHeight;
    this.plotWidth = plotWidth;

    this.storage = new Storage();
    this.plot = null;

    this.storage.storeDataSource(this.dataSource);

    this.scripts = [
      'https://cdn.plot.ly/plotly-latest.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.0.4/fuse.min.js',
      'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/4.5.0/papaparse.min.js'
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

    this.div.innerHTML = this.template;
  }

  createPlot(){
    $script(this.scripts, ()=>{
      // Parse data based on its dataSource (formats are different)
      let csv = Papa.parse(this.data).data;
      let parser = new Parser(csv);
      if (this.dataSource == "CT"){
        parser.parseCTData(csv);
      } else{
        parser.parsePinpointData(csv);
      }

      // Create new Plotly plot
      this.plot = new Plot(this.div, parser.pageNames, parser.processedData, 
        parser.traces, this.plotHeight, this.plotWidth);
      this.plot.draw();

      let search = new Search(this.div, parser.pageNames, parser.processedData);
      this.initializeElements(search);
    });
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