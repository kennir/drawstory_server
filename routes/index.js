var register = require('../controllers/register'),
	login = require('../controllers/login'),
	game = require('../controllers/game');

exports.init = function(aAuth,aModels) {
	register.init(aAuth,aModels.UserModel);
	login.init(aAuth,aModels.UserModel);
	game.init(aAuth,aModels);
}



exports.index = function(req, res){
  res.render('index', { title: 'Express' })
}

exports.queryGame = function(req,res){
	console.log('queryGame -> ObjectId is:' + req.params.gid);
	game.queryGame(req,res);
}

exports.queryGamesFromUser = function(req,res){
	console.log('queryGameForUser -> user object id is:' + req.params.uid);
	game.queryGamesFromUser(req,res);
}

exports.queryReplay = function(req,res){
	console.log('queryReplay -> replay id is:' + req.params.rid);
	game.queryReplay(req,res);
}


exports.register = function(req,res){
	console.log('register -> email is:' + req.body.email + ' usrname is:' + req.body.username);
	register.reg(req,res);
}

exports.login = function(req,res){
	console.log('login -> email is:' + req.body.email + ' password is:' + req.body.password);
	login.login(req,res);
}


exports.randomGame = function(req,res){
	console.log('randomGame -> email is:' + req.body.email);
	game.random(req,res);
}


exports.deleteGameIfNotStarted = function(req,res){
	console.log('deleteGameIfNotStarted -> ObjectId is:' + req.params.gid);
	game.deleteGameIfNotStarted(req,res);
}

exports.receivePainting = function(req,res) {
	console.log('receivePainting -> Game is:' + req.params.gid);
	game.receivePainting(req,res);
}