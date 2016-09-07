var container = document.getElementById("container");
var content = document.getElementById("content");
var canvas = document.getElementById('canvas');
var search = document.getElementById('search');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
var zoom = 100.0;
var maxZoom = 100.0;
var minZoom = 50.0;
var mapImg = new Image();
mapImg.src = 'Atlas.png';

// Screen variables
var zoomValue = 1;
var originX = 0;
var originY = 0;
var width = 0;
var height = 0;
var endX = 0;
var endY = 0;

// Mouse varaibles
var lastX = 0;
var lastY = 0;
var dragStart;
var isPressed = false;

// Remove scroll bars
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only

function trackTransforms(context){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
	var xform = svg.createSVGMatrix();
	context.getTransform = function(){ return xform; };
		
    var scale = context.scale;
    context.scale = function(sx, sy){
        xform = xform.scaleNonUniform(sx, sy);
        zoomValue = zoomValue * sx;
        return scale.call(context, sx, sy);
    };

    var translate = context.translate;
    context.translate = function(dx,dy){
        xform = xform.translate(dx, dy);
        originX = xform.e;
        originY = xform.f;
        return translate.call(context, dx, dy);
    };

    var pt = svg.createSVGPoint();
    context.transformedPoint = function(x, y){
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
}


window.onload = function () {
    trackTransforms(context);
    
    var draw = function () {
        setTimeout(function() {
            requestAnimationFrame(draw);
            // Clear canvas
            var origin = context.transformedPoint(0, 0);
            var dimension = context.transformedPoint(canvas.width, canvas.height);
            context.clearRect(origin.x, origin.y, dimension.x - origin.x, dimension.y - origin.y);
            if (!isPressed){
                reset();
            }

            // Draw map
            var mapHeight = canvas.height * this.zoom / 100.0;
            var mapWidth = canvas.height * 16.0 / 9.0 * this.zoom / 100.0;
            context.drawImage(mapImg, (canvas.width - mapWidth) / 2, 0, mapWidth, mapHeight);
            
            // Set some variables
            width = canvas.width * zoomValue;
            height = canvas.height * zoomValue;
            endX = width + originX;
            endY = height + originY

        }, 1000 / 30);
    }
    

    function reset () {

        var xLimit1 = (canvas.width - (canvas.width * zoomValue));
        var yLimit1 = (canvas.height - (canvas.height * zoomValue));
        var xLimit2 = - xLimit1 + canvas.width;
        var yLimit2 = - yLimit1 + canvas.height;
        if (originX < xLimit1){
            context.translate((xLimit1 - originX) / 40.0, 0);
        }
        if (originY < yLimit1){
            context.translate(0,  (yLimit1 - originY) / 40.0);
        }
        if (endX > xLimit2){
           context.translate((xLimit2 - endX) / 40.0, 0);
        }
        if (endY > yLimit2){
          context.translate(0,  (yLimit2 - endY) / 40.0);
        }
    }
        
    draw();
    
    function addEvent(obj, evt, fn) {
        if (obj.addEventListener) {
            obj.addEventListener(evt, fn, false);
        }
        else if (obj.attachEvent) {
            obj.attachEvent("on" + evt, fn);
        }
    }
    
    canvas.addEventListener('mousedown', function(evt){
        lastX = evt.offsetX;
        lastY = evt.offsetY;
        dragStart = context.transformedPoint(lastX, lastY);
        isPressed = true;
    });
    
    canvas.addEventListener('mousemove', function(evt){
        lastX = evt.offsetX;
		lastY = evt.offsetY;
		if (dragStart){
			var pt = context.transformedPoint(lastX, lastY);
			context.translate(pt.x - dragStart.x, pt.y - dragStart.y);
			draw();
		}
	});
    
	canvas.addEventListener('mouseup', function(evt){
		dragStart = null;
        isPressed = false;
    });
    
    addEvent(document, "mouseout", function(e) {
        e = e ? e : window.event;
        var from = e.relatedTarget || e.toElement;
        if (!from || from.nodeName == "HTML") {
            dragStart = null;
            isPressed = false;
        }
    });

	var scaleFactor = 1.1;
	var zoom = function(delta){
	   var pt = context.transformedPoint(lastX, lastY);
        if (zoomValue * (Math.pow(scaleFactor, delta)) > 0.9 && zoomValue * (Math.pow(scaleFactor, delta)) < 3){
           context.translate(pt.x, pt.y);
           context.scale(Math.pow(scaleFactor, delta), Math.pow(scaleFactor, delta));
           context.translate(-pt.x, -pt.y);
           draw();
        }
	}
    
    var handleScroll = function(evt){
        var delta = evt.wheelDelta ? evt.wheelDelta / 40 : evt.detail ? -evt.detail : 0;
        if (delta) zoom(delta);
			return evt.preventDefault() && false;
		};
    
    canvas.addEventListener('DOMMouseScroll', handleScroll, false);
    canvas.addEventListener('mousewheel', handleScroll, false);
    

};
    

class Button{
    constructor(x, y){
        this.x = x;
        this.y = y;
    }
}