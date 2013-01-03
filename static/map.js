// Global variables
var ctx,
    tooltips = [],
    activetooltip = {id:-1,pos:null},
    disablemovecheck = false,
    chatbox,
    playerlist,
    areatip,
    infotip,
    timetip,
    tooltip,
    canvasRight,
    canvasBottom,
    show;

$.cookie.json = true;

function Vector2D(x, y) {
    if (!(this instanceof Vector2D))
        return new Vector2D(x, y);
    if (typeof x == "undefined")
        x = 0;
    else if (typeof y == "undefined")
        y = 0;
    this.x = x;
    this.y = y;
    return this;
}

Vector2D.prototype.imgcoords = function() {
    return Vector2D(Math.round((this.x*1.023/4+512)*0.75), Math.round((-this.y*1.023/4+512)*0.75));
}

Vector2D.prototype.gamecoords = function() {
    return Vector2D((this.x-384)/384*2048, -(this.y-384)/384*2048);
}

Vector2D.prototype.distance = function(x, y) {
    if (x instanceof Vector2D) {
        x=x.x;
        y=x.y;
    }
    return Math.sqrt(Math.pow(this.x-x, 2)+Math.pow(this.y-y, 2));
}

Vector2D.prototype.toString = function() {
    return "("+this.x+";"+this.y+")";
}

Vector2D.prototype.inarea = function(minpos, maxpos) {
    return minpos.x <= this.x && minpos.y <= this.y && maxpos.x >= this.x && maxpos.y >= this.y;
}

Vector2D.prototype.dot = function(radius, color) {
    var vec = this.imgcoords();
    if (typeof color == "undefined" || !color)
        color = "red";
    ctx.fillStyle=color;
    ctx.strokeStyle="black";
    ctx.beginPath();
    ctx.arc(vec.x, vec.y, radius, 0, Math.PI*2, true);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

Vector2D.prototype.line = function(vece, color, width) {
    var vec = this.imgcoords();
    vece = vece.imgcoords();
    if (typeof color == "undefined" || !color)
        color = "red";
    if (typeof width == "undefined" || !width)
        width = 3;
    ctx.strokeStyle=color;
    ctx.beginPath();
    ctx.moveTo(vec.x, vec.y);
    ctx.lineTo(vece.x, vece.y);
    ctx.closePath();
    ctx.lineWidth = width;
    ctx.stroke();
}

Vector2D.prototype.polygon = function(a, n, color) {
    var vec = this.imgcoords();
    if (typeof color == "undefined" || !color)
        color = "red";
    var tangle = Math.PI*2/n;
    var angle = (tangle+Math.PI)/2;
    var x = a/2/Math.sin(tangle/2);
    ctx.fillStyle = color;
    ctx.strokeStyle = "red";
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle)*x+vec.x, Math.sin(angle)*x+vec.y);
    for(var i=1;i<n;i++){
        angle += tangle;
        ctx.lineTo(Math.cos(angle)*x+vec.x, Math.sin(angle)*x+vec.y);
    }
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

Vector2D.prototype.star = function(a, n, color) {
    var vec = this.imgcoords();
    if (typeof color == "undefined" || !color)
        color = "red";
    var tangle = Math.PI*4/n;
    var angle = (tangle/2+Math.PI)/2;
    var x = a/2/Math.sin(tangle/2);
    ctx.strokeStyle = "red";
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(Math.cos(angle)*x+vec.x, Math.sin(angle)*x+vec.y);
    for (var i=1;i<n;i++) {
        angle += tangle;
        ctx.lineTo(Math.cos(angle)*x+vec.x, Math.sin(angle)*x+vec.y);
    }
    ctx.closePath();
    ctx.stroke();
    ctx.fill();
}

Vector2D.prototype.rect = function(vece, color) {
    var vec = this.imgcoords();
    vece = vece.imgcoords();
    if (typeof color == "undefined" || !color)
        color = "rgba(0, 255, 255, 0.5)";
    ctx.fillStyle = color;
    ctx.fillRect(vec.x, vec.y, vece.x-vec.x, vece.y-vec.y);
}

Vector2D.prototype.tooltip = function(a, isradius, text, key) {
    var vec = this.imgcoords();
    if (!isradius)
        a /= 2;
    if (typeof key != "undefined")
        tooltips[key] = {position:vec, a:a, rad:isradius, text:text}
    else
        tooltips.push({position:vec, a:a, rad:isradius, text:text});
}

