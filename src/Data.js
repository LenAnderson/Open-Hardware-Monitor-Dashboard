var Data = (function() {
	//
	// vars
	//
	var module = {};
	
	
	//
	// methods
	//
	
	// constructor
	function Data() {
		getData();
	}
	
	function getData() {
		get('data.json').then(JSON.parse).then(gotData.bind(this));
	}
	function gotData(data) {
		module.raiseEvent('update', data);
		setTimeout(getData.bind(this), 1000);
	}
	
	
	
	Data();
	return module;
});