// Show spinner animation
function LoadSpinner(){
  StopSpinner(); //make sure existing spinners are removed
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
    //position: 'absolute'
  };
  let target = document.getElementById('spinner');
  let spinner = new Spinner(opts).spin();
  target.appendChild(spinner.el);
}

// Remove spinner animation
function StopSpinner(){
  document.getElementById('spinner').innerHTML = '';
}

export{
  LoadSpinner,
  StopSpinner
}