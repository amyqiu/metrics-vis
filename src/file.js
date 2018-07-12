import * as parse from './parse.js';
import * as plot from './plot.js';
import * as spinner from './spinner.js';
import * as storage from './storage.js';

function ProcessFile(file, height, width){
  spinner.LoadSpinner();
  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function(event) {
    let content = event.target.result;
    let data_source = storage.RetrieveDataSource();
    let csv = Papa.parse(content);
    if (csv) {
      // Parse data based on its datasource (formats are different)
      if (data_source == "CT"){
        parse.ParseCTData(csv.data);
      } else{
        parse.ParsePinpointData(csv.data);
      }
      // Create new Plotly plot
      plot.PlotData(true, height, width);
    } else {
      alert('No data to import!');
    }
  };
  reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
  };
}

export{
  ProcessFile
}