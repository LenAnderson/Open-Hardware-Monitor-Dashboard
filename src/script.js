// ==UserScript==
// @name         Open Hardware Monitor - Dashboard
// @banesoace    https://github.com/LenAnderson/
// @downloadURL  https://github.com/LenAnderson/Open-Hardware-Monitor-Dashboard/raw/master/ohmd.user.js
// @version      2.0
// @author       LenAnderson
// @match        http://localhost:8085
// @grant        GM_registerMenuCommand
// @grant        GM_unregisterMenuCommand
// @require      https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js
// ==/UserScript==

import { log } from "./lib/basics.js";
import { Dashboard } from "./ohmd/Dashboard.js";

(function() {
	'use strict';




	// ${imports}




	const app = new Dashboard();
	log(app);
})();