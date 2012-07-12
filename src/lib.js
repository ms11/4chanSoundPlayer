
function insertAfter(referenceNode, newNode)
{
	referenceNode.parentNode.insertBefore(newNode, referenceNode.nextSibling);
}
function byClass(items, cl)
{
	for (var i = 0; i < items.length; i++)
	{
		if (items[i].classList.contains(cl))
		{
			return items[i];
		}
	}
	return null;
}

function s2ab(text)
{
	var foo = new ArrayBuffer(text.length);
	var bar = new Uint8Array(foo);
	for (var a = 0; a < text.length; a++)
	{
		bar[a] = text.charCodeAt(a);
	}
	return foo;
}
function getPostID(o)
{
	var o = o.getAttribute('id');
	if (!archive)
	{
		o = o.substr(1);
	}
	return parseInt(o);
}
function create(type, parent, attributes)
{
    var element = document.createElement(type);
    for (attr in attributes) {
        element.setAttribute(attr, attributes[attr]);
    }
    if (parent) {
        parent.appendChild(element);
    }
    return element;
}
function sectos(sec) {
	var m = Math.floor(sec/60);
	var s = +(sec-m*60);
	return m+(s<10?":0":":")+s;
}
String.prototype.replaceAll = function(replaceTo,replaceWith) {
	return this.replace(new RegExp(replaceTo,'g'),replaceWith);
};