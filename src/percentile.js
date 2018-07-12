import * as plot from './plot.js';
import * as spinner from './spinner.js';

// Get index of x percentile value
function GetPercentileIndex(percentile, array_length){
  let index = Math.ceil(array_length * (percentile / 100)) - 1;
  if (index == -1) {
    return 0;
  }
  return index;
}

// Called when percentile filters are submitted
function FilterGraphWithPercentile(){
  spinner.LoadSpinner();

  // Add slight delay to allow loading animation to start
  setTimeout(function(){
    plot.PlotData(false);
  }, 5)
}

export{
  GetPercentileIndex,
  FilterGraphWithPercentile
}