var lexicon = require("./lexicon");

var auth;
var UserModel;
var GameModel;
var ReplayModel;

var GAME_MAX				= 99;

var GAME_ERR_DB 			= -1;
var GAME_ERR_DB_SAVE		= -2;
var GAME_ERR_USERNOTFOUND	= -3;
var GAME_ERR_GETOBJECTID	= -4;
var GAME_ERR_GAMENOTFOUND	= -5;
var GAME_ERR_STARTED		= -6;
var GAME_ERR_USERHAVENOTGAME = -7;
var GAME_ERR_NOTOWNER 		= -8;
var GAME_ERR_INVALIDPARAM	= -9;
var GAME_ERR_TOOMANYGAMES	= -10;
var GAME_ERR_LEXICONERROR	= -11;
var GAME_ERR_REPLAYNOTFOUND = 12;
var GAME_ERR_SUCCESSED		= 0;

var GAME_CREATE				= 1;
var GAME_JOIN				= 2;

function getObjectId(aEmail,cb){
	UserModel.findOne({email: aEmail},function(err,res){
		if(err){
			console.log("ERROR:DB findOne");
			cb(GAME_ERR_DB,null);
		} else if(!res) {
			console.log("ERROR:User doesn't existed");
			cb(GAME_ERR_USERNOTFOUND,null);
		} else {
			console.log("SUCCESSED:User found. id is " + res._id);
			cb(GAME_ERR_SUCCESSED,res);
		}
	});
}


function join(aGame,aUser,cb){
	aGame.opponent = aUser._id;
	aGame.state = 1;
	aGame.save(function(err){
		if(err){
			console.log("ERROR:DB Save");
			cb(GAME_ERR_DB_SAVE,null,null);
		} else {
			aUser.games.push(aGame._id);
			aUser.save(function(err){
				if(err){
					console.log("ERROR:DB Save");
					cb(GAME_ERR_DB_SAVE,null,null);
				} else {
					console.log("SUCCESSED:random game joined");
					cb(GAME_ERR_SUCCESSED,GAME_JOIN,aGame._id);
				}
			})
		}
	});
}

function removeGameFromUser(aOwnerId,aGameId,cb) {
	UserModel.findById(aOwnerId,function(err,user){
		if(err){
			console.log("ERROR:DB findOne");
			cb(GAME_ERR_DB);
		} else if(!user){
			console.log("ERROR:Invalid user object id");
			cb(GAME_ERR_USERNOTFOUND);
		} else {
			var index = user.games.indexOf(aGameId);
			if(index >= 0) {
				user.games.splice(index,1);
				user.save(function(err){
					if(err){
						console.log("ERROR:DB Save");
						cb(GAME_ERR_DB_SAVE);	
					} else {
						console.log("SUCCESSED,game removed from user at index:" + index);
						cb(GAME_ERR_SUCCESSED);
					}
				})		
			} else {
				console.log("ERROR,game doesn't exist in user");
				cb(GAME_ERR_USERHAVENOTGAME);
			}
		} 
	}) // UserModel.findById(aOwnerId,function(err,user)
}

function prepareQuestion(cb) {
	lexicon.generate(function(err,words){
		if(err) {
			console.log("ERR:Can't generate question");
			cb(GAME_ERR_LEXICONERROR,null);
		} else {
			var question = {
				words:words,
				paint:null,
				answer:null,
			};
			cb(GAME_ERR_SUCCESSED,question);
		}
	})
}

function create(aUser,cb){
	if(aUser.games.length > GAME_MAX){
		cb(GAME_ERR_TOOMANYGAMES,null,null);
	} else {
		prepareQuestion(function(err,question){
			if(err) {
				console.log("ERROR:Can't generate question!");
				cb(GAME_ERR_LEXICONERROR,null,null);
			} else {
				var newGame = new GameModel({
					state: 0,
					question:question,
					turn:1,
					owner: aUser._id
				});
				newGame.save(function(err){
					if(err){
						console.log("ERROR:DB Save");
						cb(GAME_ERR_DB_SAVE,null,null);
					} else {
						aUser.games.push(newGame._id);
						aUser.save(function(err){
							if(err){
								console.log("ERROR:DB Save");
								cb(GAME_ERR_DB_SAVE,null,null);
							} else {
								console.log("SUCCESSED:random game created, waiting for another player");
								cb(GAME_ERR_SUCCESSED,GAME_CREATE,newGame._id);
							}
						})
					}
				});
			}
		})
	}
}