// Info variables
var mapzones = [
    {vstart:Vector2D(-1613.03, 413.128), vend:Vector2D(-213.73, 1677.32), name:"Downtown", color: [0, 254, 127]},
    {vstart:Vector2D(163.656, -351.153), vend:Vector2D(1246.03, 1398.85), name:"Vice Point", color: [127, 254, 0]},
    {vstart:Vector2D(-103.97, -930.526), vend:Vector2D(1246.03, -351.153), name:"Washington Beach", color: [127, 254, 127]},
    {vstart:Vector2D(-253.206, -1805.37), vend:Vector2D(1254.9, -930.526), name:"Ocean Beach", color: [0, 254, 254]},
    {vstart:Vector2D(-1888.21, -1779.61), vend:Vector2D(-1208.21, 230.39), name:"Escobar International",color: [0, 0, 254]},
    {vstart:Vector2D(-748.206, -818.266), vend:Vector2D(-104.505, -241.467), name:"Starfish Island", color: [127, 127, 0]},
    {vstart:Vector2D(-213.73, 797.605), vend:Vector2D(163.656, 1243.47), name:"Prawn Island", color: [127, 0, 0]},
    {vstart:Vector2D(-213.73, -241.429), vend:Vector2D(163.656, 797.605), name:"Leaf Links", color: [254, 254, 0]},
    {vstart:Vector2D(-1396.76, -42.9113), vend:Vector2D(-1208.21, 230.39), name:"Junk Yard", color: [127, 127, 254]},
    {vstart:Vector2D(-1208.21, -1779.61), vend:Vector2D(-253.206, -898.738), name:"Viceport", color: [127, 254, 254]},
    {vstart:Vector2D(-1208.21, -898.738), vend:Vector2D(-748.206, -241.467), name:"Little Havana", color: [254, 254, 127]},
    {vstart:Vector2D(-1208.21, -241.467), vend:Vector2D(-578.289, 412.66), name:"Little Haiti", color: [254, 127, 254]}
]
var weaponmodels = {0:"Unarmed",1:"Brass Knuckles",2:"Screwdriver",3:"Golf Club",4:"Nightstick",5:"Knife",6:"Baseball Bat",7:"Hammer",8:"Meat Cleaver",9:"Machete",10:"Katana",11:"Chainsaw",12:"Grenade",13:"Remote Detonation Grenade",14:"Tear Gas",15:"Molotov Cocktails",16:"Rocket",17:"Colt45",18:"Python",19:"Shotgun",20:"SPAZ Shotgun",21:"Stubby Shotgun",22:"Tec9",23:"Uzi",24:"Silenced Ingram",25:"MP5",26:"M4",27:"Ruger",28:"Sniper Rifle",29:"Laser Sniper Rifle",30:"Rocket Launcher",31:"Flame Thrower",32:"M60",33:"Minigun",42:"Drive-By",43:"Drowned",60:"Heli Blade",255:"Suicide"}
var skins = {0:"Tommy Vercetti",1:"Cop",2:"Swat",3:"FBI",4:"Army",5:"Paramedic",6:"Fireman",7:"Golf guy #1",9:"Bum lady #1",10:"Bum lady #2",11:"Punk #1",12:"Lawyer",13:"Spanish lady #1",14:"Spanish lady #2",15:"Cool guy #1",16:"Arabic guy",17:"Beach lady #1",18:"Beach lady #2",19:"Beach guy #1",20:"Beach guy #2",21:"Office lady #1",22:"Waitress #1",23:"Food lady",24:"Prostitue #1",25:"Bum lady #2",26:"Bum guy #1",27:"Garbageman #1",28:"Taxi driver #1",29:"Hatian #1",30:"Criminal #1",31:"Hood lady",32:"Granny #1",33:"Business man #1",34:"Church guy",35:"Club lady",36:"Church lady",37:"Pimp",38:"Beach lady #3",39:"Beach guy #3",40:"Beach lady #4",41:"Beach guy #4",42:"Business man #2",43:"Prostitute #2",44:"Bum lady #3",45:"Bum guy #2",46:"Hatian #2",47:"Construction worker #1",48:"Punk #2",49:"Prostitute #2",50:"Granny #2",51:"Punk #3",52:"Business man #3",53:"Spanish lady #3",54:"Spanish lady #4",55:"Cool guy #2",56:"Business man #4",57:"Beach lady #5",58:"Beach guy #5",59:"Beach lady #6",60:"Beach guy #6",61:"Construction worker #2",62:"Golf guy #2",63:"Golf lady",64:"Golf guy #3",65:"Beach lady #7",66:"Beach guy #7",67:"Office lady #2",68:"Business man #5",69:"Business man #6",70:"Prostitute #2",71:"Bum lady #4",72:"Bum guy #3",73:"Spanish guy",74:"Taxi driver #2",75:"Gym lady",76:"Gym guy",77:"Skate lady",78:"Skate guy",79:"Shopper #1",80:"Shopper #2",81:"Tourist #1",82:"Tourist #2",83:"Cuban #1",84:"Cuban #2",85:"Hatian #3",86:"Hatian #4",87:"Shark #1",88:"Shark #2",89:"Diaz guy #1",90:"Diaz guy #2",91:"DBP security #1",92:"DBP security #2",93:"Biker #1",94:"Biker #2",95:"Vercetti guy #1",96:"Vercetti guy #2",97:"Undercover cop #1",98:"Undercover cop #2",99:"Undercover cop #3",100:"Undercover cop #4",101:"Undercover cop #5",102:"Undercover cop #6",103:"Rich guy",104:"Cool guy #3",105:"Prostitute #3",106:"Prostitute #4",107:"Love Fist #1",108:"Ken Rosenberg",109:"Candy Suxx",110:"Hilary",111:"Love Fist #2",112:"Phil",113:"Rockstar guy",114:"Sonny",115:"Lance",116:"Mercades",117:"Love Fist #3",118:"Alex Srub",119:"Lance (Cop)",120:"Lance",121:"Cortez",122:"Love Fist #3",123:"Columbian guy #1",124:"Hilary (Robber)",125:"Mercades",126:"Cam",127:"Cam (Robber)",128:"Phil (One arm)",129:"Phil (Robber)",130:"Cool guy #4",131:"Pizzaman",132:"Taxi driver #1",133:"Taxi driver #2",134:"Sailor #1",135:"Sailor #2",136:"Sailor #3",137:"Chef",138:"Criminal #2",139:"French guy",140:"Garbageman #2",141:"Hatian #5",142:"Waitress #2",143:"Sonny guy #1",144:"Sonny guy #2",145:"Sonny guy #3",146:"Columbian guy #2",147:"Thug #1",148:"Beach guy #8",149:"Garbageman #3",150:"Garbageman #4",151:"Garbageman #5",152:"Tranny",153:"Thug #5",154:"SpandEx guy #1",155:"SpandEx guy #2",156:"Stripper #1",157:"Stripper #2",158:"Stripper #3",159:"Store clerk"}
var weathers = {0:"Partly cloudy",1:"Overcast cloudy skies",2:"Lightning",3:"Fog with low visibility",4:"Clear skies",5:"Rain",6:"Darkness from the eclipse",7:"Light sky, partly cloudy",8:"Overcast partly cloudy",9:"Grey sky, black clouds"}
var bodyparts = {0:"Body",1:"Torso",2:"Left Arm",3:"Right Arm",4:"Left Leg",5:"Right Leg",6:"Head"}
var vehiclemodels = {130:"Landstalker",131:"Idaho",132:"Stinger",133:"Linerunner",134:"Perennial",135:"Sentinel",136:"Rio",137:"Firetruck",138:"Trashmaster",139:"Stretch",140:"Manana",141:"Infernus",142:"Voodoo",143:"Pony",144:"Mule",145:"Cheetah",146:"Ambulance",147:"FBI Washington",148:"Moonbeam",149:"Esperanto",150:"Taxi",151:"Washington",152:"Bobcat",153:"Mr Whoopee",154:"BF Injection",155:"Hunter",156:"Police",157:"Enforcer",158:"Securicar",159:"Banshee",160:"Predator",161:"Bus",162:"Rhino",163:"Barracks",164:"Cuban Hermes",165:"Helicopter",166:"Angel",167:"Coach",168:"Cabbie",169:"Stallion",170:"Rumpo",171:"RC Bandit",172:"Romero's Hearse",173:"Packer",174:"Sentinel XS",175:"Admiral",176:"Squalo",177:"Sea Sparrow",178:"Pizza Boy",179:"Gang Burrito",180:"airtrain",181:"deaddodo",182:"Speeder",183:"Reefer",184:"Tropic",185:"Flatbed",186:"Yankee",187:"Caddy",188:"Zebra Cab",189:"Top Fun",190:"Skimmer",191:"PCJ 600",192:"Faggio",193:"Freeway",194:"RC Baron",195:"RC Raider",196:"Glendale",197:"Oceanic",198:"Sanchez",199:"Sparrow",200:"Patriot",201:"Love Fist",202:"Coast Guard",203:"Dinghy",204:"Hermes",205:"Sabre",206:"Sabre Turbo",207:"Phoenix",208:"Walton",209:"Regina",210:"Comet",211:"Deluxo",212:"Burrito",213:"Spand Express",214:"Marquis",215:"Baggage Handler",216:"Kaufman Cab",217:"Maverick",218:"VCN Maverick",219:"Rancher",220:"FBI Rancher",221:"Virgo",222:"Greenwood",223:"Cuban Jetmax",224:"Hotring Racer 1",225:"Sandking",226:"Blista Compact",227:"Police Maverick",228:"Benson",229:"Boxville",230:"Mesa Grande",231:"RC Goblin",232:"Hotring Racer 2",233:"Hotring Racer 3",234:"Bloodring Banger 1",235:"Bloodring Banger 2",236:"FBI Cheetah"}
var vehiclecolors = {0:[5,5,5],1:[245,245,245],2:[42,119,161],3:[132,4,16],4:[38,55,57],5:[134,68,110],6:[255,182,16],7:[76,117,183],8:[189,190,198],9:[94,112,114],10:[49,0,0],11:[90,33,36],12:[132,4,16],13:[99,50,46],14:[181,20,0],15:[138,58,66],16:[100,13,26],17:[139,60,68],18:[158,47,43],19:[163,58,47],20:[210,86,51],21:[146,86,53],22:[184,124,38],23:[211,87,51],24:[226,90,89],25:[119,42,37],26:[225,119,67],27:[196,70,54],28:[225,120,68],29:[195,89,56],30:[70,72,64],31:[116,119,97],32:[117,119,99],33:[145,138,61],34:[148,140,102],35:[255,156,16],36:[216,165,52],37:[201,189,125],38:[201,197,145],39:[212,200,78],40:[26,51,46],41:[36,47,43],42:[29,55,63],43:[60,74,59],44:[45,80,55],45:[82,105,82],46:[45,104,62],47:[124,162,130],48:[76,82,78],49:[86,119,91],50:[16,20,80],51:[72,94,132],52:[28,39,69],53:[28,55,111],54:[43,72,120],55:[71,92,131],56:[68,124,146],57:[61,103,171],58:[75,125,130],59:[128,176,183],60:[61,35,51],61:[28,41,72],62:[52,57,65],63:[64,69,76],64:[74,45,43],65:[86,62,51],66:[65,70,76],67:[103,39,49],68:[131,90,117],69:[134,133,135],70:[23,23,23],71:[46,46,46],72:[69,69,69],73:[92,92,92],74:[115,115,115],75:[138,138,138],76:[161,161,161],77:[184,184,184],78:[207,207,207],79:[222,223,231],80:[170,175,170],81:[106,115,107],82:[170,175,170],83:[187,190,181],84:[224,223,214],85:[106,111,112],86:[96,99,95],87:[106,115,107],88:[170,175,170],89:[187,190,181],90:[33,41,43],91:[52,56,66],92:[65,70,72],93:[78,89,96],94:[65,69,76]}
var teamcolors = {0:"#778898",1:"#ff8d13",2:"#c715ff",3:"#20b1aa",4:"#ffd720",5:"#dc143b",6:"#6395ec",7:"#ff1494",8:"#f4a361",9:"#ee82ef",10:"#8b4512",11:"#f0e78c",12:"#148a8a",13:"#14ff7f",14:"#566b30",15:"#191971",16:"#ffffff",255:"#ffffff"}
var partreasons = {0:"Timeout",1:"Quit",2:"Kicked",3:"Banned",4:"Crashed"}

