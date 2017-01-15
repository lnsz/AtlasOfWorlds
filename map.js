var container = document.getElementById("container");
var content = document.getElementById("content");
var search = document.getElementById('search');
var canvas = document.getElementById('canvas');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;
var context = canvas.getContext("2d");
var searchCanvas = document.getElementById('canvas');
searchCanvas.width = window.innerWidth;
searchCanvas.height = window.innerHeight;
var searchContext = searchCanvas.getContext("2d");
var maxSearchResults = 30;
var scaleFactor = 1.1;
var mapImg = new Image();
var tiersImg = new Image();
var namesImg = new Image();
var uniquesImg = new Image();
var upgradesImg = new Image();
var smallNamesImg = new Image();
var smallUniquesImg = new Image();
var selectedImg = new Image();
var completedImg = new Image();
var selectedButtons = [];
var buttons = [];
var showNames =  true;
var showTiers = true;
var showUniques = false;
var showUpgrades = false;
var landscape = true;
var isLarge = true;
var shouldDraw = true;
atlasTracker = localStorage;

mapImg.src = 'Atlas25.jpg';
tiersImg.src = 'AtlasTier25.png'
namesImg.src = 'AtlasNames25.png';
uniquesImg.src = 'AtlasUnique25.png';
upgradesImg.src = 'AtlasUpgrades25.png';
smallNamesImg.src = 'AtlasNamesSmall25.png';
smallUniquesImg.src = 'AtlasUniquesSmall25.png';
selectedImg.src = 'Selected.png';
completedImg.src = 'Completed.png'
// Screen variables
var zoomValue = 1;
var originX = 0;
var originY = 0;
var width = 0;
var height = 0;
var endX = 0;
var endY = 0;
var mapHeight = 0;
var mapWidth = 0;
var mapX = 0;
var mapY = 0;

// Mouse varaibles
var mouseX = 0;
var mouseY = 0;
var lastX = 0;
var lastY = 0;
var dragStart;
var isPressed = false;
var isKeyPressed = false;

// Remove scroll bars
document.documentElement.style.overflow = 'hidden';  // firefox, chrome
document.body.scroll = "no"; // ie only
onselectstart="return false;"

var loadButtons = function(){
    createButtons();
    if (localStorage.getItem("buttons") != null){
        var temp = (JSON.parse(localStorage.getItem("buttons")));
        for (i = 0; i < temp.length; i++){
            if (temp[i].completed){
                buttons[i].completed = temp[i].completed;
                addInstance(i, selectedButtons);
            }
        }
    }
}

function trackTransforms(context){
    var svg = document.createElementNS("http://www.w3.org/2000/svg",'svg');
	var xform = svg.createSVGMatrix();
	context.getTransform = function(){ return xform; };
		
    var scale = context.scale;
    context.scale = function(sx, sy){
        xform = xform.scaleNonUniform(sx, sy);
        zoomValue = zoomValue * sx;
        shouldDraw = true;
        draw();
        return scale.call(context, sx, sy);
    };

    var translate = context.translate;
    context.translate = function(dx,dy){
        xform = xform.translate(dx, dy);
        originX = xform.e;
        originY = xform.f;
        shouldDraw = true;
        draw();
        return translate.call(context, dx, dy);
    };

    var pt = svg.createSVGPoint();
    context.transformedPoint = function(x, y){
        pt.x = x; pt.y = y;
        return pt.matrixTransform(xform.inverse());
    }
    
}

function detectMobile() { 
   if( navigator.userAgent.match(/Android/i)
    || navigator.userAgent.match(/webOS/i)
    || navigator.userAgent.match(/iPhone/i)
    || navigator.userAgent.match(/iPad/i)
    || navigator.userAgent.match(/iPod/i)
    || navigator.userAgent.match(/BlackBerry/i)
    || navigator.userAgent.match(/Windows Phone/i)
    ){
        return true;
    } else {
        return false;
    }
}

$(window).resize(function() {
    // Refresh page when it changes size
    if (!detectMobile()){
        window.location.reload(false);
    }
});

