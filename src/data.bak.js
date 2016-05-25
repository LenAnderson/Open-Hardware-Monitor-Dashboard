var data = {
	
	init: function() {
		this.getData();
	},
	
	getData: function() {
		get('data.json').then(JSON.parse).then(this.gotData.bind(this));
	},
	gotData: function(data) {
		this.raiseEvent('update', data);
		setTimeout(this.getData.bind(this), 1000);
	}
};