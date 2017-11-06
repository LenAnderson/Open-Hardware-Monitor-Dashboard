// ==UserScript==
// @name         Open Hardware Monitor - Dashboard
// @banesoace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Open-Hardware-Monitor-Dashboard/raw/master/ohmd.user.js
// @version      0.5
// @author       LenAnderson
// @match        *://*/*
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/2.1.3/Chart.min.js
// ==/UserScript==

(function() {
	'use strict';
	
	if (localStorage.getItem('ohmd-active') && localStorage.getItem('ohmd-active') == location.href) {
		activate();
	} else {
		var cmdActivate = GM_registerMenuCommand('OHM Dashboard - Activate', function() {
			GM_unregisterMenuCommand(cmdActivate);
			localStorage.setItem('ohmd-active', location.href);
			activate();
		});
	}
	
	function activate() {
		GM_registerMenuCommand('OHM Dashboard - Deactivate', function() {
			localStorage.setItem('ohmd-active', 0);
			location.href = location.href;
		});
		${include: helpers.js}
		${include: md.js}
		${include: Config.js}
		${include: Data.js}
		${include: Widget.js}
		${include: WidgetDlg.js}
		${include: SettingsDlg.js}
		${include: OHMDashboard.js}
		
		
		//
		// VARS
		//
		function init() {
			var dashboard = new OHMDashboard();
		}
		init();
	}
})();