$(document).on("click" || "change", "input[type='checkbox']", function () {
    // Handle Checkboxes
    showNames = $("#mapCheckbox").is(':checked');
    showTiers = $("#tierCheckbox").is(':checked');
    showUniques = $("#uniqueCheckbox").is(':checked');
    showUpgrades = $("#upgradesCheckbox").is(':checked');
    isLarge = $("#largeTextCheckbox").is(':checked');
    shouldDraw = true;
});

$('*').mouseenter(function(){;
    var currentCursor = $(this).css('cursor') ;
    if (currentCursor != "default"){
        isPressed = false;
        dragStart = null;
    }
});

$('*').mouseleave(function(){
    isPressed = false;
    dragStart = null;
});

function setCanvas(){
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    if ((canvas.width / canvas.height) > 16.0 / 9.0){
        mapHeight = canvas.height;
        mapWidth = canvas.height * 16.0 / 9.0;
        mapX = (canvas.width - mapWidth) / 2;
        mapY = 0;
        landscape = true;
    } else{
        landscape = false;
        mapHeight = canvas.width * 9.0 / 16.0;
        mapWidth = canvas.width;
        mapX = 0;
        mapY = (canvas.height - mapHeight) / 2;;
    }
}

function removeInstance(value, array){
    // Remove instance of value from array
    var index = array.indexOf(i);
    if (index > - 1){
        selectedButtons.splice(index, 1);
    }
    
}

function addInstance(value, array){
    // Adds the value to the array if it does not already exist
    if (array.indexOf(value) < 0){
        array.push(value);
    }
    
}

function reset () {
    var xLimit1 = (canvas.width - (canvas.width * zoomValue));
    var yLimit1 = (canvas.height - (canvas.height * zoomValue));
    var xLimit2 = - xLimit1 + canvas.width;
    var yLimit2 = - yLimit1 + canvas.height;
    var shouldReset = false;
    if (originX < xLimit1 - 0.1){
        if(!isPressed){
            context.translate((xLimit1 - originX) / 10.0, 0);
        }
        shouldReset = true;
    }
    if (originY < yLimit1 - 0.1){
        if(!isPressed){
            context.translate(0,  (yLimit1 - originY) / 10.0);
        }
        shouldReset = true;
    }
    if (endX > xLimit2 + 0.1){
        if(!isPressed){
            context.translate((xLimit2 - endX) / 10.0, 0);
        }
        shouldReset = true;
    }
    if (endY > yLimit2 + 0.1){
        if(!isPressed){
            context.translate(0,  (yLimit2 - endY) / 10.0);
        }
        shouldReset = true;
    }
    return shouldReset;
}

function checkButtons(){
// Draw selected buttons
        var countSelected = 0;
        var searchValue = document.getElementById('search').value;
        var searchLength = searchValue.length;
        var index = 0;
        for (i = 0; i < buttons.length; i++){	
			
            if (countSelected < maxSearchResults && searchLength > 0 && 
            (buttons[i].name.toUpperCase().includes(searchValue.toUpperCase()) || 
            buttons[i].tier == searchValue)){
                countSelected = countSelected + 1;
                buttons[i].selected = true;
                addInstance(i, selectedButtons);
            }
            else{
                buttons[i].selected = false;
                if(!buttons[i].completed){
                    removeInstance(i, selectedButtons);
                }
            }
        }
        if (countSelected >= maxSearchResults){
            document.getElementById("systemText").innerHTML = "Showing first " + countSelected + " results found";
        }
        else{
            document.getElementById("systemText").innerHTML = "";
        }
}

function drawButtons(){
    for(i = 0; i < selectedButtons.length; i++){
        buttons[selectedButtons[i]].draw();
    }
}

