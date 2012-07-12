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