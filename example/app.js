document.addEventListener('DOMContentLoaded', function(){
  // Initialize event handlers for dropdown and file upload
  document.getElementById('upload').addEventListener('change', UploadFile);
  document.getElementById('data-source').addEventListener('change', SetDataSource);
});

// Parses data from file to create Plotly plot
function UploadFile(){
  let file = document.getElementById('upload').files[0];
  MetricsVis.CreatePlot('main', file, GetDataSource(), window.innerHeight * 0.8, window.innerWidth * 0.8);
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
  let dropdown = document.getElementById("data-source");
  let source = dropdown.options[dropdown.selectedIndex].value;
  return source;
}
