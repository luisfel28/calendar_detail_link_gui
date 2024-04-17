/* global QUnit */
QUnit.config.autostart = false;

sap.ui.getCore().attachInit(function () {
	"use strict";

	sap.ui.require([
		"comfidelidademundial/resumo_idocs/test/unit/AllTests"
	], function () {
		QUnit.start();
	});
});
