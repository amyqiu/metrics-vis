import Storage from './storage.js';
import DetailedPlot from './detailed-plot.js';

export default class Plot {

  constructor(div, pageNames, processedData, traces, height, width) {
    this.div = div;
    this.pageNames = pageNames;
    this.processedData = processedData;
    this.traces = traces;
    this.height = height;
    this.width = width;
    this.storage = new Storage();
    this.firstTime = true;
    this.layout = {
      title: 'Metrics Visualization',
      xaxis: {title: 'Websites',  showticklabels: false},
      yaxis: {title: 'Time'},
      barmode: 'stack',
      autosize: true,
      hovermode: 'closest'
    };
  }

  // Returns indices for data shown in plot
  getIndices(){
    let start;
    let end;

    // Initialize indices if first time generating plot
    if (this.firstTime){
      start = 0;
      if (this.storage.retrieveDataSource() == 'CT'){
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

    let startIndex = this.getPercentileIndex(start, this.pageNames.size);
    let endIndex = this.getPercentileIndex(end, this.pageNames.size);

    return [startIndex, endIndex];
  }

  // Get index of x percentile value
  getPercentileIndex(percentile, arrayLength){
    let index = Math.ceil(arrayLength * (percentile / 100)) - 1;
    if (index == -1) {
      return 0;
    } else if (index >= arrayLength){
      return arrayLength - 1;
    }
    return index;
  }

  // Create main Plotly plot
  draw() {
    let indices = this.getIndices();
    let startIndex = indices[0];
    let endIndex = indices[1];

    let slicedTraces = [];

    // Only plot the filtered values (based on percentile indices)
    for(let i = 0; i < this.traces.length; ++i){
      slicedTraces[i] = { x: [], y: [], name: this.traces[i].name, type: 'bar', 
        mode:'markers', hoverlabel: {namelength:-1}};

      slicedTraces[i].x = this.traces[i].x.slice(startIndex, endIndex + 1);
      slicedTraces[i].y = this.traces[i].y.slice(startIndex, endIndex + 1);

      //slicedTraces[i].text = this.traces[i].text;
    }

    let plot;

    // Initialize new Plotly plot if first time data is loaded
    if (this.firstTime){
      plot = document.createElement('div');
      plot.id = 'plot';

      this.layout.width = this.width || 700;
      this.layout.height = this.height || 450;

      Plotly.newPlot(plot, slicedTraces, this.layout);

      // Show legend, but don't allow clicking to hide other traces
      plot.on('plotly_legendclick',function() { return false; });

      let plotContainer = this.div.querySelector('#plots');
      plotContainer.innerHTML = '';
      plotContainer.appendChild(plot);
      this.firstTime = false;
    } else { // Update existing plot if it already exists
      this.removeAnnotations();
      plot = this.div.querySelector('#plot');
      Plotly.react(plot, slicedTraces, this.layout);
    }

    this.initializeAnnotations(plot);
  }

  // Create annotations for Plotly that show when a bar is clicked
  initializeAnnotations(plotDiv){
    plotDiv.on('plotly_click', (click)=> {
      this.removeAnnotations(); // Clear any previous annotation

      let point = click.points[0];
      let page = this.processedData.find(x => x.pageName === point.x);

      // Save the point so detailed plot can be generated
      this.storage.storeData(page, point.data.name);

      // Find correct location on stacked par to put annotation
      let yLocation;
      switch(point.data.name){
        case 'frame_times':
          yLocation = page.data[0];
          break;
        case 'mean_frame_time':
          yLocation = page.data[0] + page.data[1];
          break;
        default:
          yLocation = page.data[0] + page.data[1] + page.data[2];
      }

      let newAnnotation = {
        x: point.xaxis.d2l(point.x),
        y: yLocation,
        ax: 0,
        ay: -80,
        bgcolor: 'rgba(255, 255, 255, 0.8)',
        bordercolor: '#404040',
        arrowcolor: '#404040',
        borderpad: 10,
        text: '<a rel="external">' + point.x + ': ' + point.data.name + '</a>',
        captureevents: true
      };

      let plot = this.div.querySelector('#plot');
      let newIndex = (plot.layout.annotations || []).length;

      Plotly.relayout('plot', 'annotations[' + newIndex + ']', newAnnotation);
    });

    let detailedPlot = new DetailedPlot();
    plotDiv.on('plotly_clickannotation', () => {
      detailedPlot.open();
    });
  }

  removeAnnotations(){
    Plotly.relayout('plot', 'annotations', 'remove');
  }
}