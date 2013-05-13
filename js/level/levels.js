goog.provide("bricks3d.levels");


//var level1 = 
//{
//		type:"brick",
//		gameSize : {x:5,y:5},
//		brickSize : {x:.49,y:.25,z:.25},
//		brickSpace : {x:.1,y:.1},
//		layout: 
//		[
//		[ 0, 0, 0, 0 ,0, 0, 0 ],
//		  [ 0, 0, 1, 1 ,0, 0 ],
//		[ 0, 0, 1, 1 ,1, 0, 0 ],
//		  [ 0, 1, 1, 1 ,1, 0 ],
//		[ 0, 1, 1, 1 ,1, 1, 0 ],
//		  [ 1, 1, 1, 1 ,1, 1,],
//		[ 1, 1, 1, 1 ,1, 1, 1 ]
//		]
//}


levels = (function(){

	var levels = [];
	levels.push( ///level 0 for demo	
			{
					type:"align",
					background:"textures/bg1.png",
					gameSize : {x:5,y:5},
					music:"music/leveleen.ogg",
					firstBrickPosition : {x:-3,y:2.4},
					brickSize : {x:.47,y:.22,z:.22},
					brickSpace : {x:1.0, y:0.52},
					types : {1:{'color':11808294.026639538,'type':'normal'}, 
							 2:{'color':6356160.3086433,'type':'extraBalls'},
							 5:{'color':15346160.1086433,'type':'superspeed'},
							 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
							 6:{'color':19346160.1086433,'type':'ghost'},
							 7:{'color':934446.7959924,'type':'normal','hitCount':3,"onHitTransformTo":4},
							 9:{'color':4234.234342,'type':'bigBall'}
					
					},
					layout: 
					[
					[ 1, 9, 1, 2 ,1, 9, 1 ],
					[ 1, 1, 1, 1 ,1, 1, 1 ],
					[ 7, 1, 4, 2 ,4, 1, 7 ],
					[ 5, 5, 1, 1 ,1, 5, 5 ],
					[ 1, 1, 1, 7 ,1, 1, 1 ],
					[ 1, 1, 1, 1 ,1, 1, 1 ],
					[ 0, 1, 1, 2 ,1, 1, 0 ],
					[ 0, 0, 1, 1 ,1, 0, 0 ]
					] 
			});
		
	var color = Math.random() * 0xffffff;
	levels.push( ///level 1	
	{
			type:"align",
			background:"textures/bg2.png",
			planeColor: 208966.07738840044,
			gameSize : {x:5,y:5},
			music:"music/leveleen.ogg",
			firstBrickPosition : {x:-3,y:2.4},
			brickSize : {x:.47,y:.22,z:.22},
			brickSpace : {x:1.0, y:0.52},
			types : {1:{'color':11808294.026639538,'type':'normal'}, 
					 2:{'color':6356160.3086433,'type':'extraBalls'},
					 5:{'color':15346160.1086433,'type':'superspeed'},
					 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
					 6:{'color':19346160.1086433,'type':'ghost'},
					 7:{'color':934446.795992431,'type':'normal','hitCount':3,"onHitTransformTo":4},
					 8:{'color':1860824.026639538,'type':'normal'},
					 9:{'color':4234.234342,'type':'bigBall'}
			
			},
			layout: 
			[
			[ 0, 1, 1, 2 ,1, 1, 0 ],
			[ 0, 1, 8, 5 ,8, 1, 0 ],
			[ 0, 1, 1, 1 ,1, 1, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 0 ]
			] 
	});
	
	levels.push( ///level 2
	{
		type:"align",
		gameSize : {x:5,y:5},
		background:"textures/bg4.png",
		planeColor: 0x006600,
		music:"music/russia.mp3",
		firstBrickPosition : {x:-3,y:2.4},
		brickSize : {x:.47,y:.22,z:.22},
		brickSpace : {x:1.0, y:0.52},
			types : {1:{'color':11808294.026639538,'type':'normal'}, 
				 2:{'color':6356160.3086433,'type':'extraBalls'},
				 5:{'color':15346160.1086433,'type':'superspeed'},
				 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
				 6:{'color':19346160.1086433,'type':'ghost'}
			},
			layout: 
			[
			[ 1, 5, 1, 5 ,1, 5, 1 ],
			[ 1, 1, 1, 2 ,1, 1, 1 ],
			[ 1, 1, 2, 6 ,2, 1, 1 ],
			[ 1, 1, 1, 1 ,1, 1, 1 ],
			[ 0, 0, 1, 1 ,1, 0, 0 ],
			[ 0, 0, 4, 4 ,4, 0, 0 ], 
			[ 0, 0, 1, 1 ,1, 0, 0 ]
			]
	});

	levels.push( ///level 3
	{
			type:"align",
			background:"textures/bg3.png",
			planeColor : 0x8A0000,
			gameSize : {x:5,y:5},
			music:"music/leveldrie.ogg",
			firstBrickPosition : {x:-3,y:2.4},
			brickSize : {x:.47,y:.22,z:.22},
			brickSpace : {x:1.0, y:0.52},
			types : {1:{'color':11808294.026639538,'type':'normal'}, 
				     2:{'color':6356160.3086433,'type':'extraBalls'},
					 3:{'color':8485631.716873156,'type':'normal','hitCount':3,"onHitTransformTo":4},
					 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
					 5:{'color':11808294.026639538,'type':'normal'},
					 6:{'color':15346160.1086433,'type':'superspeed'},
					 7:{'color':934446.795992431,'type':'normal','hitCount':3,"onHitTransformTo":4},
					 9:{'color':4234.234342,'type':'bigBall'}
			},
			
			layout: 
			[
			[ 9, 6, 6, 1 ,6, 6, 9 ],
			[ 1, 6, 6, 1 ,6, 6, 1 ],
			[ 1, 6, 6, 1 ,6, 6, 1 ],
			[ 2, 3, 2, 2 ,2, 3, 2 ],
			[ 7, 7, 7, 7 ,7, 7, 7 ],
			[ 4, 4, 4, 4 ,4, 4, 4 ], 
			[ 5, 5, 5, 5 ,5, 5, 5 ]
			]
	});
	
	levels.push( ///level 4
	{
			type:"align",
			gameSize : {x:5,y:5},
			background:"textures/bg5.png",
			music:"music/DJCLANTM.ogg",
			planeColor: 0x7A0936,
			firstBrickPosition : {x:-3,y:2.4},
			brickSize : {x:.47,y:.22,z:.22},
			brickSpace : {x:1.0, y:0.52},
			types : {1:{'color':11808294.026639538,'type':'normal'}, 
				     2:{'color':6356160.3086433,'type':'extraBalls'},
					 3:{'color':8157503.589997533,'type':'normal'},
					 4:{'color':1274646.795992431,'type':'normal'},
					 5:{'color':61838294.026639538,'type':'normal'},
					 7:{'color':934446.795992431,'type':'normal','hitCount':3,"onHitTransformTo":4},
					 9:{'color':4234.234342,'type':'bigBall'}
			},
			
			layout: 
			[
			[ 1, 0, 1, 0 ,1, 0, 1 ],
			[ 1, 7, 1, 7 ,1, 7, 1 ],
			[ 1, 9, 1, 0 ,1, 9, 1 ],
			[ 2, 7, 2, 7 ,2, 7, 2 ],
			[ 3, 0, 3, 0 ,3, 0, 3 ],
			[ 4, 0, 4, 0 ,4, 0, 4 ], 
			[ 5, 0, 5, 0 ,5, 0, 5 ]
			]
	});	
	
	levels.push( ///level 5 final
	{
			type:"align",
			gameSize : {x:5,y:5},
			music:"music/GEFORCE.ogg",
			firstBrickPosition : {x:-3,y:2.4},
			brickSize : {x:.24,y:.12,z:.12},
			brickSpace : {x:0.5, y:0.27},
			types : {1:{'color':11808294.026639538,'type':'normal'}, 
				 2:{'color':6356160.3086433,'type':'extraBalls'},
				 5:{'color':15346160.1086433,'type':'superspeed'},
				 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
				 6:{'color':19346160.1086433,'type':'ghost'},
				 7:{'color':934446.795992431,'type':'normal','hitCount':3,"onHitTransformTo":4},
				 9:{'color':4234.234342,'type':'bigBall'},
				 8:{'color':1860824.026639538,'type':'normal'}},
			layout: 
			[
			[ 7, 7, 7, 7 ,7, 7, 2, 2, 7, 7, 7, 7, 7, 7 ],
			[ 1, 1, 1, 1 ,1, 1, 2, 2, 1, 1, 1, 1, 1, 0 ],
			[ 0, 0, 1, 1 ,1, 1, 4, 4, 1, 1, 1, 1, 0, 0 ],
			[ 0, 0, 0, 1 ,1, 1, 2, 2, 1, 2, 1, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,9, 1, 4, 4, 1, 9, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 1, 1, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 6, 6, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 0, 1, 1, 0, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,0, 1, 1, 1, 1, 0, 0, 0, 0, 0 ],
			[ 0, 0, 0, 0 ,9, 1, 2, 2, 1, 9, 0, 0, 0, 0 ],
			[ 0, 0, 0, 1 ,1, 1, 2, 2, 1, 1, 1, 0, 0, 0 ],
			[ 0, 0, 1, 1 ,1, 1, 1, 1, 1, 1, 1, 1, 0, 0 ],
			[ 0, 7, 7, 7 ,7, 7, 7, 7, 7, 7, 7, 7, 7, 0 ]
			]
	});
	
//	levels.push( ///level 5 final
//			{
//					type:"align",
//					gameSize : {x:5,y:5},
//					music:"music/GEFORCE.ogg",
//					firstBrickPosition : {x:-3,y:2.4},
//					brickSize : {x:.24,y:.12,z:.12},
//					brickSpace : {x:0.5, y:0.27},
//					types : {1:{'color':11808294.026639538,'type':'normal'}, 
//						 2:{'color':6356160.3086433,'type':'extraBalls'},
//						 5:{'color':15346160.1086433,'type':'superspeed'},
//						 4:{'color':4274646.795992431,'type':'normal','hitCount':2,"onHitTransformTo":1},
//						 6:{'color':19346160.1086433,'type':'ghost'},
//						 7:{'color':934446.795992431,'type':'normal','hitCount':3,"onHitTransformTo":4},
//						 8:{'color':1860824.026639538,'type':'normal'}},
//					layout: 
//					[
//					[ 5, 5, 5, 5 ,5, 5, 5, 5, 5, 5, 5, 5, 5, 5 ],
//					[ 5, 5, 5, 5 ,5, 5, 5, 5, 5, 5, 5, 5, 5, 5 ],
//					[ 5, 5, 0, 0 ,0, 0, 0, 0, 0, 0, 0, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,2, 2, 2, 2, 2, 2, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 5, 5, 5, 5, 5, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 5, 5, 5, 5, 5, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 5, 5, 5, 5, 5, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 5, 5, 5, 5, 5, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 5, 5, 5, 5, 5, 2, 0, 5, 5 ],
//					[ 5, 5, 0, 2 ,5, 1, 1, 1, 1, 5, 2, 0, 5, 5 ],
//					[ 7, 7, 7, 7 ,1, 1, 2, 2, 1, 1, 7, 7, 7, 7 ],
//					[ 7, 7, 7, 7 ,1, 1, 1, 1, 1, 1, 7, 7, 7, 7 ],
//					[ 1, 1, 1, 1 ,0, 0, 0, 0, 0, 0, 1, 1, 1, 1 ],
//					[ 0, 0, 0, 0 ,0, 0, 0, 0, 0, 0, 0, 0, 0, 0 ]
//					]
//			});
	
	
	return {
		getLevel : function(level){
			return levels[level];
		}
	}
		
})()


