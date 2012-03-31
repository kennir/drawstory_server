var auth;
var userModel;


exports.init = function(aAuth,aUserModel)
{
	auth = aAuth;
	userModel = aUserModel;
}


exports.reg = function(req,res){
	auth.registerUser(req.body.email,req.body.username,function(err,password){
		if(err){
			var json = { "result":false, "reason": err };
			res.send(json);
		} else{
			var json = {"result":true, "email":req.body.email, "password":password };
			res.send(json);
		}
	})
}