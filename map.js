var container = document.getElementById("container");
var content = document.getElementById("content");
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var search = document.getElementById('search');
var context = canvas.getContext("2d");
var mapImg = new Image();
var buttons = [];
mapImg.src = 'AtlasComplete.png';

// Screen variables
var zoomValue = 1;
var originX = 0;
var originY = 0;
var width = 0;
var height = 0;
var endX = 0;
var endY = 0;
var mapHeight = canvas.height;
var mapWidth = canvas.height * 16.0 / 9.0;

// Mouse varaibles
var mouseX = 0;
var mouseY = 0;
var lastX = 0;
var lastY = 0;
var dragStart;
var isPressed = false;

// Remove scroll bars
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only
onselectstart="return false;"

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

$(window).resize(function() {
    // Reset variables

    window.location.reload(false); 
});


class Button{
    constructor(name, x, y){
        this.name = name;
        this.x = ((canvas.width - mapWidth) / 2) + x * mapWidth;
        this.y = canvas.height * y;
        this.radius = canvas.width / 150;
        this.selected = false;
    }
    
    draw(){
      if (this.selected){
          context.beginPath();
          context.ellipse(this.x - this.radius , this.y - this.radius, this.radius, this.radius, 0, 2 * Math.PI, 0);
          context.lineWidth = 3;
          context.strokeStyle = 'red';
          context.stroke();
      }
    }
}