var colors, str = "#", n;
for (var k in vehiclecolors) { // make string hex codes
    colors = vehiclecolors[k];
    str = "#";
    for (var i=0; i<3; i++) {
        n = colors[i];
        if (n < 16) str += "0";
        str += n.toString(16);
    }

    vehiclecolors[k] = str;
}

for (var k in mapzones) // convert color codes
    mapzones[k].color = "rgba(" + mapzones[k].color[0] + "," + mapzones[k].color[1] + "," + mapzones[k].color[2] + ",0.2)";

var tagsToReplace = {'&': '&amp;','<': '&lt;','>': '&gt;'}

function replaceTag(tag) {
    return tagsToReplace[tag] || tag;
}

function safe_tags_replace(str) {
    if (typeof str != "string") return "";
    return str.replace(/[&<>]/g, replaceTag);
}

function colored_name(nick, team) {
    return "<span style=\"color: " + (teamcolors[team] || teamcolors[255]) + "\">" + safe_tags_replace(nick) + "</span>";
}

function redraw(data) {
    if (typeof data == "undefined" || typeof data.players == "undefined") {
        if (typeof cachedata == "undefined")
            return;
        else
            data = cachedata;
    }
    else
        cachedata = data;

    var timestart = new Date().getTime();

    // Clear the canvas and the tooltip list
    ctx.clearRect(0, 0, 768, 768);
    if (show.areacol) {
        for (var k in mapzones) {
            mapzones[k].vstart.rect(mapzones[k].vend, mapzones[k].color);
        }
    }
    tooltips = [];

    // Draw player blips, list, tooltips
    if ((show.players || show.playerlist) && data.players.length > 0) {
        var plrstr = "", plr, str, playerspecs = [], tmpname, zone;

        data.players.sort(function(a,b) {
            return b.score - a.score;
        });

        if (show.players) {
            for (var i in data.players) {
                if (data.players[i].spectating == null) continue;
                tmpname = "<span style=\"color: lightgray\">" + safe_tags_replace(data.players[i].name) + "</span>";
                if (!playerspecs[data.players[i].spectating]) playerspecs[data.players[i].spectating] = tmpname;
                else playerspecs[data.players[i].spectating] += ", " + tmpname;
            }
        }

        for (var i in data.players) {
            plr = data.players[i];
            if (show.players && plr.spawned == true && plr.spectating == null && plr.pos.x && plr.pos.y) {
                str = "<strong>" + safe_tags_replace(plr.name) + "</strong> <span class=\"red\">[" + plr.id + "]</span>" + (plr.hp > 0 ? " - " + plr.hp + " HP" + (plr.ap > 0 ? " | " + plr.ap + " AP" : "") : "") + "<br />Skin: " + skins[plr.skin];
                if (plr.vehicle && vehiclemodels[plr.vehicle.model]) {
                    str += "<br />Vehicle: " + vehiclemodels[plr.vehicle.model] + " <span style=\"color: #000000;font-weight: bold\"><span style=\"background-color: " + vehiclecolors[plr.vehicle.color[0]] + "\">" + plr.vehicle.color[0] + "</span> <span style=\"background-color: " + vehiclecolors[plr.vehicle.color[1]] + "\">" + plr.vehicle.color[1] + "</span></span>";
                }
                if (plr.weapon > 0 && weaponmodels[plr.weapon]) {
                    str += "<br />Weapon: " + weaponmodels[plr.weapon];
                }
                if (plr.score >= 0 && plr.cash >= 0)
                    str += "<br />Score: " + plr.score + " - Cash: $" + plr.cash;
                if (playerspecs[plr.id])
                    str += "<br />Spectators: " + playerspecs[plr.id];

                for (var k in mapzones) {
                    zone = mapzones[k];
                    if (Vector2D(plr.pos.x, plr.pos.y).inarea(zone.vstart, zone.vend)) {
                        str += "<br />District: " + zone.name;
                        break;
                    }
                }
                Vector2D(plr.pos.x, plr.pos.y).dot(5, (teamcolors[plr.team] || teamcolors[255]));
                Vector2D(plr.pos.x, plr.pos.y).tooltip(5, true, str, plr.id);
            }
            if (show.playerlist) plrstr += "<tr><td class=\"id\">" + plr.id + "</td><td>" + colored_name(plr.name, plr.team) + "</td><td class=\"score\">" + plr.score + "</td><td class=\"ping\">" + plr.ping + "</td></tr>";
        }
        
        if (plrstr != "")
            playerlist.html("<b>Player list</b><br /><br /><table><thead><tr><th class=\"id\">id</th><th>name</th><th class=\"score\">score</th><th class=\"ping\">ping</th></tr></thead><tbody>" + plrstr + "</tbody></table>").show();
        else
            playerlist.html("").hide();
    }
    else
        playerlist.html("").hide();
    
    // Draw chatbox
    if (show.chat && data.messages.length > 0) {
        var msgstr = "", msg;
        for (var i in data.messages) {
            msg = data.messages[i];
            switch (msg.type) { // Events
                case 1: // join
                    msgstr += "<span class=\"join\">* " + colored_name(msg.name, msg.team) + " joined" + (msg.country ? " from <span class=\"skin\">" + msg.country + "</span>" : "") + ".</span>";
                    break;
                case 2: // part
                    msgstr += "<span class=\"part\">* " + colored_name(msg.name, msg.team) + " left. [" + (partreasons[msg.reason] || "Unknown") + "]</span>";
                    break;
                case 3: // spawn
                    msgstr += "<span class=\"spawn\">* " + colored_name(msg.name, msg.team) + " spawned as <span class=\"skin\">" + skins[msg.skin] + "</span></span>.";
                    break;
                case 4: // chat
                    msgstr += "<span class=\"chat\">" + colored_name(msg.name, msg.team) + ": " + safe_tags_replace(msg.msg) + "</span>";
                    break;
                case 5: // action
                    msgstr += "<span class=\"action\">** " + colored_name(msg.name, msg.team) + " " + safe_tags_replace(msg.msg) + "</span>";
                    break;
                case 6: // death
                    msgstr += "<span class=\"kill\">* " + colored_name(msg.name, msg.team) + " died. <span class=\"reason\">(" + (weaponmodels[msg.reason] || "Unknown") + ")</span></span>";
                    break;
                case 7: // kill
                    msgstr += "<span class=\"kill\">* " + colored_name(msg.name, msg.team) + " killed " + colored_name(msg.victim, msg.vteam) + ". <span class=\"reason\">(" + (weaponmodels[msg.reason] || "Unknown") + ")</span> <span class=\"reason\">(" + (bodyparts[msg.bodypart] || "Unknown") + ")</span></span>";
                    break;
                case 8: // teamkill
                    msgstr += "<span class=\"kill\">* " + colored_name(msg.name, msg.team) + " team-killed " + colored_name(msg.victim, msg.vteam) + ". <span class=\"reason\">(" + (weaponmodels[msg.reason] || "Unknown") + ")</span> <span class=\"reason\">(" + (bodyparts[msg.bodypart] || "Unknown") + ")</span></span>";
                    break;
                case 9: // teamchat
                    msgstr += "<span class=\"teamchat\">" + colored_name(msg.name, msg.team) + ": " + safe_tags_replace(msg.msg) + "</span>";
                    break;
                case 10: // custom
                    msgstr += "<span class=\"custom\">" + safe_tags_replace(msg.msg) + "</span>";
                    break;
            }
            msgstr += "<br />";
        }
        if (msgstr != "")
            chatbox.html(msgstr).show();
        else
            chatbox.html("").hide();
    }
    else
        chatbox.html("").hide();

    // Show last active tooltip if it exists
    showTooltip(activetooltip.id);
    
    // Update info tooltip
    if (show.info)
        infotip.text("Server: " + data.hostname + " | Players: " + data.numplayers + "/" + data.maxplayers);

    timestart = new Date().getTime() - timestart;

    // Update timing tooltip
    if (show.time)
        timetip.html("Time: <strong>" + (data.hour <= 9 ? "0" : "") + data.hour + ":" + (data.minute <= 9 ? "0" : "") + data.minute + "</strong><br />" + (weathers[data.weather] ? "Weather: <strong>" + weathers[data.weather] + "</strong><br />" : "") + "Rendered in <strong>"+timestart+"</strong> ms.").css('left', canvasRight - timetip.outerWidth());
}

