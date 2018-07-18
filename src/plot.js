import Storage from './storage.js';
import DetailedPlot from './detailed-plot.js';

export default class Plot {

  constructor(div, page_names, processed_data, traces, height, width) {
    this.div = div;
    this.page_names = page_names;
    this.processed_data = processed_data;
    this.traces = traces;
    this.height = height;
    this.width = width;
    this.storage = new Storage();
    this.first_time = true;
    this.layout = {
      title: 'Metrics Visualization',
      xaxis: {title: 'Websites',  showticklabels: false},
      yaxis: {title: 'Seconds'},
      barmode: 'stack',
      autosize: true,
      hovermode: 'closest'
    };
  }

  // Returns indices for data shown in plot
  GetIndices(){
    let start;
    let end;

    // Initialize indices if first time generating plot
    if (this.first_time){
      start = 0;
      if (this.storage.RetrieveDataSource() == 'CT'){
        end = 20; // Show 20% of data for CT b/c larger dataset
      } else {
        end = 100; // Show all data for Pinpoint
      }
      this.div.querySelector('#start').value = start;
      this.div.querySelector('#end').value = end;
    } else { // User has submitted percentile filters, get the new values
      start = this.div.querySelector("#start").value;
      end = this.div.querySelector("#end").value;
    }

    let start_index = this.GetPercentileIndex(start, this.page_names.size);
    let end_index = this.GetPercentileIndex(end, this.page_names.size);

    return [start_index, end_index];
  }

  // Get index of x percentile value
  GetPercentileIndex(percentile, array_length){
    let index = Math.ceil(array_length * (percentile / 100)) - 1;
    if (index == -1) {
      return 0;
    } else if (index >= array_length){
      return array_length - 1;
    }
    return index;
  }

  // Create main Plotly plot
  Draw() {
    let indices = this.GetIndices();
    let start_index = indices[0];
    let end_index = indices[1];

    let sliced_traces = [];

    console.log("traces", this.traces);

    // Only plot the filtered values (based on percentile indices)
    for(let i = 0; i < this.traces.length; ++i){
      sliced_traces[i] = { x: [], y: [], name: this.traces[i].name, type: 'bar', mode:'markers', hoverlabel: {namelength:-1}};

      sliced_traces[i].x = this.traces[i].x.slice(start_index, end_index + 1);
      sliced_traces[i].y = this.traces[i].y.slice(start_index, end_index + 1);
    }

    let plot;

    // Initialize new Plotly plot if first time data is loaded
    if (this.first_time){
      plot = document.createElement('div');
      plot.id = 'plot';

      this.layout.width = this.width || 700;
      this.layout.height = this.height || 450;

      Plotly.newPlot(plot, sliced_traces, this.layout);

      // Show legend, but don't allow clicking to hide other traces
      plot.on('plotly_legendclick',function() { return false; });

      let plot_container = this.div.querySelector('#plots');
      plot_container.innerHTML = '';
      plot_container.appendChild(plot);
      this.first_time = false;
    } else { // Update existing plot if it already exists
      this.RemoveAnnotations();
      plot = this.div.querySelector('plot');
      Plotly.react(plot, sliced_traces, this.layout);
    }

    this.InitializeAnnotations(plot);
  }

  // Create annotations for Plotly that show when a bar is clicked
  InitializeAnnotations(plot_div){
    plot_div.on('plotly_click', (data)=> {
      this.RemoveAnnotations(); // Clear any previous annotation

      let point = data.points[0];

      let info = this.processed_data.find(x => x.page_name === point.x);

      // Save the point so detailed plot can be generated
      this.storage.StoreDataPoint(info, point.data.name);

      let newAnnotation = {
          x: point.xaxis.d2l(point.x),
          y: point.yaxis.p2c(data.event.clientY-300),
          ax: 0,
          ay: -80,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: '#404040',
          arrowcolor: '#404040 ',
          borderpad: 10,
          text: '<a rel="external">' + point.x + ': ' + point.data.name + '</a>',
          captureevents: true
      };

      let plot = this.div.querySelector('#plot');
      let newIndex = (plot.layout.annotations || []).length;

      Plotly.relayout('plot', 'annotations[' + newIndex + ']', newAnnotation);
    });
    let detailed_plot = new DetailedPlot();
    plot_div.on('plotly_clickannotation', () => {
      detailed_plot.Open()
    });
  }

  RemoveAnnotations(){
    Plotly.relayout('plot', 'annotations', 'remove');
  }
}