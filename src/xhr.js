function get_chrome(url, callback, progressCb, userState)
{
	var xhr = new XMLHttpRequest();
	xhr.open('GET', url, true);
	xhr.overrideMimeType('text/plain; charset=x-user-defined');
	xhr.responseType = 'arraybuffer';
	if(progressCb)
		xhr.onprogress = function(e){progressCb(e,userState);};
	xhr.onload = function(e) {
		if (this.status == 200)	{
			callback(this.response,userState);
		}
	};
	xhr.send();
}

function get_grease(url, callback, progressCb, userState) {
	var arg = {
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
			}
		}
	};
	if(progressCb)
		arg.onprogress = function(e){progressCb(e,userState);};
	GM_xmlhttpRequest(arg);
}
var xmlhttp = chrome ? get_chrome:get_grease;
