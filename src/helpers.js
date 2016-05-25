var $ = document.querySelector.bind(document);
var $$ = document.querySelectorAll.bind(document);
document.$ = document.querySelector;
document.$$ = document.querySelectorAll;
Node.prototype.$ = Element.prototype.querySelector;
Node.prototype.$$ = Element.prototype.querySelectorAll;

HTMLCollection.prototype.forEach = Array.prototype.forEach;
HTMLCollection.prototype.filter = Array.prototype.filter;
HTMLCollection.prototype.find = Array.prototype.find;
NodeList.prototype.forEach = Array.prototype.forEach;
NodeList.prototype.filter = Array.prototype.filter;
NodeList.prototype.find = Array.prototype.find;

Node.prototype.addClass = function(cl) { this.classList.add(cl); return this; };
Node.prototype.delClass = function(cl) { this.classList.remove(cl); return this; };
Node.prototype.toggleClass = function(cl) { this.classList.toggle(cl); return this; };
Node.prototype.hasClass = function(cl) { return this.classList.contains(cl); };

Node.prototype._ = Node.prototype.addEventListener;


Object.prototype.addListener = function(type, func) {
	if (!this.listeners) {
		Object.defineProperty(this, 'listeners', {
			writable: true,
			value: {}
		});
	}
	if (!this.listeners[type])
		this.listeners[type] = [];
	this.listeners[type].push(func);
	return func;
};
Object.prototype.removeListener = function(type, func) {
	if (!this.listeners || !this.listeners[type])
		return;
	for (var i=0;i<this.listeners[type].length;i++) {
		if (this.listeners[type][i] != func) continue;
		this.listeners[type].splice(i,1);
	}
};
Object.prototype.raiseEvent = function(type, evt) {
	if (!this.listeners || !this.listeners[type])
		return;
	this.listeners[type].forEach(function(it) {
		it(evt);
	});
};


function get(url) {
	return new Promise(function(resolve, reject) {
		var xhr = new XMLHttpRequest();
		xhr.open('GET', url, true);
		xhr.addEventListener('load', function() {
			if (xhr.status == 200) {
				resolve(xhr.responseText);
			} else {
				reject(Error(xhr.statusText));
			}
		});
		xhr.send();
	});
}