goog.require("bricks3d.gameobject");

goog.provide("bricks3d.ball");

function Ball(scene,world){
	
	var scene = scene;
	var world = world;
	this.maxSpeed = 5;

	var getGeometry = function(color){
		
		var geometry = new THREE.SphereGeometry(0.2, 32, 8);
		geometry.dynamic = true;
		var color = color || Math.random() * 0xffffff;
		
		material = new THREE.MeshPhongMaterial({
			color : color,
			shininess : 100
		});

		var ball = new THREE.Mesh(geometry, material);
		//ball.useQuaternion = true;
	//	ball.receiveShadow = true;
		ball.castShadow = true;
		
		return ball;
	}
	
	var getBody = function(x,y){
	
		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;

		bodyDef.position.x = x;
		bodyDef.position.y = y;

		var ballbody = world.CreateBody(bodyDef);
		return ballbody;		
	}

	this.create = function(x,y,color){
		
		var ball = getGeometry(color);
		this.mesh = ball;
		scene.add(ball);
		
		var body = getBody(x,y);
		
		body.userData = {
			'name' : 'ball',
			'guiref' : ball  
		};
				
		var fixDef = new b2FixtureDef;
		fixDef.density = 1.0;
		fixDef.friction = 0;
		fixDef.restitution = 1;
		fixDef.shape = new b2CircleShape(0.2);
		
		body.CreateFixture(fixDef)
	
		this.body = body;
		return body;
	}	
	
	this.maintainSpeed = function(){
		
		var ball = this.body;
		
		var speed = ball.GetLinearVelocity().Length()
		var maxSpeed = this.maxSpeed;

		if (speed > maxSpeed) {
			ball.SetLinearDamping(0.9);
		} else if (speed <= maxSpeed) {
			ball.SetLinearDamping(0.0);
		}
		if (speed < maxSpeed) {

			var currentVelocity = ball.GetLinearVelocity();

			currentVelocity.Set(currentVelocity.x * 1.05,
					currentVelocity.y * 1.05);

			ball.ApplyForce(currentVelocity, ball.GetWorldCenter());

			ball.SetLinearDamping(0.0);
		}
	}
	
	this.sync = function(){
		this.body.userData.guiref.position.x = this.body.GetPosition().x;
		this.body.userData.guiref.position.y = this.body.GetPosition().y;
		this.maintainSpeed();
	}
	
	var dies = false;
	this.validate = function(){
		
		if (this.body.GetPosition().y > -4.5){
			dies = false;
		}
		
		if (dies) return;
		
		if (this.body.GetPosition().y < -4.5){
			dies = true;
			
			ev.pub("game.ball.dies",this);
		}
	}
	
}

Ball.prototype = new GameObject();
Ball.prototype.constructor = GameObject;