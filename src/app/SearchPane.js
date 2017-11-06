define([
    "dojo/parser",
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/on",
    "dojo/json",
    "dojo/request",
    "dojo/dom-style",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/LayoutContainer",
    "dijit/layout/StackContainer",
    "dijit/layout/StackController",
    "dijit/form/Select",
    "dijit/form/Button",
    "dijit/form/ValidationTextBox",
    "dijit/form/TextBox",
    "dijit/form/Textarea",
    "dijit/form/SimpleTextarea",
    "dijit/Dialog",
    "dgrid/Grid",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/CellSelection",
    "dgrid/Keyboard",
    "dijit/TooltipDialog",
    "dijit/Tooltip",
    "dijit/popup",
    "dojo/_base/fx",
    "dijit/layout/BorderContainer",
    "app/CustomizedTooltipDialog",
    "app/RecreateRecordsetDialog",
    "dojo/text!./templates/SearchPane.html",
    "dojo/domReady!"
], function(parser, declare, window, lang, dom1, on, json, request,domStyle,_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, TabContainer, ContentPane, LayoutContainer, StackContainer, StackController, Select, Button, ValidationTextBox, TextBox, Textarea, SimpleTextarea, Dialog, Grid, OnDemandGrid, Selection, CellSelection, Keyboard, TooltipDialog, Tooltip, popup, fx, BorderContainer, CustomizedTooltipDialog, RecreateRecordsetDialog, template, dom) {
     console.log("ENTERED SearchPane");
 
     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        recordsetsGrid: null,
        data: null,
        picked_data: [],
        pickType: 0,
        pickedRecordsets: [],
        currentSearchType: "simple",
        firstCall: 0,
        recordsetsGrid: null,
        recordsGrid: null,
        deleteAllButton: null,
 
        rebuildRecordsetsList: function(resp)
        {
          // this.recordsetsGrid.destroy();
          if(this.deleteAllTooltipDialog != null)
          {
            popup.close(this.deleteAllTooltipDialog);
            this.deleteAllTooltipDialog = null;
          }
          for(var i=0; i<this.tooltips.length; i++)
          {
            this.tooltips[i].destroyRecursive();
            this.tooltips1[i].destroyRecursive();
          }
          request("services/getRecordsets.php").then(lang.hitch(this, this.buildRecordsetsList));
          this.recordsetsGrid = null;
        },

        showRecordsList: function(resp)
        {
          var columns = [
            {field: "gpid", label: "GPID"}
          ];
          var records = json.parse(resp);
          this.gpids = [];
          for(var i=0; i<records.length; i++)
          {
            this.gpids.push({gpid: records[i].gpid});
          }

          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);

          var recordsGrid = new CellSelectionGrid({columns: columns, selectionMode: "single"}, "my_records");
          recordsGrid.refresh(this.gpids);
          recordsGrid.renderArray(this.gpids);
          if(this.recordsGrid == null)
          {
            this.recordsGrid = recordsGrid;
            on(this.recordsGrid, "dgrid-select", lang.hitch(this, this.recordSelection));
          }
        },

        recordSelection: function(evt)
        {
          console.log("GPID selection", evt);

          var evtType = evt.type;
          if(evtType == "dgrid-select")
          {
            var cells = evt.cells[0];
            var column = cells.column.field;
            var gpid = cells.row.data.gpid;
            if(column == "gpid")
            {
              // Show GPID in its pane
              var gpidPane = window.global.app.widgets.GpidPane;
              gpidPane.idType.set("value", "gpid");
              gpidPane.CurrentIdType = "gpid";
              var a;
              a = lang.hitch(gpidPane, gpidPane.populateByGpid);
              a(gpid);
            }
          }
        },

        confirmDeleteAllRecordsets: function()
        {
          console.log("confirmDeleteAllRecordsets");
          this.deleteAllTooltipDialog = new CustomizedTooltipDialog({
            style: "width: 250px;",
            caller: this
          });

          popup.open({
            popup: this.deleteAllTooltipDialog,
            around: this.deleteAllButton.domNode
          });
        },

        clicked_cancel_del: function()
        {
          console.log("cda!:", this);
          popup.close(this.deleteAllTooltipDialog);
          this.deleteAllTooltipDialog = null;
        },

        clicked_del: function()
        {
          console.log("da!:", this);
          if(this.recordsGrid != null)
          {
            this.recordsGrid.destroy();
            this.recordsGrid = null;
            this.records.set('title', "Records for " + name);
          }
          request("services/deleteAllRecordsets.php").then(lang.hitch(this, this.waitAndRebuildRecordsetsList));
        },

        waitAndRebuildRecordsetsList: function()
        {
          setTimeout(lang.hitch(this, this.rebuildRecordsetsList), 1000);
        },

        buildRecordsetsList: function(resp)
        {
          var columns = [
            {field: "info", label: "", 
                        renderHeaderCell: lang.hitch(this,function(object,value,node,options)
                          {
                            self = this;
                            this.deleteAllButton = new ContentPane({
                                            content: '<img src="app/images/delete_all.gif">',
                                            onClick: lang.hitch(self, self.confirmDeleteAllRecordsets)
                                        });
                            return this.deleteAllButton.domNode;
                          }),
                          sortable: false,
                          formatter: function (url) { return '<img src="app/images/info-icon.gif"/>';}},
            {field: "name", label: "Name"},
            {field: "created", label: "Date"},
            {field: "description", label: "Description"}
          ];
          var recordsets = json.parse(resp);

          this.data = [];
          for(var i=0; i<recordsets.length; i++)
          {
            var e = recordsets[i];
            if(e.definition == false) e.definition = "";
            if(e.description == false) e.description = "";
            this.data.push({name: e.name, created: e.created, description: e.description, definition: e.definition, gpidcount: e.gpidcount});
          }
          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);

          var recordsetsGrid = new CellSelectionGrid({columns: columns, selectionMode: "single"}, "my_recordsets");
          recordsetsGrid.refresh(this.data);
          recordsetsGrid.renderArray(this.data);
          if(this.recordsetsGrid == null)
          {
            this.recordsetsGrid = recordsetsGrid;
            on(this.recordsetsGrid, "dgrid-select,dgrid-deselect", lang.hitch(this, this.recordsetSelection));
            on(this.recordsetsGrid, "dgrid-sort", lang.hitch(this, this.reattachTooltips));
          }
          
          this.attachTooltipDialogs();

        },

        reattachTooltips: function()
        {
          for(var i=0; i<this.tooltips.length; i++)
          {
            this.tooltips[i].destroyRecursive();
            this.tooltips1[i].destroyRecursive();
          }
          setTimeout(lang.hitch(this, this.attachTooltipDialogs), 1000);
          // this.attachTooltipDialogs();
        },

        recordsetSelection: function(evt)
        { 
          var evtType = evt.type;
          if(evtType == "dgrid-select")
          {
            var cells = evt.cells[0];
            var column = cells.column.field;
            var element = cells.element;
            var name = cells.row.data.name;
            if(column == "info")
            {
            }
            if(column == "name")
            {
              if(this.pickType == 0) // Picking for displaying
              {
                this.records.set('title', "Records for " + name);
                this.recordsetContainer.selectChild(this.records);

                request("services/getRecordset.php?recordset=" + name).then(lang.hitch(this, this.showRecordsList));
                request("services/currentRecordset.php?recordset=" + name);
                dojo.byId("download_link").style.visibility = 'visible';
              }
              else // Picking for combination
              {
                console.log("Picked", name);
                fx.animateProperty({
                  node: element,
                  properties: 
                  {
                    opacity: 0.3
                  }
                }).play();
            
                this.picked_data.push({name: name, element: element});
                this.pickedRecordsetsGrid.refresh(this.picked_data);
                this.pickedRecordsetsGrid.renderArray(this.picked_data);
              }
            }
          }
        },

        attachTooltipDialogs: function()
        {
          this.tooltips = new Array();
          this.tooltips1 = new Array();
          this.datecells = new Array();
          this.timeouts = new Array();
          for(var i=0; ; i++)
          {
            var node=dom1.byId("my_recordsets-row-" + i);
            if(node == null) break;
            this.datecells[i] = node.childNodes[0].childNodes[0].childNodes[2];
            var name = node.childNodes[0].childNodes[0].childNodes[1].innerHTML;
            var num = 0;
            var def = "..";
          
            for(j=0; j<this.data.length; j++)
            {
              if(this.data[j].name == name)
              {
                num = this.data[j].gpidcount;
                def = this.data[j].definition;
                break;
              }
            }
            this.tooltips[i] = new RecreateRecordsetDialog({
              caller: this,
              recordsetName: name,
              recordsCount: num,
              recordsetNumber: i,
              createDate: this.datecells[i].innerHTML,
              style: "width: 220px;",
              onMouseLeave: lang.hitch(this, this.closeTooltip, i)
            });

            on(this.datecells[i], 'mouseover', lang.hitch(this, this.planToOpenTooltip, i));
            on(this.datecells[i], 'mouseout', lang.hitch(this, this.dontOpenTooltip, i));
            this.tooltips1[i] = new Tooltip({
              connectId: [node.childNodes[0].childNodes[0].childNodes[0]],
              label: "GPIDs: " + num + ";<br>SQL: " + def,
              position: ["before"]
            });
          }
        },

        planToOpenTooltip: function(i)
        {
          this.timeouts[i] = setTimeout(lang.hitch(this, this.openTooltip, i), 2000);
        },
        
        dontOpenTooltip: function(i)
        {
          clearTimeout(this.timeouts[i]);
        },
    
        openTooltip: function(i)
        {
          popup.open({
            popup: this.tooltips[i],
            around: this.datecells[i]
          });
        },

        closeTooltip: function(i)
        {
          {
            popup.close(this.tooltips[i]);
          }
        },

        recreateButtonClicked1: function(name, i, from)
        {
          console.log("recreateButtonClicked1", name, i, from);
          from.show_confirm_recreate();
        },

        deleteButtonClicked1: function(name, i, from)
        {
          console.log("deleteButtonClicked1");
          from.show_confirm_delete();
        },
        confirmRecreateButtonClicked1: function(name, i, from)
        {
          console.log("confirmRecreateButtonClicked1");
          this.closeTooltip(i);
          request("services/recreateRecordset.php?recordset=" + name).then(lang.hitch(this, this.rebuildRecordsetsList));
        },

        confirmDeleteButtonClicked1: function(name, i, from)
        {
          console.log("confirmDeleteButtonClicked1");
          this.closeTooltip(i);
          request("services/deleteRecordset.php?recordset=" + name).then(lang.hitch(this, this.rebuildRecordsetsList));
        },

        searchTypeChanged: function(selectedSearchType)
        {
          if(selectedSearchType == "simple")
          {
            this.currentSearchType = "simple";
            this.searchStackContainer.selectChild(this.simplePane);
            this.findButton.set('disabled', false);
          }
          if(selectedSearchType == "special")
          {
            this.currentSearchType = "special";
            this.searchStackContainer.selectChild(this.specialPane);
            this.findButton.set('disabled', true);
          }
          if(selectedSearchType == "expert")
          {
            this.currentSearchType = "expert";
            this.searchStackContainer.selectChild(this.expertPane);
            this.findButton.set('disabled', true);
          }
        },

        findButtonClicked: function(evt)
        {     
          if(this.currentSearchType == "simple")
          {
            var columnName = this.columnName.value;
            var filterOperator = this.filterOperator.value;
            var what_input = this.what_input.value;
            if(this.whatValidator(what_input) == true)
            {
              var scope = this.rcCode.value;
              console.log("columnName:", columnName);
              console.log("filterOperator:", filterOperator);
              console.log("what_input:", what_input);
              this.searchStackContainer.selectChild(this.searchProgress);
              request("services/simpleSearch.php?column=" + columnName + "&operator=" + filterOperator + "&attribute=" + what_input + "&scope=" + scope).then(lang.hitch(this, this.showSaveRecordsetPane));
            }
          }
          if(this.currentSearchType == "expert")
          {
            var sql = this.expert_rule.get('value');
            request("services/expertSearch.php?sql=" + sql).then(lang.hitch(this, this.showSaveRecordsetPane));
          }
          if(this.currentSearchType == "special")
          {
            var strlist = "";
            for (var property in this)
            {
              if(this.hasOwnProperty(property))
              {
                if(property.substr(0,9) == "admin_dys")
                {
                  strlist = strlist + "&" + this[property].name + "=" + this[property].get('value');
                }
              }
            }
            strlist = strlist.substr(1);
            this.searchStackContainer.selectChild(this.searchProgress);
            request("services/specialSearch.php?" + strlist).then(lang.hitch(this, this.showSaveRecordsetPane));
        
          }
        },

        showSaveRecordsetPane: function(resp)
        {
          this.searchStackContainer.selectChild(this.searchResult);
          var node = dojo.byId("gpids_count");
          var resp1 = json.parse(resp);
          var gpids_count = resp1.gpids;
          node.innerHTML = gpids_count;
          this.recordset_name.set('value', '');
          this.recordset_description.set('value', '');
        },

        doDismissRecordset: function()
        {
          if(this.currentSearchType == "expert") this.searchStackContainer.selectChild(this.expertPane);
          if(this.currentSearchType == "simple") this.searchStackContainer.selectChild(this.simplePane);
          if(this.currentSearchType == "special") this.searchStackContainer.selectChild(this.specialPane);
        },

        doSaveRecordset: function(resp)
        {
          this.recordsetContainer.selectChild(this.myRecordsets);
          var name = this.recordset_name.value;
          var description = this.recordset_description.value;
          request("services/saveRecordset.php?recordset=" + name + "&description=" + description).then(lang.hitch(this, this.rebuildRecordsetsList));
          this.searchStackContainer.selectChild(this.simplePane);
        },
        whatValidator: function(value)
        {
          if(value.length > 0)
          {
            this.findButton.set('disabled', false);
            return true;
          }

          this.findButton.set('disabled', true);
          return false;
        },

        strValidator: function(value)
        {
          var nonempty = 0;
          var valid_values = 0;
          for (var property in this)
          {
            if(this.hasOwnProperty(property))
            {
              if(property.substr(0,9) == "admin_dys")
              {
                var data = this[property].get('value');
                if(data == "") valid_values++;
                else
                {
                  if (/^\d+$/.test(data))
                  {
                    if(data != "0") valid_values++;
                  }
                }
                if(data != "") nonempty++;
              }
            }
          }
          if(nonempty > 0 && valid_values == 12) this.findButton.set('disabled', false);
          else this.findButton.set('disabled', true);
          if(/^\d+$/.test(value) || value == "") return true;
          return false;
        },

        recordsetNameValidator: function(value)
        {
          var good = 1;
          if(value == '')
          {
            this.recordset_name.set('invalidMessage', "Recordset name must be specified.");
            good = 0;
          }
          if(value.indexOf(' ') >= 0)
          {
            this.recordset_name.set('invalidMessage', "Space is not allowed in name.");
            good = 0;
          }
          if(value.indexOf('|') >= 0)
          {
            this.recordset_name.set('invalidMessage', "Pipe is not allowed in name.");
            good = 0;
          }
          if(value.indexOf(',') >= 0)
          {
            this.recordset_name.set('invalidMessage', "Comma is not allowed in name.");
            good = 0;
          }
          if(value.indexOf(';') >= 0)
          {
            this.recordset_name.set('invalidMessage', "Semicolon is not allowed in name.");
            good = 0;
          }
          if(value.indexOf('/') >= 0)
          {
            this.recordset_name.set('invalidMessage', "Slash is not allowed in name.");
            good = 0;
          }
          if(this.data != null)
          {
            for(var i=0; i<this.data.length; i++)
            {
              if(this.data[i].name == value)
              {
                this.recordset_name.set('invalidMessage', "Recordset already exists.");
                good = 0;
              }
            }
          }
          if(good == 0)
          {
            this.saveRecordset.set('disabled', true);
            return false;
          }
          this.saveRecordset.set('disabled', false);
          return true;
        },

        validateSql: function(newval)
        {
          var value;
          value = this.expert_rule.get('value');
          console.log("Current SQL stmt is:", value);
          request("services/validateSql.php?sql=" + value).then(lang.hitch(this, this.sqlChecked));
        },
 
        sqlChecked: function(resp)
        {
          var resp1 = json.parse(resp);
          if(resp1.result =="success")
          {
            this.findButton.set('disabled', false);
          }
          else
          {
            this.sqlError.set('content', resp1.errmsg);
            popup.open({
              popup: this.sqlError,
              around: "expert_rule"
            });
          }
        },

        closeSqlError: function()
        {
          popup.close(this.sqlError);
        },

        disableFindButton: function()
        {
          this.findButton.set('disabled', true);
        },

        userLoggedIn: function()
        {
          request("services/getRecordsets.php").then(lang.hitch(this, this.buildRecordsetsList));
        },

        pickRecordsetsButtonClicked: function()
        {
          this.pickType = 1;
          this.recordsetContainer.selectChild(this.myRecordsets);
        },

        finishPickingButtonClicked: function()
        {
          this.pickType = 0;
          // this.rebuildRecordsetsList();
          // Restore opacity
          for(var i=0; i<this.picked_data.length; i++)
          {
            this.picked_data[i].element.style.opacity = 1;
            console.log("element:", this.picked_data[i].element);
          }
          var ctype = this.combinationType.value;
          // Now do the combination
          var recordsetList = "";
          for(var i=0; i<this.picked_data.length; i++)
          {
            recordsetList = recordsetList + "/" + this.picked_data[i].name;
          }
          this.searchStackContainer.selectChild(this.searchProgress);
          this.recordsetContainer.selectChild(this.search);
          request("services/combineRecordsets.php?combination=" + ctype + "&list=" + recordsetList).then(lang.hitch(this, this.showSaveRecordsetPane));
        },

        resetPickButtonClicked: function()
        {
          // Restore opacity
          for(var i=0; i<this.picked_data.length; i++)
          {
            this.picked_data[i].element.style.opacity = 1;
            console.log("element:", this.picked_data[i].element);
          }
          this.picked_data = [];
          this.pickedRecordsetsGrid.refresh(this.picked_data);
          this.pickedRecordsetsGrid.renderArray(this.picked_data);
          this.pickType = 0;
          this.resetPick.set('disabled', true);
          this.finishPicking.set('disabled', true);
        },

        searchFocused: function()
        {
          if(this.currentSearchType == "simple")
          {
            this.searchStackContainer.selectChild(this.simplePane);
          }
          if(this.currentSearchType == "special")
          {
            this.searchStackContainer.selectChild(this.specialPane);
          }
          if(this.currentSearchType == "expert")
          {
            this.searchStackContainer.selectChild(this.expertPane);
          }
        },

        combineRecordsetsFocused: function()
        {
          console.log("combineRecordsetsFocused:", this);
          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);

          if(this.firstCall == 0)
          {
            this.firstCall = 1;
            var columns1 = [ {field: "name", label: "Name"}];
            this.pickedRecordsetsGrid = new CellSelectionGrid({columns: columns1, selectionMode: "single"}, "combine_recordsets");
            this.pickedRecordsetsGrid.refresh(this.picked_data);
            this.pickedRecordsetsGrid.renderArray(this.picked_data);
          }
          this.finishPicking.set('disabled', true);
          this.resetPick.set('disabled', true);
          if(this.picked_data.length >=1) this.resetPick.set('disabled', false);
          if(this.picked_data.length >=2) this.finishPicking.set('disabled', false);
        },

        postCreate: function()
        {
          console.log("SearchPane postCreate:", this);
          this.searchTypeSelect.on("change", lang.hitch(this, this.searchTypeChanged));
          this.recreate.onClick = lang.hitch(this, this.recreateButtonClicked);
          this.findButton.onClick = lang.hitch(this, this.findButtonClicked);
          this.dismissRecordset.onClick = lang.hitch(this, this.doDismissRecordset);
          this.saveRecordset.onClick = lang.hitch(this, this.doSaveRecordset);
          this.validate_sql_button.onClick = lang.hitch(this, this.validateSql);
          this.searchStackContainer.domNode.style.backgroundColor="#EEE";
          this.recordset_name.validator = lang.hitch(this, this.recordsetNameValidator);
          this.what_input.validator = lang.hitch(this, this.whatValidator);
          for (var property in this)
          {
            if(this.hasOwnProperty(property))
            {
              if(property.substr(0,9) == "admin_dys") this[property].validator = lang.hitch(this, this.strValidator);
            }
          }
          this.combineRecordsets.onShow = lang.hitch(this, this.combineRecordsetsFocused);
          this.search.onShow = lang.hitch(this, this.searchFocused);
          this.expert_rule.onFocus = lang.hitch(this, this.disableFindButton);
          this.sqlError = new TooltipDialog({
              style: "width: 300px;",
              content: "---",
              onMouseLeave: lang.hitch(this, this.closeSqlError)
          });

          this.pickRecordsets.onClick = lang.hitch(this, this.pickRecordsetsButtonClicked);
          this.finishPicking.onClick = lang.hitch(this, this.finishPickingButtonClicked);
          this.resetPick.onClick = lang.hitch(this, this.resetPickButtonClicked);

          window.global.app.widgets.SearchPane = this;
          this.findButton.set('disabled', true);
        }
    });
});
