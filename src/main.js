import Manager from './manager.js';
import './css/styles.css';

function init(div, data, data_source, plot_height, plot_width){
  let manager = new Manager(div, data, data_source, plot_height, plot_width);
}

export {
  init
}