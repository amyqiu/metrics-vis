import Storage from './storage.js';

export default class DetailedPlot {

  constructor() {
    this.storage = new Storage();

    // Update if new CT metrics added
    this.ctTraceNames = [
      'Thread<br> Renderer Time',
      'Thread Total<br> Fast Path Time',
      'Thread Total<br> All CPU Time'
    ];

    this.pinpointTraceNames1 = [
      'Frame<br> Time Discrepancy',
      'First Gesture<br> Scroll Update<br> Latency'
    ]

    this.pinpointTraceNames2 = [
      'Queueing<br> Durations', 
      'Input<br> Event Latency',
      'Main Thread<br> Scroll Latency'
    ]

    this.pinpointTraceNames3 = [
      'Mean Main<br> Thread Scroll<br> Latency',
      'Percentage Smooth'
    ]

    this.pinpointColors1 = [
      'rgba(1,1,1,0.0)',
      '#2281c4',
      '#13486d'
    ]

    this.pinpointColors2 = [
      'rgba(1,1,1,0.0)',
      '#e66c00',
      '#b35400',
      '#803c00'
    ]

    this.pinpointColors3 = [
      'rgba(1,1,1,0.0)',
      '#32b432',
      '#1c641c'
    ]

    this.pinpointColors = [
      'rgba(1,1,1,0.0)',
      '#2281c4',
      '#13486d',
      '#e66c00',
      '#b35400',
      '#803c00',  
      '#32b432',
      '#1c641c'      
    ]

    // Default plotly colors, to match main vertical plot
    this.colors = [
        'rgba(1,1,1,0.0)',
        '#1f77b4',
        '#ff7f0e',
        '#2ca02c',
        '#d62728',
        '#9467bd',
        '#8c564b',
        '#e377c2',
        '#7f7f7f',
        '#bcbd22',
        '#17becf' 
    ];
  }

  draw(doc){
    // Load correct trace names based on data source
    let dataSource = this.storage.retrieveDataSource();
    let storedData = this.storage.retrieveData();
    let page = storedData.page;

    let data;
    let traceNames;
    let colors;

    // Show breakdown if sub category was selected
    if (dataSource == 'CT'){
      data = page.data;
      traceNames = this.ctTraceNames;
      colors = this.colors;
    } else {
      switch(storedData.subCategory){
        case 'frame_times':
          data = page.data1;
          traceNames = this.pinpointTraceNames1;
          colors = this.pinpointColors1;
          break;
        case 'mean_frame_time':
          data = page.data2;
          traceNames = this.pinpointTraceNames2;
          colors = this.pinpointColors2;
          break;
        case 'mean_input_event_latency':
          data = page.data3;
          traceNames = this.pinpointTraceNames3;
          colors = this.pinpointColors3;
          break
        default:
          data = page.data1.concat(page.data2, page.data3);
          traceNames = this.pinpointTraceNames1.concat(
            this.pinpointTraceNames2, this.pinpointTraceNames3);
          colors = this.pinpointColors;
      }      
    }

    let base = [0];
    let values = [];
    let hoverTexts = [];
    let sum = 0;

    // Create values for 'waterfall' chart
    // See: https://plot.ly/javascript/bar-charts/#waterfall-bar-chart
    for (let i = 0; i < data.length; ++i){
      if (i > 0){
        base[i] = sum;
      }

      let currValues = new Array(data.length).fill(0);
      currValues[i] = data[i];
      values.push(currValues);

      let hoverText = new Array(data.length).fill('');
      hoverText[i] = data[i] + ' s';
      hoverTexts.push(hoverText);

      sum += data[i];
    }

    // Add base array to beginning of values
    // This becomes a hidden trace that allows the other traces to be spaced out
    values.unshift(base);

    let traces = [];

    // Convert to Plotly data format
    for (let i = 0; i < values.length; ++i){
      let trace = {
        y: traceNames,
        x: values[i],
        type: 'bar',
        orientation: 'h',
        marker: {
          color: colors[i]
        }
      };

      if (i == 0){
        trace.hoverinfo = 'none';
      } else {
        trace.hoverinfo = 'text';
        trace.hovertext = hoverTexts[i-1];
      }

      traces.push(trace);
    }

    let annotation = {
      xref: 'paper',
      yref: 'paper',
      x: 1,
      xanchor: 'left',
      y: 1,
      yanchor: 'bottom',
      text: 'Total time: ' + sum.toFixed(2),
      font: {
        size: 14
      },
      showarrow: false
    };

    let subtitle = storedData.subCategory ? storedData.subCategory : 'All';

    let layout = {
      xaxis: {title: 'Time (s)'},
      yaxis: {tickfont:{size:12}, automargin: true},
      title: page.pageName + ': ' +  subtitle,
      barmode: 'stack',
      width: 900,
      height: 600,
      autosize: false,
      showlegend: false,
      margin: {
        l: 150,
        r: 150,
        b: 100,
        t: 100,
        pad: 5
      },
      annotations: [annotation]
    };

    let div = doc.createElement('div');
    div.id = 'detailed-plot';
    Plotly.newPlot(div, traces, layout);
    doc.getElementById('plots').appendChild(div);
  }

  open(){
    let data = this.storage.retrieveData();
    var win = window.open("", Math.random());
    win.document.title = data.page.pageName;

    let script = win.document.createElement('script');
    script.setAttribute('src', 'https://cdn.plot.ly/plotly-latest.min.js');
    script.async = false;
    script.addEventListener('load', ()=>{
      this.draw(win.document);
    });
    win.document.head.insertBefore(script, win.document.head.firstChild);

    let div = win.document.createElement('div');
    div.id = 'plots';
    win.document.body.appendChild(div);
  }
}
