export default class Spin {
  constructor(div) {
    this.div = div;
  }

  // Show spinner animation
  start(){
    this.stop(); //make sure existing spinners are removed
    const opts = {
      lines: 13,
      length: 25,
      width: 10,
      radius: 45,
      scale: 1,
      corners: 1,
      color: 'gray',
      fadeColor: 'transparent',
      speed: 1,
      rotate: 0, 
      animation: 'spinner-line-fade-quick',
      direction: 1,
      zIndex: 2e9, 
      className: 'spinner',
      top: '50%',
      left: '40%',
      shadow: '0 0 2px transparent',
    };
    let target = this.div.querySelector('#spinner');
    let spinner = new Spinner(opts).spin(target);
    console.log("started");
  }

  // Remove spinner animation
  stop(){
    this.div.querySelector('#spinner').innerHTML = '';
  }
}