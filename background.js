chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'bounds': {
      'width': 800,
      'height': 600
    }
  });
});

chrome.runtime.onConnect.addListener(function(port){
  port.postMessage({response:"connected"});
  chrome.system.cpu.getInfo(function(info) {
  	port.postMessage({response:info.archName});
  });
});
