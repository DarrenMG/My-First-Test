scripts = {
  port: null,
};

scripts.sendRequest=function(what,callback) {
     var request=new Message.Request(what,callback); 
	 scripts.port.postMessage(JSON.stringify(request));
}

report_cpu=function(response) {
	if(Message.isResponseSucceeded(response)) {
		console.log("CPU Architecture="+response.data.archName);
	}
}

scripts.start=function() {
	scripts.sendRequest("cpu","report_cpu");
}

scripts.connect=function() {
	debugger;
	//This line opens up a long-lived connection to your background page.
	var port = chrome.runtime.connect({name:"player-channel"});
	scripts.port=port;

	port.onMessage.addListener(function(messageString,sender){
		console.log("message received");
		var message=JSON.parse(messageString);
		if(Message.isResponse(message)) {
			var messageHandled=false;
			if(message.callback) {
				console.log(message.callback);
				messageHandled=true;
				var fn=window[message.callback];
				if(fn) {
					var fnparams=[message];
					if (typeof fn === "function") {
						fn.apply(null,fnparams);
					}
				} else {
					console.error("Callback not found "+message.callback);
				}
			}
			if(!messageHandled) {
				switch(message.response) {
					case "connect":
						console.log(message.response);
						scripts.start();
						break;
					default:
						console.error("Unknown response "+message);
						break;

				}
			}
		}
	});
}

$(document).ready(function(){
	console.log("HERE I AM");
	setTimeout(scripts.connect, 1000);
}); 
