var resource = new Resources();

/**
 * this file contains all the logic to steer the game itself
 * 
 * game starts by loading all resources (images, sounds) 
 * 
 * - contains gamestate machine to control different game states
 * - creates event listeners on certain game events
 * - helper functions for animation stuff 
 */
var game = function(){

	//detects if browser supports webgl. otherwise show message
	var webgl = Detector.webgl;
	if (!webgl){
		document.getElementById('loadingContainer').innerHTML = "";
		return document.getElementById('loadingContainer').appendChild(Detector.getWebGLErrorMessage());
	}
	
	var maxLifes = 3;
	var level = 1;
	var lifes = maxLifes;
	var score = 0;
	var bonusMultiplier = 1;
	var game = new BrickGame()
	var hud = new Hud();
	var sound = new Sound();

	/**
	 * game state 
	 * use this to change game states. logic here makes sure old gamestates are getting cleaned up.
	 */
	var states = {"demo":1,"playing":2,"gameover":3,"credits":4};
	var gameState = {
		
		currentState : null,	
			
		startDemo : function(){
			gameState.currentState = states.demo;
			
			sound.playTheme();	
			
			showMainTitleScreen()
			startDemoGame(function(){
				showPressKeyToPlay();
			});
		},
		
		startGameover : function(){
			
			sound.stopLevelMusic(level);
			sound.playGameOver();
			
			gameState.clearPreviousState(function(){
				gameState.currentState = states.gameover;				
				game.togglePause();
				startGameOverScreen();
			})			
		},
		
		startGame : function(){
			gameState.clearPreviousState(function(){
				gameState.currentState = states.playing;
				startPlayerGame();
			})
		},
		
		startCredits : function(){
			
			gameState.currentState = states.credits;
			startCredits();
		},
		
		
		clearPreviousState : function(cb){
			
			if (gameState.currentState == states.demo){
				stopDemoGame(cb)
			}
			else if (gameState.currentState == states.playing){
				cb()
			}	
			else if (gameState.currentState == states.gameover){
				stopGameOverScreen(cb)
				game.togglePause();
			}
			else{
				cb();
			}
		}		
	}
	
	
	/**
	 * basic routines used by gamestate
	 * startPlayerGame
	 * stopPlayerGame
	 * startDemoGame
	 * stopDemoGame
	 * startCredits
	 * stopCredits
	 * startGameOver
	 * stopGameOver
	 */
	function startPlayerGame(){
			
		document.getElementById("gameoverTitle").style.display = 'none';
		document.getElementById("startTitle").style.opacity = 0;
		
		level = 1;
		lifes = maxLifes;
		score = 0;
		registerPlayerGameEvents();
		game.setLevel(level);

		//fade to white -> reset the game -> let the camera look and follow the paddle ->
		//pause the game -> start camera from certain position -> show blocks falling ->
		//fade to normal -> move camera to play position
		fade(0,1,function(){
			game.reset(function(){
				game.setCameraLookAtMesh(game.getPaddle().mesh);
				game.cameraFollowsPaddle(true);
				
				game.togglePause(function(){
		
					game.getCamera().setLens(25)
					game.getCamera().position.x = 0;
					game.getCamera().position.y = -7;
					game.getCamera().position.z = 2;			
					
					animateBricksFadeIn(function(){
		
						hud.drawGameStatistics(score,level,lifes);
						game.togglePause();			
					});
				
					fade(1,-1,function(){});
					game.getComposer().passes[2].copyUniforms.opacity.value = 0.7;
					game.tweenCamera(Tween.easeInOutQuad,{yTarget:-7,zTarget:6, xTarget:0});
										
				});
			});
		});
	};
	
	function stopPlayerGame(cb){
		game.resetTweenCamera(); 
		unRegisterGameEvents();
		game.cleanup(cb);	
		hud.clear();
	}
	
	function showMainTitleScreen(){
		document.getElementById("splashContainer").style.display = 'block';
		document.getElementById("startTitle").style.opacity = 0;
	}
	
	function startGameOverScreen(){
		
		//fade to white -> reset paddle to start position -> show bloom effect -> clear hud
		//-> let camera no longer follow paddle and make it look to center of game field ->
		//start animating the camera around the table -> fade to normal
		fade(0,1,function(){

			game.resetPaddle();
			var bloomdur = 100;
			var i = 0;
			function animateBloom(){
			
				if (i==bloomdur){
					//bloom is over so user can start playing again.
					//if we do this earlier we introduce potention bug where bloom animation is running 
					//when game is already started again
					showPressKeyToPlay();	
					return;
				}
					
				game.addPreRenderCb(function(){
					//t: current time, b: begInnIng value, c: change In value, d: duration
					game.getComposer().passes[2].copyUniforms.opacity.value = Tween.easeInOutQuad(i,2,-0.5,bloomdur);
					
					i++;
					
					animateBloom();
				})
			}
			animateBloom();
					
			document.getElementById("gameoverTitle").style.display = "block";
			hud.clear();
			game.setCameraLookAtMesh({'position':{'x':0,'y':-2,'z':0}});
			game.cameraFollowsPaddle(false);
			game.tweenCamera(Tween.easeOutQuad, {
				yTarget : -6,
				zTarget : 2,
				xTarget : -4,
				speed : 200
			}, function() {
			
				game.tweenCameraLens(Tween.easeInOutQuad,{
					start: 25,
					target: 19,
					speed: 300
				})
		
				function aniloop(){

					game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-5,speed:1500});
					game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:6,speed:1500});
					game.tweenCamera(Tween.easeInOutQuad,{yTarget:-5,zTarget:3, xTarget:-5,speed:1500});
					game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-5,speed:1500,},function(){
						
						aniloop();
					});
				}
			
			aniloop();
			});
			
			fade(1,-1,function(){
							
			});
		});
	}
	
	function stopGameOverScreen(cb){
		
		document.getElementById("gameoverTitle").style.display = 'none';
		document.getElementById("startTitle").style.opacity = 0;
		paddleAiActive = false;
		game.resetTweenCamera(); 
		unRegisterGameEvents();
		game.cleanup(cb);	
	}
	
	function showPressKeyToPlay(){
		//let the start title blink
		var el = document.getElementById("startTitle");
		
		var start = 1;
		var change = -1
		var dur = 20;
		var t = 0;
		
		//start animation of press key to continue title
		function blinkAnimate(){
			if (gameState.currentState != states.gameover 
				&& gameState.currentState != states.demo){
				return;
			}
			
			el.style.opacity = Tween.easeInOutQuad(t,start,change,dur);
			t++;
			
			t = t % (dur*2);
			
			setTimeout(function(){
				blinkAnimate();
			},20)
		}
		
		blinkAnimate();
		
		var listener = function(e){
			if (e.keyCode == 13){
				//startPlayerGame();
				gameState.startGame();						
				document.removeEventListener('keyup', listener, false);
			}
		}
		
		document.addEventListener('keyup', listener);	
	}
	
	function startCredits(cb){
		
		document.getElementById("gameoverTitle").style.display = 'none';
		document.getElementById("startTitle").style.opacity = 0;
		document.getElementById("splashContainer").style.display = "none";
		sound.playCredits();
		demo = true;
		level = 1;
		lifes = maxLifes;
		score = 0;
		unRegisterGameEvents();
		hud.showCredits();
		setTimeout(function(){
			hud.stopCredits();
			gameState.startDemo();
		},30000)
		document.getElementById('credits').style.display = "block";
		
		var bloomdur = 100;
		var i = 0;
		function animateBloom(){
		
		if (i==bloomdur) return;
			
		game.addPreRenderCb(function(){
			//t: current time, b: begInnIng value, c: change In value, d: duration
			game.getComposer().passes[2].copyUniforms.opacity.value = Tween.easeInOutQuad(i,1.4,-0.4,bloomdur);		
			i++;
			animateBloom();
		})
		}
		animateBloom();
		
		game.tweenCameraLens(Tween.easeInOutQuad,{
			start: 10,
			target: 25,
			speed: 200
		});
		
		game.tweenCamera(Tween.easeOutQuad, {
			yStart : -7,
			yTarget : -6,
			zStart : 4,
			zTarget : 2,
			xTarget : 4,
			speed : 200
		}, function() {
				
			game.tweenCameraLens(Tween.easeInOutQuad,{
				start: 25,
				target: 19,
				speed: 300
			})
	
			function aniloop(){
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:5,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-6,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:-5,zTarget:3, xTarget:-5,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-5,speed:1500,},function(){
					
					aniloop();
				});
			}
		
		aniloop();
		});
		
		fade(1,-1,function(){})
		game.cameraFollowsPaddle(false);
		
	}
	
	function startDemoGame(cb){
		
		//demo is just a regular game with the exception that we dont use normal game events
		//also the camera doesnt follow the paddle, but moves arround the table.
		//level 0 is used as a demo level. 
		demo = true;
		level = 0;
		lifes = maxLifes;
		score = 0;
		registerDemoGameEvents();
		
		var bloomdur = 100;
		var i = 0;
		function animateBloom(){
			if (i==bloomdur) return;
			
			game.addPreRenderCb(function(){
				game.getComposer().passes[2].copyUniforms.opacity.value = Tween.easeInOutQuad(i,1.4,-0.4,bloomdur);
				i++;
				animateBloom();
			});
		}
		animateBloom();
		
		game.setLevel(level);
		game.start();
		
		//from here we execute a bunch of camera movements which make sure the camera moves around the table
		//each tween command is executed after the previous one is fininshed
		game.setCameraLookAtMesh({'position':{'x':0,'y':-2,'z':0}});

		game.tweenCameraLens(Tween.easeInOutQuad,{
			start: 10,
			target: 25,
			speed: 200
		});
		
		game.tweenCamera(Tween.easeOutQuad, {
			yStart : -7,
			yTarget : -6,
			zStart : 4,
			zTarget : 2,
			xTarget : 4,
			speed : 200
		}, function() {
				
			game.tweenCameraLens(Tween.easeInOutQuad,{
				start: 25,
				target: 19,
				speed: 300
			})
	
			function aniloop(){
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:5,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-6,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:-5,zTarget:3, xTarget:-5,speed:1500});
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:5,zTarget:3, xTarget:-5,speed:1500,},function(){
					
					aniloop();
				});
			}
		
		aniloop();
		});
		
		fade(1,-1,function(){})
		game.cameraFollowsPaddle(false);
		
		//we reset the game and show some baloons
		game.reset(function(){
			showBaloons();
			game.togglePause(function(){
				animateBricksFadeIn(function(){
					game.togglePause();
					activatePaddleAi();	
					
					if (cb) cb()
				});
			});		
		});
	};
	
	function stopDemoGame(cb){
		
		if (gameState.currentState != states.demo) return cb();
		
		document.getElementById("splashContainer").style.display = 'none';
		demo = false;
		paddleAiActive = false;
		demo = false;
		game.resetTweenCamera(); 
		unRegisterGameEvents();
		game.resetPaddle();
		game.cleanup(cb);
		
	}
	
	
	/*
	 * ##################################
	 * GAME EVENTS
	 * ##################################
	 */
	//these events are registered when player starts a game
	function registerPlayerGameEvents(){
		
		ev.sub("game.start",function(){
			
			hud.drawGameStatistics(score,level,lifes);
		});
		
		ev.sub("game.levelObjectsCreated",function(){

			//reset paddle, ball and camera when new scene is created
			game.resetPaddle();
			//game.resetBall();
			sound.playLevelMusic(level);
			game.tweenCamera(Tween.easeInOutQuad,{yTarget:-7,zTarget:6});
		});
		
		ev.sub("game.wallCollition",function(){
			sound.playSound("music/hit2.ogg");
		});
		
		ev.sub("game.ball.created",function(ball){
		
			if (game.getBallCount() == 2){
				game.tweenCamera(Tween.easeInOutQuad,{yTarget:-7,zTarget:8});
			}
		});

		ev.sub("game.ball.dies",function(ball){
			
			if (game.getBallCount() == 1 && !lifes){
				
				return gameState.startGameover();
			}
			else if (game.getBallCount() == 1){
			
				lifes--;
				bonusMultiplier =1
				hud.drawGameStatistics(score,level,lifes);
				game.resetBall(function(){
					game.togglePause(function(){
						setTimeout(function(){
							game.togglePause();
						},1000)
					});
				});
			}
			else{
				game.addPreRenderCb(function(){
					game.destroyBall(ball);
					
					if (game.getBallCount() == 1){
						game.tweenCamera(Tween.easeInOutQuad,{yTarget:-7,zTarget:6});					
					}
				});
			}
		});
		
		//when ball hit brick
		ev.sub("game.brickHit",function(e){
		
			var bscore = 100 * bonusMultiplier;
			score += bscore;
			hud.drawGameStatistics(score,level,lifes);
			bonusMultiplier+=1;
			
			if (e.brick.userData.type.type == 'extraBalls'){
				sound.playSound("music/bonus1.ogg");
				game.addPreRenderCb(function(){
					game.createBonusBall(3,3);
					game.createBonusBall(-3,3);
				})
			}
			else if (e.brick.userData.type.type=="bigBall"){
	
				e.ball.userData.guiref.scale.x= 1;
				e.ball.userData.guiref.scale.y= 1; 
				e.ball.userData.guiref.scale.z= 1;		
			}
			else if (e.brick.userData.type.type=="superspeed"){
	
				sound.playSound("music/alarm.ogg");
				var lv = e.ball.GetLinearVelocity();
				
				var xv = lv.x * 2
				var yv = lv.y * 2
				
				if (xv < 0){
					xv= Math.max(xv,-15)
				}else{
					xv=Math.min(xv,15)
				}
				if (yv < 0){
					yv=Math.max(yv,-15)
				}else{
					yv=Math.min(yv,15)
				}
			
				e.ball.SetLinearVelocity(new b2Vec2(xv,yv))	
			}
			else if (e.brick.userData.type.type == 'ghost'){
				sound.playSound("music/bonus3.ogg");
			}
			else{
				sound.playSound("music/hit.ogg");
			}
			
			//show some fancy things when the ball hits the brick. if there is no hitcount left, we remove the brick	
			if (!brick.userData.hitCount){
				onBrickHit({
					'brick' : e.brick,
					'score' : bscore,
					'enableBrickFadeOut' : true,
				}, function(brick) {
					game.destroyBrick(brick);
				})
			}
			else{
				onBrickHit({
					'brick' : e.brick,
					'score' : bscore,
					'enableBrickFadeOut' : false,
				}, function(brick) {
					
				})			
			}
			
			//if no bricks are left we reset the game and starts the next level		
			if (!e.bricksLeft){
				
				level++;
				
				//when no more levels show credits
				if (!levels.getLevel(level)){
					sound.stopLevelMusic(level-1);
					return gameState.startCredits();
				}
				
				game.setLevel(level);
				
				game.togglePause(function(){
					
					game.setCameraLookAtMesh(null);
					game.cameraFollowsPaddle(false);
					
					zoomToBrick(e.brick,function(){

						//fade(0,1,function(){})
						game.togglePause(function(){				
							game.reset(function(){
						
								//fade(1,-1,function(){})
								game.resetPaddle();
								game.resetBall();
								
								game.setCameraLookAtMesh(game.getPaddle().mesh);
								game.cameraFollowsPaddle(true);
						
								animateBricksFadeIn(function(){						
									hud.drawGameStatistics(score,level,lifes);
									game.togglePause();
								});
							},true);	
						});
					},function(){
						
						fade(0,1,function(){
	
							fade(1,-1,function(){})
						})		
					});
				});
			}
		});
			
		//event is fired just before a brick ball collition is occuring
		ev.sub("game.brickPreHit",function(e){
	
			//create ghost ball for 3 seconds
			if (e.brick.userData.type.type == 'ghost'){
				
				e.contact.SetEnabled(false);
				e.ball.userData.isGhost = true;
				e.ball.userData.guiref.material.opacity = 0.5;
				
				
				(function(contact){
					setTimeout(function(){
						e.ball.userData.guiref.material.opacity = 1;
						e.contact.SetEnabled(true);
						e.ball.userData.isGhost = false;
					},5000)
				})(e.contact)
			}
			
			if (e.ball.userData.isGhost){
				e.contact.SetEnabled(false);
			}
		});
		
		//when ball hits paddle we reset the bonus multiplyer
		ev.sub("game.paddleHit",function(){
			
			bonusMultiplier = 1;
		});	
	}
	
	//these events are registered when demo splash screen is shown.
	//its a bit identical to the events when player plays the game with the exception that
	//there are no camera changes here. code is a bit duplicated but easier to maintain than to add
	//loads of "if" clauses inside the regular player events
	function registerDemoGameEvents(){
		
		ev.sub("game.ball.dies",function(ball){
			
			if (game.getBallCount() == 1 && !lifes){
				
				level = 0;
				score = 0;
				bonusMultiplier = 1;
				game.setLevel(level);
				
				game.reset(function(){
								
					animateBricksFadeIn(function(){
						game.togglePause();
					});
				},true);
				lifes = maxLifes
			}
			else if (game.getBallCount() == 1){
			
				lifes--;
				bonusMultiplier =1
				game.resetBall();
			}
			else{
				game.addPreRenderCb(function(){
					game.destroyBall(ball);
				});
			}
		});
		
		//when ball hit brick
		ev.sub("game.brickHit",function(e){
			
			var bscore = 100 * bonusMultiplier;
			score += bscore;
			bonusMultiplier+=1;
			
			if (e.brick.userData.type.type == 'extraBalls'){
				game.addPreRenderCb(function(){
					game.createBonusBall(3,3);
					game.createBonusBall(-3,3);
				})
			}
			else if (e.brick.userData.type.type=="bigBall"){
	
				e.ball.userData.guiref.scale.x= 1;
				e.ball.userData.guiref.scale.y= 1; 
				e.ball.userData.guiref.scale.z= 1;		
			}
			else if (e.brick.userData.type.type=="superspeed"){
	
				var lv = e.ball.GetLinearVelocity();
				
				var xv = lv.x * 2
				var yv = lv.y * 2
				
				if (xv < 0){
					xv= Math.max(xv,-15)
				}else{
					xv=Math.min(xv,15)
				}
				if (yv < 0){
					yv=Math.max(yv,-15)
				}else{
					yv=Math.min(yv,15)
				}
			
				e.ball.SetLinearVelocity(new b2Vec2(xv,yv))	
			}
			else if (e.brick.userData.type.type == 'ghost'){
				
			}
			
			//show some fancy things when the ball hits the brick. if there is no hitcount left, we remove the brick	
			if (!brick.userData.hitCount){
				onBrickHit({
					'brick' : e.brick,
					'score' : bscore,
					'enableBrickFadeOut' : true,
				}, function(brick) {
					game.destroyBrick(brick);
				})
			}
			else{
				onBrickHit({
					'brick' : e.brick,
					'score' : bscore,
					'enableBrickFadeOut' : false,
				}, function(brick) {
					
				})			
			}
			
			//if no bricks are left we reset the game and starts the next level		
			if (!e.bricksLeft){
				
				game.setLevel(level);
					
				game.togglePause(function(){				
					game.reset(function(){
						//game.togglePause(function(){
							animateBricksFadeIn(function(){						
								game.togglePause();
							});
						//});
					},true);	
				});				
			}
		});
			
		//event is fired just before a brick ball collition is occuring
		ev.sub("game.brickPreHit",function(e){
	
			//create ghost ball for 3 seconds
			if (e.brick.userData.type.type == 'ghost'){
				
				e.contact.SetEnabled(false);
				e.ball.userData.isGhost = true;
				e.ball.userData.guiref.material.opacity = 0.5;
				
				
				(function(contact){
					setTimeout(function(){
						e.ball.userData.guiref.material.opacity = 1;
						e.contact.SetEnabled(true);
						e.ball.userData.isGhost = false;
					},5000)
				})(e.contact)
			}
			
			if (e.ball.userData.isGhost){
				e.contact.SetEnabled(false);
			}
		});
		
		//when ball hits paddle we reset the bonus multiplyer
		ev.sub("game.paddleHit",function(){
			
			bonusMultiplier = 1;
		});	
	}
	
	function unRegisterGameEvents(){
		ev.unsub("game.paddleHit");
		ev.unsub("game.brickPreHit");
		ev.unsub("game.brickHit");
		ev.unsub("game.ball.dies");
		ev.unsub("game.ball.created");
		ev.unsub("game.start");
		ev.unsub("game.levelObjectsCreated");
		ev.unsub("game.wallCollition");
	}
	
	
	/**
	 * Everything starts here. we load required resources and start the game
	 */
	resource.loadResources(function(){
		game.setLevel(level);
		game.init();
		gameState.startDemo();
	})

	
	
	/**
	 * ##############################
	 * BELOW HELPER FUNCTIONS. 
	 * ##############################
	 */
	//fade screen to white and back
	var fade = function(start,change,cb){
		
		var el = document.getElementById("white");
		
		var dur = 20;
		var t = 0;
		
		//start animation of press key to continue title
		function animate(){
			
			if (t == dur){
				if(cb) cb();
				return;
			};
			
			el.style.opacity = Tween.easeInOutQuad(t,start,change,dur);
			t++;
			
			t = t % (dur*2);
			
			setTimeout(function(){
				animate();
			},20)
		}
		
		animate();	
	}
	
	/**
	 * shows score above brick. bricks slowly fades away and will be removed from scene
	 */
	var onBrickHit = function(options,cb){
		
		var brick = options.brick;
		var score = options.score;
	  	var size = 0.3;
        var height = 0.05;
        var curveSegments =4
        var font = "helvetiker";
        var weight = "bold";
        var style = "normal";
        
        var d = 30; //duration
        
        var textGeo = new THREE.TextGeometry( score, {
        	size: size,
			height: height,
			curveSegments: curveSegments,

			font: font,
			weight: weight,
			style: style,

			material: 0,
			extrudeMaterial: 1});
        textGeo.computeBoundingBox();
		textGeo.computeVertexNormals();
	
		var textMaterial = new THREE.MeshFaceMaterial( [ 
		    	                    					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading,transparent: true, opacity: 0.8 } ), // front
		    	                    					new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.SmoothShading,transparent: true, opacity: 0.8 } ) // side
		    	                    				] );
		
		textMesh1 = new THREE.Mesh( textGeo, textMaterial );

		textMesh1.position.x = brick.GetPosition().x - 0.3;
		textMesh1.position.y = brick.GetPosition().y;
		textMesh1.position.z = 0.5;
		textMesh1.rotation.x = 1.7;
        
        
		parent = new THREE.Object3D();
		parent.castShadow = true;
		parent.receiveShadow = false;
		//parent.position.y = 100;

		if (!game.getScene()) return;
		game.getScene().add( parent );
        
		parent.add( textMesh1 );
		
		//make sure that brick is not active anymore (gui objects stays)
		if (!brick.userData.hitCount){
			game.addPreRenderCb(function(){
				brick.SetActive(false);
				brick.userData.guiref.castShadow = false;
				brick.userData.guiref.material.color.setHex("0xffffff");;
			});
		}
		else{
			//TODO this is not the right place to change brick type
			brick.userData.type = levels.getLevel(level).types[brick.userData.type.onHitTransformTo];
			brick.userData.guiref.material.color.set(brick.userData.type.color);
		}
		
		(function(mesh,parent,brick){
			
			var opacityStep = 0.02
			var scaleStep = 0.02;
			
			var opacity = null;
			var tick = 0;
			 			
			function animate(){
				
				game.addPreRenderCb(function(){
					
					var opacity = Tween.easeInQuad(tick,1,-1,d);
					
					mesh.material.materials[0].opacity = opacity;
					mesh.material.materials[1].opacity = opacity;
					mesh.scale.x += scaleStep;
					mesh.scale.y += scaleStep; 
					
					if (options.enableBrickFadeOut){
						brick.userData.guiref.material.opacity = opacity;
					}
					
					game.addPostRenderCb(function(){
					
						if (tick == d){
							game.getScene().remove(parent);
							cb(brick);
						}
						else{
							animate();
						}
												
					tick++
						
					});
				})
			}
			
			animate();
					
		})(textMesh1,parent,brick);
	}
	
	//animation to fade in bricks like falling blocks
	var animateBricksFadeIn = function(cb){
		
		var bricks = game.getBricks();
		var startHeight = 4;
		var step = 0.3;
		var diffStep = 1;

		for (var i=0,len=bricks.length;i<len;i++){
			
			bricks[i].userData.guiref.position.z = 4+diffStep;
			bricks[i].userData.guiref.material.opacity = 0;
			diffStep+=0.7
		}
		
		function animate(){
			
			game.addPreRenderCb(function(){
				
				var allReady = true;
				
				for (var i=0,len=bricks.length;i<len;i++){
			
					bricks[i].userData.guiref.material.opacity = 1;
					bricks[i].userData.guiref.position.z -= step;					
					if (bricks[i].userData.guiref.position.z < 0){
						bricks[i].userData.guiref.position.z = 0;
					}
					else{
						allReady = false;
					}
				}
				
				game.addPostRenderCb(function(){
				
					if (allReady){
						cb()
					}
					else{
						animate();
					}			
				});
			})
		}
		
		animate();		
		
	}
	
	//cb = complete callback
	//cb2 = halfway callback
	var zoomToBrick = function(brick, cb, cb2) {

		var paddleX = game.getPaddle().mesh.position.x;
		var paddleZ = game.getPaddle().mesh.position.z;
		var paddleY = game.getPaddle().mesh.position.y;
	
		var brickX = brick.GetPosition().x;
		var brickZ = brick.GetPosition().z;
		var brickY = brick.GetPosition().y;
		
		var cameraX = game.getCamera().position.x;
		var cameraY = game.getCamera().position.y;
		var cameraZ = game.getCamera().position.z;
		
		// zoom the camera to the brick
		game.tweenCamera(Tween.easeInOutQuad, {
			yStart : cameraY,
			yTarget : brickY - 1,
			zStart : cameraZ,
			zTarget : 2,
			xStart : paddleX / 1.3,
			xTarget : brickX,
			speed : 20
		});
	
		game.tweenLookAtCamera(Tween.easeInOutQuad, {
			yStart : paddleY + 2,
			yTarget : brickY,
			zStart : paddleZ,
			zTarget : paddleZ,
			xStart : paddleX,
			xTarget : brickX,
			speed : 20
		}, function() {
	
			game.tweenCamera(Tween.linear, {
				yStart : brickY - 1,
				yTarget : brickY - 1,
				zStart : 2,
				zTarget : 2,
				xStart : brickX,
				xTarget : brickX,
				speed : 60
			}, function() {
	
				if (cb2) cb2();
				
				game.tweenCamera(Tween.easeInOutQuad, {
					yStart : brickY - 1,
					yTarget : cameraY,
					zStart : 2,
					zTarget : cameraZ,
					xStart : brickX,
					xTarget : 0,
					speed : 20
				});
				game.tweenLookAtCamera(Tween.easeInOutQuad, {
					yStart : brickY,
					yTarget : paddleY + 2,
					zStart : paddleZ,
					zTarget : paddleZ,
					xStart : brickX,
					xTarget : 0,
					speed : 20
				}, function() {
					if (cb)
						cb();
				})
			});
	
		});
	}
	
	var paddleAiActive = true;
	function activatePaddleAi(){
		
		paddleAiActive = true;
		
		function ai(){
			
			if (!paddleAiActive) return;
			
			var keepMoving = false;
			var left = 0;
			var right = 0;
			
			if (game.getBalls().length)
			{
				var balls = game.getBalls();
				
				var ball;
				for (var i=0; i<balls.length; i++){
					
					if (!ball){
						ball = balls[i];
					}
					
					if (ball.body.GetPosition().y > balls[i].body.GetPosition().y){
						ball = balls[i];
					}
				}
				
				var diff = ball.body.GetPosition().x - game.getPaddle().body.GetPosition().x
				
			
				var imp = 3/diff * 6;
				//console.log(diff)
				
				
				if (diff > 0.4) {
					left++;
					right = 0;
					game.getPaddle().body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(6.2,0),game.getPaddle().body.GetWorldCenter())
				}
				else if (diff < -0.4){
					right++;
					left = 0;
					game.getPaddle().body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(-6.2,0),game.getPaddle().body.GetWorldCenter())
				}
			}
						
			setTimeout(function(){
			
				if (!paddleAiActive) return;
				ai();
				
			},20)
			
		}
		
		ai();
	}

	
	/**
	 * shows flying ballons
	 */
	var showBaloons = function(){

		var planets = [];
		
		var colors = [15813933.58085355,6100182.730150754,4326982.82802921,1467844.0140721737,2028035.0978696812,11345698.050306158  ]
		
		for (var i=0; i < 50; i++){
					
			var geometry = new THREE.SphereGeometry(5, 32, 32);
			geometry.dynamic = false;
			material = new THREE.MeshPhongMaterial({
				color : colors[Math.floor(Math.random() * colors.length)],
				shininess : 66,
				opacity:0.3,
				transparent: true
			});
	
			var planet = new THREE.Mesh(geometry, material);
			planet.useQuaternion = true;
			planet.receiveShadow = true;
			planet.castShadow = true;
			planet.position.y = Math.random() * 100 * (Math.random() < 0.5 ? -1 : 1);;
			planet.position.x = Math.random() * 100 * (Math.random() < 0.5 ? -1 : 1);
			planet.position.z = Math.random() * 100 * (Math.random() < 0.5 ? -1 : 1);
			planet.position.speedz = Math.random() * .3;
			planet.position.speedx = Math.random() * .1 * (Math.random() < 0.5 ? -1 : 1);;
			planet.position.speedy = Math.random() * .1* (Math.random() < 0.5 ? -1 : 1);;
			
			planets.push(planet);
			game.getScene().add(planet);
		}
			
		function move(){
			
			if (gameState.currentState != states.demo) return;
			for (var i=0,len=planets.length;i<len;i++){
				
				planets[i].position.z +=planets[i].position.speedz;
				planets[i].position.x +=planets[i].position.speedx 
				planets[i].position.y +=planets[i].position.speedy
				
				if (planets[i].position.z > 50){
					planets[i].position.z = -50;
					planets[i].position.z = -50;
				}					
			}
			
			game.addPreRenderCb(function(){
				
				move();
			})
		}
		
		game.addPreRenderCb(function(){
			
			move();
		})	
	}
};