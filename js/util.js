    //basic event system
    ev = {};
    ev = {};
    ev.subs = [];
    ev.subsIndex = [];
    ev.published = {};

    ev.sub = function(to,cb){

        var ci = ev.subsIndex.indexOf(to);

        if (ci == -1){
            ev.subsIndex.push(to);
            ev.subs.push([]);
            ci = ev.subsIndex.length-1;
        }

        ev.subs[ci].push({'to':to,'cb':cb});
    }
 
    ev.pub = function(to,param){
    	var pubIterator;
    	var triggerIndex = ev.subsIndex.indexOf(to);

        ev.published[to] = param || true;
        
        if (triggerIndex == -1) return null;

        for (pubIterator=0, len = ev.subs[triggerIndex].length; pubIterator < len; pubIterator++)
        {
            ev.subs[triggerIndex][pubIterator].cb(param);
        }
    }
    
    ev.unsub = function(to){
    	var ci = ev.subsIndex.indexOf(to);
    	var triggerIndex = ev.subsIndex.indexOf(to);
    	
    	if (ci != -1){
    		ev.subs[ci] = [];
    		ev.subsIndex[to] = [];
    	}
    }
    
    ev.executeAfter = function(to,cb){
    	
    	if (ev.published[to]){
    		cb(ev.published[to]);
    	}
    	else{
    		ev.sub(to,cb);	
    	}
    }  
    
    Color=function(a,b,d){var e;this.getR=function(){return this.r};this.setR=function(a){this.r=a;this.computeHSV()};this.getG=function(){return this.g};this.setG=function(a){this.g=a;this.computeHSV()};this.getB=function(){return this.b};this.setB=function(a){this.b=a;this.computeHSV()};this.getH=function(){return this.h};this.setH=function(a){this.h=a;this.computeRGB()};this.getS=function(){return this.s};this.setS=function(a){this.s=a;this.computeRGB()};this.getV=function(){return this.v};
    this.setV=function(a){this.v=a;this.computeRGB()};var f=function(a){return parseInt(a,16)};this.setValue=function(a){"#"===a.substr(0,1)?(this.r=f(a.substr(1,2)),this.g=f(a.substr(3,2)),this.b=f(a.substr(5,2))):(a=/^rgb\((\d{1,3}),\s*(\d{1,3}),\s*(\d{1,3})\)$/.exec(a),this.r=parseInt(a[1]),this.g=parseInt(a[2]),this.b=parseInt(a[3]));this.computeHSV()};this.getValue=function(){return"#"+((16>this.r?"0":"")+this.r.toString(16))+((16>this.g?"0":"")+this.g.toString(16))+((16>this.b?"0":"")+this.b.toString(16))};
    this.computeHSV=function(){var a=this.r/255,b=this.g/255,d=this.b/255,e=Math.min(a,b,d),f=Math.max(a,b,d),e=f-e,m=0,r=0;0!=f?(r=e/f,m=60*(e?a==f?(b-d)/e:b==f?2+(d-a)/e:4+(a-b)/e:0),0>m&&(m+=360)):(r=0,m=-1);this.h=m;this.s=r;this.v=f};this.computeRGB=function(){var a=this.h,b=this.s,d=this.v,f=0,n=0,m=0,r=0,f=m=n=0;if(0==b)e=f=m=d;else switch(a=a%360/60,f=Math.floor(a),n=a-f,m=d*(1-b),r=d*(1-b*n),n=d*(1-b*(1-n)),f){case 0:e=d;f=n;break;case 1:e=r;f=d;break;case 2:e=m;f=d;m=n;break;case 3:e=m;f=r;
    m=d;break;case 4:e=n;f=m;m=d;break;default:e=d,f=m,m=r}this.r=Math.round(255*e);this.g=Math.round(255*f);this.b=Math.round(255*m)};"string"==typeof a?this.setValue(a):("number"==typeof a?(this.r=a,this.g=b,this.b=d):this.b=this.g=this.r=0,this.computeHSV())};
    
 // http://paulirish.com/2011/requestanimationframe-for-smart-animating/
 // http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating
  
 // requestAnimationFrame polyfill by Erik Möller
 // fixes from Paul Irish and Tino Zijdel
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
     
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
     
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    