// ==UserScript==
// @name           4chan Sound Player
// @namespace      ms11
// @description    Allows to play the posted sounds on 4chan (based on Triangle's 4chan Sound Script dev)
// @include        http://boards.4chan.org/*
// @include        https://boards.4chan.org/*
// @include        http://archive.foolz.us/*
// @include        https://archive.foolz.us/*
// @version        0.62
// @updateURL      https://raw.github.com/ms11/4chanSoundPlayer/master/4chanSP.user.js
// ==/UserScript==

var chrome = (navigator.userAgent+'').indexOf(' Chrome/') != -1;
var archive = (document.location+'').indexOf('boards.4chan.org') == -1;

function insertAfter(referenceNode, newNode)
{
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function byClass(items, cl)
{
	for (var i = 0; i < items.length; i++)
	{
		if (items[i].classList.contains(cl))
		{
			return items[i];
		}
	}
	return null;
}

function s2ab(text)
{
	var foo = new ArrayBuffer(text.length);
	var bar = new Uint8Array(foo);
	for (var a = 0; a < text.length; a++)
	{
		bar[a] = text.charCodeAt(a);
	}
	return foo;
}

function getPostID(o)
{
	var o = o.getAttribute('id');
	if (!archive)
	{
		o = o.substr(1);
	}
	return parseInt(o);
}
function create(type, parent, attributes)
{
    var element = document.createElement(type);
    for (var attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}
function sectos(sec) {
	var m = Math.floor(sec/60);
	var s = +(sec-m*60);
	return m+(s<10?":0":":")+s;
}
String.prototype.replaceAll = function(replaceTo,replaceWith) {
	return this.replace(new RegExp(replaceTo,'g'),replaceWith);
};

function toUInt32(data,offset){
	return (data[offset] | data[offset + 1] << 8 | data[offset + 2] << 16 | data[offset + 3] << 24);
}
function toUInt16(data,offset){
	return data[offset] | data[offset + 1] << 8;
}
function get_chrome(url, callback, userState)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		if (this.status == 200)	{
			callback(this.response,userState);
			//callback(findOggWithFooter(this.response, link.tag), link);
		}
	};
	xhr.send();
}
//modified to be able to pass thumbnail link
function get_grease(url, callback, userState) {
	GM_xmlhttpRequest({
		method: "GET",
		url: url,
		overrideMimeType: 'text/plain; charset=x-user-defined',
		onload: function(e)
		{
			if (e.status == 200)
			{
				var text = e.responseText;
				var foo = s2ab(text);
				callback(foo,userState);
				//callback(findOggWithFooter(foo, link.tag), link);
			}
		}
	});
}
var xmlhttp = chrome ? get_chrome:get_grease;
function loadAll(file) {
	if(!file.type){
		xmlhttp(file,function(data) {
			loadAllWithFooter(data);
		});
	}else{
		var reader = new FileReader();
		reader.onload = function() {
		loadAllWithFooter(reader.result);
		};
		reader.readAsArrayBuffer(file);
	}
}

