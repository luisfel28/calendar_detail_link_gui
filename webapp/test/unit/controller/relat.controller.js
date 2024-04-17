/*global QUnit*/

sap.ui.define([
	"comfidelidademundial/zrefxcustreport/controller/relat.controller"
], function (Controller) {
	"use strict";

	QUnit.module("relat Controller");

	QUnit.test("I should test the relat controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
