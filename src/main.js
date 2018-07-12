import * as parse from './parse.js';
import * as percentile from './percentile.js';
import * as plot from './plot.js';
import * as search from './search.js';
import * as spinner from './spinner.js';
import * as storage from './storage.js';

import './css/styles.css';
let $script = require('scriptjs');

const scripts = [
  'https://www.papaparse.com/resources/js/papaparse.js', 
  'https://cdnjs.cloudflare.com/ajax/libs/spin.js/2.3.2/spin.min.js',
  'https://cdn.plot.ly/plotly-latest.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/fuse.js/3.0.4/fuse.min.js'
];

const TEMPLATE = '<div class="metrics-vis">' +
  '  <div>' +
  '    <input type="number" id="start" placeholder="Starting Percentile">' +
  '    <input type="number" id="end" placeholder="Ending Percentile">' +
  '    <span class="button" id="submit">Submit</span>' +
  '  </div>' +
  '  <div>' +
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

let TEMPLATE_LOADED = false;

function CreatePlot(div_id, data, data_source, plot_height, plot_width){
  storage.StoreDataSource(data_source);
  if (!TEMPLATE_LOADED){
    // Load external scripts and add selectors, then initialize the plot
    $script(scripts, function(){
      let div = document.getElementById(div_id);
      div.innerHTML += TEMPLATE;

      InitializeElements();
      TEMPLATE_LOADED = true;
      GeneratePlot(data, data_source, plot_height, plot_width);
    });
  } else {
    // Only need to replot
    GeneratePlot(data, data_source, plot_height, plot_width);
  }
}

function GeneratePlot(data, data_source, plot_height, plot_width){
  spinner.LoadSpinner();

  // Parse data based on its data_source (formats are different)
  if (data_source == "CT"){
    parse.ParseCTData(data);
  } else{
    parse.ParsePinpointData(data);
  }
  // Create new Plotly plot
  plot.PlotData(true, plot_height, plot_width);
}

function InitializeElements(){
  // Initialize button onclicks
  document.getElementById('submit').addEventListener('click', percentile.FilterGraphWithPercentile);
  document.getElementById('submit-page').addEventListener('click', search.SearchForPage);

  // Associate textbox enter key presses with buttons
  document.getElementById('end').addEventListener('keyup', function(e){
    if(e.keyCode==13){
      percentile.FilterGraphWithPercentile();
    }
  });
  document.getElementById('page').addEventListener('keyup', function(e){
    if(e.keyCode==13){
      search.SearchForPage();
    }
  });
}

export {
  CreatePlot
}