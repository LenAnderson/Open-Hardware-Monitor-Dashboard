var SettingsDlg = (function() {
	//
	// nodes
	//
	var _grid;
	var _gridSize;
	var _gridColor;
	var _gridColorPicker;
	var _gridColorOpacity;
	var _gridShow;
	
	//
	// vars
	//
	var element;
	var dlg;
	
	
	//
	// methods
	//
	
	// constructor
	function SettingsDlg() {
		element = document.createElement('div');
		element.innerHTML = '${include-min-esc: html/settings-dlg.html}';
		$('#app').appendChild(element);
		dlg = element.children[0];
		
		_grid = dlg.$('#dlg-settings-grid');
		_gridSize = dlg.$('#dlg-settings-gridSize');
		_gridColor = dlg.$('#dlg-settings-gridColor');
		_gridColorPicker = dlg.$('#dlg-settings-gridColor-picker');
		_gridColorOpacity = dlg.$('#dlg-settings-gridColor-opacity');
		_gridShow = dlg.$('#dlg-settings-gridShow');
		
		dlg.$('#dlg-settings-ok').addEventListener('click', ok);
		dlg.$('#dlg-settings-cancel').addEventListener('click', function() {
			dlg.hide();
		});
		
		_gridColor.addEventListener('change', function() {
			_gridColorPicker.value = this.value;
		});
		_gridColorPicker.addEventListener('change', function() {
			_gridColor.value = this.value;
		});
	}
	
	function show(evt) {
		var colorParts = Config.gridColor.match(/[0-9\.]+/g);
		_grid.checked = Config.grid;
		_gridSize.value = Config.gridSize;
		_gridColor.value = '#' + ("00"+parseInt(colorParts[0]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[1]).toString(16)).slice(-2) + ("00"+parseInt(colorParts[2]).toString(16)).slice(-2);
		_gridColorPicker.value = _gridColor.value;
		_gridColorOpacity.value = parseFloat(colorParts[3])*100;
		_gridShow.checked = Config.showGrid;
		dlg.show(evt);
	}
	
	function ok() {
		var parts = _gridColor.value.substring(1).match(/.{2}/g);
		var opacity = _gridColorOpacity.value;
		var gridColor = 'rgba(' + parseInt(parts[0],16) + ',' + parseInt(parts[1],16) + ',' + parseInt(parts[2],16) + ',' + (opacity/100) + ')';
		module.raiseEvent('change', {
			grid: _grid.checked,
			gridSize: parseInt(_gridSize.value),
			gridColor: gridColor,
			showGrid: _gridShow.checked
		});
		dlg.hide();
	}
	
	
	
	SettingsDlg();
	var module;
	return module = {
		show: show
	};
});