function loadAllWithFooter(raw) {
		var data = new Uint8Array(raw);
		var footU = s2ab('4SPF');
		var foot8 = new Uint8Array(footU);
		var match = true;
		for(var i = 0; i < 4 ;i++){
			if(foot8[i] != data[data.length-4+i])
				match = false;
		}
		if(match) {
			var tags=[];
			var fstart = data.length - 6 - toUInt16(data,data.length-6);
			for(var i = fstart;i < data.length-6;){
				var taglen = data[i];
				i++;
				var tag = ""
				for(var j = 0; j < taglen;j++){
					tag += String.fromCharCode(data[i+j]);
				}
				i+=taglen;
				var start = toUInt32(data,i);
				i+=4;
				var end = toUInt32(data,i);
				i+=4;
				tags.push({tag:tag,start:start,end:end});
			}
			for(var i = 0; i < tags.length;i++){
				addMusic({data:raw.slice(tags[i].start,tags[i].end),tag:tags[i].tag},tags[i].tag);
			}
		}else{
			loadAllFromLocal(raw);
		}
}
function loadAllFromLocal(raw) {
	var oggU = s2ab('OggSxx');
	var ogg8 = new Uint8Array(oggU);
	ogg8[4] = 0;
	ogg8[5] = 2;
	var data = new Uint8Array(raw);
	var sounds = [];
	var cont = true;
	var oldptr = 0;
	do{
		var ptr = 0;
		for (var i = oldptr; i < data.byteLength - 10; i++)
		{
			var match = true;
			for (var j = 0; j < ogg8.byteLength; j++)
			{
				if (data[i+j] != ogg8[j])
				{
					match = false;
					break;
				}
			}
			if (match)
			{
				ptr = i;
				break;
			}
		}
		if (ptr > oldptr)
		{
			var ofs = [-1,-1];
			var find = s2ab('[]');
			var fin8 = new Uint8Array(find);
			for (var j = ptr; j > ptr - 100; j--)
			{
				if (data[j] == fin8[0] && ofs[1] > 0)
				{
					ofs[0] = j+1;
					break;
				}
				else if (data[j] == fin8[1] && ofs[0] < 0)
				{
					ofs[1] = j-1;
				}
			}
			if (ofs[0] > 0 && ofs[1] > 0)
			{
				var tag = '';
				for (var j = ofs[0]; j <= ofs[1]; j++)
				{
					tag += String.fromCharCode(data[j]);
				}
				sounds.push({data: null,start:ptr,tag: tag});
				if(sounds.length > 1) {
					var id = sounds.length-2;
					sounds[id].data = raw.slice(sounds[id].start,ptr - sounds[id].tag.length);
				}
			}
			oldptr = ptr;
		}else{
			cont = false;
		}
	}while(cont);
	if(sounds.length > 0) {
		var id = sounds.length-1;
		sounds[id].data = raw.slice(sounds[id].start);
	}
	for(var i = 0; i < sounds.length;i++){
		var tag = sounds[i].tag;
		addMusic({data:sounds[i].data,tag:tag},tag);
	}
}
function findOggWithFooter(raw,tag) {
	var timer = new Date().getTime();
	var tagU = s2ab(tag);
	var tag8 = new Uint8Array(tagU);
	var data = new Uint8Array(raw);
	var footU = s2ab('4SPF');
	var foot8 = new Uint8Array(footU);
	var match = true;
	for(var i = 0; i < 4 ;i++){
		if(foot8[i] != data[data.length-4+i])
			match = false;
	}
	//x y 4 S P F
	//6 5 4 3 2 1
	if(match){
		var fstart = data.length - toUInt16(data,data.length-6);
		//alert(fstart);
		for(var i = fstart; i < data.length; i++){
			var tagmatch = true;
			for (var j = 0; j < tag8.byteLength; j++)
			{
				if (data[i+j] != tag8[j])
				{
					tagmatch = false;
					break;
				}
			}
			if (!tagmatch)
			{
				continue;
			}
			i += tagU.byteLength;
			var start = toUInt32(data,i);
			i += 4;
			var end = toUInt32(data,i);
			//alert(tag + '|' + start + '|' + end);
			console.log(timer-new Date().getTime());
			return raw.slice(start,end);
		}
	}else
		return findOgg(raw,tag);
}
function findOgg(raw, tag)
{
	var timer = new Date().getTime();
	var tagU = s2ab('[' + tag + ']');
	var skip = s2ab(' "\r\n');
	var oggU = s2ab('OggSxx');
	var tag8 = new Uint8Array(tagU);
	var skp8 = new Uint8Array(skip);
	var ogg8 = new Uint8Array(oggU);
	ogg8[4] = 0;
	ogg8[5] = 2;
	var data = new Uint8Array(raw);
	var eof = skp8.byteLength + 12;
	var ptr = -1;
	
	// keep comparing data to [tag] until match
	for (var i = 0; i < data.byteLength - eof; i++)
	{
		var match = true;
		// match the tag and brackets
		for (var j = 0; j < tag8.byteLength; j++)
		{
			if (data[i+j] != tag8[j])
			{
				match = false;
				break;
			}
		}
		if (!match)
		{
			continue;
		}
		i += tagU.byteLength;
		// skip whitespace and newline
		for (var j = 0; j < skp8.byteLength; j++)
		{
			if (data[i] == skp8[j])
			{
				j = -1;
				i++;
			}
		}
		// match against ogg header
		for (var j = 0; j < ogg8.byteLength; j++)
		{
			if (data[i+j] != ogg8[j])
			{
				match = false;
				break;
			}
		}
		if (!match)
		{
			continue;
		}
		ptr = i;
		break;
	}
	if (ptr < 0)
	{
		// matching against tag failed, try just the ogg header
		for (var i = 0; i < data.byteLength - eof; i++)
		{
			var match = true;
			for (var j = 0; j < ogg8.byteLength; j++)
			{
				if (data[i+j] != ogg8[j])
				{
					match = false;
					break;
				}
			}
			if (match)
			{
				ptr = i;
				break;
			}
		}
		if (ptr > 0)
		{
			var ofs = [-1,-1];
			var find = s2ab('[]');
			var fin8 = new Uint8Array(find);
			for (var j = ptr; j > ptr - 100; j--)
			{
				if (data[j] == fin8[0] && ofs[1] > 0)
				{
					ofs[0] = j+1;
					break;
				}
				else if (data[j] == fin8[1] && ofs[0] < 0)
				{
					ofs[1] = j-1;
				}
			}
			if (ofs[0] > 0 && ofs[1] > 0)
			{
				var newtag = '';
				for (var j = ofs[0]; j <= ofs[1]; j++)
				{
					newtag += String.fromCharCode(data[j]);
				}
				tag = newtag;
			}
		}
	}
	if (ptr > 0)
	{
		//find next ogg header
		//ogg8
		var end = -1;
		for (var i = (ptr+1); i < data.byteLength - eof; i++)
		{
			var match = true;
			for (var j = 0; j < ogg8.byteLength; j++)
			{
				if (data[i+j] != ogg8[j])
				{
					match = false;
					break;
				}
			}
			if (match) //find the tag before
			{
				var ofs = [-1,-1];
				var find = s2ab('[]');
				var fin8 = new Uint8Array(find);
				for (var j = i; j > i - 100; j--)
				{
					if (data[j] == fin8[0] && ofs[1] > 0)
					{
						ofs[0] = j + 1;
						break;
					}
					else if (data[j] == fin8[1] && ofs[0] < 0)
					{
						ofs[1] = j - 1;
					}
				}
				if(ofs[0] > 0) {
					i = ofs[0];
				}
				
				
				end = i;
				break;
			}
		}
		console.log(timer-new Date().getTime());
		if(end>0)
		return {"data":raw.slice(ptr,end),"tag":tag};
		else
		return {"data":raw.slice(ptr,end),"tag":tag};
	}
}
function rehyperlink(target,second) {

	var links = target.getElementsByClassName('soundlink');
	if(links.length < 1) {
		if(second) return;
		else
		setTimeout(function() {rehyperlink(target, true); },200);
	}
	var post = target.getElementsByTagName(archive ? 'article':'blockquote')[0];
	var a = null;
	var p = null;
	if (!archive) {
		p = post;
		a = byClass(target.getElementsByTagName('a'), 'fileThumb');
		if (!a) return;
	}else{
		a = byClass(post.getElementsByTagName('a'), 'thread_image_link');
		p = byClass(post.getElementsByTagName('div'), 'text');		
		if (!a || !p) return;
	}
	for(var i = 0;i < links.length;i++){
		var link = links[i];
		link.realhref = a.href;
		link.tag = link.innerHTML.replace("[","").replace("]","");
		link.addEventListener('click', function(e) {
			e.preventDefault();
			this.innerHTML = '[loading]';
            xmlhttp(this.realhref, function(data,rlink) {   
				showPlayer();
				addMusic(findOggWithFooter(data, rlink.tag),rlink.tag,rlink.realhref);
				rlink.innerHTML = '[' + rlink.tag + ']';
			},this);
		});
	}
}
function hyperlinkone(target) {
	var postname = archive ? 'article':'blockquote';
	if(target.nodeName.toLowerCase() != postname) {
		var elems = target.getElementsByTagName(postname);
		for(var i = 0; i < elems.length; i++) {
			hyperlinkone(elems[i]);
		}
	}else{
		var repeat = true;
		while (repeat) {
			repeat = false;
			var a = null;
			var p = null;
			if (!archive) {
				p = target;
				a = byClass(target.parentNode.getElementsByTagName('a'), 'fileThumb');
				if (!a) continue;
			}else{
				a = byClass(target.getElementsByTagName('a'), 'thread_image_link');
				p = byClass(target.getElementsByTagName('div'), 'text');
				
				if (!a || !p) continue;
			}
			for (var j = 0; j < p.childNodes.length; j++) {
				var match = null;
				var node = p.childNodes[j];
				if (node.nodeType != 3) {
					if(node.className != "spoiler" && node.className != 'quote') {
						continue;
					}else{
						for(var k = 0; k < node.childNodes.length; k++) {
							
							var subnode = node.childNodes[k];
							if(subnode.nodeType != 3) {continue;}
							if (!(match = subnode.nodeValue.match(/(.*)\[([^\]]+)\](.*)/))) {
								continue;
							}
							repeat = true;
							var href = a.href;
							var code = match[2];
							var link = document.createElement('a');
							link.innerHTML = '[' + code + ']';
							link.className = 'soundlink';
							//link.href = href;
							link.href = "#";
							link.realhref = href;
							link.tag = code;
							link.addEventListener('click', function(e) {
								e.preventDefault();
								this.innerHTML = '[loading]';
								xmlhttp(link.realhref, function(data, rlink) {   
									showPlayer();
									addMusic(findOggWithFooter(data, rlink.tag),rlink.tag,rlink.realhref);
									rlink.innerHTML = '[' + rlink.tag + ']';
								},this);
							});
							subnode.nodeValue = match[1];
							insertAfter(subnode, link);
							var text = document.createTextNode(match[3]);
							insertAfter(link, text);
						}
					}
				}else{
					if (!(match = node.nodeValue.match(/(.*)\[([^\]]+)\](.*)/))) {
						continue;
					}
					repeat = true;
					var href = a.href;
					var code = match[2];
					var link = document.createElement('a');
					link.innerHTML = '[' + code + ']';
					link.className = 'soundlink';
	
					link.href = "#";
					link.realhref = href;
					link.tag = code;
					link.addEventListener('click', function(e) {
						e.preventDefault();
						this.innerHTML = '[loading]';
						xmlhttp(this.realhref, function(data, rlink) {   
							showPlayer();
							addMusic(findOggWithFooter(data, rlink.tag),rlink.tag,rlink.realhref);
							rlink.innerHTML = '[' + rlink.tag + ']';
						},this);
					});
					node.nodeValue = match[1];
					insertAfter(node, link);
					var text = document.createTextNode(match[3]);
					insertAfter(link, text);
				}
			}
		}
	}
}


