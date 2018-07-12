import * as storage from './storage.js';

// Update if new CT metrics added
const CT_TRACE_NAMES = [
  'Thread<br> Renderer Time',
  'Thread Total<br> Fast Path Time',
  'Thread Total<br> All CPU Time'
];

// Update if new Pinpoint metrics added
const PINPOINT_TRACE_NAMES = [
  'Frame Times',
  'Mean<br> Frame Time',
  'Mean Input<br> Event Latency',
  'Mean Main<br> Thread Scroll<br> Latency'
]

// Default plotly colors, to match main vertical plot
const COLORS = [
    'rgba(1,1,1,0.0)',
    '#1f77b4',
    '#ff7f0e',
    '2ca02c',
    '#d62728',
    '#9467bd',
    '#8c564b',
    '#e377c2',
    '#7f7f7f',
    '#bcbd22',
    '#17becf' 
];

function CreateDetailedPlot(doc){
  let point = storage.RetrieveDataPoint();

  let base = [0];
  let values = [];
  let hover_texts = [];
  let sum = 0;

  // Load correct trace names based on data source
  let trace_names;
  let data_source = storage.RetrieveDataSource();
  if (data_source == 'CT'){
    trace_names = CT_TRACE_NAMES;
  } else {
    trace_names = PINPOINT_TRACE_NAMES;
  }

  // Create values for 'waterfall' chart
  // See: https://plot.ly/javascript/bar-charts/#waterfall-bar-chart
  for (let i = 0; i < point.data.length; ++i){
    if (i > 0){
      base[i] = sum;
    }

    let curr_values = new Array(point.data.length).fill(0);
    curr_values[i] = point.data[i];
    values.push(curr_values);

    let hover_text = new Array(point.data.length).fill('');
    hover_text[i] = point.data[i] + ' s';
    hover_texts.push(hover_text);

    sum += point.data[i];
  }

  // Add base array to beginning of values
  // This becomes a hidden trace that allows the other traces to be spaced out
  values.unshift(base);

  let traces = [];

  // Convert to Plotly data format
  for (let i = 0; i < values.length; ++i){
    let trace = {
      y: trace_names,
      x: values[i],
      type: 'bar',
      orientation: 'h',
      marker: {
        color: COLORS[i]
      },
    };

    if (i == 0){
      trace.hoverinfo = 'none';
    } else {
      trace.hoverinfo = 'text';
      trace.hovertext = hover_texts[i-1];
    }

    traces.push(trace);
  }

  let layout = {
    xaxis: {title: 'Time (s)'},
    yaxis: {tickfont:{size:12}, automargin: true},
    title: 'Frame Time Breakdown: ' + point.page,
    barmode: 'stack',
    width: window.innerWidth * 0.6,
    height: window.innerWidth * 0.4,
    autosize: false,
    showlegend: false,
    margin: {
      l: 150,
      r: 100,
      b: 100,
      t: 100,
      pad: 5
    },
  };

  let div = doc.createElement('div');
  div.id = 'detailed_plot';
  Plotly.newPlot(div, traces, layout);
  doc.getElementById('plots').appendChild(div);
}

function OpenDetailedPlot(){
  let point = storage.RetrieveDataPoint();
  var win = window.open("", Math.random());
  win.document.title = point.page;

  let script = win.document.createElement('script');
  script.setAttribute('src', 'https://cdn.plot.ly/plotly-latest.min.js');
  script.async = false;
  script.addEventListener('load', function(){
    CreateDetailedPlot(win.document);
  });
  win.document.head.insertBefore(script, win.document.head.firstChild);

  let div = win.document.createElement('div');
  div.id = 'plots';
  win.document.body.appendChild(div);
}

export{
  OpenDetailedPlot
}