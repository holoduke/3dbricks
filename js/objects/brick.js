function Brick(scene,world){

	var scene = scene;
	var world = world;
	
	var getGeometry = function(x, y, xw, yw,color){
		
		//var color = Math.random() * 0xffffff;
		
		//console.log(color);
		var material = new THREE.MeshPhongMaterial({
			color : color,
			shininess : 50,
			opacity : 1,
			transparent: true
		});
		
		var geometry = new THREE.CubeGeometry(xw * 2, yw * 2, 0.5);
		var mesh = new THREE.Mesh(geometry, material);
		
		mesh.position.z = 0;
		mesh.position.x = x
		mesh.position.y = y
		mesh.receiveShadow = false;
		mesh.castShadow = true;
		mesh.matrixAutoUpdate = true;
		scene.add(mesh);
		
		return mesh;
	}
	
	var getBody = function(x, y, xw, yw){
		
		var fixDef = new b2FixtureDef;
		fixDef.density = 11.0;

		fixDef.restitution = 0;

		var bodyDef = new b2BodyDef;
		bodyDef.type = b2Body.b2_staticBody;

		fixDef.shape = new b2PolygonShape();
		fixDef.shape.SetAsBox(xw, yw)
		bodyDef.position.x = x;
		bodyDef.position.y = y;

		var barbody = world.CreateBody(bodyDef);
		barbody.CreateFixture(fixDef)
		barbody.SetLinearDamping(5.9);	
		
		return barbody
	}
	
	this.create = function(x, y, xw, yw,type){
		
		var brick = getGeometry(x, y, xw, yw,type.color);
		scene.add(brick);
		
		var body = getBody(x, y, xw, yw);
		body.userData = {
			'name' : 'brick',
			'guiref' : brick,
			'type' : type,
			'hitCount' : type.hitCount || 1,
		};
				
		return body;
	}	
		
	this.sync = function(){
		this.body.userData.guiref.position.x = this.body.GetPosition().x;
		this.body.userData.guiref.position.y = this.body.GetPosition().y;
	}
	
}

Brick.prototype = new GameObject();
Brick.prototype.constructor = GameObject;