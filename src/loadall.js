function loadAll(file,isUrl,cb) {
	if(isUrl){
		xmlhttp(file,function(data,link) {
			loadAllWithFooter(data,link,cb);
		},onprogress, file);
	}else{
		for(var i = 0; i < file.length;i++){
			var reader = new FileReader();
			reader.onload = function() {
				loadAllWithFooter(this.result,"",cb);
			};
			reader.readAsArrayBuffer(file[i]);
		}
	}
}

function loadAllWithFooter(raw,link,cb) {
		var data = new Uint8Array(raw);
		var footU = s2ab('4SPF');
		var foot8 = new Uint8Array(footU);
		var match = true;
		for(var i = 0; i < 4 ;i++){
			if(foot8[i] != data[data.length-4+i])
				match = false;
		}
		if(match) {
			var tags=[];
			var fstart = data.length - 6 - toUInt16(data,data.length-6);
			for(var i = fstart;i < data.length-6;){
				var taglen = data[i];
				i++;
				var tag = ""
				for(var j = 0; j < taglen;j++){
					tag += String.fromCharCode(data[i+j]);
				}
				i+=taglen;
				var start = toUInt32(data,i);
				i+=4;
				var end = toUInt32(data,i);
				i+=4;
				tags.push({tag:tag,start:start,end:end});
			}
			showPlayer();
			for(var i = 0; i < tags.length;i++){
				addMusic({data:raw.slice(tags[i].start,tags[i].end),tag:tags[i].tag},tags[i].tag,link);
			}
			cb();
		}else{
			loadAllFromData(raw,link,cb);
		}
}
function loadAllFromData(raw,link,cb) {
	var oggU = s2ab('OggSxx');
	var ogg8 = new Uint8Array(oggU);
	ogg8[4] = 0;
	ogg8[5] = 2;
	var data = new Uint8Array(raw);
	var sounds = [];
	var cont = true;
	var oldptr = 0;
	do{
		var ptr = 0;
		for (var i = oldptr; i < data.byteLength - 10; i++)
		{
			var match = true;
			for (var j = 0; j < ogg8.byteLength; j++)
			{
				if (data[i+j] != ogg8[j])
				{
					match = false;
					break;
				}
			}
			if (match)
			{
				ptr = i;
				break;
			}
		}
		if (ptr > oldptr)
		{
			var ofs = [-1,-1];
			var find = s2ab('[]');
			var fin8 = new Uint8Array(find);
			for (var j = ptr; j > ptr - 100; j--)
			{
				if (data[j] == fin8[0] && ofs[1] > 0)
				{
					ofs[0] = j+1;
					break;
				}
				else if (data[j] == fin8[1] && ofs[0] < 0)
				{
					ofs[1] = j-1;
				}
			}
			if (ofs[0] > 0 && ofs[1] > 0)
			{
				var tag = '';
				for (var j = ofs[0]; j <= ofs[1]; j++)
				{
					tag += String.fromCharCode(data[j]);
				}
				sounds.push({data: null,start:ptr,tag: tag});
				if(sounds.length > 1) {
					var id = sounds.length-2;
					sounds[id].data = raw.slice(sounds[id].start,ptr - sounds[id].tag.length);
				}
			}
			oldptr = ptr + 1;
		}else{
			cont = false;
		}
	}while(cont);
	if(sounds.length > 0) {
		var id = sounds.length-1;
		sounds[id].data = raw.slice(sounds[id].start);
		showPlayer();		
		for(var i = 0; i < sounds.length;i++){
			var tag = sounds[i].tag;
			addMusic({data:sounds[i].data,tag:tag},tag,link);
		}
		cb();
	}
}
