goog.require("bricks3d.gameobject");

goog.provide("bricks3d.paddle");

function Paddle(scene,world){

	var scene = scene;
	var world = world;
	var speed = 0.01;
	var maxSpeed = 0.4;
	
	this.mesh = null
	
	var getGeometry = function(x, y){
		
        return mesh;
	}
	
	var getBody = function(x, y){
		
		var fixDef = new b2FixtureDef;
		fixDef.density = 11.0;
		fixDef.friction = 50;
		fixDef.linearDamping = 1005;
		fixDef.restitution = 0;

		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_dynamicBody;
		bodyPoly = new b2PolygonShape();   
		fixDef.shape = bodyPoly;
		
		var vertexArray = [];

		vertexArray.push(new b2Vec2(0.8, 0.2));

		vertexArray.push(new b2Vec2(0.7, 0.33));
		vertexArray.push(new b2Vec2(0.2, 0.35));

		vertexArray.push(new b2Vec2(-0.2, 0.35));
		vertexArray.push(new b2Vec2(-0.7, 0.33));
		
		vertexArray.push(new b2Vec2(-0.8, 0.2));
	
		bodyPoly.SetAsArray(vertexArray, vertexArray.length);

		bodyDef.position.x = x;
		bodyDef.position.y = y;
		var barbody = world.CreateBody(bodyDef);
		barbody.CreateFixture(fixDef)
		barbody.SetLinearDamping(5.9);
		
		return barbody;
	}
	
	var isRight = false;
	var isLeft = false;
	
	var getKeyDownInput = function(event) {
	    if(event.keyCode == 37 || event.keyCode == 65) {
	        isLeft = true;
	    } else if(event.keyCode == 39 || event.keyCode == 68) {
	    	isRight = true;
	    }
	}

	var getKeyUpInput = function(event) {
		if(event.keyCode == 37 || event.keyCode == 65) {
			isLeft = false;
	    } else if(event.keyCode == 39 || event.keyCode == 68) {
	    	isRight = false;
	    }
	}

	var addListeners = function(){
		document.addEventListener('keydown', getKeyDownInput);
		document.addEventListener('keyup', getKeyUpInput);	
	}

	var removeListeners = function(){
		document.removeEventListener('keydown', getKeyDownInput);
		document.removeEventListener('keyup', getKeyUpInput);
	}
	
	var getDir = function(){
		var result = 0;
		
		if(isRight) ++result;
		if(isLeft) --result;

		return result;
	}
	
	var dir;
	this.updateControls = function(){
		
		dir = getDir();
		if (dir > 0) {
			this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(2.7,0),this.body.GetWorldCenter())
			
			speed += dir/100;
			if (speed < 0) speed += dir/60;
		}
		else if (dir < 0){ 
			this.body.ApplyImpulse(new Box2D.Common.Math.b2Vec2(-2.7,0),this.body.GetWorldCenter())
			speed += dir/100;
			if (speed > 0) speed +=dir/60;
		}
	}
	
	
	this.create = function(x, y){
	
		var r = resource.getResource('models/paddle.js');
	    mesh = new THREE.Mesh( r.geometry, new THREE.MeshFaceMaterial( r.materials ));
	    		
        mesh.scale.set( 1, 1, 1 );
        mesh.rotation.x = 1.5
        mesh.position.x = x;
        mesh.position.y = y;
        scene.add( mesh );
        this.mesh = mesh;
	  
		this.body = getBody(x, y);
		this.body.userData = {
			'name' : 'paddle',
			'guiref' : this.mesh   
		};
			
		addListeners();
		
		return this.body;
	}	
		
	this.sync = function(){
		this.body.userData.guiref.position.x = this.body.GetPosition().x;
		this.body.userData.guiref.position.y = this.body.GetPosition().y;
	}
	
	this.destroy = function(){
		removeListeners();
	}
	
}

Paddle.prototype = new GameObject();
Paddle.prototype.constructor = GameObject;