function createButtons(){
    buttons = [];
    // T1
    buttons.push(new Button("Crystal Ore Map", 0.18193717277486768, 0.14764397905759163));
    buttons.push(new Button("Jungle Valley Map", 0.23082460732984172, 0.774869109947644));
    buttons.push(new Button("Desert Map", 0.8127617801047134, 0.15387958115183245));
    buttons.push(new Button("Arcade Map", 0.8316099476439806, 0.768586387434555));
    
    // T2
    buttons.push(new Button("Factory Map", 0.177814136125653, 0.2418848167539267));
    buttons.push(new Button("Beach Map", 0.2520287958115172, 0.7267015706806282));
    buttons.push(new Button("Ghetto Map", 0.7921465968586401, 0.7424083769633508));
    buttons.push(new Button("Oasis Map", 0.8080497382198967, 0.20837696335078534));
    
    // T3
    buttons.push(new Button("Channel Map", 0.20785340314135994, 0.30261780104712044));
    buttons.push(new Button("Cavern Map", 0.18134816753926558, 0.42094240837696334));
    buttons.push(new Button("Marshes Map", 0.19018324607329704, 0.650261780104712));
    buttons.push(new Button("Vaal Pyramid Map", 0.23023560209423963, 0.6230366492146597));
    buttons.push(new Button("Arid Lake Map", 0.8021596858638758, 0.2534031413612565));
    buttons.push(new Button("Sewers Map", 0.7785994764397919, 0.8));
    buttons.push(new Button("Grotto Map", 0.8227748691099491, 0.3518324607329843));
    buttons.push(new Button("Vaults of Atziri Vaal Pyramid Map", 0.24790575916230254, 0.6052356020942409));
    
    // T4
    buttons.push(new Button("Acid Lakes Map", 0.20667539267015575,  0.21780104712041884));
    buttons.push(new Button("Waste Pool Map", 0.2184554973821977, 0.3968586387434555));
    buttons.push(new Button("Phantasmagoria Map", 0.1972513089005222, 0.5664921465968586));
    buttons.push(new Button("Graveyard Map", 0.7338350785340325, 0.7476439790575916));
    buttons.push(new Button("Dungeon Map", 0.8151178010471218, 0.3078534031413613));
    buttons.push(new Button("Villa Map", 0.7717044240837709, 0.3486910994764398));
    buttons.push(new Button("Hallowed Ground Cemetery Map", 0.7273560209424094, 0.7905759162303665));
    buttons.push(new Button("Academy Map", 0.8304319371727764, 0.6984293193717277));
    
    // T5
    buttons.push(new Button("Dunes Map", 0.7542722513089016, 0.2649743455497382));
    buttons.push(new Button("Peninsula Map", 0.7346020942408388, 0.35602094240837695));
    buttons.push(new Button("Phantasmagoria Map", 0.1972513089005222, 0.5664921465968586));
    buttons.push(new Button("Spider Lair Map", 0.8215968586387449, 0.48206282722513089));
    buttons.push(new Button("Tower Map", 0.7880235602094254, 0.5926230366492147));
    buttons.push(new Button("Pit Map", 0.2172774869109935, 0.16753926701570682));
    buttons.push(new Button("Mesa Map", 0.2543848167539256, 0.2784397905759162));
    buttons.push(new Button("Primordial Pool Map", 0.2147434554973809, 0.4858167539267016));
    buttons.push(new Button("Burial Chamber Map", 0.2518287958115172, 0.5420141361256545));
    
    // T6
    buttons.push(new Button("Racecourse Map", 0.25597382198952767, 0.13179581151832462));
    buttons.push(new Button("Quarry Map", 0.28365706806282626, 0.21675392670157068));
    buttons.push(new Button("Canyon Map", 0.26106387434554864, 0.4326607329842932));
    buttons.push(new Button("Vaal City Map", 0.28836910994764303, 0.5999528795811518));
    buttons.push(new Button("Strand Map", 0.7114528795811528, 0.2627801047120419));
    buttons.push(new Button("Wharf Map", 0.6837696335078542, 0.3162303664921466));
    buttons.push(new Button("Ramparts Map", 0.7202879581151842, 0.44397905759162304));
    buttons.push(new Button("Spider Forest Map", 0.7952696335078547, 0.4941937172774869));
    buttons.push(new Button("Thicket Map", 0.8151178010471218, 0.4292251308900524));
    
    // T6
    buttons.push(new Button("Armory Map", 0.7314790575916241, 0.6732984293193718));
    buttons.push(new Button("Mud Geyser Map", 0.7591623036649227, 0.49842931937172774));
    buttons.push(new Button("Castle Ruins Map", 0.6778795811518332, 0.19467015706806281));
    buttons.push(new Button("Cells Map", 0.30150523560209336, 0.13712565445026178));
    buttons.push(new Button("Catacombs Map", 0.3274214659685856, 0.5612094240837696));
    buttons.push(new Button("Strand Map", 0.7114528795811528, 0.2627801047120419));
    buttons.push(new Button("Wharf Map", 0.6837696335078542, 0.3162303664921466));
    buttons.push(new Button("Ramparts Map", 0.7202879581151842, 0.44397905759162304));
    buttons.push(new Button("Spider Forest Map", 0.7952696335078547, 0.4941937172774869));
    buttons.push(new Button("Thicket Map", 0.8151178010471218, 0.4292251308900524));
    
    
    
}


window.onload = function () {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    mapHeight = canvas.height;
    mapWidth = canvas.height * 16.0 / 9.0;
    createButtons();
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
            context.drawImage(mapImg, (canvas.width - mapWidth) / 2, 0, mapWidth, mapHeight);
            
            // Set some variables
            width = canvas.width * zoomValue;
            height = canvas.height * zoomValue;
            endX = width + originX;
            endY = height + originY
            for (i = 0; i < buttons.length; i++){
                if (buttons[i].name.toUpperCase().includes(document.getElementById('search').value.toUpperCase())){
                    buttons[i].selected = true;
                }
                else{
                    buttons[i].selected = false;
                }
                buttons[i].draw();
            }
            var ratioX =  ((mouseX-(1920 - 1697.77777777777)  / 2) /1697.77777777777);
            var ratioY = mouseY / 955;
            console.log(ratioX + ", " + ratioY);
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
    
    onmousemove = function(e){
        mouseX = e.clientX;
        mouseY = e.clientY;
    }

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
    

