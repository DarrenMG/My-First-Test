Message = {
	id:0
};

// --------------------------------------------------------------------------------------------------
Message.Types = {
        Request : 0,
        Response : 1,
        Event : 2
}

Message.Request = function(request) {
     this.type=Message.Types.Request;
     this.id=Message.id;
     Message.id++;
     this.request=request;
};

Message.Response = function(request,success,data) {
     this.type=Message.Types.Response;
     this.id=request.id;
     this.response=request.request;
     this.success=success;
     this.data=data;
};

Message.isResponse=function(message0) {
	if(message.type==Message.Types.Response) {
		return true;
	} else {
		return false;
	}
}