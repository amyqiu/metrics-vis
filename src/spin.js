export default class Spin {
  constructor(div) {
    this.div = div;
  }

  // Show spinner animation
  Start(){
    this.Stop(); //make sure existing spinners are removed
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
      top: '20%',
      left: '20%',
      shadow: '0 0 2px transparent',
      //position: 'absolute'
    };
    let target = this.div.querySelector('#spinner');
    let spinner = new Spinner(opts).spin();
    target.appendChild(spinner.el);
  }

  // Remove spinner animation
  Stop(){
    this.div.querySelector('#spinner').innerHTML = '';
  }
}