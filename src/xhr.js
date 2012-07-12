var xmlhttp = chrome ? get_chrome:get_grease;
function get_chrome(link, callback)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', link.realhref, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.responseType = 'arraybuffer';
	xhr.onload = function(e) {
		if (this.status == 200)	{
			callback(findOggWithFooter(this.response, link.tag), link);
		}
	};
	xhr.send();
}
//modified to be able to pass thumbnail link
function get_grease(link, callback) {
	GM_xmlhttpRequest({
		method: "GET",
		url: link.realhref,
		overrideMimeType: 'text/plain; charset=x-user-defined',
		onload: function(e)
		{
			if (e.status == 200)
			{
				var text = e.responseText;
				var foo = s2ab(text);
				callback(findOggWithFooter(foo, link.tag), link);
			}
		}
	});
}
