/* */
var port;

$(document).ready(function(){
	console.log("HERE I AM");

	//This line opens up a long-lived connection to your background page.
	port = chrome.runtime.connect({name:"mycontentscript"});

	port.onMessage.addListener(function(message,sender){
	    console.log(message.response);
	});

}); 
