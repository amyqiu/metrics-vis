export default class Parser {
  constructor(raw_data) {
    this.raw_data = raw_data;
    this.page_names = new Set(); // Set of page names for searching
    this.processed_data = []; 
    this.traces = []; // Stores data in Plotly format
  }

  // Used to sort data by total time taken
  CompareTimes(a, b){
    let a_value = a.data.reduce((x, y) => Number(x) + Number(y), 0);
    let b_value = b.data.reduce((x, y) => Number(x) + Number(y), 0);
    if (a_value === b_value) {
        return 0;
    }
    else {
        return (a_value < b_value) ? -1 : 1;
    }
  }

  // Converts string to number and rounds to two decimal places
  GetRoundedNumber(string){
    return Number(Number(string).toFixed(2));
  }

  // Parses Cluster Telemetry data
  ParseCTData(){
    let trace_names = [
      'Thread Renderer Compositor Time',
      'Thread Total Fast Path Time',
      'Thread Total All CPU Time'
    ];

    let headers = this.raw_data[0];
    let data = this.raw_data.slice(1,-1);

    let thread_renderer_index = headers.indexOf('thread_renderer_main_cpu_time_per_frame (ms)');
    let frame_times_index = headers.indexOf('frame_times (ms)');
    let thread_total_fast_index = headers.indexOf('thread_total_fast_path_cpu_time_per_frame (ms)');
    let thread_total_all_index = headers.indexOf('thread_total_all_cpu_time_per_frame (ms)');
    let page_name_index = headers.indexOf('page_name');

    // Remove rows where any of the data is missing
    let filtered_data = data.filter(function(item) {
      return (item[thread_renderer_index] != '' && item[thread_total_fast_index] != '' 
        && item[thread_total_all_index] != '' && item[frame_times_index] != '');
    });

    // Populate processed_data with objects containing the page and data points
    for (let i = 0; i < filtered_data.length; ++i) {
      let thread_renderer = this.GetRoundedNumber(filtered_data[i][thread_renderer_index]);
      let thread_total_fast = this.GetRoundedNumber(filtered_data[i][thread_total_fast_index]);
      let thread_total_all = this.GetRoundedNumber(filtered_data[i][thread_total_all_index]);

      let new_site = {
        page_name: filtered_data[i][page_name_index],
        data: [thread_renderer, thread_total_fast, thread_total_all]
      };
      this.processed_data.push(new_site);
    }

    this.FillTraces(trace_names);
  }

  // Parses Pinpoint data
  ParsePinpointData(){
    // Add more metrics here if needed
    let trace_names = ['frame_times', 'mean_frame_time', 'mean_input_event_latency'];
    let trace_names_1 = ['frame_time_discrepancy', 'first_gesture_scroll_update_latency'];
    let trace_names_2 = ['queueing_durations', 'input_event_latency', 'main_thread_scroll_latency'];
    let trace_names_3 = ['mean_main_thread_scroll_latency', 'percentage_smooth'];

    let headers = this.raw_data[0];
    let data = this.raw_data.slice(1,-1);

    let display_label_index = headers.indexOf('displayLabel');
    let name_index = headers.indexOf('name');
    let page_name_index = headers.indexOf('stories');
    let value_index = headers.indexOf('avg');

    // Only use rows containg with-patch data (indicated by '+')
    let filtered_data = data.filter(function(item) {
      let name = item[name_index];
      return (trace_names.indexOf(name) >= 0 || trace_names_1.indexOf(name) >= 0 ||
        trace_names_2.indexOf(name) >= 0 || trace_names_3.indexOf(name) >= 0); 
      //return (item[display_label_index] && item[display_label_index].includes('+'));
    });

    for (let i = 0; i < filtered_data.length; i++){
      this.AddData(filtered_data[i], name_index, page_name_index, value_index);
    }

    console.log("processed_data");
    console.log(this.processed_data);

    this.FillTraces(trace_names);
  }

  AddData(row, name_index, page_name_index, value_index){
    let trace_names = ['frame_times', 'mean_frame_time', 'mean_input_event_latency'];
    let trace_names_1 = ['frame_time_discrepancy', 'first_gesture_scroll_update_latency'];
    let trace_names_2 = ['queueing_durations', 'input_event_latency', 'main_thread_scroll_latency'];
    let trace_names_3 = ['mean_main_thread_scroll_latency', 'percentage_smooth'];

    let data_name = row[name_index];
    let main_data_index = trace_names.indexOf(data_name);
    let data_1_index = trace_names_1.indexOf(data_name);
    let data_2_index = trace_names_2.indexOf(data_name);
    let data_3_index = trace_names_3.indexOf(data_name);

    let page_name = row[page_name_index];

    let existing_site = this.processed_data.find(x => x.page_name === page_name);
    let site;

    if (existing_site == null){
      site = {
        page_name: page_name,
        data: Array.apply(null, Array(trace_names.length)).map(Number.prototype.valueOf,0),
        data_1: Array.apply(null, Array(trace_names_1.length)).map(Number.prototype.valueOf,0),
        data_2: Array.apply(null, Array(trace_names_2.length)).map(Number.prototype.valueOf,0),
        data_3: Array.apply(null, Array(trace_names_3.length)).map(Number.prototype.valueOf,0)
      };
    } else {
      site = existing_site;
    }

    let value = this.GetRoundedNumber(row[value_index]);

    if (main_data_index >= 0){
      site.data[main_data_index] = value; 
    } else if(data_1_index >= 0){
      site.data_1[data_1_index] = value;
    } else if(data_2_index >= 0){
      site.data_2[data_2_index] = value;
    } else if(data_3_index >= 0){
      site.data_3[data_3_index] = value;
    }

    if (existing_site == null){
      this.processed_data.push(site);
    }
  }

  // Given processed data from CT or Pinpoint, convert to Plotly trace format
  FillTraces(trace_names){
    let sorted_data = this.processed_data.sort(this.CompareTimes);

    for (let i = 0; i < trace_names.length; ++i) {
      this.traces[i] = { x: [], y: [], name: trace_names[i], type: 'bar', mode:'markers', hoverlabel: {namelength:-1}};
      for (let r = 0; r < sorted_data.length; ++r) {
        this.traces[i].x[r] = sorted_data[r].page_name;
        this.traces[i].y[r] = sorted_data[r].data[i];
        this.page_names.add(sorted_data[r].page_name);
      }
    }
  }

}