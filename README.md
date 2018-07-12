# Metrics Visualization Project

This project explores ways to visualize Chrome metrics, specifically the durations of various steps in the rendering pipeline.

## Setting Up

 1. Clone this repo
 2. Run npm install
 3. Run npm run start and open the link provided to see a demo (opens exmple/index.html)
    * This starts Webpack Dev Server, which will generate a minified metrics-vis.js file in the dist/ folder whenever anything in src/ is changed
    * It also copies the generated metrics-vis.js file to the example/ folder so that the page receives all new changes

## Using the Tool

1. Download the **raw csv** from a Cluster Telemetry run or the **merged csv** from a Pinpoint run
2. Use the "Data Source" dropdown to select the correct data source
3. Upload the file using the "Upload File" button
4. Use the "Starting Percentile" and "Ending Percentile" text boxes to filter the data (this is calculated based on total time)
5. Click on any of the bars to open a new page, containing a plot with more detailed time breakdowns
6. Alternatively, enter a page name in the searchbox and click "Detailed Plot" to view its detailed plot