$(function () {
    canvas = $("#drawarea")[0];

    // Setting canvas info for future use in playerlist/chatbox
    canvasBottom = canvas.offsetTop + canvas.height;
    canvasRight = canvas.offsetLeft + canvas.width;

    var plhtext = "Waiting for data...";
    tooltip = $("#tooltip");
    areatip = $("#areatip").text("Vice City");
    infotip = $("#infotip").text(plhtext);
    timetip = $("#timetip").text(plhtext);
    playerlist = $("#players");
    chatbox = $("#chatbox");
    ctx = canvas.getContext("2d");

    var setdiv = $("#showsettings");
    timetip.css('left', canvasRight - timetip.outerWidth());
    setdiv.css('left', canvasRight - setdiv.outerWidth()).show();

    $('#drawarea').click(function () {
        if (tooltip.css("display") == "block") disablemovecheck = !disablemovecheck;
    });

    $(window).mousemove(function (e) {
        var x = e.pageX-canvas.offsetLeft,
            y = e.pageY-canvas.offsetTop;
        if (x < 0 || y < 0 || x >= canvas.width || y >=canvas.height)
            showTooltip();
        else {
            // Area tooltip
            var area = "Vice City", zone;
            var gamepos = Vector2D(x, y).gamecoords();
            for(var k in mapzones){
                zone = mapzones[k];
                if(gamepos.inarea(zone.vstart, zone.vend)){
                    area = zone.name;
                    break;
                }
            }
            areatip.text(area);
            // Blip tooltip
            if (disablemovecheck) return;
            var tid = -1, tclosest = 0, smallest = 0, tt, c, dist, a, pos, size;
            for (var i in tooltips) {
                tt = tooltips[i];
                c = false;
                if(tt.rad){
                    if(tt.position.distance(x, y) <= tt.a){
                        c = true;
                    }
                } else {
                    a = tt.a;
                    pos=tt.position;
                    if((pos.x-a) <= x&&(pos.x+a) >= x&&(pos.y-a) <= y&&(pos.y+a) >= y){
                        c = true;
                    }
                }
                if(c){
                    dist = tt.position.distance(x, y);
                    size = tt.a;
                    if(!tt.rad)size *= 2;
                    if(tid == -1||dist < tclosest||(dist == tclosest&&size < smallest)){
                        tid = i;
                        tclosest = dist;
                        smallest = size;
                    }
                }
            }
            showTooltip(tid);
        }
    });

    $(window).bind('mouseout', function () {
        if (!disablemovecheck) showTooltip();
    });
    
    setdiv.find('input[type="checkbox"]').click(function () {
        updateSettings(false);
    });

    updateSettings(true);
    update();
});

