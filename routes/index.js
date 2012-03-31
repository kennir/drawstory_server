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
	console.log('queryGame -> ObjectId is:' + req.param.gameid);
	game.queryGame(req.res);
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