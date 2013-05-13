goog.provide("bricks3d.resources");

/**
 * resource loader
 * 
 * resources should be defined in the resources array
 * calling loadResources(cb) will load all resources
 * to retreive a resource use getResource(key)
 */
Resources = function(){
	
	var loadedResources = {};
	var jsonloader = new THREE.JSONLoader();
	
	var resources = {
			
			"audio":['music/JAHOOR.ogg', //start
			         'music/game over.ogg',
			         'music/leveleen.ogg',
			         'music/leveldrie.ogg',
			         'music/level hakken.ogg',
			         'music/GEFORCE.ogg',
			         'music/DJCLANTM.ogg',
			         'music/russia.mp3',
			         'music/hit2.ogg',
			         'music/hit.ogg',
			         'music/bonus1.ogg',
			         'music/bonus2.ogg',
			         'music/bonus3.ogg',
			         'music/alarm.ogg',
			         'music/blow.ogg'
			         ],
			"models":['models/paddle.js'],
			"cubemaps" :[{'name':'textures/bg1.png',"maps":['textures/bg1.png','textures/bg1.png','textures/bg1.png','textures/bg1.png','textures/bg1.png','textures/bg1.png']},
			             {'name':'textures/bg2.png',"maps":['textures/bg2.png','textures/bg2.png','textures/bg2.png','textures/bg2.png','textures/bg2.png','textures/bg2.png']},
			             {'name':'textures/bg3.png',"maps":['textures/bg3.png','textures/bg3.png','textures/bg3.png','textures/bg3.png','textures/bg3.png','textures/bg3.png']},
			             {'name':'textures/bg4.png',"maps":['textures/bg4.png','textures/bg4.png','textures/bg4.png','textures/bg4.png','textures/bg4.png','textures/bg4.png']},
			             {'name':'textures/bg5.png',"maps":['textures/bg5.png','textures/bg5.png','textures/bg5.png','textures/bg5.png','textures/bg5.png','textures/bg5.png']}
			            ]
	}
	
	var totalResources = resources.audio.length + resources.models.length + resources.cubemaps.length;
	
	var loadAudio = function(url,cb) {
		
		if (!window.AudioContext || !window.webkitAudioContext){
			cb();
			return;
		}
		
		var request = new XMLHttpRequest();
		request.open('GET', url, true);
		request.responseType = 'arraybuffer';
 
		var onError;
		request.onload = function() {
			audioContext.decodeAudioData(request.response, function(buffer) {
				
				loadedResources[url] = buffer;										
				cb();


			}, onError);
		}
		request.addEventListener("progress", function(e){
			
			var percentComplete = e.loaded / e.total
			addProgress(url,e.loaded / e.total);
			
		},false);
		
		request.send();
	}
	
	var loadJSON = function(model,cb){
		 jsonloader.load(model, function( geometry, materials ) {
				
			 addProgress(model,1);
			 loadedResources[model] = {geometry:geometry, materials:materials};
			 cb();
		 });		
	}
	
	var loadCubeMap = function(name,maps,cb){
		var textureCube = THREE.ImageUtils.loadTextureCube(maps,null,function(){
			
			addProgress(name,1);
			loadedResources[name] = textureCube;
			cb();
		});
	}
	
	var totals = [];
	var addProgress = function(url,perc){
		
		totals[url] = perc;
		var t = 0;
		
		for (var i in totals){
			t += totals[i];
		}
		
		
		document.getElementById('loadingText').innerHTML ="Loading "+Math.round(t/totalResources*100)+"%"
		
		if (t == totalResources){
			document.getElementById('loadingText').innerHTML ="Please wait....";
		}
	
	}
	
	
	this.getResource = function(r){
		return loadedResources[r];
	}
	
	this.loadResources = function(cb){
	

		var loadedResources = 0;
		
		var evaluate = function(){
			loadedResources++;
			
			if (loadedResources == totalResources){
				document.getElementById('loadingContainer').style.display = 'none';
				cb();
			}
		}
		
		for (var i=0; i<resources.audio.length; i++){
			loadAudio(resources.audio[i],function(){
				
				evaluate();
			});
		}
		
		for (var i=0; i<resources.models.length; i++){
			loadJSON(resources.models[i],function(){
				
				evaluate();
			});
		}
		
		for (var i=0; i<resources.cubemaps.length; i++){
		
			loadCubeMap(resources.cubemaps[i].name,resources.cubemaps[i].maps,function(){
				
				evaluate();
			});
		}
		
	}
		
}