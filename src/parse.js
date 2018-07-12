let TRACES; // Stores data in Plotly format
let PAGE_NAMES; // Set of page/page names

// Used to sort data by total time taken
function CompareTimes(a, b){
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
function GetRoundedNumber(string){
  return Number(Number(string).toFixed(2));
}

// Parses Cluster Telemetry data
function ParseCTData(raw_data){
  let trace_names = [
    'Thread Renderer Compositor Time',
    'Thread Total Fast Path Time',
    'Thread Total All CPU Time'
  ];

  let headers = raw_data[0];
  let data = raw_data.slice(1,-1);

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

  let processed_data = [];

  // Populate processed_data with objects containing the page and data points
  for (let i = 0; i < filtered_data.length; ++i) {
    let thread_renderer = GetRoundedNumber(filtered_data[i][thread_renderer_index]);
    let thread_total_fast = GetRoundedNumber(filtered_data[i][thread_total_fast_index]);
    let thread_total_all = GetRoundedNumber(filtered_data[i][thread_total_all_index]);

    let new_site = {
      page_name: filtered_data[i][page_name_index],
      data: [thread_renderer, thread_total_fast, thread_total_all]
    };
    processed_data.push(new_site);
  }

  FillTraces(processed_data, trace_names);
}

// Parses Pinpoint data
function ParsePinpointData(raw_data){
  // Add more metrics here if needed
  let trace_names = ['frame_times', 'mean_frame_time', 'mean_input_event_latency', 'mean_main_thread_scroll_latency'];

  let headers = raw_data[0];
  let data = raw_data.slice(1,-1);

  let display_label_index = headers.indexOf('displayLabel');
  let name_index = headers.indexOf('name');
  let page_name_index = headers.indexOf('stories');
  let value_index = headers.indexOf('avg');

  // Only use rows containg with-patch data (indicated by '+')
  let filtered_data = data.filter(function(item) {
    return (item[display_label_index] && item[display_label_index].includes('+'));
  });

  let processed_data = [];

  // Populate processed_data with objects containing the page name and data points
  for (let i = 0; i < filtered_data.length; ++i){
    let index = trace_names.indexOf(filtered_data[i][name_index]);
    // Only check rows containing relevant metrics data
    if (index > -1){
      let site = processed_data.find(x => x.page_name === filtered_data[i][page_name_index])
      // If object with the site exists already, fill out the value for the given metric
      if (site){      
        site.data[index] = GetRoundedNumber(filtered_data[i][value_index]);
      } else{ // Otherwise, create a new object with values defaulted to 0
        let new_site = {
          page_name: filtered_data[i][page_name_index],
          // Create array of zeroes
          data: Array.apply(null, Array(trace_names.length)).map(Number.prototype.valueOf,0)
        };
        new_site.data[index] = GetRoundedNumber(filtered_data[i][value_index]);
        processed_data.push(new_site);
      }
    }
  }

  FillTraces(processed_data, trace_names);
}

// Given processed data from CT or Pinpoint, convert to Plotly trace format
function FillTraces(processed_data, trace_names){
  let sorted_data = processed_data.sort(CompareTimes);

  PAGE_NAMES = new Set(); // Used for searching
  TRACES = [];

  for (let i = 0; i < trace_names.length; ++i) {
    TRACES[i] = { x: [], y: [], name: trace_names[i], type: 'bar', mode:'markers', hoverlabel: {namelength:-1}};
    for (let r = 0; r < sorted_data.length; ++r) {
      TRACES[i].x[r] = sorted_data[r].page_name;
      TRACES[i].y[r] = sorted_data[r].data[i];
      PAGE_NAMES.add(sorted_data[r].page_name);
    }
  }
}

export{
  GetRoundedNumber,
  ParseCTData,
  ParsePinpointData,
  FillTraces,
  TRACES,
  PAGE_NAMES
}