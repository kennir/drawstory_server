var models = require('../models/models');



var	GameModel = models.GameModel;
	
GameModel.remove({state:0},function(err){
	console.log("Remove all games! err:" + err);
})