function hyperlink() {
	var tmpDate = (new Date()).getTime();
	if (tmpDate < lastHyper + 2000) {
		return;
	}
	lastHyper = tmpDate;
	var newLastPost = null;
	var posts = archive? 'article':'blockquote';
	posts = document.getElementsByTagName(posts);
	newLastPost = getPostID(posts[posts.length-1]);
	if (newLastPost == lastPost) {
		return;
	}
	for (var i = 0; i < posts.length; i++) {
		// dom-insertion listener lags the fuck out on longer threads
		if (lastPost && getPostID(posts[i]) <= lastPost) {
			// fixed (somewhat)
			continue;
		}
		hyperlinkone(posts[i]);
	}
	lastPost = newLastPost;
}

var lastPost = null;	// last post that was hyperlink()ed
var lastHyper = 0;		// unixtime*1000 for last hyperlink()
var isPlayer = false;
var playerDiv = null;
var playerList = null;
var playerTitle = null;
var playerTime = null;
var playerPlayer = null;
var newWindow = null;
var playerCompact = false;
var playerCurrentDuration = 0;
var playerMovingListItem = null;
var playerSaveData = null;
var playerSettings = null;
var playerStyle = null;

var playerListItemMenu = null;
var playerVolume = null;
var playerCurrentVolume = null;
var playerSeekbar = null;
var playerSeekbarCurrent = null;

