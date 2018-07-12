# Metrics Visualization Project

This project explores ways to visualize Chrome metrics, specifically the durations of various steps in the rendering pipeline.

## Using the library

1. Download the metrics-vis.min.js file from the /dist folder
2. Include this in the header of your html file
3. In your script, Call `MetricsVis.CreatePlot(div_id, file, data_source, plot_height, plot_width);`
   * `div_id`: ID of the div that the plot should be inserted into
   * `file`: JS file object containg Cluster Telemetry or Pinpoint data
   * `data_source`: either 'CT' for Cluster Telemetry or 'PP' for Pinpoint
   * `plot_height`/`plot_width`: dimensions of Plotly plot (in px)

## Using the tool

1. Download the **raw csv** from a Cluster Telemetry run or the **merged csv** from a Pinpoint run
2. Use the "Data Source" dropdown to select the correct data source
3. Upload the file using the "Upload File" button
4. Use the "Starting Percentile" and "Ending Percentile" text boxes to filter the data (this is calculated based on total time)
5. Click on any of the bars to open a new page, containing a plot with more detailed time breakdowns
6. Alternatively, enter a page name in the searchbox and click "Detailed Plot" to view its detailed plot


## Setting up (for development)

 1. Clone this repo
 2. Run npm install
 3. Run npm run start and open the link provided to see a demo (opens exmple/index.html)
    * This starts Webpack Dev Server, which will generate a minified metrics-vis.js file in the dist/ folder whenever anything in src/ is changed
    * It also copies the generated metrics-vis.js file to the example/ folder so that the page receives all new changes

