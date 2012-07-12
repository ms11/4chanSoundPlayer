function findOggWithFooter(raw,tag) {
	var timer = new Date().getTime();
	var tagU = s2ab(tag);
	var tag8 = new Uint8Array(tagU);
	var data = new Uint8Array(raw);
	var footU = s2ab('4SPF');
	var foot8 = new Uint8Array(footU);
	var match = true;
	for(var i = 0; i < 4 ;i++){
		if(foot8[i] != data[data.length-4+i])
			match = false;
	}
	//x y 4 S P F
	//6 5 4 3 2 1
	if(match){
		var offset = (data[data.length-5] << 8 | data[data.length-6]) + 6;
		var fstart = data.length - offset;
		//alert(fstart);
		for(var i = fstart; i < data.length; i++){
			var tagmatch = true;
			for (var j = 0; j < tag8.byteLength; j++)
			{
				if (data[i+j] != tag8[j])
				{
					tagmatch = false;
					break;
				}
			}
			if (!tagmatch)
			{
				continue;
			}
			i += tagU.byteLength;
			var start = toUInt32(data,i);
			i += 4;
			var end = toUInt32(data,i);
			//alert(tag + '|' + start + '|' + end);
			console.log(timer-new Date().getTime());
			return raw.slice(start,end);
		}
	}else
		return findOgg(raw,tag);
}
function findOgg(raw, tag)
{
	var timer = new Date().getTime();
	var tagU = s2ab('[' + tag + ']');
	var skip = s2ab(' "\r\n');
	var oggU = s2ab('OggSxx');
	var tag8 = new Uint8Array(tagU);
	var skp8 = new Uint8Array(skip);
	var ogg8 = new Uint8Array(oggU);
	ogg8[4] = 0;
	ogg8[5] = 2;
	var data = new Uint8Array(raw);
	var eof = skp8.byteLength + 12;
	var ptr = -1;
	
	// keep comparing data to [tag] until match
	for (var i = 0; i < data.byteLength - eof; i++)
	{
		var match = true;
		// match the tag and brackets
		for (var j = 0; j < tag8.byteLength; j++)
		{
			if (data[i+j] != tag8[j])
			{
				match = false;
				break;
			}
		}
		if (!match)
		{
			continue;
		}
		i += tagU.byteLength;
		// skip whitespace and newline
		for (var j = 0; j < skp8.byteLength; j++)
		{
			if (data[i] == skp8[j])
			{
				j = -1;
				i++;
			}
		}
		// match against ogg header
		for (var j = 0; j < ogg8.byteLength; j++)
		{
			if (data[i+j] != ogg8[j])
			{
				match = false;
				break;
			}
		}
		if (!match)
		{
			continue;
		}
		ptr = i;
		break;
	}
	if (ptr < 0)
	{
		// matching against tag failed, try just the ogg header
		for (var i = 0; i < data.byteLength - eof; i++)
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
		if (ptr > 0)
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
				var newtag = '';
				for (var j = ofs[0]; j <= ofs[1]; j++)
				{
					newtag += String.fromCharCode(data[j]);
				}
				tag = newtag;
			}
		}
	}
	if (ptr > 0)
	{
		//find next ogg header
		//ogg8
		var end = -1;
		for (var i = (ptr+1); i < data.byteLength - eof; i++)
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
			if (match) //find the tag before
			{
				var ofs = [-1,-1];
				var find = s2ab('[]');
				var fin8 = new Uint8Array(find);
				for (var j = i; j > i - 100; j--)
				{
					if (data[j] == fin8[0] && ofs[1] > 0)
					{
						ofs[0] = j + 1;
						break;
					}
					else if (data[j] == fin8[1] && ofs[0] < 0)
					{
						ofs[1] = j - 1;
					}
				}
				if(ofs[0] > 0) {
					i = ofs[0];
				}
				
				
				end = i;
				break;
			}
		}
		console.log(timer-new Date().getTime());
		if(end>0)
		return {"data":raw.slice(ptr,end),"tag":tag};
		else
		return {"data":raw.slice(ptr,end),"tag":tag};
	}
}