var draw = function () {
    if(shouldDraw){
        setTimeout(function() {
            requestAnimationFrame(draw);
            // Clear canvas
            var origin = context.transformedPoint(0, 0);
            var dimension = context.transformedPoint(canvas.width, canvas.height);
            context.clearRect(origin.x, origin.y, dimension.x - origin.x, dimension.y - origin.y);
            
            // Draw map
            context.drawImage(mapImg, mapX, mapY, mapWidth, mapHeight);
            if(showUpgrades){
               context.drawImage(upgradesImg, mapX, mapY, mapWidth, mapHeight);  
            }
            if(showNames){
                if(isLarge){
                    context.drawImage(namesImg, mapX, mapY, mapWidth, mapHeight);  
                }
                else{
                    context.drawImage(smallNamesImg, mapX, mapY, mapWidth, mapHeight); 
                }
            }
            if(showTiers){
                  context.drawImage(tiersImg, mapX, mapY, mapWidth, mapHeight);  
            }
            if(showUniques){
               if(isLarge){
                   context.drawImage(uniquesImg, mapX, mapY, mapWidth, mapHeight);  
               }
                else{
                    context.drawImage(smallUniquesImg, mapX, mapY, mapWidth, mapHeight); 
                }
            }

            // Set some variables
            width = canvas.width * zoomValue;
            height = canvas.height * zoomValue;
            endX = width + originX;
            endY = height + originY
            
            if(isKeyPressed){
                checkButtons();
            }

            drawButtons();
            // var ratioX =  ((mouseX-(1920 - 1697.77777777777)  / 2) /1697.77777777777);
            // var ratioY = mouseY / 955;

            if(!reset() && !isKeyPressed){
                shouldDraw = false;
            }
        }, 1000 / 30);
		
			var atlasBonus = 0;
		
		for (i = 0; i < buttons.length; i++){
			if(buttons[i].completed == true){
				atlasBonus = atlasBonus + 1;
			}		
		}	
		
		document.getElementById("systemText").innerHTML = "Atlas Bonus: " + atlasBonus + "/" + buttons.length;
   }
}

class Button{
    constructor(name, tier, x, y){
        this.name = name;
        this.x = mapX + x * mapWidth;
        this.y = mapY + y * mapHeight;
        this.radius = canvas.width / 150;
        this.selected = false;
        this.completed = false;
        this.tier = tier;
    }
    
    draw(){
        if (this.completed){
            searchContext.drawImage(completedImg, this.x - this.radius * 2, this.y - this.radius * 2, this.radius * 2, this.radius * 2);
        }
        if (this.selected){
//          searchContext.moveTo(this.x, this.y - this.radius);
//          searchContext.ellipse((this.x - this.radius) , this.y - this.radius, this.radius, this.radius, 0, 2 * Math.PI, 0);
            searchContext.drawImage(selectedImg, this.x - this.radius * 2, this.y - this.radius * 2, this.radius * 2, this.radius * 2); 
        }
    }
    
    isPressed(mX, mY){
        return (Math.sqrt(Math.pow((mX - (this.x - this.radius * 0.75)), 2) + Math.pow((mY - (this.y - this.radius * 0.75)), 2)) < this.radius);
    }
}

