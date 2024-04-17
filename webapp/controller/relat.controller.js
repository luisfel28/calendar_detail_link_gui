sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/core/format/NumberFormat",
    "sap/ui/core/UIComponent",
    "sap/ui/model/json/JSONModel"
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, NumberFormat, UIComponent, JSONModel) {
        "use strict";

        var oFilterCompany = [];
        var oFilterUnidades = [];
        var oCelulas = [];
        var vTotal = 0;
        var oTotal;
        var oCurrencyFormat;
        var vFilterDtFrom;
        var vFilterDtTo;

        return Controller.extend("com.fidelidademundial.zrefxcustreport.controller.relat", {
            onInit: function () {
                oTotal = this.getView().byId("TxtTotal");
                oCurrencyFormat = NumberFormat.getCurrencyInstance();
                oTotal.setNumber(oCurrencyFormat.format(0, "EUR"));

                oFilterCompany.push("FS01");
                oFilterCompany.push("FIIS");

                this.getRouter().initialize();

                var oModel = new JSONModel();
                //var vCboDtLanc = this.getView().byId("cboDtLanc");
                var vDateTo     = new Date(),
                    vDateFrom   = new Date();

                //vCboDtLanc.setFrom(vDateFrom);
                //vCboDtLanc.setTo(vDateTo);

                vDateFrom.setDate( vDateTo.getDate() - 90 );

                oModel.setData({
                    dtini: vDateFrom,
                    dtfim: vDateTo
                });
                this.getView().setModel(oModel);

            },

            handleCompanyChange: function (oEvent) {
                var changedItem = oEvent.getParameter("changedItem");
                var isSelected = oEvent.getParameter("selected");

                if (!isSelected) {
                    var index = oFilterCompany.indexOf(changedItem.getText());
                    oFilterCompany.splice(index, 1);
                }
                else {
                    oFilterCompany.push(changedItem.getText());
                }

            },

            handleUnidadesChange: function (oEvent) {
                var changedItem = oEvent.getParameter("changedItem");
                var isSelected = oEvent.getParameter("selected");

                if (!isSelected) {
                    var index = oFilterUnidades.indexOf(changedItem.getText());
                    oFilterUnidades.splice(index, 1);
                }
                else {
                    oFilterUnidades.push(changedItem.getText());
                }

            },

            LoadTab: function () {

                vTotal = 0;

                var oModel = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZRE_GW_CUSTOS_SRV", true);
                var oJsonModel = new sap.ui.model.json.JSONModel();

                ///////////////////////////////////////////////////////////////////
                var oFilters = [];

                /// Empresas
                for (var i = 0; i < oFilterCompany.length; i++) {
                    var oTabFilter = new sap.ui.model.Filter("Campo", sap.ui.model.FilterOperator.BT, "RBUKRS", oFilterCompany[i].toString());
                    oFilters.push(oTabFilter);
                }

                /// Unidades EConomiCas
                for (var i = 0; i < oFilterUnidades.length; i++) {
                    var oTabFilter = new sap.ui.model.Filter("Campo", sap.ui.model.FilterOperator.BT, "SWENR", oFilterUnidades[i].toString());
                    oFilters.push(oTabFilter);
                }                

                var vCboDtLanc = this.getView().byId("cboDtLanc");
                var sFrom   = vCboDtLanc.mProperties.dateValue,
				    sTo     = vCboDtLanc.mProperties.secondDateValue;

                /// DT INI
                if (sFrom != null)
                { vFilterDtFrom = this.ConvertDate(sFrom); }
                else
                { vFilterDtFrom = "19000101"; }

                var oTabFilter = new sap.ui.model.Filter("Campo", sap.ui.model.FilterOperator.BT, "DTINI", vFilterDtFrom );
                oFilters.push(oTabFilter);

                /// DT FIM
                if (sTo != null)
                { vFilterDtTo = this.ConvertDate(sTo); }
                else
                { vFilterDtTo = "99991231"; }
                var oTabFilter = new sap.ui.model.Filter("Campo", sap.ui.model.FilterOperator.BT, "DTFIM", vFilterDtTo);
                oFilters.push(oTabFilter);

                ///////////////////////////////////////////////////////////////////

                oModel.read("/ZENT_REPORTSet", {

                    success: function (oData, response) {
                        this.WriteData(oData);
                    }.bind(this),
                    error: function (err) {
                        sap.ui.core.BusyIndicator.hide();
                    },
                    filters: oFilters
                }
                );

            },

            ConvertDate: function (date) {

                var vConvDate;

                var vDay    = date.getDate().toString();
                if ( vDay < 10)
                { vDay = "0" + vDay };
                
                var vMonth  = ( date.getMonth() + 1 ).toString();
                { vMonth = "0" + vMonth };

                var vYear   = date.getFullYear().toString();

                vConvDate = vYear + vMonth + vDay;

                return vConvDate;

            },


            OnSearch: function (oEvent) {
                this.LoadTab();
            },

            handleDetails: function (evt) {

                //var oRouter = this.getOwnerComponent().getRouter();
                //var vRouter = sap.ui.core.UIComponent.getRouterFor(this);

                //vRouter.navTo("TargetDetails");
                //oRouter.navTo("TargetDetails", true);

                var oRouter = sap.ui.core.UIComponent.getRouterFor(this); 
                oRouter.navTo("Routedetails");

            },

            handleLinkPredio: function (evt) {
                debugger;
                // Empresa
                var vRBUKRS = evt.getSource().getBindingContext().getObject("RBUKRS");

                // Unidade Economica 
                var vSWENR = evt.getSource().getBindingContext().getObject("SWENR");
                
                // Edificio
                var vSGENR = evt.getSource().getBindingContext().getObject("SGENR");

/*                 var xNavigation = sap.ushell && sap.ushell.Container && sap.ushell.Container.getService && sap.ushell.Container.getService(
                    "CrossApplicationNavigation");

                var href = (xNavigation && xNavigation.hrefForExternal({
                    target: {
                        sematicObject: "REMasterData",
                        action: "manageBuilding"
                    },
                    params: {
                        "CompanyCode": vRBUKRS,
                        "REBusinessEntity": vSWENR,
                        "RealEstateBuilding": vSGENR
                    }
                })) || ""; */

                //var finalUrl = window.location.href.split("#")[0] + href;
                var finalUrl = window.location.href.split("#")[0] + "#REMasterData-manageBuilding?CompanyCode="+vRBUKRS+"&REBusinessEntity="+vSWENR+"&RealEstateBuilding="+vSGENR;
                sap.m.URLHelper.redirect(finalUrl, false);

/*                 xNavigation.toExternal({
                    target: {
                        shellHash: href
                    }
                }); */

            },

            getRouter : function () {
                return UIComponent.getRouterFor(this);
            },            

            WriteData: function (results) {

                var vRouter = sap.ui.core.UIComponent.getRouterFor(this);
                var oTable = this.getView().byId("TabReport");
                var linha_atual;
                var col_array = [];
                var row_obj = {};
                var row_array = [];
                var vType = "";
                var vObject = "";

                var array = results.results;

                for (var i = 0; i < array.length; i++) {

                    if (linha_atual != array[i].Linha) {
                        linha_atual = array[i].Linha;

                        if (linha_atual != 1) {
                            row_array.push(row_obj);
                            row_obj = {};
                        }

                    }

                    // Monta Array das Colunas (Primeira linha)
                    if (linha_atual == 1) {
                        col_array.push({ columnName: array[i].Campo, columnTit: array[i].Descricao });
                    }

                    // Monta Array dos Dados
                    row_obj[array[i].Campo] = array[i].Valor;

                    // Guarda valores totais
                    if (array[i].Campo == 'TOTAL') {
                        vTotal += parseFloat(array[i].Valor);
                    }

                    // Última linha de resultados
                    if (i == (array.length - 1)) {
                        row_array.push(row_obj);
                        row_obj = {};
                    }

                };

                // Coluna Detalhes
                col_array.push({ columnName: "DETALHES", columnTit: "Detalhes" });

                var oModel = new sap.ui.model.json.JSONModel();
                oModel.setData({
                    rows: row_array,
                    columns: col_array
                });

                oTable.setModel(oModel);

/*                 oTable.bindAggregation("columns", "/columns", function (index, context) {
                    if (context.getObject().columnName == 'MORADA') {
                        return new sap.m.Column({
                            header: new sap.m.Label({ text: context.getObject().columnTit }),
                            width: "30rem"
                        });
                    }
                    if (context.getObject().columnName == 'RBUKRS' || context.getObject().columnName == 'GJAHR') {
                        return new sap.m.Column({
                            header: new sap.m.Label({ text: context.getObject().columnTit }),
                            width: "6rem"
                        });
                    }
                    else {
                        return new sap.m.Column({
                            header: new sap.m.Label({ text: context.getObject().columnTit }),
                            width: "10rem"
                        });
                    }
                }); */

                // Formata Linhas
                for (var i = 0; i < col_array.length; i++) {

                    if (col_array[i].columnName == 'MORADA') {
                        var oCell = new sap.m.Text({
                            text: {
                                parts: [{ path: col_array[i].columnName }]
                            }
                        }
                        );
                    }
                    else if (col_array[i].columnName == 'SGENR') {
                        var oCell = new sap.m.Link({
                            text: {
                                parts: [{ path: col_array[i].columnName }]
                            },
                            press: function (oEvent) {
                                this.handleLinkPredio(oEvent)
                            }.bind(this)
                        }
                        );
                    }
                    else if (col_array[i].columnName == 'DETALHES') {
                        var oCell = new sap.m.Button({
                            text: "Ver Documentos",
                            press: function (oEvent) {
                                this.handleDetails(oEvent)
                            }.bind(this)
                        }
                        );
                    }
                    else {
                        var oCell = new sap.m.Text({
                            text: {
                                parts: [{ path: col_array[i].columnName }]
                            }
                        });
                    }

                    oCelulas.push(oCell);

                };

                var oTemplateRows = new sap.m.ColumnListItem(
                    { cells: oCelulas }
                );

                // M.TABLE
                //oTable.bindItems("/rows", oTemplateRows);
                
                // UI.TABLE
                 oTable.bindColumns("/columns", function(sId, oContext) {
                    var sColumnId = oContext.getObject().columnName;
                    var sColumnTit = oContext.getObject().columnTit;
                    var sTemplate = new sap.m.Text({
                        text: {
                            parts: [{ path: sColumnId }]
                        }
                    });
                    var sWidth;

                    if (sColumnId == 'SWENR' || sColumnId == 'SGENR' || sColumnId == 'SGRNR')
                    {
                        sTemplate = new sap.m.Link({
                            text: {
                                parts: [{ path: sColumnId }]
                            },
                            press: function (evt) {

                                // Empresa
                                var vRBUKRS = evt.getSource().getBindingContext().getObject("RBUKRS");

                                // Unidade Economica 
                                var vSWENR = evt.getSource().getBindingContext().getObject("SWENR");

                                var finalUrl;

                                // Unidade Economica
                                if ( sColumnId == 'SWENR' ){
                                    finalUrl = window.location.href.split("#")[0] + "#REMasterData-manageBusinessEntity?CompanyCode="+vRBUKRS+"&REBusinessEntity="+vSWENR;
                                }
                                // Edificio
                                else if ( sColumnId == 'SGENR' ){
                                    var vSGENR = evt.getSource().getBindingContext().getObject("SGENR");
                                    finalUrl = window.location.href.split("#")[0] + "#REMasterData-manageBuilding?CompanyCode="+vRBUKRS+"&REBusinessEntity="+vSWENR+"&RealEstateBuilding="+vSGENR;
                                }
                                // Terreno
                                else if ( sColumnId == 'SGRNR' ){
                                    var SGRNR = evt.getSource().getBindingContext().getObject("SGRNR");
                                    finalUrl = window.location.href.split("#")[0] + "#REMasterData-manageProperty?CompanyCode="+vRBUKRS+"&REBusinessEntity="+vSWENR+"&RealEstateProperty="+SGRNR;
                                }

                                sap.m.URLHelper.redirect(finalUrl, true);

                            }
                        }
                        );
                        sWidth = "8rem";
                    }
                    else if (sColumnId == 'TOTAL')
                    {
                        sTemplate = new sap.m.Label({
                            text: {
                                parts: [{ path: sColumnId }, { path: 'EUR' }],
                                type: 'sap.ui.model.type.Currency',
                                formatOptions: { showMeasure: true }
                            },
                            design: "Bold"
                        });
                        sWidth = "8rem";
                    }   
                    else if (sColumnId.includes('PARAM') || sColumnId == 'OUTRAS' )
                    {
                        sTemplate = new sap.m.Label({
                            text: {
                                parts: [{ path: sColumnId }, { path: 'EUR' }],
                                type: 'sap.ui.model.type.Currency',
                                formatOptions: { showMeasure: true }
                            }
                        });
                        sWidth = "8rem";
                    }                      
                    else if (sColumnId == 'DETALHES') {
                        sTemplate = new sap.m.Button({
                            text: "Ver Documentos",
                            press: function (evt) {
                                // Empresa
                                var vRBUKRS = evt.getSource().getBindingContext().getObject("RBUKRS");

                                // ExerCiCio
                                //var vGJAHR = evt.getSource().getBindingContext().getObject("GJAHR");

                                // Unidade Economica 
                                var vSWENR = evt.getSource().getBindingContext().getObject("SWENR");

                                // Edificio
                                var vSGENR = "-";
                                if ( evt.getSource().getBindingContext().getObject("SGENR") != "" )
                                {
                                vSGENR = evt.getSource().getBindingContext().getObject("SGENR");
                                }

                                // Terreno
                                var vSGRNR = "-";
                                if ( evt.getSource().getBindingContext().getObject("SGRNR") != "" )
                                {
                                vSGRNR = evt.getSource().getBindingContext().getObject("SGRNR");
                                }                                

                                vRouter.navTo("Routedetails", {
                                    bukrs: vRBUKRS,    // Empresa
                                    //gjahr: vGJAHR,     // ExerCiCio
                                    swenr: vSWENR,     // Unidade Economica 
                                    sgenr: vSGENR,     // Edificio
                                    sgrnr: vSGRNR,      // Terreno
                                    dtini: vFilterDtFrom,   // Dt Inicio Lançamento
                                    dtfim: vFilterDtTo      // Dt Inicio Lançamento
                                });

                            }
                        }
                        );
                        sWidth = "10rem";
                    }                    
                    else if (sColumnId == 'MORADA')
                    {
                        sTemplate = new sap.m.ObjectStatus({
                            text: {
                                parts: [{ path: sColumnId }]
                            },
                            icon: "sap-icon://home"
                            //inverted: true,
                            //state: "Information"
                        }
                        );                        
                        sWidth = "30rem";
                    }   
                    else if ( sColumnId == 'TPUTI' )
                    {
                        sWidth = "14rem";
                    }   
                    else if ( sColumnId == 'FUNCAO' || sColumnId == 'FINALIDADE')
                    {
                        sWidth = "18rem";
                    }   
                    else if (sColumnId == 'RBUKRS' || sColumnId == 'GJAHR') {
                        sWidth = "5rem";
                    }                                     
                    else if (sColumnId == 'VALFROM' || sColumnId == 'VALTO') {
                        sWidth = "6rem";
                    }                 
                    else
                    {
                        sWidth = "8rem";
                    }

                    return new sap.ui.table.Column({
                        id : sColumnId,
                        label: sColumnTit, 
                        template: sTemplate, 
                        sortProperty: sColumnId, 
                        filterProperty: sColumnId,
                        width: sWidth
                    });
                });

                oTable.bindRows("/rows");

                // Monta Valor Total
                oTotal.setNumber(oCurrencyFormat.format(vTotal, "EUR"));

            }

        });
    });