var playerUserStyle = null;
var playerDefault = {right:0,bottom:0,shuffle:0,repeat:0,volume:1,userCSS:""};
var playerSettingsHeader = null;
function fixFFbug() {
	if (!chrome && !playerPlayer.paused) { 
		// Workaround for Firefox bug #583444
		try { playerCurrentDuration = playerPlayer.buffered.end(0); }
		catch(ex) { playerCurrentDuration = 0; }
	}
}
function documentMouseDown(e) {
	if(playerListMenu.parentNode) {
		var parent = e.target.parentNode;
		var hide = false;
		do{
			if(parent == playerListMenu) {
				hide = false;
				break;
			}else if(parent == document.body) {
				hide = true;
				break;
			}else{
				parent = parent.parentNode;
			}
		}while(true);
		if(hide){
			playerListMenu.parentNode.removeChild(playerListMenu);
		}
	}
	if(playerListItemMenu.parentNode) {
		var parent = e.target.parentNode;
		var hide = false;
		do{
			if(parent == playerListItemMenu) {
				hide = false;
				break;
			}else if(parent == document.body) {
				hide = true;
				break;
			}else{
				parent = parent.parentNode;
			}
		}while(true);
		if(hide){
			playerListItemMenu.parentNode.removeChild(playerListItemMenu);
		}
	}
	if(e.target == playerTitle || e.target==playerTime || e.target==playerHeader){
		e.preventDefault();
		playerHeader.down = true;
		playerHeader.oldx = e.clientX;
		playerHeader.oldy = e.clientY;
	}else if(e.target == playerSettingsHeader){
		e.preventDefault();
		playerSettingsHeader.down = true;
		playerSettingsHeader.oldx = e.clientX;
		playerSettingsHeader.oldy = e.clientY;
	}else if(e.target == playerCurrentVolume && !playerPlayer.error) {
		e.preventDefault();
		playerCurrentVolume.down = true;
		playerCurrentVolume.oldx = e.clientX;
	}else if(e.target == playerSeekbarCurrent && !playerPlayer.error) {
		e.preventDefault();
		playerSeekbarCurrent.down = true;
		playerSeekbarCurrent.oldx = e.clientX;
	}
}
function documentMouseUp(e) {
	if(playerHeader.down){
		e.preventDefault();
		playerHeader.down = false;
		putInsidePage();
	}
	if(playerSettingsHeader.down) {
		e.preventDefault();
		playerSettingsHeader.down = false;
	}
	if(playerCurrentVolume.down) {
		e.preventDefault();
		playerCurrentVolume.down = false;
	}
	if(playerSeekbarCurrent.down) {
		e.preventDefault();
		playerSeekbarCurrent.down = false;
		var cl = Number(playerSeekbarCurrent.style.left.replace("px",""));
		var max = Number(window.getComputedStyle(playerSeekbar).width.replace("px",""));
		var width = Number(window.getComputedStyle(playerSeekbarCurrent).width.replace("px",""));
		var n = cl/(max-width);
		if ((chrome?playerPlayer.duration:playerCurrentDuration) !== 0) {
					playerPlayer.currentTime = (chrome?playerPlayer.duration:playerCurrentDuration) * n;
		}		
	}
}
function documentMouseMove(e) {
	if(e.target == playerHeader || e.target == playerSettingsHeader){
		e.preventDefault();
	}
	if(playerHeader.down) {
		var cr = Number(playerDiv.style.right.replace("px",""));
		var cb = Number(playerDiv.style.bottom.replace("px",""));
		playerDiv.style.right = (cr + playerHeader.oldx - e.clientX) + "px";
		playerDiv.style.bottom = (cb + playerHeader.oldy - e.clientY) + "px";
		playerHeader.oldx = e.clientX;
		playerHeader.oldy = e.clientY;
	}
	if(playerSettingsHeader.down){
		var cr = Number(playerSettings.style.right.replace("px",""));
		var ct = Number(playerSettings.style.top.replace("px",""));
		playerSettings.style.right = (cr + (playerSettingsHeader.oldx - e.clientX)) + "px";
		playerSettings.style.top = (ct - (playerSettingsHeader.oldy - e.clientY)) + "px";
		playerSettingsHeader.oldx = e.clientX;
		playerSettingsHeader.oldy = e.clientY;
	}
	if(playerCurrentVolume.down) {
		var cl = Number(playerCurrentVolume.style.left.replace("px",""));
		var nl = (cl - (playerCurrentVolume.oldx - e.clientX));
		
		var max = Number(window.getComputedStyle(playerVolume).width.replace("px",""));
		var width = Number(window.getComputedStyle(playerCurrentVolume).width.replace("px",""));
		if(nl < 0 || nl > max-width) return;
		playerPlayer.volume = nl/(max-width);
		playerCurrentVolume.style.left = nl + "px";
		playerCurrentVolume.oldx = e.clientX;
	}
	
	if(playerSeekbarCurrent.down) {
		var cl = Number(playerSeekbarCurrent.style.left.replace("px",""));
		var nl = (cl - (playerSeekbarCurrent.oldx - e.clientX));
		
		var max = Number(window.getComputedStyle(playerSeekbar).width.replace("px",""));
		var width = Number(window.getComputedStyle(playerSeekbarCurrent).width.replace("px",""));
		if(nl < 0 || nl > max-width) return;
		playerSeekbarCurrent.style.left = nl + "px";
		playerSeekbarCurrent.oldx = e.clientX;
	}
}

function putInsidePage() {
	if(playerDiv.clientHeight + Number(playerDiv.style.bottom.replace("px","")) > window.innerHeight) {
		playerDiv.style.bottom = (window.innerHeight - playerDiv.clientHeight) + "px";
	}else if(Number(playerDiv.style.bottom.replace("px","")) < 0) {
		playerDiv.style.bottom = "0px";
	}
	if(playerDiv.clientWidth + Number(playerDiv.style.right.replace("px","")) > window.innerWidth) {
		playerDiv.style.right = (window.innerWidth - playerDiv.clientWidth) + "px";
	}else if(Number(playerDiv.style.right.replace("px","")) < 0) {
		playerDiv.style.right = "0px";
	}
}
function loadConf() {
	playerSaveData = JSON.parse(localStorage.getItem("4chanSP"));
	if(!playerSaveData) {
		playerSaveData = playerDefault;
	}else if(playerSaveData.css) {		
		playerSaveData.css = undefined;
		playerSaveData.saveVer = undefined;
	}
}


