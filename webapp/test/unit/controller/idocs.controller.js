/*global QUnit*/

sap.ui.define([
	"comfidelidademundial/resumo_idocs/controller/idocs.controller"
], function (Controller) {
	"use strict";

	QUnit.module("idocs Controller");

	QUnit.test("I should test the idocs controller", function (assert) {
		var oAppController = new Controller();
		oAppController.onInit();
		assert.ok(oAppController);
	});

});
