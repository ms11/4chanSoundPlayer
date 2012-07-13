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
