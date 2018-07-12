import * as storage from './storage.js';
import * as main from './main.js';
import * as detailed from './detailed-plot.js';

// Create annotations for Plotly that show when a bar is clicked
function InitializeAnnotations(plot_div){
  plot_div.on('plotly_click',
    function(data){
      RemoveAnnotations(); // Clear any previous annotation

      let y_total = 0; // Total bar height for arrow placement
      let y_points = [];
      let point = data.points[data.points.length - 1];
      
      for (let i = 0; i < data.points.length; ++i){
        y_points.push(data.points[i].y);
        y_total += point.yaxis.d2l(data.points[i].y);
      }

      // Save the point so detailed plot can be generated
      storage.StoreDataPoint(data.points[0].x, y_points);

      let newAnnotation = {
          x: point.xaxis.d2l(point.x),
          y: y_total,
          ax: 0,
          ay: -80,
          bgcolor: 'rgba(255, 255, 255, 0.8)',
          bordercolor: '#404040',
          arrowcolor: '#404040 ',
          borderpad: 10,
          text: '<a rel="external">' + point.x + '</a>',
          captureevents: true
      };

      let plot = document.getElementById('plot');
      let newIndex = (plot.layout.annotations || []).length;

      Plotly.relayout('plot', 'annotations[' + newIndex + ']', newAnnotation);
    });

  plot_div.on('plotly_clickannotation', detailed.OpenDetailedPlot);
}

function RemoveAnnotations(){
  Plotly.relayout('plot', 'annotations', 'remove');
}

export{
  InitializeAnnotations,
  RemoveAnnotations
}