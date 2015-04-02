chrome.app.runtime.onLaunched.addListener(function() {
  chrome.app.window.create('window.html', {
    'bounds': {
      'width': 800,
      'height': 600
    }
  });
});

chrome.runtime.onConnect.addListener(function(port){
	if(port.name=='player-channel') {
		port.onMessage.addListener(function(messageString) {
            // do some stuff here
            console.log("background message received");
			var message=JSON.parse(messageString);

            switch(message.request) {
            	case "cpu":
					chrome.system.cpu.getInfo(function(info) {
				        var response=new Message.Response(message,true,info); 
						port.postMessage(JSON.stringify(response));
			 		});
            		break;
            }

        });

		// One time fake response for the connect case
        var request=new Message.Request("connect"); 
        var response=new Message.Response(request,true,null); 
		port.postMessage(JSON.stringify(response));
	}

/*
		chrome.system.cpu.getInfo(function(info) {
  		port.postMessage({response:info.archName});
 	});

	}
*/

});
