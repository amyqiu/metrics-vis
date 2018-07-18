import Manager from './manager.js';
import './css/styles.css';

let manager;
function init(div, data, dataSource, plotHeight, plotWidth, newFile){
  if(manager == null){
    manager = new Manager(div, data, dataSource, plotHeight, plotWidth);
  } else if (newFile == true){
    manager.createPlot(data, dataSource);
  }
}

export {
  init
}