function showPlayer() {
	if(!isPlayer) {
		
		loadConf();
		playerDiv = create('div', undefined, {"id":"playerDiv","class":"playerWindow"});
		
		playerDiv.style.right = playerSaveData.right+'px';
		playerDiv.style.bottom = playerSaveData.bottom+'px';
		
		
		playerHeader = create('div', playerDiv, {"id": "playerHeader"});
		playerTitle = create('div', playerHeader, {"id": "playerTitle"});
		playerTime = create('div', playerHeader, {"id": "playerTime"});
		playerImage = create('img', playerDiv, {"id": "playerImage"});
		playerControls = create('div', playerDiv, {"id": "playerControls"});
		playerVolumeSeekHeader = create('div', playerDiv, {"id": "playerVolumeSeekHeader"});
		playerVolume = create('div', playerVolumeSeekHeader, {"id": "playerVolume"});
		playerCurrentVolume = create('div',playerVolume, {"id": "playerCurrentVolume"});
	
		
		playerVolume.addEventListener("DOMMouseScroll",function(e) {
			e.preventDefault();
			var n = Number(playerCurrentVolume.style.left.replace("px",""));
			if(e.detail<0) {
				n+=1;
			}else if(e.detail>0) {
				n-=1;
			}
			
			
			var max = Number(window.getComputedStyle(playerVolume).width.replace("px",""));
			var width = Number(window.getComputedStyle(playerCurrentVolume).width.replace("px",""));
			
			if(n < 0 || n > max-width)return;
			playerCurrentVolume.style.left = n +"px";
			playerPlayer.volume=n/(max-width);
		});
		
		playerSeekbar = create('div', playerVolumeSeekHeader, {"id":"playerSeekbar"});
		playerSeekbarCurrent = create('div', playerSeekbar, {"id":"playerSeekbarCurrent"});
		
		
		playerList = create('div', playerDiv, {"id":"playerList"});
		playerControls2 = create('div',playerDiv, {"id": "playerControls2"});
		playerPlayer = create('audio', playerDiv, {"id": "playerPlayer"});
		//playerCurrentVolume.style.left = (playerPlayer.volume*170) + "px";
		playerPlayer.addEventListener('ended', function() {playerPlayPause.innerHTML = ">"; nextMusic(true);});
		playerPlayer.volume = playerSaveData.volume;
		//copy from Triangle's script
		playerPlayer.addEventListener('play', function(e) {
			fixFFbug();
		});
		//end
		fixFFbug();
		playerPlayer.addEventListener('timeupdate', function(e) {
			if(!playerSeekbarCurrent.down){
			if(this.currentTime > 0){
				var max = Number(window.getComputedStyle(playerSeekbar).width.replace("px",""));
				var width = Number(window.getComputedStyle(playerSeekbarCurrent).width.replace("px",""));
				
				var x = (this.currentTime/(chrome?this.duration:playerCurrentDuration)) * (max-width);
				if(x > max-width) {
					fixFFbug();
					playerSeekbarCurrent.style.left = "0px";
					return;
				}
				playerSeekbarCurrent.style.left = x + "px";
				playerTime.innerHTML = sectos(Math.round(this.currentTime)) + "/" + sectos(Math.round(chrome?this.duration:playerCurrentDuration)) || "[unknown]";
			}
			}
		});
		
		playerPlayer.addEventListener('play', function() {playerPlayPause.innerHTML="| |";});
		playerPlayer.addEventListener('pause', function() {playerPlayPause.innerHTML=">";});
		playerRepeat = create('a', playerControls2, {"href": "#"});
		switch(playerSaveData.repeat){
			case 1: playerRepeat.innerHTML = "[RA]"; playerRepeat.title = "Repeat all"; break;
			case 2: playerRepeat.innerHTML = "[R1]"; playerRepeat.title = "Repeat one"; break;
			case 0: playerRepeat.innerHTML = "[RO]"; playerRepeat.title = "Repeat off"; break;
		}
		playerRepeat.addEventListener('click', function(e) {
			e.preventDefault();
			switch(playerSaveData.repeat){
				case 0: playerSaveData.repeat=1; playerRepeat.innerHTML = "[RA]"; playerRepeat.title = "Repeat all"; break;
				case 1: playerSaveData.repeat=2; playerRepeat.innerHTML = "[R1]"; playerRepeat.title = "Repeat one"; break;
				case 2: playerSaveData.repeat=0; playerRepeat.innerHTML = "[RO]"; playerRepeat.title = "Repeat off"; break;
			}
		});
		
		
		playerShuffle = create('a', playerControls2, {"href": "#"});
		playerShuffle.title = playerSaveData.shuffle ? "Shuffle" : "By order";
		playerShuffle.innerHTML = playerSaveData.shuffle ? "[SH]" : "[BO]";
		playerShuffle.addEventListener('click', function(e) {
			e.preventDefault();
			playerSaveData.shuffle = !playerSaveData.shuffle;
			if(playerSaveData.shuffle) {
				playerShuffle.title = "Shuffle";
				playerShuffle.innerHTML = "[SH]";
			}else{
				playerShuffle.title = "By order";
				playerShuffle.innerHTML = "[BO]";
			}
		});
		
		
		playerClose = create('a', playerDiv, {"id":"playerClose","href":"#"});
		playerClose.innerHTML="[X]";
		playerClose.addEventListener('click', function(e) {
			e.preventDefault();
			playerSaveData.right = playerDiv.style.right.replace("px","");
			playerSaveData.bottom = playerDiv.style.bottom.replace("px","");
			playerSaveData.volume = playerPlayer.volume;
			
			localStorage.setItem('4chanSP', JSON.stringify(playerSaveData));
					
			document.body.removeChild(playerDiv);
			playerDiv = null;
			isPlayer = false;
		});
		
		
	
		
		playerChangeMode = create('a', playerControls2, {"id": "playerChangeMode", "href": "#"});
		playerChangeMode.innerHTML = "[M]";
		playerChangeMode.title = "Change view";
		playerChangeMode.addEventListener('click', function(e) {e.preventDefault(); swmode();});

		
		
		playerPrev = create('a', playerControls, {"href": "#", "class":"playerControlLink"});
		playerPrev.innerHTML = "|<<";
		playerPrev.addEventListener('click', function(e) {
			e.preventDefault();
			prevMusic();
		});
		playerBackward = create('a', playerControls, {"href": "#", "class":"playerControlLink"});
		playerBackward.innerHTML = "<<";
		playerBackward.addEventListener('click', function(e) {
			e.preventDefault();
			playerPlayer.currentTime -= 5;
		}); 
		playerPlayPause = create('a', playerControls, {"href": "#", "class":"playerControlLink"});
		playerPlayPause.innerHTML = ">";
		playerPlayPause.addEventListener('click', function(e) {
			e.preventDefault();
			if(playerPlayer.paused)
				playerPlayer.play();
			else
				playerPlayer.pause();
		});
		playerForward = create('a', playerControls, {"href": "#", "class":"playerControlLink"});
		playerForward.innerHTML = ">>";
		playerForward.addEventListener('click', function(e) {
			e.preventDefault();
			playerPlayer.currentTime += 5;
		}); 
		playerNext = create('a', playerControls, {"href": "#", "class":"playerControlLink"});
		playerNext.innerHTML = ">>|";
		playerNext.addEventListener('click', function(e) {
			e.preventDefault();
			nextMusic(false);
		});
		
		playerStyleSettingsButton = create('a', playerDiv, {"id":"playerStyleSettingsButton","href":"#"});
		playerStyleSettingsButton.innerHTML="[S]";
		playerStyleSettingsButton.addEventListener('click', function(e) {
			e.preventDefault();
			if(playerSettings.style.display == "none")
				playerSettings.style.display = "block";
			else
				playerSettings.style.display = "none";
		});
		playerSettings = create('table', playerDiv, {"id":"playerSettings","class":"playerWindow"});
		playerSettings.style.right = "210px";
		playerSettings.style.top = "0px";
		playerSettings.style.display = "none";
		var tbody = create('tbody', playerSettings);
		var headerrow = create('tr', tbody);
		playerSettingsHeader = create('td', headerrow,{"colspan":2});
		playerSettingsHeader.innerHTML = "4chan Sounds Player Style Settings";
		playerSettingsHeader.style.textAlign="center";
		playerSettingsHeader.style.cursor = "move";

		var data = [{name:"Text color",format:"CSS color value",id:"LinkColor",sets:"#playerCurrentVolume, #playerSeekbarCurrent {background-color:%1} .playerWindow > * > * {color:%1 !important;} .playerWindow > * {color:%1 !important;} .playerWindow a {color:%1 !important;} .playerWindow a:visited {color:%1 !important;}"},
					{name:"Control hover color",format:"CSS color value",id:"HoverColor",sets:".playerWindow a:hover, .playerListItemTag:hover{color:%1 !important;} #playerCurrentVolume:hover, #playerSeekbarCurrent:hover {background: %1;}"},
					{name:"Background color",format: "CSS color value",id:"BGColor",sets:".playerWindow {background-color:%1 !important}"},
					{name:"Playlist size",format:"Width x Height",id:"PlaylistSize",func: "var data=self.value.split('x'); data[0]=data[0].trim(); data[1]=data[1].trim(); return '#playerList {'+(data[0]?'width:'+data[0]+'px;':'') + (data[1]?' height:'+data[1]+'px;}':'}');"},
					{name:"Playlist margins",format:"left,right,top,bottom", id:"PlaylistMargins", func: "var data=self.value.split(','); return '#playerList {'+(data[0]?'margin-left:'+data[0]+'px;':'') + (data[1]?'margin-right:'+data[1]+'px;':'') + (data[2]?'margin-top:'+data[2]+'px;':'') + (data[3]?'margin-bottom:'+data[3]+'px;':'')+'}';"},
					{name:"List item background color", format:"CSS color value", id:"ListItemBGColor",sets:".playerListItem{background-color:%1}"},
					{name:"Played list item bg color", format:"CSS color value", id:"PlayedListItemBGColor",sets:".playerListItem[playing=true]{background-color:%1}"},
					{name:"Volume slider width", id:"VolumeSliderWidth", sets:"#playerCurrentVolume{width:%1px}"},
					{name:"Seekbar slider width", id:"SeekbarCurrentWidth", sets:"#playerSeekbarCurrent{width:%1px}"}];
		for(var i = 0; i < data.length;i++){
			var tr = create('tr',tbody);
			var td = create('td', tr,{"class":"playerSettingLabel"});
			td.innerHTML = data[i].name;
			if(!data[i].sets && !data[i].func) continue;
			if(data[i].format) {
				td.style.cursor = "help";
				td.title = data[i].format;
			}
			td = create('td',tr);
			var input = create('input', td);
			input.classList.add('playerSettingsInput');
			input.id = "playerSettings"+data[i].id;

			input.sets = data[i].sets;
			input.func = data[i].func;
			input.addEventListener('change',function(){
				updateUserCSS();
			});
		}
		
		
		playerListMenu = create('div', null, {"id": "playerListMenu","class":"playerWindow"});
		playerListMenuDelete = create('a', playerListMenu, {"href":"#","class":"playerListItemMenuLink"});
		playerListMenuDelete.innerHTML = "Remove all...";
		playerListMenuDelete.addEventListener('click', function(e) {
			e.preventDefault();
			if(confirm('Are you sure?')){
				var items = playerList.getElementsByTagName('li');
				while(items.length > 0){
					items[items.length-1].remove();
				}
			}
			playerListMenu.parentNode.removeChild(playerListMenu);
		});
		playerListMenuAddLocal = create('a', playerListMenu, {"href":"#","class":"playerListItemMenuLink"});
		playerListMenuAddLocal.innerHTML = "Add local file...";
		playerListMenuAddLocalInput = create('input', playerListMenuAddLocal, {"type":"file","id":"playerListMenuAddLocalInput"});
		playerListMenuAddLocalInput.addEventListener('change', function(e) {
			loadAllFromLocalFileWithFooter(e.target.files[0]);
			playerListMenu.parentNode.removeChild(playerListMenu);
		});
		playerList.addEventListener('contextmenu', function(e) {
			if(e.target == playerList){
				e.preventDefault();
				if(playerListMenu.parentNode) playerListMenu.parentNode.removeChild(playerListMenu);
				document.body.appendChild(playerListMenu);
				playerListMenu.style.left = e.clientX + 5 + "px";
				playerListMenu.style.top = e.clientY + 5 + "px";
			}
		});
		
		
		playerListItemMenu = create('div', null, {"id": "playerListItemMenu","class":"playerWindow"});
		playerListItemMenuDelete = create('a', playerListItemMenu, {"href":"#","class":"playerListItemMenuLink"});

		playerListItemMenuDelete.innerHTML = "Delete";
		playerListItemMenuDelete.addEventListener('click',function(e) {
			e.preventDefault();
			playerListItemMenu.item.remove();
			playerListItemMenu.parentNode.removeChild(playerListItemMenu);
		});

		playerListItemMenuMove = create('a', playerListItemMenu, {"href":"#","class":"playerListItemMenuLink"});
		playerListItemMenuMove.innerHTML = "Move";
		playerListItemMenuMove.addEventListener('click',function(e) {
			e.preventDefault();
			playerListItemMenu.item.move();
			playerListItemMenu.parentNode.removeChild(playerListItemMenu);
		});
		
		playerListItemMenu.save = create('a', playerListItemMenu, {"href":"#","class":"playerListItemMenuLink"});
		playerListItemMenu.save.innerHTML = "Save...";
		playerListItemMenu.save.addEventListener('click',function(e) {
			if(!chrome){
			e.preventDefault();
			window.open(this.href);
			}
		});
		
		
		
		playerHeader.down = false;
		playerSettingsHeader.down = false;
		document.addEventListener('mousedown',documentMouseDown);
		document.addEventListener('mouseup',documentMouseUp);
		document.addEventListener('mousemove',documentMouseMove);
		
		
		isPlayer = true;
		document.body.appendChild(playerDiv);
		addCSS();
		
	}
}

