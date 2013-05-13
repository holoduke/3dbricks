goog.provide("bricks3d.tween");

var Tween = {
		// t: current time, b: begInnIng value, c: change In value, d: duration
	easeInQuad : function(t, b, c, d) {
		return c*(t/=d)*t + b;
	},
	
	linear : function(t, b, c, d) {
		return (t/d) * c + b;
	},
	
	easeOutQuad : function(t, b, c, d) {
		return -c *(t/=d)*(t-2) + b;
	},
	
	easeInOutQuad : function(t, b, c, d) {
		if ((t/=d/2) < 1) return c/2*t*t + b;
		return -c/2 * ((--t)*(t-2) - 1) + b;
	},
	
	 sineInOut: function (t, b, c, d) {
         return -c / 2 * (Math.cos(Math.PI * t / d) - 1) + b;
     },

	
	quintInOut: function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return c / 2 * t * t * t * t * t + b;
        }
        t -= 2;
        return c / 2 * (t * t * t * t * t + 2) + b;
    },
    circInOut: function (t, b, c, d) {
        t /= d / 2;
        if (t < 1) {
            return -c/2 * (Math.sqrt(1 - t*t) - 1) + b;
        }
        t -= 2;
        return c / 2 * (Math.sqrt(1 - t * t) + 1) + b;
    }
	
	
};