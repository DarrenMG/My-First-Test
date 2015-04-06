Message = {
	id:0
};

// --------------------------------------------------------------------------------------------------
Message.Type = {
        Request : 0,
        Response : 1,
        Event : 2
}

Message.Request = function(request,callback) {
     this.type=Message.Type.Request;
     this.id=Message.id;
     Message.id++;
     this.request=request;
     this.callback=callback;
};

Message.Response = function(request,success,data) {
     this.type=Message.Type.Response;
     this.id=request.id;
     this.response=request.request;
     this.callback=request.callback;
     this.success=success;
     this.data=data;
};

Message.isResponse=function(message) {
	if(message.type==Message.Type.Response) {
		return true;
	} else {
		return false;
	}
}

Message.isResponseSucceeded=function(message) {
	if(message.type==Message.Type.Response&&message.success) {
		return true;
	} else {
		return false;
	}
}