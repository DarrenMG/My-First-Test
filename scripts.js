scripts = {
  port: null,
  localStorageSize:100*1024*1024,
  savedURL:null
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

// API failures in Chrome are logged but currently not recoverable
scripts.logFilesystemError = function(e) {
	 var msg = '';
	  switch (e.code) {
	    case FileError.QUOTA_EXCEEDED_ERR:
	      msg = 'QUOTA_EXCEEDED_ERR';
	      break;
	    case FileError.NOT_FOUND_ERR:
	      msg = 'NOT_FOUND_ERR';
	      break;
	    case FileError.SECURITY_ERR:
	      msg = 'SECURITY_ERR';
	      break;
	    case FileError.INVALID_MODIFICATION_ERR:
	      msg = 'INVALID_MODIFICATION_ERR';
	      break;
	    case FileError.INVALID_STATE_ERR:
	      msg = 'INVALID_STATE_ERR';
	      break;
	    default:
	      msg = 'Unknown Error';
	      break;
	  };
	  console.error(msg);
}

scripts.saveBlobPart2=function(filename,blob,onCompleted) {
	window.webkitRequestFileSystem(window.TEMPORARY,scripts.localStorageSize,
		function(fs){
			fs.root.getFile(filename,{create:true},
		    	function(fileEntry){
					scripts.savedURL=fileEntry.toURL();
	    			console.debug("Created file "+filename+" "+scripts.savedURL);
			    	fileEntry.createWriter(function(fileWriter){
			    		fileWriter.onwriteend=function(e) {
							console.debug("Save successful = "+filename);
			    			onCompleted(true);
			    		};
			    		fileWriter.onerror=function(e) {
			    			console.debug("Save failed = "+filename+" "+e.toString());
			    			onCompleted(false);
			    		};
			    		fileWriter.write(blob);
			    	});
			    },
		    	scripts.logFilesystemError
			);
		},
		scripts.logFilesystemError
	);
}

scripts.recursivelyCreateDirectory=function(root,path,blob,onCreatedDirectories) {

	var makeDirectories = function(root,paths,onCreateDirectories) {
		// Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
		if (paths[0] == '.' || paths[0] == '') {
			paths = paths.slice(1);
		}
		
		if(paths.length > 1) {
			var directory=paths[0];
			root.getDirectory(directory,{create:true},
		    	function(dirEntry){
	    			console.debug("Created directory "+directory+" "+ dirEntry.toURL());
	    			makeDirectories(dirEntry,paths.slice(1),onCreatedDirectories);
			    },
			    function(e) {
	    			console.debug("Failed created directory "+directory);
				    scripts.logFilesystemError(e);
	    			makeDirectories(dirEntry,paths.slice(1),onCreatedDirectories);
			    }
			);
		} else {
			onCreatedDirectories();
		}
	}; 	
	makeDirectories(root,path.split('/'),onCreatedDirectories);
  
} 

scripts.saveBlobPart1=function(filename,blob,onCreatedDirectories) {
	window.webkitRequestFileSystem(window.TEMPORARY,scripts.localStorageSize,
		function(fs){
			scripts.recursivelyCreateDirectory(fs.root,filename,blob,onCreatedDirectories);
		},
		scripts.logFilesystemError
	);

}

scripts.saveBlobToLocalStorage = function(filename,blob,onCompleted) {
	scripts.saveBlobPart1(filename,blob,function(){
		scripts.saveBlobPart2(filename,blob,onCompleted);
	});
}


scripts.downloadImage = function() {
	var url="http://git-repo.qiniudn.com/images/test.jpg-small";
//	var url="http://localhost:8080/images/small.jpg";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	
	xhr.onload = function(e) {
	  if (this.status == 200) {
		// Note: .response instead of .responseText
		var blob = new Blob([this.response], {type: ''});
		scripts.saveBlobToLocalStorage("image.jpg",blob,scripts.onDownloadImageComplete);
	  } else {
		// TODO: Handle download errors
		console.log("Image download failed");
	  }
	};
	xhr.send();
}

scripts.downloadVideo = function() {
	var url="http://localhost:8080/videos/small.mp4";
	
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.responseType = 'blob';
	
	xhr.onload = function(e) {
	  if (this.status == 200) {
		// Note: .response instead of .responseText
		var blob = new Blob([this.response], {type: ''});
		scripts.saveBlobToLocalStorage("image.jpg",blob,scripts.onDownloadVideoComplete);
	  } else {
		// TODO: Handle download errors
		console.log("Image download failed");
	  }
	};
	xhr.send();
}

scripts.onDownloadImageComplete=function() {
	console.log("Image download succeeded");
	$('#imageTest').append( '<img src=\"' + scripts.savedURL + '\">' );
	scripts.VideoTest();
}

scripts.onDownloadVideoComplete=function() {
	console.log("Video download succeeded");
	$('#videoTest').append( '<video width=\"320\" height=\"240\" controls> <source src=\"' + scripts.savedURL + '\" type=\"video/mp4\"></video>' );
 
}

scripts.ImageTest=function() {
	scripts.downloadImage();
}

scripts.VideoTest=function() {
	scripts.downloadVideo();
}

scripts.start=function() {
	scripts.sendRequest("cpu","report_cpu");
	scripts.ImageTest();
/*
	window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	window.webkitRequestFileSystem(window.TEMPORARY,scripts.localStorageSize,
		function(fs){
			console.log("filesystem obtain");
		},
		scripts.logFilesystemError
	);
*/
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
