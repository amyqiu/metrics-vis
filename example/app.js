// Parses data from file and create plot
function UploadFile(){
  let file = document.getElementById('upload').files[0];
  let reader = new FileReader();
  reader.readAsText(file);

  reader.onload = function(event) {
    let content = event.target.result;
    let csv = Papa.parse(content);
    if (csv) {
      MetricsVis.CreatePlot('main', csv.data, GetDataSource(), window.innerHeight * 0.8, window.innerWidth * 0.8);
    } else {
      alert('No data to import!');
    }
  };
  reader.onerror = function() {
      alert('Unable to read ' + file.fileName);
  };
}

// Called when user chooses a local file
function SetDataSource(){
  let file = document.getElementById('upload').files[0];
  if (file != null){
    UploadFile();
  }
}

// Get data source from dropdown (either 'CT' or 'PP')
function GetDataSource(){
  let dropdown = document.getElementById('data-source');
  let source = dropdown.options[dropdown.selectedIndex].value;
  return source;
}

document.addEventListener('DOMContentLoaded', function(){
  // Initialize event handlers for dropdown and file upload
  document.getElementById('upload').addEventListener('change', UploadFile);
  document.getElementById('data-source').addEventListener('change', SetDataSource);
});