function createButtons(){
    // T1
    buttons.push(new Button("Crystal Ore Map", 1, 0.18193717277486768, 0.14764397905759163));
    buttons.push(new Button("Jungle Valley Map", 1, 0.23082460732984172, 0.774869109947644));
    buttons.push(new Button("Desert Map", 1, 0.8127617801047134, 0.15387958115183245));
    buttons.push(new Button("Arcade Map", 1, 0.8316099476439806, 0.768586387434555));
    
    // T2
    buttons.push(new Button("Factory Map", 2, 0.177814136125653, 0.2418848167539267));
    buttons.push(new Button("Beach Map", 2, 0.2520287958115172, 0.7267015706806282));
    buttons.push(new Button("Ghetto Map", 2, 0.7921465968586401, 0.7424083769633508));
    buttons.push(new Button("Oasis Map", 2, 0.8080497382198967, 0.20837696335078534));
    
    // T3
    buttons.push(new Button("Channel Map", 3, 0.20785340314135994, 0.30261780104712044));
    buttons.push(new Button("Cavern Map", 3, 0.18134816753926558, 0.42094240837696334));
    buttons.push(new Button("Marshes Map", 3, 0.19018324607329704, 0.650261780104712));
    buttons.push(new Button("Vaal Pyramid Map", 3, 0.23023560209423963, 0.6230366492146597));
    buttons.push(new Button("Arid Lake Map", 3, 0.8021596858638758, 0.2534031413612565));
    buttons.push(new Button("Sewers Map", 3, 0.7785994764397919, 0.8));
    buttons.push(new Button("Grotto Map", 3, 0.8227748691099491, 0.3518324607329843));
    buttons.push(new Button("Vaults of Atziri Vaal Pyramid Map", 3, 0.24790575916230254, 0.6052356020942409));
    
    // T4
    buttons.push(new Button("Acid Lakes Map", 4, 0.20667539267015575,  0.21780104712041884));
    buttons.push(new Button("Waste Pool Map", 4, 0.2184554973821977, 0.3968586387434555));
    buttons.push(new Button("Phantasmagoria Map", 4, 0.1972513089005222, 0.5664921465968586));
    buttons.push(new Button("Graveyard Map", 4, 0.7338350785340325, 0.7476439790575916));
    buttons.push(new Button("Dungeon Map", 4, 0.8151178010471218, 0.3078534031413613));
    buttons.push(new Button("Villa Map", 4, 0.7717044240837709, 0.3486910994764398));
    buttons.push(new Button("Hallowed Ground Cemetery Map", 4, 0.7273560209424094, 0.7905759162303665));
    buttons.push(new Button("Academy Map", 4, 0.8304319371727764, 0.6984293193717277));
    
    // T5
    buttons.push(new Button("Dunes Map", 5, 0.7542722513089016, 0.2649743455497382));
    buttons.push(new Button("Peninsula Map", 5, 0.7346020942408388, 0.35602094240837695));
    buttons.push(new Button("Spider Lair Map", 5, 0.8215968586387449, 0.48206282722513089));
    buttons.push(new Button("Tower Map", 5, 0.7880235602094254, 0.5926230366492147));
    buttons.push(new Button("Pit Map", 5, 0.2172774869109935, 0.16753926701570682));
    buttons.push(new Button("Mesa Map", 5, 0.2543848167539256, 0.2784397905759162));
    buttons.push(new Button("Primordial Pool Map", 5, 0.2147434554973809, 0.4858167539267016));
    buttons.push(new Button("Burial Chamber Map", 5, 0.2518287958115172, 0.5420141361256545));
    
    // T6
    buttons.push(new Button("Racecourse Map", 6, 0.25597382198952767, 0.13179581151832462));
    buttons.push(new Button("Quarry Map", 6, 0.28365706806282626, 0.21675392670157068));
    buttons.push(new Button("Canyon Map", 6, 0.26106387434554864, 0.4326607329842932));
    buttons.push(new Button("Vaal City Map", 6, 0.28836910994764303, 0.5999528795811518));
    buttons.push(new Button("Strand Map", 6, 0.7114528795811528, 0.2627801047120419));
    buttons.push(new Button("Wharf Map", 6, 0.6837696335078542, 0.3162303664921466));
    buttons.push(new Button("Ramparts Map", 6, 0.7202879581151842, 0.44397905759162304));
    buttons.push(new Button("Spider Forest Map", 6, 0.7952696335078547, 0.4941937172774869));
    buttons.push(new Button("Thicket Map", 6, 0.8151178010471218, 0.4292251308900524));
    buttons.push(new Button("Whakawairua Tuhau Strand Map", 6, 0.7114528795811528, 0.29842931937172773));
    
    // T7
    buttons.push(new Button("Armory Map", 7, 0.7314790575916241, 0.6732984293193718));
    buttons.push(new Button("Mud Geyser Map", 7, 0.7591623036649227, 0.49842931937172774));
    buttons.push(new Button("Castle Ruins Map", 7, 0.6778795811518332, 0.19467015706806281));
    buttons.push(new Button("Cells Map", 7, 0.30150523560209336, 0.13712565445026178));
    buttons.push(new Button("Catacombs Map", 7, 0.3274214659685856, 0.5612094240837696));
    buttons.push(new Button("Arachnid Tomb Map", 7, 0.2720549738219885, 0.6586387434554973));
    buttons.push(new Button("Ashen Wood Map", 7, 0.35922774869109886, 0.17801047120418848));
    buttons.push(new Button("Olmec's Sanctum Catacombs Map", 7, 0.3409685863874338, 0.581151832460733));
    

    // T8
    buttons.push(new Button("Arachnid Nest Map", 8, 0.3896780104712037, 0.1799633507853403));
    buttons.push(new Button("Bog Map", 8, 0.592295811518325, 0.15178534031413612));
    buttons.push(new Button("Cemetery Map", 8, 0.6246962303664928, 0.222830890052356));
    buttons.push(new Button("Barrows Map", 8, 0.43579842931937146, 0.16753926701570682));
    buttons.push(new Button("Shore Map", 8, 0.32288743455497304, 0.6366020942408377));
    buttons.push(new Button("Tropical Island Map", 8, 0.2914921465968577, 0.7276544502617801));
    buttons.push(new Button("Arena Map", 8, 0.7085078534031423, 0.7381256544502618));
    buttons.push(new Button("Pier Map", 8, 0.7444371727748702, 0.5862931937172775));
    buttons.push(new Button("Atoll Map", 8, 0.7102748691099486, 0.5852931937172775));
    buttons.push(new Button("Maelstrom of Chaos Atoll Map", 8, 0.6926047120418857, 0.5895287958115183));
    
    // T9
    buttons.push(new Button("Crypt Map", 9, 0.5482984293193719, 0.24193193717277486));
    buttons.push(new Button("Museum Map", 9, 0.5275052356020944, 0.2271780104712042));
    buttons.push(new Button("Promenade Map", 9, 0.480000076963350007696335, 0.26598586387434556));
    buttons.push(new Button("Overgrown Shrine Map", 9, 0.39397905759162255, 0.24079057591623038));
    buttons.push(new Button("Coves Map", 9, 0.33390052356020866, 0.7287015706806282));
    buttons.push(new Button("Reef Map", 9, 0.2914921465968577, 0.8544502617801047));
    buttons.push(new Button("Orchard Map", 9, 0.7102748691099486, 0.8020471204188482));
    buttons.push(new Button("Temple Map", 9, 0.6496073298429326, 0.7235602094240837));
    buttons.push(new Button("Acton's Nightmare Overgrown Shrine Map", 9, 0.37866492146596803, 0.2293193717277487));
    buttons.push(new Button("Hall of Grandmasters Promenade Map", 9, 0.42678429319371694, 0.2271780104712042));
    buttons.push(new Button("Putrid Cloister Museum Map", 9, 0.5429973821989531, 0.21675392670157068));
    buttons.push(new Button("Coward's Trial Crypt Map", 9, 0.566557591623037, 0.24607329842931938));
    buttons.push(new Button("Mao Kun Reef Map", 9, 0.3144633507853395, 0.8408376963350785));
        
    // T10
    buttons.push(new Button("Quay Map", 10, 0.37277486910994706, 0.8335078534031414));
    buttons.push(new Button("Underground River Map", 10, 0.40281413612565403, 0.8649214659685864));
    buttons.push(new Button("Malformation Map", 10, 0.6384162303664928, 0.8303664921465969));
    buttons.push(new Button("Courtyard Map", 10, 0.5318062827225132, 0.31204188481675393));
    buttons.push(new Button("Colonade Map", 10, 0.4387434554973819, 0.2973350785340314));
    buttons.push(new Button("Arsenal Map", 10, 0.6000078534031418, 0.3035999785340314));
    buttons.push(new Button("Terrace Map", 10, 0.3168193717277479, 0.2869109947643979));
    buttons.push(new Button("The Vinktar Square Courtyard Map", 10, 0.524149214659686, 0.2743455497382199));
    buttons.push(new Button("Poorjoy's Asylum Temple Map", 10, 0.6372382198952886, 0.7068062827225131));
	buttons.push(new Button("Caer Blaidd, Wolfpack's Den Underground River Map", 10, 0.406704188481675, 0.8365078534031414));
    
    // T11
    buttons.push(new Button("Bazaar Map", 11, 0.3456806282722506, 0.3581151832460733));
    buttons.push(new Button("Chateau Map", 11, 0.6394162303664928, 0.29628795811518327));
    buttons.push(new Button("Wasteland Map", 11, 0.5665005235602097, 0.37587958115183243));
    buttons.push(new Button("Excavation Map", 11, 0.5954188481675396, 0.7801047120418848));
    buttons.push(new Button("Underground Sea Map", 11, 0.481740837696335, 0.8052356020942408));
    buttons.push(new Button("Torture Chamber Map", 11, 0.42384031413612533, 0.766586387434555));
    buttons.push(new Button("Precinct Map", 11, 0.3737198952879576, 0.7654450261780105));
    buttons.push(new Button("Perandus Manor Chateau Map", 11, 0.6507853403141368, 0.3204188481675393));
    buttons.push(new Button("Oba's Cursed Trove Torture Chamber Map", 11, 0.43933246073298404, 0.7706806282722513));
    
    // T12
    buttons.push(new Button("Shipyard Map", 12, 0.30032722513088916, 0.3622565445026178));
    buttons.push(new Button("Ivory Temple Map", 12, 0.3631727748691093, 0.6785340314136126));
    buttons.push(new Button("Residence Map", 12, 0.43720942408376934, 0.7182303664921466));
    buttons.push(new Button("Crematorium Map", 12, 0.6042539267015712, 0.36120942408376966));
    buttons.push(new Button("Estuary Map", 12, 0.6607984293193725, 0.4407905759162304));
    buttons.push(new Button("Necropolis Map", 12, 0.6046649214659691, 0.7225130890052356));
    buttons.push(new Button("Vault Map", 12, 0.4664267015706805, 0.7664921465968586));
    buttons.push(new Button("Plateau Map", 12, 0.46919371727748677, 0.6586387434554973));
    buttons.push(new Button("Death and Taxes Necropolis Map", 12, 0.619924083769634, 0.7393612565445026));
        
    // T13
    buttons.push(new Button("Gorge Map", 13, 0.5388743455497383, 0.7811518324607329));
    buttons.push(new Button("Scriptorium Map", 13, .4261963350785337, 0.631413612565445));
    buttons.push(new Button("Plaza Map", 13, 0.3863219895287953, 0.6397905759162303));
    buttons.push(new Button("High Gardens Map", 13, 0.3221204188481667, 0.4869109947643979));
    buttons.push(new Button("Waterways Map", 13, 0.37159685863874287, 0.4167539267015707));    
    buttons.push(new Button("Beacon Map", 13, 0.6974947643979067, 0.5109476439790576));
    buttons.push(new Button("Sulphur Wastes Map", 13, 0.6294031413612571, 0.46810994764397906));
    buttons.push(new Button("Lair Map", 13, 0.6299921465968592, 0.6491675392670158));
    
    // T14
    buttons.push(new Button("Palace Map", 14, 0.3674738219895282, 0.47010994764397906));
    buttons.push(new Button("Maze Map", 14, 0.40045811518324564, 0.556020942408377));
    buttons.push(new Button("Springs Map", 14, 0.42248429319371694, 0.39467015706806285));
    buttons.push(new Button("Volcano Map", 14, 0.6292251308900529, 0.5486910994764398));
    buttons.push(new Button("Mineral Pools Map", 14, 0.5954188481675396, 0.581151832460733));    
    buttons.push(new Button("Shrine Map", 14, 0.5376963350785342, 0.7319371727748691));
    
    // T15
    buttons.push(new Button("Colosseum Map", 15, 0.43579842931937146, 0.5455497382198953));
    buttons.push(new Button("Dark Forest Map", 15, 0.408704188481675, 0.4544502617801047));
    buttons.push(new Button("Abyss Map", 15, 0.5783376963350789, 0.6596387434554973));
    buttons.push(new Button("Overgrown Ruin Map", 15, 0.4589476439790574, 0.35906806282722514));
    buttons.push(new Button("Core Map", 15, 0.5960078534031418, 0.44597905759162304));    
    
    // T16
    buttons.push(new Button("Pit of the Chimera Map", 16, 0.4611256544502616, 0.5905759162303665));
    buttons.push(new Button("Maze of the Minotaur Map", 16, 0.554777486910995, 0.5916230366492147));
    buttons.push(new Button("Forge of the Phoenix Map", 16, 0.5545994764397908, 0.4198952879581152));
    buttons.push(new Button("Lair of the Hydra Map", 16, 0.4587696335078532, 0.4157068062827225));
    buttons.push(new Button("Vaal Temple Map", 16, 0.3611727748691093, 0.5329371727748691)); 
	// T17
    buttons.push(new Button("The Shaper's Realm", 17, 0.507509214659686, 0.4999476439790576));
}