function swmode(tocompact) {
	if(tocompact === undefined) {
		tocompact = !playerCompact;
		playerCompact = !playerCompact;
	}
	var s = tocompact ? "none" : "block";
	playerImage.style.display = s;
	playerList.style.display = s;
	playerControls2.style.marginTop = tocompact ? "15px" : "0px";
	putInsidePage();
}
function showMoverTargets(show) {
	if(show === undefined) {
		show = true;
	}
	var mvs = document.getElementsByClassName('playerListItemMoveTarget');
	for(var i = 0; i < mvs.length;i++) {
		if(show && mvs[i].parentNode == playerMovingListItem) continue;
		mvs[i].style.display = (show ? "block" : "none");
	}
}

function addMusic(resp,tag,url) {
    data = resp.data;
	var list = playerList;
	var item = create('li',list, {"class":"playerListItem"});
	//item.innerHTML = tag;
	var tagelem = create('span',item,{"class":"playerListItemTag"});
	tagelem.innerHTML = tag;
	tagelem.title = tag;
	if(resp.tag) {
		var realtag = tag.replace(' ','');
		if(resp.tag != realtag && resp.tag != tag){
		tagelem.innerHTML = "(!) " + tag;
		tagelem.title = "'" + tag + "' was not found, playing '" + resp.tag + "' instead.";
		}
	}
	item.move = function() {
		playerMovingListItem = this;
		showMoverTargets(false);
		showMoverTargets();
	};
	item.remove = function() {
		if(this.getAttribute('playing') == "true") {
			playerPlayer.pause();
			playerPlayer.src = "";
			playerImage.src = "";
			playerTitle.innerHTML = "";
			playerTime.innerHTML = "";
			playerSeekbarCurrent.style.left = "0px";
		}
		(window.webkitURL || window.URL).revokeObjectURL(this.bloburl);
		this.parentNode.removeChild(this);
	};
	item.addEventListener('contextmenu',function(e) {
		e.preventDefault();
		if(playerListItemMenu.parentNode) playerListItemMenu.parentNode.removeChild(playerListItemMenu);
		document.body.appendChild(playerListItemMenu);
		playerListItemMenu.style.left = e.clientX + 5 + "px";
		playerListItemMenu.style.top = e.clientY + 5 + "px";
		playerListItemMenu.item = this;
		playerListItemMenu.save.href = this.bloburl;
		playerListItemMenu.save.setAttribute("download",this.tag + ".ogg");
	});
	var mover = create('div', item, {"class":"playerListItemMoveTarget"});
	mover.style.display = "none";
	var mvl = create('a', mover, {"href":"#"});
	mvl.addEventListener('click',function(e) {
		e.preventDefault();
		var li = e.target.parentNode.parentNode;
		playerMovingListItem.parentNode.removeChild(playerMovingListItem);
		insertAfter(li,playerMovingListItem);
		showMoverTargets(false);
	});
	mvl.innerHTML = "[here]";
	var BlobBuilder = (window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder);
    var bb = new BlobBuilder();
    bb.append(data);
    var blob = bb.getBlob('audio/ogg');
	item.bloburl = (window.webkitURL || window.URL).createObjectURL(blob);
	item.tag = tag;
	item.uri = url;
	item.tagelem = tagelem;
	tagelem.addEventListener('click', function(e) {
		if(e.target.parentNode.bloburl){
			var items = list.getElementsByTagName('li');
			for(var i in items) {
				if(items[i].setAttribute)
				items[i].setAttribute("playing",false);
			}
			e.target.parentNode.setAttribute("playing",true);
			
            playerPlayer.src = e.target.parentNode.bloburl;
			playerTitle.innerHTML = e.target.parentNode.tag;
			playerTitle.title = e.target.parentNode.tag;
			playerPlayer.play();
			playerCurrentVolume.style.left = (playerPlayer.volume * 55)+"px";
			playerImage.src = e.target.parentNode.uri;
			
		}
	});
	if(playerPlayer.paused) { tagelem.click(); }
}
	
