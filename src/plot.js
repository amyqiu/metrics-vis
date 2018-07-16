import * as annotation from './annotation.js';
import * as parse from './parse.js';
import * as percentile from './percentile.js';
import * as spinner from './spinner.js';
import * as storage from './storage.js';

const LAYOUT = {
  title: 'Metrics Visualization',
  xaxis: {title: 'Websites',  showticklabels: false},
  yaxis: {title: 'Seconds'},
  barmode: 'stack',
  autosize: true,
};

// Returns indices for data shown in plot
function GetIndices(first_time){
  let start;
  let end;

  // Initialize indices if first time generating plot
  if (first_time){
    start = 0;
    if (storage.RetrieveDataSource() == 'CT'){
      end = 20; // Show 20% of data for CT b/c larger dataset
    } else {
      end = 100; // Show all data for Pinpoint
    }
    document.getElementById('start').value = start;
    document.getElementById('end').value = end;
  } else { // User has submitted percentile filters, get the new values
    start = document.getElementById("start").value;
    end = document.getElementById("end").value;
  }

  let start_index = percentile.GetPercentileIndex(start, parse.PAGE_NAMES.size);
  let end_index = percentile.GetPercentileIndex(end, parse.PAGE_NAMES.size);

  return [start_index, end_index];
}

// Create main Plotly plot
function PlotData(first_time, height, width) {
  let indices = GetIndices(first_time);
  let start_index = indices[0];
  let end_index = indices[1];

  let sliced_traces = [];

  // Only plot the filtered values (based on percentile indices)
  for(let i = 0; i < parse.TRACES.length; ++i){
    sliced_traces[i] = { x: [], y: [], name: parse.TRACES[i].name, type: 'bar', mode:'markers', hoverlabel: {namelength:-1}};

    sliced_traces[i].x = parse.TRACES[i].x.slice(start_index, end_index + 1);
    sliced_traces[i].y = parse.TRACES[i].y.slice(start_index, end_index + 1);
  }

  let plot;

  // Initialize new Plotly plot if first time data is loaded
  if (first_time){
    plot = document.createElement('div');
    plot.id = 'plot';

    LAYOUT.width = width || 700;
    LAYOUT.height = height || 450;

    Plotly.newPlot(plot, sliced_traces, LAYOUT);

    // Show legend, but don't allow clicking to hide other traces
    plot.on('plotly_legendclick',function() { return false; });

    let plot_container = document.getElementById('plots');
    plot_container.innerHTML = '';
    plot_container.appendChild(plot);
  } else { // Update existing plot if it already exists
    annotation.RemoveAnnotations();
    plot = document.getElementById('plot');
    Plotly.react(plot, sliced_traces, LAYOUT);
  }

  annotation.InitializeAnnotations(plot);
  spinner.StopSpinner();
}

export{
  GetIndices,
  PlotData
}