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
	}
	
	
};