function createRandomGame(aEmail,cb) {
	getObjectId(aEmail,function(err,user){
		if(err){
			console.log("ERROR:Can't get object id for email:" + email);
			cb(GAME_ERR_GETOBJECTID,null,null);
		} else {
			GameModel.findOne( { state: 0, owner: {'$ne': user._id} },function(err,res){
				if(err){
					console.log("ERROR:DB findOne");
					cb(GAME_ERR_DB,null,null);
				} else if(res){
					console.log("SUCCESSED:try join game");
					join(res,user,cb);
				} else {
					console.log("SUCCESSED:try create game");
					create(user,cb);
				}
			});		
		}
	})
}

function deleteNotStartedGame(aGameId,aOwnerId,cb) {
	GameModel.findById(aGameId,function(err,game){
		if(err){
			console.log("ERROR:DB findOne");
			cb(GAME_ERR_DB);
		} else {
			if(!game){
				console.log("ERROR:Game not found");
				cb(GAME_ERR_GAMENOTFOUND);
			} else if(game.state != 0) {
				console.log("ERROR:Game already started");
				cb(GAME_ERR_STARTED);
			} else {
				if(game.owner != aOwnerId){
					console.log("ERROR:User not owner of game");
					cb(GAME_ERR_NOTOWNER);
				} else {
					console.log("SUCCESSED:Game removed");
					game.remove();
					// delete game from users
					console.log("STEP:remove game from owner: " + aOwnerId);
					removeGameFromUser(aOwnerId,aGameId,function(err){
						console.log("SUCCESSED:game removed from user game list");
						cb(GAME_ERR_SUCCESSED);
					})	
				}
			}
		}
	})
}

function query(aGameId,cb){
	GameModel.findById(aGameId,function(err,game){
		if(err){
			console.log("ERROR:DB GameMode.findOne " + aGameId);
			cb(GAME_ERR_DB,null);
		} else if(!game){
			console.log("ERROR:game not found:");
			cb(GAME_ERR_GAMENOTFOUND,null);
		} else {
			console.log("SUCCESSED:game found:");
			cb(GAME_ERR_SUCCESSED,game);				
		}
	});
}

function queryGamesFromUser(aUserId,cb){
	UserModel.findById(aUserId,function(err,user){
		if(err){
			console.log("ERROR:DB UserModel.findById + " + aUserId);
			cb(GAME_ERR_DB,null);
		} else if(!user) {
			console.log("ERROR:DB UserModel.findById + " + aUserId);
			cb(GAME_ERR_USERNOTFOUND,null);
		} else {
			var games = new Array()
			var count = user.games.length;
			user.games.forEach(function(gid){
				GameModel.findById(gid,function(err,game){
					if(err){
						console.log("WARNNING:DB findOne");
					} else if(!game){
						console.log("WARNNING:Can't find game");
						--count;
					} else {
						var opponentId;
						if(aUserId == game.owner) {
							opponentId = game.opponent;
						} else {
							opponentId = game.owner;
						}
						
						UserModel.findById(opponentId,function(err,opponent){
							if(err || !opponent){
								console.log("WARNNING:Can't get opponent");
							} else {
								games.push({
									"opponent":opponent.email,
									"detail":game
								});
							}
							
							--count;
							if(!count){								
								console.log("SUCCESSED:" + games.length + " games found!");
								cb(GAME_ERR_SUCCESSED,games);
							}
						}) // UserModel.findById(game.opponent,function(err,opponent)
					}
				}) // GameModel.findById(id,function(err,game)
			}) 	// user.games.forEach(function(gid)	
		} // else
	}) // UserModel.findById(aUserId,function(err,user)
}


