//basic methods for objects
function GameObject(){

	this.body = null;
	
	this.sync = function(){
		this.body.userData.guiref.position.x = this.body.GetPosition().x;
		this.body.userData.guiref.position.y = this.body.GetPosition().y;
	}
	
	this.validate = function(){
		
	}
	
	this.destroy = function(){
		
	}
	
}