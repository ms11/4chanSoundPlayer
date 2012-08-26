function loadSplitSounds(arr,cb,userState){
	var data = {links:arr.slice(),sounddata:[]};
	realLoadSplitSounds(data,arr[0].realhref,arr[0].splittag,cb,userState);
}
function realLoadSplitSounds(data,url,tag,cb,userState){
	if(data.links.length < 1){
		var len = 0;
		for(var i = 0; i < data.sounddata.length;i++){
			len += data.sounddata[i].byteLength;
		}
		var raw = new ArrayBuffer(len);
		var rawa = new Uint8Array(raw);
		var offs = 0;
		for(var i = 0; i < data.sounddata.length;i++){
			var sa = new Uint8Array(data.sounddata[i]);
			rawa.set(sa,offs);
			offs+=sa.length;
		}
		showPlayer();
		if(cb)
			cb(userState);
		addMusic({data:raw,tag:tag},tag,url);
	}else{
		xmlhttp(data.links[0].realhref,function(resp){
			var sound = findOggWithFooter(resp,data.links[0].tag)
			data.sounddata.push(sound.data);
			data.links = data.links.splice(1);
			realLoadSplitSounds(data,url,tag,cb,userState);
		});
	}
}