function receivePainting(aUserId,aGameId,aDiff,aOriginSize,aRecord,cb) {
	UserModel.findById(aUserId,function(err,user){
		if(err) {
			console.log("ERROR:DB Error" + err);
			cb(GAME_ERR_DB);
		} else if(!user) {
			console.log("ERROR:User not found");
			cb(GAME_ERR_USERNOTFOUND);
		} else {
			// ok! user found
			GameModel.findById(aGameId,function(err2,game){
				if(err2) {
					console.log("ERROR:DB Error" + err);
					cb(GAME_ERR_DB);
				} else if(!game) {
					console.log("ERROR:Game not found");
					cb(GAME_ERR_GAMENOTFOUND);
				} else {
					// Ok! game found
					game.state = (game.state == 1) ? 2 : 1;
					game.question.difficult = aDiff;
					// save buffer to database
					if(game.question.replayid) {
						ReplayModel.findById(game.question.replayid,function(err3,pr){
							if(err3) {
								console.log("ERROR:DB Error" + err);
								cb(GAME_ERR_DB);
							} else if(!pr) {
								console.log("ERROR:Painting record not found");
								game.question.replayid = null;
								game.save(function(err4){
									cb(GAME_ERR_REPLAYNOTFOUND);
								});	
							} else {
								pr.paintreplayoriginsize = aOriginSize;
								pr.paintreplay = aRecord;
								pr.save(function(err4){
									game.save(function(err){
										console.log("SUCCESS:Painting record updated");
										cb(GAME_ERR_SUCCESSED);
									});	// update game state
								})
							}
						}) // PaintingRecordModel.findById(game.question.paintingid,cb(err3,pr)
					} else {
						var pr = new ReplayModel({
							gameid:aGameId,
							paintreplayoriginsize:aOriginSize,
							paintreplay:aRecord
						});
						pr.save(function(err3){
							if(err3) {
								console.log("ERROR:DB Error" + err);
								cb(GAME_ERR_DB);
							} else {
								game.question.replayid = pr._id;
								game.save(function(err5){
									console.log("SUCCESS:Painting record saved");
									cb(GAME_ERR_SUCCESSED);
								});
							}
						})
					}
				}
			}) // GameModel.findById(aGameId,cb(err2,game)
		}
	})  // UserModel.findById(aUserId,cb(err,user)
}

function queryReplay(aReplayId,cb) {
	ReplayModel.findById(aReplayId,function(err,replay){
		if(err) {
			console.log("ERROR:DB Error" + err);
			cb(GAME_ERR_DB,null);
		} else if(!replay) {
			console.log("ERROR:GAME_ERR_REPLAYNOTFOUND");
			cb(GAME_ERR_REPLAYNOTFOUND,null);
		} else {
			console.log("SUCCESSED:Replay found");
			cb(GAME_ERR_SUCCESSED,replay);
		}
	})
}




exports.init = function(aAuth,aModels) {
	lexicon.init(aModels);
	auth = aAuth;
	UserModel = aModels.UserModel;
	GameModel = aModels.GameModel;
	ReplayModel = aModels.ReplayModel;
}


exports.random = function(req,res) {
	createRandomGame(req.body.email,function(err,method,gameid){
		if(err){
			res.send( { "result":false,"reason":err } );
		} else {
			res.send( { "result":true,"gameid":gameid,"method":method } );
		}
	});
}

exports.queryGame = function(req,res){
	if(!req.params.gid){
		res.send({"result":false,"reason":GAME_ERR_INVALIDPARAM});
	} else {
		query(req.params.gid,function(err,game){
			if(err){
				res.send({"result":false,"reason":err});
			} else {
				res.send({"result":true,"game":game});
			}
		})
	}
}

exports.deleteGameIfNotStarted = function(req,res) {
	if(!req.params.gid){
		res.send({"result":false,"reason":GAME_ERR_INVALIDPARAM});
	} else { 
		deleteNotStartedGame(req.params.gid,req.body.owner,function(err){
			if(err) {
				res.send({"result":false,"reason":err});
			} else {
				res.send({"result":true});
			}
		})
	}
}

exports.queryGamesFromUser = function(req,res) {
	if(!req.params.uid){
		res.send({"result":false,"reason":GAME_ERR_INVALIDPARAM});
	} else {
		queryGamesFromUser(req.params.uid,function(err,games){
			if(err){
				res.send({"result":false,"reason":err});
			} else {
				res.send({"result":true,"games":games});
			}
		})
	}
}

exports.queryReplay = function(req,res) {
	if(!req.params.rid) {
		res.send({"result":false,"reason":GAME_ERR_INVALIDPARAM});
	} else {
		queryReplay(req.params.rid,function(err,replay){
			if(err) {
				res.send({"result":false,"reason":err});
			} else {
				res.send({"result":true,"replay":replay});
			}
		})
	}
}

exports.receivePainting = function(req,res) {		
	if(!req.params.uid || !req.params.gid || !req.params.difficult) {
		res.send({"result":false, "reason":GAME_ERR_INVALIDPARAM});
	} else {
		receivePainting(req.params.uid,req.params.gid,req.params.difficult,req.body.paintingsize,req.body.painting,function(err){

			if(err) {
				res.send({"result":false,"reason":err,"gameid":req.params.gid });
			} else {
				res.send({"result":true,"gameid":req.params.gid});
			}
		})
	}
}
