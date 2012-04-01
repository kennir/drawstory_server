var bcrypt = require('bcrypt');
var UserModel;

var AUTH_ERR_DB				= -1;
var AUTH_ERR_BCRYPT			= -2;
var AUTH_ERR_DB_SAVE		= -3;
var AUTH_ERR_EXISTED 		= -4;
var AUTH_ERR_USERNOTFOUND	= -5;
var AUTH_ERR_PASSWORD		= -6;
var AUTH_ERR_SUCCESSED		= 0;

function randomPassword(count){
	var avaiable ="0123456789";
	var password = "";
	for(i = 0; i < count; ++i)
	{
		password += avaiable.charAt(Math.ceil( Math.random() * 100000000 ) % avaiable.length);
	}
	
	return password;
}


exports.init = function(aUserModel) {
	UserModel = aUserModel;
}

exports.loginUser = function(aEmail,aPassword,cb){
	UserModel.findOne({email: aEmail},function(err,user){
		if(err){
			console.log("ERROR:DB FindOne");
			cb(AUTH_ERR_DB,null);
		} else if(!user) {
			console.log("ERROR:User doesn't existed!");
			cb(AUTH_ERR_USERNOTFOUND,null);
		} else {
			bcrypt.compare(aPassword, user.password, function(err,res) {
	        	if(err) {
	          		console.log("ERROR: Couldn't generate hash");
	          		cb(AUTH_ERR_BCRYPT,null);
	        	} else if (!res) {
	          		console.log("Error: Passwords don't match");
	          		cb(AUTH_ERR_PASSWORD,null);
	        	} else {
	          		console.log("SUCCESSED: User logined");
					cb(AUTH_ERR_SUCCESSED,user);
	        	}
	      });
		}
	});
}

exports.registerUser = function(aEmail,aUsername,cb){
	UserModel.findOne({email: aEmail}, function(err,res) {
		if(err) {
			console.log("ERROR:DB FindOne");
			cb(AUTH_ERR_DB,null,null);
		} else if(res != null) {
			console.log("ERROR:Email: " + aEmail + " existed");
			cb(AUTH_ERR_EXISTED,null,null);
		} else {
			bcrypt.genSalt(10, function(err,salt) {
				if(err){
					console.log("ERROR:BCRYPT genSalt failed!");
					cb(AUTH_ERR_BCRYPT,null);
				} else {
					var password = randomPassword(8);
					bcrypt.hash(password, salt, function(err, hash) {
		            	if(err) {
		              		console.log("ERROR:BCRYPT hash failed");
		              		cb(AUTH_ERR_BCRYPT,null,null);
		            	} else {	
							var newUser = new UserModel({
								email:aEmail,
								username:aUsername,
								password:hash
							});	
							newUser.save(function(err){
								if(err){
									console.log("ERROR:DB Save");
									cb(AUTH_ERR_DB_SAVE,null,null);
								} else {
									console.log("SUCCESS:Email: " + aEmail + " registed");
									cb(AUTH_ERR_SUCCESSED,newUser,password);
								}
							});	// newUser.save(function(err){
						} 
					}); // bcrypt.encrypt(data.password, salt, function(err, hash) {
				}
			});
		}
	});
}