function showTooltip(tid) {
    if (typeof tid == "undefined" || tid == -1 || !tooltips[tid]) {
        if (disablemovecheck == true) disablemovecheck = false;
        activetooltip = {id:-1,pos:null}
        tooltip.hide();
        return;
    }
    var pos = tooltips[tid].position;
    activetooltip.id = tid;
    activetooltip.pos = pos;
    tooltip.html(tooltips[tid].text).css('left', pos.x+8).css('top', pos.y+8).show();
}

function updateSettings(load) {
    if (load) {
        show = $.cookie('showsettings');
        if (typeof show == "undefined" || !show || show.length == 0) return updateSettings(false);
        var setting;
        for (var k in show) {
            setting = show[k];
            if (setting) $("#show" + k).attr("checked", "checked");
            else $("#show" + k).removeAttr("checked");
        }
    }
    show = {
        players:$("#showplayers").attr("checked")||false,
        playerlist:$("#showplayerlist").attr("checked")||false,
        chat:$("#showchat").attr("checked")||false,
        info:$("#showinfo").attr("checked")||false,
        area:$("#showarea").attr("checked")||false,
        time:$("#showtime").attr("checked")||false,
        areacol:$("#showareacol").attr("checked")||false
    }
    if (!load)
        $.cookie('showsettings', show, {expires: 30});
    if (!show.info) infotip.hide();
    else infotip.show();
    if (!show.area) areatip.hide();
    else areatip.show();
    if (!show.time) timetip.hide();
    else timetip.show();
    redraw();
}

function update() {
    $.getJSON(config.updatefile, redraw);
    window.setTimeout(update, config.updaterate);
}
