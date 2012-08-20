hyperlink();
if(!archive){
	if(MutationObserver) {
		var obs = new MutationObserver(function(records) {
			for(var i = 0; i < records.length; i++) {
				var e = records[i];
				if(e.type == "childList"){
				if(e.addedNodes){
					for(var j = 0; j < e.addedNodes.length;j++) {
						var target = e.addedNodes[j];
						if(target.classList){
							if(target.classList.contains('inline')) {
								rehyperlink(target);
							}else if(target.classList.contains('postContainer')) {
								hyperlinkone(target);
							}else if(target.classList.contains('backlinkHr')) {
								rehyperlink(target.parentNode.parentNode);
							}
						}
					}
				}
			}
		});
	obs.observe(document.getElementsByClassName('board')[0],{childList:true,subtree:true,characterData:true});
	}else{
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
	var relNode = document.getElementById('settingsWindowLink').nextSibling;
	var playerShowLink = create('a',null,{'class':"settingsWindowLinkBot"});
	var bracket = document.createTextNode('] [');
	var elem = document.getElementById('navtopr');
	elem.insertBefore(playerShowLink,relNode);
	elem.insertBefore(bracket,playerShowLink);
	playerShowLink.innerHTML = "Show player";
	playerShowLink.href = "#";
	playerShowLink.addEventListener('click',function(e) {
		e.preventDefault();
		showPlayer();
	});
	
}