function save(){
    localStorage.setItem("buttons", JSON.stringify(buttons));
}

// Mouse functions
function addEvent(obj, evt, fn) {
    if (obj.addEventListener) {
        obj.addEventListener(evt, fn, false);
    }
    else if (obj.attachEvent) {
        obj.attachEvent("on" + evt, fn);
    }
}

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
    if (delta){ 
        zoom(delta)
        return evt.preventDefault() && false;
    }
};

canvas.addEventListener('mousemove', function(evt){
    mouseX = evt.clientX;
    mouseY = evt.clientY;
    var mX = context.transformedPoint(mouseX, 0).x;
    var mY = context.transformedPoint(0, mouseY).y;
    var hover = false;
    for (i = 0; i < buttons.length; i++){
        if (buttons[i].isPressed(mX, mY)){
            shouldDraw = true;
            document.body.style.cursor = "pointer";
            hover = true;
        }
    }
    if (!hover){
        document.body.style.cursor = "default";
    }
    lastX = evt.offsetX;
    lastY = evt.offsetY;
    if (dragStart){
        var pt = context.transformedPoint(lastX, lastY);
        context.translate(pt.x - dragStart.x, pt.y - dragStart.y);
    }
});

canvas.addEventListener('mousedown', function(evt){
    lastX = evt.offsetX;
    lastY = evt.offsetY;
    isPressed = true;
    if ($(this).css('cursor') == "default"){
        dragStart = context.transformedPoint(lastX, lastY);
    }
});

