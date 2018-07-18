import Parser from './parser.js';
import Plot from './plot.js';
import Search from './search.js';
import Spin from './spin.js'
import Storage from './storage.js';

let $script = require('scriptjs');

export default class Manager {
  constructor(div, data, data_source, plot_height, plot_width, callback) {
    this.div = div;
    this.data = data;
    this.data_source = data_source;
    this.plot_height = plot_height;
    this.plot_width = plot_width;

    this.parser = new Parser(this.data);
    this.spin = new Spin(this.div);
    this.storage = new Storage();

    this.storage.StoreDataSource(this.data_source);

    this.scripts = [
      'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.min.js',
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
      '    <p id="error_page"></p>' +
      '  </div>' +
      '  <div>' +
      '    <div id="spinner">' +
      '    </div>' +
      '    <div id="plots">' +
      '    </div>' +
      '  </div>' +
      '</div>';

    this.div.innerHTML += this.template;

    $script(this.scripts, ()=>{
      this.CreatePlot();
    });

  }

  CreatePlot(){
    this.spin.Start();

    // Parse data based on its data_source (formats are different)
    let parser = new Parser(this.data);
    if (this.data_source == "CT"){
      parser.ParseCTData(this.data);
    } else{
      parser.ParsePinpointData(this.data);
    }

    // Create new Plotly plot
    let plot = new Plot(this.div, parser.page_names, parser.processed_data, 
      parser.traces, this.plot_height, this.plot_width);
    plot.Draw();

    let search = new Search(this.div, parser.page_names, parser.processed_data);
    this.InitializeElements(search);

    this.spin.Stop();
  }

  FilterByPercentile(){
    this.spin.Start();

    // Add slight delay to allow loading animation to start
    setTimeout(function(){
      this.plot.Draw(false);
    }, 5);

    this.spin.Stop();
  }

  InitializeElements(search){
    // Initialize button onclicks
    this.div.querySelector('#submit').addEventListener('click', this.FilterByPercentile);

    // Associate textbox enter key presses with buttons
    this.div.querySelector('#end').addEventListener('keyup', function(e){
      if(e.keyCode==13){
        FilterByPercentile();
      }
    });

    this.div.querySelector('#submit-page').addEventListener('click', search.SearchForPage);
    this.div.querySelector('#page').addEventListener('keyup', function(e){
      if(e.keyCode==13){
        search.SearchForPage();
      }
    });        
  }
}