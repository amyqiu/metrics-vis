# Metrics Visualization Project

This project explores ways to visualize Chrome metrics, specifically the durations of various steps in the rendering pipeline.

## Using the library

1. Download the `metrics-visualizer.min.js` file from the `/dist` folder
2. Include this in the header of your html file
   * Note: MetricsVis includes the following dependencies: plotly.js (plotting library), spin.js (UI spinner), fuse.js (search library)
   * You will not need to include any of these in your html file, since they are bundled into `metrics-visualizer.min.js`
3. In your script, use
    ```
    var metricsVisualizer = new MetricsVisualizer(div, file, data_source, plot_height, plot_width);
    metricsVisualizer.createPlot();
    ```
   * `div`: div that the plot should be inserted into
   * `data`: JS 2D array containing Cluster Telemetry or Pinpoint data
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
 2. Run `npm install`
 3. Run `npm start` and open the link provided to see a demo (opens `example/index.html`)
    * This starts Webpack Dev Server, which will generate a minified `metrics-visualizer.min.js` file in the `dist/` folder whenever anything in `src/` is changed
    * It also copies the generated `metrics-visualizer.min.js` file to the `example/` folder so that the page receives all new changes
 4. To run tests, use `npm test` (implemented with the Jest testing framework)