canvas.addEventListener('mouseup', function(evt){
    dragStart = null;
    isPressed = false;
    shouldDraw = true;
    reset();
});

addEvent(document, "mouseout", function(e) {
    e = e ? e : window.event;
    var from = e.relatedTarget || e.toElement;
    if (!from || from.nodeName == "HTML") {
        dragStart = null;
        isPressed = false;
    }
});

addEvent(document, "click", function(e){
    if (!dragStart){
        var mX = context.transformedPoint(mouseX, 0).x;
        var mY = context.transformedPoint(0, mouseY).y;
        for (i = 0; i < buttons.length; i++){
            if (buttons[i].isPressed(mX, mY)){
                if(buttons[i].completed){
                    buttons[i].completed = false;
                    if(!buttons[i].selected){
                        removeInstance(i, selectedButtons);
                    }
                }
                else{
                    buttons[i].completed = true;
                    addInstance(i, selectedButtons);
                }
            }
        }
    }
    draw();
});

addEvent(document, "keydown" || "keypressed", function(e){
    checkButtons();
    draw();
    shouldDraw = true;
    isKeyPressed = true;
});


addEvent(document, "keyup", function(e){
    checkButtons();
    draw();
    shouldDraw = true;
    isKeyPressed = false;
});

canvas.addEventListener('DOMMouseScroll', handleScroll, false);
canvas.addEventListener('mousewheel', handleScroll, false);

window.onload = function () {
    setCanvas();
    
    trackTransforms(context);
    loadButtons();
    
    draw();
};
    

