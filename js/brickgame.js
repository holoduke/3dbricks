goog.provide("bricks3d.brickgame");

function BrickGame() {

	var gameSize = {
		x : 1000,
		y : 600
	};
	
	var level;
	var camera, scene, renderer, composer;
	var geometry, material, mesh;
	var syncedObjects = [];
	var paused = false;

	var paddle;
	var balls = [];
	var bricks = [];
	var paddlePosX = 0;
	var paddlePosY = -4;
	var levelTargetPoints = 0;
	var that = this;
	var cameraLookAtMesh;
	
	b2Vec2 = Box2D.Common.Math.b2Vec2, 
	b2AABB = Box2D.Collision.b2AABB, 
	b2BodyDef = Box2D.Dynamics.b2BodyDef, 
	b2Body = Box2D.Dynamics.b2Body, 
	b2FixtureDef = Box2D.Dynamics.b2FixtureDef, 
	b2Fixture = Box2D.Dynamics.b2Fixture, 
	b2World = Box2D.Dynamics.b2World, 
	b2PolygonDef = Box2D.Dynamics.b2PolygonDef, 
	b2MassData = Box2D.Collision.Shapes.b2MassData, 
	b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape, 
	b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
	b2DebugDraw = Box2D.Dynamics.b2DebugDraw, 
	b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef, 
	b2PrismaticJointDef = Box2D.Dynamics.Joints.b2PrismaticJointDef;
	
	var cameraXFollowsPaddle = false;
	var cameraAutoLookAt = true;
	/**
	 * initializes render /physics engine. sets up the camera
	 */
	this.init = function(){
		setupWorld();
	}
	
	/**
	 * starts the game by creating required objects and start of animation loop
	 */
	this.start = function(){
		
		setupObjects();
		setupLighting();
		
		if (!animating){
			animate();
		}
		
		ev.pub("game.start");
	}
		
	/**
	 * resets the game. bricks will be restored, ball placed to original start position
	 */
	this.reset = function(cb,pause){
				
		this.addPreRenderCb(function(){
			
			if (balls.length >= 0){
				for (var i=balls.length-1; i >= 0; i--){
					that.destroyBall(balls[i]);
				}
			}
			if (pause) paused = true;
			cleanup();
			that.start();
			if (cb) cb();
		});
	}
	
	this.cleanup = function(cb){
		this.addPostRenderCb(function(){
			
			if (balls.length >= 0){
				for (var i=balls.length-1; i >= 0; i--){
					that.destroyBall(balls[i]);
				}
			}
			
			cleanup();			
			if (cb) cb();
		});
		
		
	}
	
	/**
	 * toggle pause game. 
	 */
	this.togglePause = function(cb){
		
		this.addPreRenderCb(function(){
			paused = !paused;
			if (paused){
				if(cb) cb();
			}
			else{
				that.addPostRenderCb(function(){
					if (cb)cb();
				});
			}
		});
	} 
	
	/**
	 * resets ball to start position
	 */
	this.resetBall = function(cb){

		this.addPreRenderCb(function(){
			
			var ballBody = balls[0].body;
			ballBody.SetLinearVelocity(new Box2D.Common.Math.b2Vec2(0,0));
			
			if (paddle){
				ballBody.SetPosition(new Box2D.Common.Math.b2Vec2(paddle.body.GetPosition().x,-3.5));
			}
			else{
				ballBody.SetPosition(new Box2D.Common.Math.b2Vec2(paddlePosX,-3.5));
			}
			
			var direction = paddle.body.GetPosition().Copy()
			direction.Subtract(new Box2D.Common.Math.b2Vec2(0,0))
			direction.Normalize();
			direction.Multiply(-1);
			
			ballBody.ApplyImpulse(direction, ballBody.GetWorldCenter());
			
			if (cb){
				that.addPostRenderCb(function(){
					cb();
				});
			}
			
			return true;
		});
	}
	
	this.resetPaddle = function(){
		paddlePosX = 0;
		paddlePosY = -4;
		paddle.body.SetPosition(new Box2D.Common.Math.b2Vec2(0,-4));
	}
	
	this.createBonusBall = function(x,y){
		var ball = createBall(x,y,8485631.716873156)
		ball.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2((Math.random() < 0.5 ? -1 : 1) * Math.random(),(Math.random() < 0.5 ? -1 : 1) * Math.random()), ball.body.GetWorldCenter())
	}
	
	this.destroyBall = function(ball){
		scene.remove(ball.body.userData.guiref);
		scene.box2dworld.DestroyBody(ball.body);
		balls.splice(balls.indexOf(ball),1);
		syncedObjects.splice(syncedObjects.indexOf(ball),1);
	}
	
	this.getBallCount = function(){
		return balls.length;
	}
	
	this.getBalls = function(){
		return balls;
	}
	
	this.destroyBrick = function(brick){
		destroySchedule.push(brick);
	}
	
	this.getBricks = function(){
		return bricks;
	}
	
	this.getPaddle = function(){
		return paddle;
	}
	
	this.getCamera = function(){
		return camera;
	}
	
	this.setCameraLookAtMesh = function(mesh){
		cameraLookAtMesh = mesh;
	}
	
	this.cameraFollowsPaddle = function(bool){
		cameraXFollowsPaddle = bool;
	}
	
	this.setCameraAutoLookAt = function(bool){
		cameraAutoLookAt = bool;
	}
	
	this.setLevel = function(lvl){
		
		level = lvl;
	}
	
	this.getComposer = function(){
		return composer;
	}
	

	var tweenSchedule = [];
	var tweenLookAtSchedule = [];
	var tweenLensSchedule = [];
	
	/**
	 * schedules camera tweens.
	 * 
	 * use tween types for various movement algorithms
	 * 
	 * examples
	 * 
	 * move camera to
	 * game.tweenCamera("easeinout",{yTarget:-7,zTarget:6});
	 * 
	 * move camera with
	 * gamee.tweenCamera("easeinout",{y:-7,z:6}, function(){//done});
	 * 
	 * move camera from to
	 * gamee.tweenCamera("easeinout",{yStart:0,zStart:0,y=12,z=10}, function(){//done});
	 * 
	 */
	this.tweenCamera = function(type,coords,cb){
		tweenSchedule.push({'type':type,'coords':coords,'cb':cb});
	}
	
	this.tweenLookAtCamera = function(type,coords,cb){
		tweenLookAtSchedule.push({'type':type,'coords':coords,'cb':cb});
	}
	
	this.tweenCameraLens = function(type,coords,cb){
		tweenLensSchedule.push({'type':type,'coords':coords,'cb':cb});
	}
	
	/**
	 * resets all scheduled tween camera actions
	 */
	this.resetTweenCamera = function(){
		tweenSchedule = [];
		tweenLookAtSchedule = [];
		tweenLensSchedule = [];
	}
		
	/**
	 * this method is called every tick
	 * used to move camera with tween algorithm.
	 * to schedule a camera movement use .tweenCamera
	 */
	var tween;
	moveCameraSchedule = function(){
		
		if (tweenSchedule && tweenSchedule.length){
		
			tween = tweenSchedule[0];
			
			if (!tween.coords.yit){
				tween.coords.yit = 0;
				
				if (tween.coords.yStart == null){
					tween.coords.yStart = camera.position.y;
				}
				if (tween.coords.zStart == null){
					tween.coords.zStart = camera.position.z;
				}
				if (tween.coords.xStart == null){
					tween.coords.xStart = camera.position.x;
				}
				
				if (tween.coords.yTarget == null){
					tween.coords.yTarget = camera.position.y;
				}
				if (tween.coords.zTarget == null){
					tween.coords.zTarget = camera.position.z;
				}
				if (tween.coords.xTarget == null){
					tween.coords.xTarget = camera.position.x;
				}
				
				if (tween.coords.y == null){
					tween.coords.y = 0;
				}
				if (tween.coords.z == null){
					tween.coords.z = 0
				}
				if (tween.coords.x == null){
					tween.coords.x= 0
				}
				
				if (tween.coords.yTarget!==null){
					tween.coords.y = tween.coords.yTarget - tween.coords.yStart;
				} 
				if (tween.coords.zTarget!==null){
					tween.coords.z = tween.coords.zTarget - tween.coords.zStart;
				}
				if (tween.coords.xTarget !==null){
					tween.coords.x = tween.coords.xTarget - tween.coords.xStart;
				}
				
				if (!tween.coords.speed){
					tween.coords.speed = 50
				}
				
				
			}
	
			camera.position.y = tween.type(tween.coords.yit,tween.coords.yStart,tween.coords.y,tween.coords.speed);
			camera.position.z = tween.type(tween.coords.yit,tween.coords.zStart,tween.coords.z,tween.coords.speed);
			camera.position.x = tween.type(tween.coords.yit,tween.coords.xStart,tween.coords.x,tween.coords.speed);
		
			if (tween.coords.yit == tween.coords.speed){
				
				tweenSchedule.splice(0,1);
				tween.cb && tween.cb();
			}
			
			tween.coords.yit++;
		}
		
		if (tweenLookAtSchedule && tweenLookAtSchedule.length){
			
			tween = tweenLookAtSchedule[0];
			
			if (!tween.coords.yit){
				tween.coords.yit = 0;
				
				if (tween.coords.yStart == null){
					tween.coords.yStart = 0
				}
				if (!tween.coords.zStart == null){
					tween.coords.zStart = 0
				}
				if (!tween.coords.xStart == null){
					tween.coords.xStart = 0
				}
				
				if (tween.coords.y == null){
					tween.coords.y = 0;
				}
				if (tween.coords.z == null){
					tween.coords.z = 0
				}
				if (tween.coords.x == null){
					tween.coords.x= 0
				}
				
				if (tween.coords.yTarget!==null){
					tween.coords.y = tween.coords.yTarget - tween.coords.yStart;
				} 
				if (tween.coords.zTarget!==null){
					tween.coords.z = tween.coords.zTarget - tween.coords.zStart;
				}
				if (tween.coords.xTarget !==null){
					tween.coords.x = tween.coords.xTarget - tween.coords.xStart;
				}	
				
				if (!tween.coords.speed){
					tween.coords.speed = 50
				}
			}
						
			camera.lookAt({
			y: tween.type(tween.coords.yit,tween.coords.yStart,tween.coords.y,tween.coords.speed),
			z: tween.type(tween.coords.yit,tween.coords.zStart,tween.coords.z,tween.coords.speed),
			x: tween.type(tween.coords.yit,tween.coords.xStart,tween.coords.x,tween.coords.speed)
			});
			
			if (tween.coords.yit == tween.coords.speed){
				
				tweenLookAtSchedule.splice(0,1);
				tween.cb && tween.cb();
			}
			
			tween.coords.yit++;
		}
		

		if (tweenLensSchedule && tweenLensSchedule.length){
			
			tween = tweenLensSchedule[0];
			
			if (!tween.coords.yit){
				tween.coords.yit = 0;
				
				if (tween.coords.start == null){
					tween.coords.start = 0
				}
				if (tween.coords.target == null){
					tween.coords.target = 0;
				}
				if (tween.coords.change == null){
					tween.coords.change = tween.coords.target - tween.coords.start;
				}		
				if (!tween.coords.speed){
					tween.coords.speed = 50
				}
			}
						
			camera.setLens(tween.type(tween.coords.yit,tween.coords.start,tween.coords.change,tween.coords.speed));
	
			if (tween.coords.yit == tween.coords.speed){
				
				tweenLensSchedule.splice(0,1);
				tween.cb && tween.cb();
			}
			
			tween.coords.yit++;
		}
	}
	
	/**
	 * returns THREE scene
	 */
	this.getScene = function(){
		return scene;
	}
	
	var bloomPass;
	var setupWorld = function() {

		//setup camera
		camera = new THREE.PerspectiveCamera(50, gameSize.x / gameSize.y, 1,1000);
		camera.position.z = 1;
		camera.position.x = 0;
		camera.position.y = -10;
		camera.up = {x:0,y:0,z:1}
		camera.eulerOrder = "XZY" //i started a bit wrong with having z as the height axis :)
		camera.lookAt({
			'x' : 0,
			'y' : 4,
			'z' : -4
		});
		
		scene = new THREE.Scene();
//		scene.fog = new THREE.Fog( 0x59472b, 0.1, 20 );

		//create box2d physics world
		var world = new b2World(new b2Vec2(0, -1) // gravity
		, true // allow sleep
		);

		//attach box2d world to the three js scene for reference
		scene.box2dworld = world;

		//assign contact listener for all colitions
		var contactListener = new Box2D.Dynamics.b2ContactListener;
		contactListener.BeginContact = beginContactListener;
		contactListener.PreSolve = preSolveContactListener;	
		world.SetContactListener(contactListener);

		//setup renderer
		renderer = new THREE.WebGLRenderer();
		renderer.autoClear = false;
		renderer.sortObjects = true;	
		renderer.shadowMapEnabled = true;
		//renderer.gammaInput = true;
		renderer.physicallyBasedShading = true;
		//renderer.autoClear = false;
		renderer.shadowMapDarkness = 0.5;
		renderer.shadowMapWidth = 1024;
		renderer.shadowMapHeight = 1024;
		renderer.setClearColor( 0xFFFFFF, 0.0 );
		renderer.setSize(gameSize.x, gameSize.y);

		document.getElementById('3dcanvas').appendChild(renderer.domElement);
		
		// postprocessing
		var renderModel = new THREE.RenderPass( scene, camera );
		renderModel.clearColor= 0x111111 //c = Math.random() * 0xffffff;
		renderModel.clearAlpha = 0;
		//renderModel.renderToScreen = true
	
		var effectFilm = new THREE.FilmPass( 0.01, 0.1, 448, false );
		effectFilm.renderToScreen = true;
		
		effectFocus = new THREE.ShaderPass( THREE.FocusShader );
		effectFocus.uniforms[ "screenWidth" ].value = gameSize.x;
		effectFocus.uniforms[ "screenHeight" ].value = gameSize.y;
		//effectFocus.renderToScreen = true;

		effectFXAA = new THREE.ShaderPass( THREE.FXAAShader );
		effectFXAA.uniforms[ "resolution" ].value =new THREE.Vector2( 1 / 1000, 1 / 600) 
		//effectFXAA.renderToScreen = true;
		///effectFXAA.uniforms[ "resolution" ].type = "v5";
		
		var effectBloom = new THREE.BloomPass(1.5 );
		//effectBloom.renderToScreen = true;
		
		depthTarget = new THREE.WebGLRenderTarget( 1000, 600, { minFilter: THREE.LinearFilter, magFilter: THREE.LinearFilter, format: THREE.RGBAFormat } );
		var effect = new THREE.ShaderPass( THREE.SSAOShader );
		effect.uniforms[ 'tDepth' ].value = depthTarget;
		effect.uniforms[ 'size' ].value.set( 1000, 600 );
		effect.uniforms[ 'cameraNear' ].value = camera.near;
		effect.uniforms[ 'cameraFar' ].value = camera.far;
		//effect.renderToScreen = true;
		
		var copyPass = new THREE.ShaderPass( THREE.CopyShader );
		copyPass.renderToScreen = true;
		
		composer = new THREE.EffectComposer( renderer );
		composer.setSize(1000,600);
		window.co = composer
		
		//composer.setSize(1000, 600);
		composer.addPass( renderModel );
		composer.addPass( effectFXAA );
		composer.addPass( effectBloom );

		//composer.addPass(effect);
		//composer.addPass( effectBloom );
		//composer.addPass( renderModel );
		composer.addPass( copyPass );
		//composer.addPass( effectFilm );
		//composer.addPass( effectFocus );

		bloomPass = effectBloom;
	}
	

	function setupLighting(){
		//setup lighting
		var ambient = new THREE.AmbientLight(0x101010);
		scene.add(ambient);

		pointLight = new THREE.PointLight(0xffaa00);
		scene.add(pointLight);
		pointLight.intensity = 0.5
		pointLight.position.x = 1;
		pointLight.position.y = -8;
		pointLight.position.z = 13;
		pointLight.intensity = 1; 
		pointLight.position.x = -400
		
		var light = new THREE.SpotLight( 0xffffff, 1, 0, Math.PI, 1 );
		light.position.set( 0, 2, 5 );
		light.target.position.set( 0, 0, 0 );
		window.lo = pointLight;
		light.castShadow = true;

		light.shadowCameraNear = 1;
		light.shadowCameraFar = 10
		light.shadowCameraFov = 100;
		//light.shadowCameraVisible = true;
		scene.add( light );
	}
	
	function createBall(x,y,color) {
		var ball = new Ball(scene,scene.box2dworld);
		ball.create(x,y,color);
		balls.push(ball);
		syncedObjects.push(ball);
		
		ev.pub('game.ball.created',ball);
		
		return ball;
	}
	
	/**
	 * creates objects for the level
	 * 
	 * -cubmap
	 * -paddle
	 * -ball
	 * -bricks
	 * -walls
	 */
	function setupObjects() {

		//create cube map
		var shader = THREE.ShaderLib[ "cube" ];
		shader.uniforms[ "tCube" ].value = resource.getResource(levels.getLevel(level).background || 'textures/bg1.png');
		var material = new THREE.ShaderMaterial( {

			fragmentShader: shader.fragmentShader,
			vertexShader: shader.vertexShader,
			uniforms: shader.uniforms,
			depthWrite: false,
			side: THREE.BackSide

		}),
		mesh = new THREE.Mesh( new THREE.CubeGeometry( 600, 600, 600 ), material );
		mesh.flipSided = false;
		scene.add( mesh );
			
		//create controlable paddle
		paddle = new Paddle(scene,scene.box2dworld);
		window.p = paddle;
		window.c = camera;
		var paddleBody =paddle.create(paddlePosX,paddlePosY);
		syncedObjects.push(paddle);
		
		//create ball
		var ball = createBall(paddlePosX,-3.2,12256377.722587917);
		var ballBody = ball.body;
		
		var direction = paddleBody.GetPosition().Copy()
		direction.Subtract(new Box2D.Common.Math.b2Vec2(0,0))
		direction.Normalize();
		direction.Multiply(-1);
		
		ballBody.ApplyImpulse(new Box2D.Common.Math.b2Vec2(-0.2,-0.05),ballBody.GetWorldCenter())
		ballBody.ApplyImpulse(direction, ballBody.GetWorldCenter())
		syncedObjects.push(ball);
		
		var brickLoc = null;
		var x = null;
		var y = null;
		var count = 0;

		var lvl = levels.getLevel(level);
		
		//TODO make bricks array dynamic adjustable
		bricks = [];
		
		for (var i=0,len=lvl.layout.length;i < len;i++){
				
			x = lvl.firstBrickPosition.x
			
			for (var j=0,jlen=lvl.layout[i].length; j < jlen; j++){
		
				if (lvl.layout[i][j] != 0){
				
				if (y === null){
					y = lvl.firstBrickPosition.y
				}
				var brick = new Brick(scene,scene.box2dworld);
				
				
				bricks.push(brick.create(x, y, 
							lvl.brickSize.x, 
							lvl.brickSize.y,
							lvl.types[lvl.layout[i][j]]
				));
				
				count += lvl.types[lvl.layout[i][j]].hitCount || 1;
				
				}
				x+=lvl.brickSpace.x;		
			}
			
			y-=lvl.brickSpace.y;			
		}
		
		levelTargetPoints = count;	
		
		//create square bounderies
		var groundBodyDef = new b2BodyDef;
		groundBodyDef.type = b2Body.b2_staticBody;
		groundBodyDef.position.Set(0, 0);
		var _groundBody = scene.box2dworld.CreateBody(groundBodyDef);
		_groundBody.userData = {'name':'wall'};

		var groundBox = new b2PolygonShape();
		var groundBoxDef = new b2FixtureDef;
		groundBoxDef.shape = groundBox;

		groundBox.SetAsEdge(new b2Vec2(5, 5), new b2Vec2(-5, 5));
		var bottomFixture = _groundBody.CreateFixture(groundBoxDef);
		bottomFixture.userData = "top";
		
		groundBox.SetAsEdge(new b2Vec2(-5, 5), new b2Vec2(-5, -5));
		var left = _groundBody.CreateFixture(groundBoxDef);
		left.userData = "left";
		
		groundBox.SetAsEdge(new b2Vec2(-5, -5), new b2Vec2(5, -5));
		var top = _groundBody.CreateFixture(groundBoxDef);
		
		groundBox.SetAsEdge(new b2Vec2(5, -5), new b2Vec2(5, 5));
		var right = _groundBody.CreateFixture(groundBoxDef);
		right.userData = "right";
		
		
		///create joint to keep paddle fixed to x axis
		var worldAxis = new b2Vec2(1.0, 0.0);

		var prismaticJointDef = new b2PrismaticJointDef();
		prismaticJointDef.Initialize(paddleBody, _groundBody, paddleBody
				.GetWorldCenter(), worldAxis);
			
		prismaticJointDef.lowerTranslation = -4.0 + paddlePosX;
		prismaticJointDef.upperTranslation = 4.0 + paddlePosX;
		prismaticJointDef.enableLimit = true;
		prismaticJointDef.maxMotorForce = 1.0;
		prismaticJointDef.motorSpeed = 0.0;
		prismaticJointDef.enableMotor = true;

		scene.box2dworld.CreateJoint(prismaticJointDef);
			
		var geometry = new THREE.PlaneGeometry( 10, 10 );
		var color = Math.random() * 0xffffff;
		var planeMaterial = new THREE.MeshPhongMaterial( { color:  levels.getLevel(level).planeColor || 208966.07738840044,opacity: 0.8,transparent: true } );
		var ground = new THREE.Mesh( geometry, planeMaterial );

		ground.position.set( 0, 0, -0.20 );

		ground.castShadow = false;
		ground.receiveShadow = true;

		scene.add( ground );	
		
		ev.pub("game.levelObjectsCreated");
	}

	/**
	 * removes all physical and graphical bodies from world.
	 */	
	function cleanup() {

		///remove all gui objects
		for ( var i = scene.children.length - 1; i >= 0; i--) {
			scene.remove(scene.children[i]);
		}
		
		//remove all physics objects
		var body;
		while (body = scene.box2dworld.GetBodyList().GetNext()){
			scene.box2dworld.DestroyBody(body);
		}
		
		syncedObjects = [];
	}

	var fa;
	var fb;
	var bA;
	var bB;
	var contactBallBody;
	var contactBrick;
	/**
	 * called by box2d when colition occurs
	 */
	function beginContactListener(contact, manifold) {
		// do some stuff
		fa = contact.GetFixtureA();
		fb = contact.GetFixtureB();

		bA = fa.GetBody();
		bB = fb.GetBody();

		if (bA.userData && bA.userData.name == 'ball' &&
			bB.userData && bB.userData.name == 'brick') {
			
			contactBallBody = bA;
			brick = bB;
		}
		else if (bB.userData && bB.userData.name == 'ball' &&
				 bA.userData && bA.userData.name == 'brick') {
			contactBallBody = bB;
			brick = bA;
		}		
		else if (bA.userData && bA.userData.name == 'paddle' || bB.userData && bB.userData.name == 'paddle') {
			
			var ball = null;
			if (bA.userData && bA.userData.name == 'ball'){
				ball = bA
			}
			else if (bB.userData && bB.userData.name == 'ball'){
				ball = bB;
			}
			
			//bounce ratio between y and x should not be lower than 1
			//in other words, the minimum angle should be 45 degrees
			if (ball){
				var lv = ball.GetLinearVelocity();
				
				var xv = Math.abs(lv.x)
				var yv = Math.abs(lv.y)
				var newY = 1;
			
				if (yv/xv < 1){
					newY = xv;
					
					if (lv.y >= 0){
						ball.SetLinearVelocity(new b2Vec2(lv.x,newY))
					}
					else if (lv.y <= 0){
						ball.SetLinearVelocity(new b2Vec2(lv.x,-newY))
					}
				}
				
				if (Math.abs(newY) < 3){
					//ball.SetLinearVelocity(new b2Vec2(lv.x,4))
				}
			}
			
			ev.pub("game.paddleHit",paddle);
		}

		// if we have ball brick colition we schedule the brick to be removed in next animate
		if (contactBallBody && brick && brick.userData.hitCount) {

			brick.userData.hitCount -= 1;
			
			levelTargetPoints--
			ev.pub("game.brickHit",{'bricksLeft':levelTargetPoints,'brick':brick,'ball':contactBallBody});
		}
		else{
			ev.pub("game.wallCollition");
		}
	}
	
	/**
	 * this method is called just before a collition
	 * We can use this space to cancel collition responses.
	 * Be aware that due ccd this method can be called multiple timer prior to the actual
	 * collition
	 */
	var preSolveContactListener = function(contact, manifold) {
		
		// do some stuff
		fa = contact.GetFixtureA();
		fb = contact.GetFixtureB();

		bA = fa.GetBody();
		bB = fb.GetBody();

		contactBallBody = null;
		brick = null;
	
		if (bA.userData && bA.userData.name == 'ball' &&
			bB.userData && bB.userData.name == 'brick') {
			
			contactBallBody = bA;
			brick = bB;
		}
		else if (bB.userData && bB.userData.name == 'ball' &&
				 bA.userData && bA.userData.name == 'brick') {
			contactBallBody = bB;
			brick = bA;
		}
		
		if (contactBallBody && brick){
			
			ev.pub("game.brickPreHit",{'contact':contact,'bricksLeft':levelTargetPoints,'brick':brick,'ball':contactBallBody});
		}
	}
	
	/**
	 * destroy scheduled bricks. is executed every tick
	 */
	var destroySchedule = [];
	function destroyScheduledBricks() {
		if (destroySchedule.length) {

			for ( var i = 0; i < destroySchedule.length; i++) {
				scene.box2dworld.DestroyBody(destroySchedule[i]);			
				scene.remove(destroySchedule[i].userData.guiref);
			}

			destroySchedule = [];
		}
	}
	
	/**
	 * use this to execute a function before render
	 */
	var addPreRenderCb =[];
	this.addPreRenderCb = function(cb){
		addPreRenderCb.push(cb)
	}
	
	/**
	 * use this to execute a function after render
	 */
	var addPostRenderCb =[];
	this.addPostRenderCb = function(cb){
		addPostRenderCb.push(cb)
	}
	
	
	/**
	 * this method is called before every render step. scheduled prerender callbacks are executed here
	 * note that we dont remove the cb inside the loop. this to prevent situation where a callback is 
	 * created inside another callback. this will mess up the array size and iteration
	 */
	var executePreRenderIterator;
	function executePrerenderCb(){
		for (executePreRenderIterator=0,len=addPreRenderCb.length;executePreRenderIterator<len;executePreRenderIterator++){
			addPreRenderCb[executePreRenderIterator].dirty = true;
			addPreRenderCb[executePreRenderIterator]();
		}

		for (executePreRenderIterator=addPreRenderCb.length-1;executePreRenderIterator >=0;executePreRenderIterator--){
			
			if (addPreRenderCb[executePreRenderIterator].dirty){
				addPreRenderCb.splice(executePreRenderIterator,1);
			}
		}
	}
	
	/**
	 * this method is called after every render step. scheduled postrender callbacks are executed here
	 * note that we dont remove the cb inside the loop. this to prevent situation where a callback is 
	 * created inside another callback. this will mess up the array size and iteration
	 */
	var executePostRenderIterator;
	function executePostrenderCb(){
		for (var executePostRenderIterator=0,len=addPostRenderCb.length;executePostRenderIterator<len;executePostRenderIterator++){
			addPostRenderCb[executePostRenderIterator].dirty = true;
			addPostRenderCb[executePostRenderIterator]();
		}
		
		for (var executePostRenderIterator=addPostRenderCb.length-1;executePostRenderIterator >=0;executePostRenderIterator--){
			
			if (addPostRenderCb[executePostRenderIterator].dirty){
				addPostRenderCb.splice(executePostRenderIterator,1);
			}
		}
	}

	/**
	 * updates gui objects with physics objects. 
	 * we run this method every render tick
	 */
	var syncWorldObjectsIterator;
	function syncWorldObjects(){
		for (syncWorldObjectsIterator=0; syncWorldObjectsIterator <syncedObjects.length;syncWorldObjectsIterator++){
			syncedObjects[syncWorldObjectsIterator].sync();		
			//generic method. used for detecting game events
			syncedObjects[syncWorldObjectsIterator].validate();
		}		
	}
	
	var animating = false;
	function animate() {

		animating = true;
		executePrerenderCb();
		
		//remove bricks beeing hit
		destroyScheduledBricks();
			
		//update gui with physics objects
		syncWorldObjects();
			
		//if the game is paused we dont update phyiscs
		if (!paused){
			
			//update paddle controls
			paddle.updateControls();
			paddlePosX = paddle.body.GetPosition().x
			paddlePosY = paddle.body.GetPosition().y
					
			//step physics
			t = new Date();
			scene.box2dworld.Step(1 / 60, 10, 10);
			scene.box2dworld.ClearForces();
			t2 = new Date()-t;
		}
	
		if (cameraLookAtMesh){
		camera.lookAt({
			'x' : cameraLookAtMesh.position.x,
			'y' : cameraLookAtMesh.position.y+2,
			'z' : cameraLookAtMesh.position.z
		});
		}

		moveCameraSchedule()
		
		//camera z rotation is always 0. otherwise weird movement behaviour
		camera.rotation.z = 0;

		if (cameraXFollowsPaddle){
			camera.position.x = paddle.mesh.position.x / 1.3;
		}
			
		scene.box2dworld.SetGravity(new b2Vec2(((0 - paddle.mesh.position.x) / 6), -0.7));

		renderer.clear(false,true,false);
		
		composer.render( 0.01 );
		
		executePostrenderCb();
		
		requestAnimationFrame(animate);
	}
}