goog.provide("bricks3d.sound");

/**
 * a simple sound helper class in which you can play resources
 */
var Sound = function(){
	
	window.AudioContext = window.AudioContext || window.webkitAudioContext;
	
	if (AudioContext){
		var context = new AudioContext();
		window.audioContext = context;
	}
	
	var source;
	var currentMusic = null;	
	var lockedSounds = {};
	
	this.playSound = function(sound){
		
		if (lockedSounds[sound]) return;
		
		var buffer = resource.getResource(sound);
		
		if (!buffer) return;
				
		source = audioContext.createBufferSource(); // creates a sound
		source.buffer = buffer;
		source.connect(audioContext.destination); // connect the source to	
	
		source.start(0);
		
		lockedSounds[sound] = true;
		
		setTimeout(function(){
			delete lockedSounds[sound];
		},20)
	}
		
	
	var sounds = {};
	
	this.playTheme = function(){
		
		if (!context) return;
		if (sounds["theme"]) sounds["theme"].stop(0);
		if (credit) credit.stop(0);
		
		var buffer = resource.getResource("music/JAHOOR.ogg");
		if (!buffer) return;
		
		source = audioContext.createBufferSource(); // creates a sound
		source.buffer = buffer; // tell the source which sound to play
		source.connect(audioContext.destination); // connect the source to	
		source.loop = true;
		sounds["theme"] = source;
	
		source.start(0);		
	}
	
	var credit;
	this.playCredits = function(){
		
		if (!context) return;
		if (sounds["theme"]) sounds["theme"].stop(0);
		if (credit) credit.stop(0);
		
		var buffer = resource.getResource("music/JAHOOR.ogg");
		
		if (!buffer) return;
				
		source = audioContext.createBufferSource(); // creates a sound
		source.buffer = buffer; // tell the source which sound to play
		source.connect(audioContext.destination); // connect the source to	
		source.loop = true;
	
		source.start(0);
		
		credit = source;
	}
	
	var gameover;
	this.playGameOver = function(){
		
		if (!context) return;
		if (sounds["theme"]) sounds["theme"].stop(0);
		if (credit) credit.stop(0);
		
		var buffer = resource.getResource("music/game over.ogg");
		
		if (!buffer) return;
				
		source = audioContext.createBufferSource(); // creates a sound
		source.buffer = buffer; // tell the source which sound to play
		source.connect(audioContext.destination); // connect the source to	
		source.loop = true;
	
		source.start(0);	
		
		gameover = source;
	}
	
	this.stopLevelMusic = function(level){
		if (!context) return;
		if (sounds[level]) sounds[level].stop(0);
	}
	
	this.playLevelMusic = function(level){
		
		if (!context) return;		
		if (sounds[level]) sounds[level].stop(0);
		if (credit) credit.stop(0);
		if (gameover) gameover.stop(0);
		if (sounds[level-1]) sounds[level-1].stop(0); //hack to stop previous level
		if (sounds["theme"]) sounds["theme"].stop(0);
	
		var buffer = resource.getResource(levels.getLevel(level).music);
		
		if (!buffer) return;
				
		source = audioContext.createBufferSource(); // creates a sound
		source.buffer = buffer; // tell the source which sound to play
		source.connect(audioContext.destination); // connect the source to	
		source.loop = true;
		sounds[level] = source;
	
		source.start(0);			
	}
	
	
	
	
}