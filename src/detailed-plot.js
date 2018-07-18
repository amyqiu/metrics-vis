import Storage from './storage.js';

export default class DetailedPlot {

  constructor() {
    this.storage = new Storage();

    // Update if new CT metrics added
    this.ct_trace_names = [
      'Thread<br> Renderer Time',
      'Thread Total<br> Fast Path Time',
      'Thread Total<br> All CPU Time'
    ];

    this.pinpoint_trace_names_1 = [
      'Frame<br> Time Discrepancy',
      'First Gesture<br> Scroll Update<br> Latency'
    ]

    this.pinpoint_trace_names_2 = [
      'Queueing<br> Durations', 
      'Input<br> Event Latency',
      'Main Thread<br> Scroll Latency'
    ]

    this.pinpoint_trace_names_3 = [
      'Mean Main<br> Thread Scroll<br> Latency',
      'Percentage Smooth'
    ]

    this.pinpoint_colors_1 = [
      'rgba(1,1,1,0.0)',
      '#2281c4',
      '#13486d'
    ]

    this.pinpoint_colors_2 = [
      'rgba(1,1,1,0.0)',
      '#e66c00',
      '#803c00'
    ]

    this.pinpoint_colors_3 = [
      'rgba(1,1,1,0.0)',
      '#32b432',
      '#278c27',
      '#1c641c'
    ]

    this.pinpoint_colors = [
      'rgba(1,1,1,0.0)',
      '#2281c4',
      '#13486d',
      '#e66c00',
      '#803c00',  
      '#32b432',
      '#278c27',
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

  Draw(doc){
    // Load correct trace names based on data source
    let data_source = this.storage.RetrieveDataSource();
    let stored_data = this.storage.RetrieveDataPoint();
    let point = stored_data.point;

    let data;
    let trace_names;
    let colors;
    switch(stored_data.sub_category){
      case 'frame_times':
        data = point.data_1;
        trace_names = this.pinpoint_trace_names_1;
        colors = this.pinpoint_colors_1;
        break;
      case 'mean_frame_time':
        data = point.data_2;
        trace_names = this.pinpoint_trace_names_2;
        colors = this.pinpoint_colors_2;
        break;
      case 'mean_input_event_latency':
        data = point.data_3;
        trace_names = this.pinpoint_trace_names_3;
        colors = this.pinpoint_colors_3;
        break
      default:
        data = point.data_1.concat(point.data_2, point.data_3);
        trace_names = this.pinpoint_trace_names_1.concat(
          this.pinpoint_trace_names_2, this.pinpoint_trace_names_3);
        colors = this.pinpoint_colors;
    }

    if (data_source == 'CT'){
      trace_names = this.ct_trace_names;
      colors = this.colors;
    }

    let base = [0];
    let values = [];
    let hover_texts = [];
    let sum = 0;

    // Create values for 'waterfall' chart
    // See: https://plot.ly/javascript/bar-charts/#waterfall-bar-chart
    for (let i = 0; i < data.length; ++i){
      if (i > 0){
        base[i] = sum;
      }

      let curr_values = new Array(data.length).fill(0);
      curr_values[i] = data[i];
      values.push(curr_values);

      let hover_text = new Array(data.length).fill('');
      hover_text[i] = data[i] + ' s';
      hover_texts.push(hover_text);

      sum += data[i];
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
          color: colors[i]
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

    let sub_title = stored_data.sub_category ? stored_data.sub_category : 'All';

    let layout = {
      xaxis: {title: 'Time (s)'},
      yaxis: {tickfont:{size:12}, automargin: true},
      title: point.page_name + ': ' +  sub_title,
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

  Open(){
    let point = this.storage.RetrieveDataPoint();
    var win = window.open("", Math.random());
    win.document.title = point.page;

    let script = win.document.createElement('script');
    script.setAttribute('src', 'https://cdn.plot.ly/plotly-latest.min.js');
    script.async = false;
    script.addEventListener('load', ()=>{
      this.Draw(win.document);
    });
    win.document.head.insertBefore(script, win.document.head.firstChild);

    let div = win.document.createElement('div');
    div.id = 'plots';
    win.document.body.appendChild(div);
  }
}