function prevMusic() {
	var items = playerList.getElementsByTagName('li');
	for(var i = 0; i < items.length;i++)
	{
		if(items[i].getAttribute("playing") == "true")
		{
			if(i === 0)
				items[items.length-1].tagelem.click();
			else
				items[i-1].tagelem.click();
			return;
		}
	}
	if(items.length > 0) items[0].tagelem.click();
}

function nextMusic(auto) {
	var items = playerList.getElementsByTagName('li');
	for(var i = 0; i < items.length;i++)
	{
		if(items[i].getAttribute("playing") == "true")
		{
			if(auto && playerSaveData.repeat == 2){ items[i].tagelem.click(); return;}
			
			if(playerSaveData.shuffle && items.length > 1) {
			var rnd = Math.floor(Math.random()*items.length);
			while(rnd == i) {
				rnd = Math.floor(Math.random()*items.length);
			}
			items[rnd].tagelem.click(); return;
			}
			if(i == (items.length - 1)) {
				if(auto && playerSaveData.repeat === 0){ return;}
				items[0].tagelem.click();
			}
			else
				items[i+1].tagelem.click();
			return;
		}
	}
	if(items.length > 0) items[0].tagelem.click();
}
function updateUserCSS() {
	var table = document.getElementById('playerSettings');
	var elems = table.getElementsByTagName('input');
	playerSaveData.userCSS = "";
	for(var i = 0; i < elems.length;i++){
		if(elems[i].value){
			if(elems[i].sets){
				var add = (playerSaveData.userCSS.length<1?"":" ")+elems[i].sets.replaceAll('%1',elems[i].value);
				playerSaveData.userCSS += add;
			}
			else if(elems[i].func){
				playerSaveData.userCSS += (playerSaveData.userCSS.length<1?"":" ")+ new Function("self",elems[i].func)(elems[i]);
			}
		}
	}
	addCSS();
}

