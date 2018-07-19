export default class Parser {
  constructor(rawData) {
    this.rawData = rawData;
    this.pageNames = new Set(); // Set of page names for searching
    this.processedData = []; 
    this.traces = []; // Stores data in Plotly format
    // Replace these trace names with actual metrics
    this.ctTraceNames = [
      'Thread Renderer Compositor Time',
      'Thread Total Fast Path Time',
      'Thread Total All CPU Time'
    ];
    this.ppTraceNames = ['frame_times', 'mean_frame_time', 'mean_input_event_latency'];
    this.ppTraceNames1 = ['frame_time_discrepancy', 'first_gesture_scroll_update_latency'];
    this.ppTraceNames2 = ['queueing_durations', 'input_event_latency', 'main_thread_scroll_latency'];
    this.ppTraceNames3 = ['mean_main_thread_scroll_latency', 'percentage_smooth'];
  }

  // Used to sort data by total time taken
  compareTimes(a, b){
    let aValue = a.data.reduce((x, y) => Number(x) + Number(y), 0);
    let bValue = b.data.reduce((x, y) => Number(x) + Number(y), 0);
    if (aValue === bValue) {
        return 0;
    }
    else {
        return (aValue < bValue) ? -1 : 1;
    }
  }

  // Converts string to number and rounds to two decimal places
  getRoundedNumber(string){
    return Number(Number(string).toFixed(2));
  }

  // Parses Cluster Telemetry data
  parseCTData(){
    let headers = this.rawData[0];
    let data = this.rawData.slice(1,-1);

    let threadRendererIndex = headers.indexOf('thread_renderer_main_cpu_time_per_frame (ms)');
    let frameTimesIndex = headers.indexOf('frame_times (ms)');
    let threadTotalFastIndex = headers.indexOf('thread_total_fast_path_cpu_time_per_frame (ms)');
    let threadTotalAllIndex = headers.indexOf('thread_total_all_cpu_time_per_frame (ms)');
    let pageNameIndex = headers.indexOf('page_name');

    // Remove rows where any of the data is missing
    let filteredData = data.filter((item)=>{
      return (item[threadRendererIndex] != '' && item[threadTotalFastIndex] != '' 
        && item[threadTotalAllIndex] != '' && item[frameTimesIndex] != '');
    });

    // Populate processedData with objects containing the page and data points
    for (let i = 0; i < filteredData.length; ++i) {
      let threadRenderer = this.getRoundedNumber(filteredData[i][threadRendererIndex]);
      let threadTotalFast = this.getRoundedNumber(filteredData[i][threadTotalFastIndex]);
      let threadTotalAll = this.getRoundedNumber(filteredData[i][threadTotalAllIndex]);

      let newSite = {
        pageName: filteredData[i][pageNameIndex],
        data: [threadRenderer, threadTotalFast, threadTotalAll]
      };
      this.processedData.push(newSite);
    }

    this.fillTraces(this.ctTraceNames);
  }

  // Parses Pinpoint data
  parsePinpointData(){
    let headers = this.rawData[0];
    let data = this.rawData.slice(1,-1);

    let displayLabelIndex = headers.indexOf('displayLabel');
    let nameIndex = headers.indexOf('name');
    let pageNameIndex = headers.indexOf('stories');
    let valueIndex = headers.indexOf('avg');

    // Only use rows containg with-patch data (indicated by '+')
    let filteredData = data.filter((item)=>{
      let name = item[nameIndex];
      return (this.ppTraceNames.indexOf(name) >= 0 || this.ppTraceNames1.indexOf(name) >= 0 ||
        this.ppTraceNames2.indexOf(name) >= 0 || this.ppTraceNames3.indexOf(name) >= 0); 
      //return (item[displayLabelIndex] && item[displayLabelIndex].includes('+'));
    });

    for (let i = 0; i < filteredData.length; i++){
      this.addData(filteredData[i], nameIndex, pageNameIndex, valueIndex);
    }

    this.fillTraces(this.ppTraceNames);
  }

  addData(row, nameIndex, pageNameIndex, valueIndex){
    let dataName = row[nameIndex];
    let mainDataIndex = this.ppTraceNames.indexOf(dataName);
    let dataIndex1 = this.ppTraceNames1.indexOf(dataName);
    let dataIndex2 = this.ppTraceNames2.indexOf(dataName);
    let dataIndex3 = this.ppTraceNames3.indexOf(dataName);

    let pageName = row[pageNameIndex];

    let existing_site = this.processedData.find(x => x.pageName === pageName);
    let site;

    if (existing_site == null){
      site = {
        pageName: pageName,
        data: Array.apply(null, Array(this.ppTraceNames.length)).map(Number.prototype.valueOf,0),
        data1: Array.apply(null, Array(this.ppTraceNames1.length)).map(Number.prototype.valueOf,0),
        data2: Array.apply(null, Array(this.ppTraceNames2.length)).map(Number.prototype.valueOf,0),
        data3: Array.apply(null, Array(this.ppTraceNames3.length)).map(Number.prototype.valueOf,0)
      };
    } else {
      site = existing_site;
    }

    let value = this.getRoundedNumber(row[valueIndex]);

    if (mainDataIndex >= 0){
      site.data[mainDataIndex] = value; 
    } else if(dataIndex1 >= 0){
      site.data1[dataIndex1] = value;
    } else if(dataIndex2 >= 0){
      site.data2[dataIndex2] = value;
    } else if(dataIndex3 >= 0){
      site.data3[dataIndex3] = value;
    }

    if (existing_site == null){
      this.processedData.push(site);
    }
  }

  // Given processed data from CT or Pinpoint, convert to Plotly trace format
  fillTraces(traceNames){
    let sortedData = this.processedData.sort(this.compareTimes);

    for (let i = 0; i < traceNames.length; ++i) {
      this.traces[i] = { x: [], y: [], name: traceNames[i], type: 'bar', mode:'markers', hoverlabel: {namelength:-1}};
      for (let r = 0; r < sortedData.length; ++r) {
        this.traces[i].x[r] = sortedData[r].pageName;
        this.traces[i].y[r] = sortedData[r].data[i];
        this.pageNames.add(sortedData[r].pageName);
      }
    }
  }

}