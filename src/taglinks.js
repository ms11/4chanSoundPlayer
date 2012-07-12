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
            xmlhttp(this, function(music, link) {   
				showPlayer();
				addMusic(music,link.tag,link.realhref);
				link.innerHTML = '[' + link.tag + ']';
			});
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
								xmlhttp(this, function(music, rlink) {   
									showPlayer();
									addMusic(music,rlink.tag,rlink.realhref);
									rlink.innerHTML = '[' + rlink.tag + ']';
								});
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
						xmlhttp(this, function(music, rlink) {   
							showPlayer();
							addMusic(music,rlink.tag,rlink.realhref);
							rlink.innerHTML = '[' + rlink.tag + ']';
						});
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
