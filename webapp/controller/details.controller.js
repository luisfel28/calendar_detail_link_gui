sap.ui.define([
    "sap/ui/core/mvc/Controller",
	"sap/ui/core/UIComponent",
    "sap/ui/model/odata/v2/ODataModel",
	"sap/ui/model/json/JSONModel",
    "sap/ui/core/format/NumberFormat"        
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, UIComponent, ODataModel, JSONModel, NumberFormat) {
        "use strict";

        var vTotal = 0;
        var oTotal;
        var oCurrencyFormat;        
        var Filtro = [];
        var sBukrs = "";
        var sGjahr = "";
        var sSwenr = "";
        var sSgenr = "";
        var sSgrnr = "";        
        var sDtIni = "";        
        var sDtFim = "";        

        return Controller.extend("com.fidelidademundial.zrefxcustreport.controller.details", {
            onInit: function () {
                oTotal = this.getView().byId("TxtTotal");
                oCurrencyFormat = NumberFormat.getCurrencyInstance();
                oTotal.setNumber(oCurrencyFormat.format(0, "EUR"));

                this.getRouter().getRoute("Routedetails").attachPatternMatched(this._onObjectMatched, this);
            },

            onSum: function (amount) {
                if (amount != null)
                {
                    //vTotal += parseFloat(amount);
                }
                return amount;
            },

            MostraTotal: function () {

                var oTable      = this.getView().byId("TabDetails");
                var row;

                for(row = 0; row < oTable.getItems().length; row++)
                {
                    vTotal += parseFloat(oTable.mBindingInfos.items.binding.oList[row].valor);
                }

                // Monta Valor Total
                oTotal.setNumber(oCurrencyFormat.format(vTotal, "EUR"));
                vTotal = 0;
            },

            handleLinkDoc: function (evt) {
                
                // Doc
                var vBELNR = evt.getSource().getBindingContext().getObject("belnr");

                //var finalUrl = window.location.href.split("#")[0] + href;
                var finalUrl = window.location.href.split("#")[0] + "#AccountingDocument-displayDocument?DynproNoFirstScreen=1&CompanyCode="+sBukrs+"&FiscalYear="+sGjahr+"&AccountingDocument="+vBELNR;
                sap.m.URLHelper.redirect(finalUrl, false);

            },

            _onObjectMatched : function (oEvent) {

                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZRE_GW_CUSTOS_SRV", true);
                var vObj = "";

                sBukrs = oEvent.getParameter("arguments").bukrs;  // Empresa
                Filtro.push(new sap.ui.model.Filter("pBukrs", "EQ",sBukrs));


/*                 sGjahr = oEvent.getParameter("arguments").gjahr;  // Exercicio
                Filtro.push(new sap.ui.model.Filter("pGjahr", "EQ",sGjahr)); */


                sSwenr = oEvent.getParameter("arguments").swenr;  // Unidade Economica 
                Filtro.push(new sap.ui.model.Filter("pSwenr", "EQ",sSwenr));

                sSgenr = oEvent.getParameter("arguments").sgenr;  // Edificio
                if (sSgenr == "-")
                {
                sSgenr = "";
                }
                else
                {
                    vObj = "Nº do edifício " + sSgenr;
                } 
                Filtro.push(new sap.ui.model.Filter("pSgenr", "EQ",sSgenr));

                sSgrnr = oEvent.getParameter("arguments").sgrnr;  // Terreno
                if (sSgrnr == "-")
                {
                sSgrnr = "";
                }
                else
                {
                    vObj = "Nº do terreno " + sSgrnr;
                }                 
                Filtro.push(new sap.ui.model.Filter("pSgrnr", "EQ",sSgrnr));

                sDtIni = oEvent.getParameter("arguments").dtini;  // Dt Inicio
                Filtro.push(new sap.ui.model.Filter("pDtIni", "EQ",sDtIni));                

                sDtFim = oEvent.getParameter("arguments").dtfim;  // Dt Fim
                Filtro.push(new sap.ui.model.Filter("pDtFim", "EQ",sDtFim));                                

                oModel.read("/ZI_CUSTOS_DETALHESSet", {
                    urlParameters: {
                        "$top": 9999
                    },
                    success: function (oData, response) {
                        this.WriteData(oData);
                    }.bind(this),
                    error: function (err) {
                        
                    },
                    filters: Filtro
                }
                );

                oModel.setSizeLimit(9999);
                
                var vLblObj = this.getView().byId("lblObj");

                //vLblObj.setText(sBukrs + " / " + sGjahr + " / " + sSwenr + " / " + vObj);
                vLblObj.setText(sBukrs + " / " + sSwenr + " / " + vObj);

            },

            WriteData: function (results) {

                var oTable      = this.getView().byId("TabDetails");
                var oModel = new sap.ui.model.json.JSONModel();

                oModel.setData(results);
                oTable.setModel(oModel);
			    Filtro = [];

            },

            getRouter : function () {
                return UIComponent.getRouterFor(this);
            }            

        });

    });
