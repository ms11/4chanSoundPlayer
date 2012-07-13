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
