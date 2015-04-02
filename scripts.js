scripts = {
  port: null,
};

scripts.sendRequest=function(what) {
     var request=new Message.Request(what); 
	scripts.port.postMessage(JSON.stringify(request));
}

scripts.start=function() {
	scripts.sendRequest("cpu");
}

scripts.connect=function() {
	debugger;
	//This line opens up a long-lived connection to your background page.
	var port = chrome.runtime.connect({name:"player-channel"});
	scripts.port=port;

	port.onMessage.addListener(function(messageString,sender){
		console.log("message received");
		var message=JSON.parse(messageString);
		switch(message.type) {
			case Message.Types.Response:
				switch(message.response) {
					case "connect":
					    console.log(message.response);
					    scripts.start();
						break;
					case "cpu":
					    console.log("got CPU info " + message.data.archName);
						break;

				}
				break;

		}
	});
}

$(document).ready(function(){
	console.log("HERE I AM");
	setTimeout(scripts.connect, 1000);
}); 
