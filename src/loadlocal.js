function loadAllFromLocalFileWithFooter(file) {

	var reader = new FileReader();
	reader.onload = function() {
		var raw = reader.result;
		var data = new Uint8Array(raw);
		var footU = s2ab('4SPF');
		var foot8 = new Uint8Array(footU);
		var match = true;
		for(var i = 0; i < 4 ;i++){
			if(foot8[i] != data[data.length-4+i])
				match = false;
		}
		if(match) {
			var offset = (data[data.length-5] << 8 | data[data.length-6]) + 6;
			var fstart = data.length - offset;
			var tags = [];
			
			for(var i = data.length-7;i >= fstart;i--){
				var it = i + 4;
				if(it > offset && it < (data.length-7)) {
					if(data[i] === 0 && data[it] === 0){
						var start = toUInt32(data,i-3);
						var end = toUInt32(data,it-3);
						var tag = "";
						for(var j = i-3;j > fstart;j--){
							if(data[j] == 0)
								break;
							tag = String.fromCharCode(data[j]) + tag;
						}
						i = i - tag.length;
						tags.push({tag:tag,start:start,end:end});
					}
				}
			}
			//tags[tags.length-1] += String.fromCharCode(data[i]);
			tags=tags.reverse();
			for(var i = 0; i < tags.length;i++){
				addMusic({data:raw.slice(tags[i].start,tags[i].end),tag:tags[i].tag},tags[i].tag);
			}
			
		}else{
			loadAllFromLocal(file);
		}
	};
	reader.readAsArrayBuffer(file);
}
function loadAllFromLocal(file) {
	var oggU = s2ab('OggSxx');
	var ogg8 = new Uint8Array(oggU);
	ogg8[4] = 0;
	ogg8[5] = 2;
	
	var reader = new FileReader();
	reader.onload = function() {
		var raw = reader.result;
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
				oldptr = ptr;
			}else{
				cont = false;
			}
		}while(cont);
		if(sounds.length > 0) {
			var id = sounds.length-1;
			sounds[id].data = raw.slice(sounds[id].start);
		}
		for(var i = 0; i < sounds.length;i++){
			var tag = sounds[i].tag;
			addMusic({data:sounds[i].data,tag:tag},tag);
		}
	};
	reader.readAsArrayBuffer(file);
}
