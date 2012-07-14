function rehyperlink(target,second) {
	var list = target.getElementsByClassName('playerLoadAllLink');
	for(var i = 0; i < list.length;i++){
		if(list[i].rehypered) continue;
		list[i].rehypered = true;
		list[i].addEventListener('click',function(e) {
			e.preventDefault();
			e.target.innerHTML = " loading...";
			var a = null;
			if(!archive){
			var a = e.target.parentNode.parentNode.getElementsByClassName('fileThumb')[0];
			}else{
				a = byClass(e.target.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('a'), 'thread_image_link');
			}
			if(a)
				loadAll(a.href,function(){e.target.innerHTML = " Load all sounds"});
		});
	}
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
		if(link.rehypered) continue;
		link.rehypered = true;
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
							addLoadAllLink(p);
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
					
					addLoadAllLink(p);
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
	var posts = archive? 'article':'blockquote';
	posts = document.getElementsByTagName(posts);
	for (var i = 0; i < posts.length; i++) {
		// dom-insertion listener lags the fuck out on longer threads
		if (lastPost && getPostID(posts[i]) <= lastPost) {
			// fixed (somewhat)
			continue;
		}
		hyperlinkone(posts[i]);
	}
}

function addLoadAllLink(post) {
	if(!post.hasAllLink){
		var to = null;
		if(!archive) {
		var id = getPostID(post);
		var pi = document.getElementById('f'+id);
		to = pi.getElementsByClassName('fileInfo')[0];
		}else{
			var head = post.parentNode.getElementsByTagName('header')[0];
			head = head.getElementsByClassName('post_data')[0];
			to = head.getElementsByClassName('post_controls')[0];
		}
		var loadAllLink = create('a',to, {"href":"#","class":"playerLoadAllLink"});
		loadAllLink.innerHTML = " Load all sounds";
		if(archive){
			loadAllLink.classList.add('btnr');
			loadAllLink.classList.add('parent');
		}
		loadAllLink.addEventListener('click',function(e) {
			e.preventDefault();
			e.target.innerHTML = " loading...";
			var a = null;
			if(!archive){
			var a = e.target.parentNode.parentNode.getElementsByClassName('fileThumb')[0];
			}else{
				a = byClass(e.target.parentNode.parentNode.parentNode.parentNode.getElementsByTagName('a'), 'thread_image_link');
			}
			if(a)
				loadAll(a.href,function(){e.target.innerHTML = " Load all sounds"});
		});
		post.hasAllLink = true;
	}
}