function addCSS() {
	if(!playerStyle){
	playerStyle = document.createElement('style');
	playerStyle.setAttribute('type', 'text/css');
	playerStyle.innerHTML ='#playerList {margin-top: 15px; width: 180px; height: 200px; overflow: auto; margin-left:10px; margin-right:10px;}'+
			'.playerWindow {font-size: 12px; line-height:15px; color: darkgrey; background: #e7e7e7; position: fixed; z-index: 20;}'+
			'#playerHeader {height: 30px; cursor: move; text-align:center; position: relative; right: 0px; top: 0px;}'+
			'#playerControls {display: block; text-align: center;}'+
			'.playerListItem {cursor:pointer;, padding-top: 1px; list-style: none;}'+
			'.playerListItemMoveTarget {width:180px; height: 10px; font-size: 10px !important; text-align: center; margin-top: -2px;}'+
			'#playerImage {max-height: 120px; max-width: 180px; display: block; margin-left: auto; margin-right: auto;}'+
			'#playerClose {top: 0px; right: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+
			'#playerStyleSettingsButton {top: 0px; left: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+
			'#playerToggleSet {top: 0px; left: 0px; position: absolute; font-size: 10px; display: block; text-align: right; z-index: 10;}'+
			'#playerChangeMode, .playerListItemDelete, .playerListItemMove {float:right;}'+
			'.playerWindow a {color: darkgray !important; text-decoration: none !important;} .playerWindow a:visited {color: darkgray !important;} .playerWindow a:hover {color: black !important;}'+
			'#playerVolume {padding-top: 7px; height: 14px; width: 60px; display:inline-block;}'+
			'#playerVolumeSeekHeader {margin-left: auto; margin-right:auto; width:180px; background:url("data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAALQAAAAHCAYAAAChk2fpAAAAAXNSR0IArs4c6QAAAJpJREFUWMPtV0kKACEMq4N/7Bv7SudUKOKCjo5UkpvWrTGGGkQkERExc6BFEJFk18vb2lfatzR25blW53oCmkeei+0fjWl7J/9/cBJPbe6dwJMX1+JrNnbLXTw7FmXmoC8GggXcCxrYBzWLvISwLjsbu8F4IiTiU9Q1EX4pR1ByDHxeAMC1Q7devK2xS/HaLx7oc9OK9+be4NIvFNCOIPRVVS4AAAAASUVORK5CYII="); background-repeat: no-repeat;}'+
			'#playerCurrentVolume {height: 14px; width: 5px; position:relative; display:block; background: darkgrey;}'+
			'#playerSeekbar {padding-top: 7px; height: 14px; width: 120px; display:inline-block;}'+
			'#playerSeekbarCurrent {height: 14px; width: 5px; position:relative; display:block; background: darkgrey;}'+
			'#playerCurrentVolume:hover, #playerSeekbarCurrent:hover {background: black;}'+
			'.playerControlLink {margin-left: 2px; margin-right:2px;}'+	
			'.playerListItemTag:hover {color: black}'+
			'.playerListItemTag {margin-left: 4px; margin-right: 4px; display:block;}'+
			'#playerTitle {width: 160px; height:15px; overflow:hidden; margin-left:auto; margin-right:auto;}'+
			'#playerTime {width:160px; height:15px; overflow:hidden; margin-left:auto; margin-right:auto;}'+
			'#playerSettings {background: #e7e7e7; position: absolute; max-width:none;}'+
			'#playerSettings > tbody {display:block; padding: 0 10px 10px;}'+
			'#playerListMenu, #playerListItemMenu {padding: 2px 3px; position: fixed; background: #e7e7e7;}'+
			'.playerListItemMenuLink {display:block;}'+
			'#playerListMenuAddLocalInput{opacity: 0; width: 100%; position: absolute; left: 0px; height: 50%; cursor: pointer;}';
	document.getElementsByTagName('head')[0].appendChild(playerStyle);
	}

	if(!playerUserStyle && playerSaveData.userCSS) {
		playerUserStyle = document.createElement('style');
		playerUserStyle.setAttribute('type', 'text/css');
		playerUserStyle.innerHTML = playerSaveData.userCSS;
		document.getElementsByTagName('head')[0].appendChild(playerUserStyle);
	}else if(playerSaveData.userCSS) {
		playerUserStyle.innerHTML = playerSaveData.userCSS;
	}
}
hyperlink();
if(!archive){
	document.getElementsByClassName('board')[0].addEventListener('DOMNodeInserted', function(e)
	{
		if(!e.target.classList) return;
		if(e.target.classList.contains('inline')){
			rehyperlink(e.target);
		}else if(e.target.classList.contains('postContainer')){
			hyperlinkone(e.target);
		}
	});
}