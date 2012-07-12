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

function addMusic(data,tag,url) {
	var list = playerList;
	var item = create('li',list, {"class":"playerListItem"});
	//item.innerHTML = tag;
	var tagelem = create('span',item,{"class":"playerListItemTag"});
	
	tagelem.innerHTML = tag;
	tagelem.title = tag;
	item.move = function() {
		playerMovingListItem = this;
		showMoverTargets(false);
		showMoverTargets();
	};
	item.remove = function() {
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
