var models = require('../models/models');


var UserModel = models.UserModel,
	GameModel = models.GameModel,
	ReplayModel = models.ReplayModel;
	
GameModel.remove({},function(err){
	console.log("Remove all games! err:" + err);
})

UserModel.update({},{games: []},function(err){
	console.log("Reset games for all users! err:" + err);
})
	
ReplayModel.remove({},function(err){
	console.log("Remove all replays! err:" + err);
})
	
