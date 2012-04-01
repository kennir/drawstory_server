var auth;
var userModel;

exports.init = function(aAuth,aUserModel)
{
	auth = aAuth;
	userModel = aUserModel;
}


exports.login = function(req,res){
	auth.loginUser(req.body.email,req.body.password,function(err,user) {
		if(err){
			res.send({ "result":false, "reason": err });
		} else{
			res.send({"result":true, "objectid":user._id });
		}
	})
}