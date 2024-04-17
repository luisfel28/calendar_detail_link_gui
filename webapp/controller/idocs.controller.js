sap.ui.define([
    "sap/ui/core/mvc/Controller",
    "sap/ui/model/json/JSONModel",
    "sap/ui/unified/library",
	"sap/ui/core/Fragment"	
],
    /**
     * @param {typeof sap.ui.core.mvc.Controller} Controller
     */
    function (Controller, JSONModel, unifiedLibrary, Fragment) {
        "use strict";
        var CalendarDayType = unifiedLibrary.CalendarDayType;
		var array_app = [];
		var array_sup = [];		
		var vDtIdoc = "";
		var oDateFormat 	= sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" });

        return Controller.extend("com.fidelidademundial.resumoidocs.controller.idocs", {
            onInit: function () {

				var vDateIni = new Date();
				vDateIni.setDate( vDateIni.getDate() - 90 );
				

				var vDtIniFormat = sap.ui.core.format.DateFormat.getDateInstance({ pattern: "yyyy-MM-dd" });

				var oDtIni = vDtIniFormat.format(vDateIni);
				oDtIni = oDtIni + "T00:00:00";

				var oDados = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZI_IDOC_SUM_DATES_CDS", true);
				var oFilters = [];

					oDados.read("/ZI_IDOC_SUM_DATES(p_dtini=datetime'" + oDtIni + "')/Set", {
					success: function (oData, response) {
						this.WriteData(oData);
					}.bind(this),
					error: function (err) {
						sap.ui.core.BusyIndicator.hide();
					}
				}
				);

            },

			WriteData: function (results) {
				
				var array = results.results;
				var vDia,
					vMes,
					vAno;

				for (var i = 0; i < array.length; i++) {
					
					  var vData;
					  if (array[i].credat) {
					  var oDateFormat = sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "MM-dd-yyyy" });
					  	vData = oDateFormat.format(new Date(array[i].credat));
					  } else {
						vData = array[i].credat;
					  }


					vDia = (vData.substring(3, 5));
					vMes = ( (vData.substring(0, 2)) - 1 );
					vAno = (vData.substring(6));


					if ( array[i].entradas > 0)
					{
						array_app.push({ 
							title: array[i].entradas + "  (OK: " + array[i].entradas_ok + " / Erros: " + array[i].entradas_err + " )",
							text: "Entradas",
							type: "Type01",
							icon: "sap-icon://inbox",
							startDate: new Date(vAno, vMes, vDia),
							endDate: new Date(vAno, vMes, vDia)
						});
					}

					if ( array[i].saidas > 0)
					{
						array_app.push({ 
							title: array[i].saidas + "  (OK: " + array[i].saidas_ok + " / Erros: " + array[i].saidas_err + " )",
							text: "Saídas",
							type: "Type09",
							icon: "sap-icon://outbox",
							startDate: new Date(vAno, vMes, vDia),
							endDate: new Date(vAno, vMes, vDia)
						});
					}					

				}

				var oModel = new JSONModel();

				var vHoje       = new Date();

                oModel.setData({
					//startDate: new Date("2024", "04", "01"),
					startDate: new Date(),
					ZI_IDOC_SUM_DATES: array_app
			    }); 
				this.getView().setModel(oModel);				

			},

			handleAppointmentSelect: function (oEvent) {
				 var oAppointment 	= oEvent.getParameter("appointment"),
				 	//oDateFormat 	= sap.ui.core.format.DateFormat.getDateTimeInstance({ pattern: "dd.MM.yyyy" }),
				 	oData			= oDateFormat.format(oAppointment.mProperties.startDate),
					oDirecao,
					oTitulo			= oAppointment.mProperties.title.toString(),
					oIcon,
					oDirect,
					oModelDet,
					oView = this.getView();

					// Converte Formato de Hora
					//var oDtIdoc = sap.ui.model.odata.ODataUtils.formatValue(oAppointment.getStartDate(), "Edm.DateTime");

					var dateFormat = sap.ui.core.format.DateFormat.getDateInstance({
						pattern: "yyyy-MM-dd"
					});
					var oDtIdoc = dateFormat.format(new Date(oAppointment.getStartDate()));
					oDtIdoc = oDtIdoc + "T00:00:00";

					if ( oAppointment.mProperties.icon.toString() == "sap-icon://inbox" )
					{ 
						oIcon = "sap-icon://inbox"; 
						oDirect = 2;
						oDirecao = "Entradas";
					}
					else
					{ 
						oIcon = "sap-icon://outbox"; 
						oDirect = 1;
						oDirecao = "Saídas";
					}

					var oDadosDet = new sap.ui.model.odata.ODataModel("/sap/opu/odata/sap/ZI_IDOC_DATE_DETAIL_CDS", true);
					var oFilters = [];
	
					//oDadosDet.read("/ZI_IDOC_DATE_DETAIL(p_direct='"+oDirect+"',p_dtidoc=datetime'2024-04-01T00:00:00')/Set", {
					oDadosDet.read("/ZI_IDOC_DATE_DETAIL(p_direct='" + oDirect + "',p_dtidoc=datetime'" + oDtIdoc + "')/Set", {
	
						success: function (oData, response) {
							this.WriteDataDet(oData);
						}.bind(this),
						error: function (err) {
							sap.ui.core.BusyIndicator.hide();
						}
					}
					);


					oModelDet = new JSONModel();
					vDtIdoc = oData;
					oModelDet.setData({
						titulo: oDirecao + " / " + oData + ' - ' + oTitulo
					});
					this.getView().setModel(oModelDet, "detalhes");


				if (!oAppointment.getSelected() && this._pDetailsPopover) {
				this._pDetailsPopover.then(function(oResponsivePopover){
					oResponsivePopover.close();
				});
				return;
				}

				if (!this._pDetailsPopover) {
					this._pDetailsPopover = Fragment.load({
						id: oView.getId(),
						name: "com.fidelidademundial.resumoidocs.view.Details",
						controller: this
					}).then(function(oResponsivePopover){
						oView.addDependent(oResponsivePopover);
						return oResponsivePopover;
					});
				}
				this._pDetailsPopover.then(function (oResponsivePopover) {
					oResponsivePopover.setBindingContext(oAppointment.getBindingContext());
					oResponsivePopover.openBy(oAppointment);
				}); 
			},

			handleLinkIdoc: function (evt) {
                
				debugger;
                
				// IDOC
                //var vIdoc = evt.getSource().getBindingContext().getObject("LnkIdoc");
				var vIdoc = evt.oSource.mProperties.text;

                //var finalUrl = window.location.href.split("#")[0] + "~transaction=WE19&MSED7START-EXIDOCNUM=" + vIdoc;
				var finalUrl = window.location.origin + "/sap/bc/gui/sap/its/webgui?~transaction=*WE02%20DOCNUM-LOW=" + vIdoc + ";CREDAT-LOW="+vDtIdoc+";DYNP_OKCODE=SHOW";
                sap.m.URLHelper.redirect(finalUrl, true);

            },

			WriteDataDet: function (results) {
				
				var oModelRes = new JSONModel();
				oModelRes.setData(results);
				this.getView().setModel(oModelRes, "resultados");

			}			

        });
    });
