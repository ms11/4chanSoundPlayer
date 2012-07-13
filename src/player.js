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
			loadAll(e.target.files[0]);
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
