define([
    "dojo/parser",
    "dojo/dom-construct",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/json",
    "dojo/request",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Form",
    "dijit/form/ValidationTextBox",
    "dijit/form/SimpleTextarea",
    "dijit/form/Button",
    "dijit/form/Select",
    "dojox/gfx",
    "dgrid/Grid",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dgrid/extensions/DijitRegistry",
    "dojo/text!./templates/EditAdmixture.html",
    "dojo/_base/array",
    "dgrid/OnDemandGrid",
    "dgrid/editor",
    "dijit/InlineEditBox",
    "dgrid/Selection",
    "dgrid/CellSelection",
    "dgrid/Keyboard",
    "dojo/domReady!"
], function(parser, domConstruct, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, Select, gfx, Grid, ContentPane, BorderContainer, DijitRegistry, template, arrayUtil, OnDemandGrid, editor, InlineEditBox, Selection, CellSelection, Keyboard, domReady) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        columns: null,
        updates: null,

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        onSaveButtonClick: function(arg)
        {
          console.log("save button:", this);
          console.log("arg:", arg);
          var updates_json = json.stringify(this.updates);
          request("services/saveParticipantAdmixture.php?gpid=" + this.gpid + "&rc=" + this.rc + "&updates=" + updates_json);
          this.updates = [];
          this.adm_save_button.set('disabled', true);
          this.adm_undo_button.set('disabled', true);
        },
        onUndoButtonClick: function(arg)
        {
          console.log("undo button:", this);
          console.log("arg:", arg);
          this.updates = [];
          request("services/getParticipantAdmixture.php?rc=" + this.rc + "&gpid=" + this.gpid).then(lang.hitch(this, this.redoGrid));
          this.adm_save_button.set('disabled', true);
          this.adm_undo_button.set('disabled', true);
        },

        redoGrid: function(response)
        {
          this.reference_pop_composition = [{}];
          var ac = [];
          var c = json.parse(response);

          for(var i=0; i<c.length; i++)
          {
            var d = c[i];
            console.log("d:", d);
            ac["a_" + d.popid] = d.share;
          }
          // ac["a_id"] = 0;
          console.log("ac:", ac);
          this.reference_pop_composition[0] = ac;

          this.doTotal();

        },

        doTotal: function()
        {
          var t=0;
          for (var property in this.reference_pop_composition[0])
          {
            if(property != "a_total")
            {
              console.log("prop:", property, ", value:", this.reference_pop_composition[0][property]);
              t = t + parseFloat(this.reference_pop_composition[0][property]);
            }
          }
          this.reference_pop_composition[0]["a_total"] = Math.round(t * 100.) / 100.;
          this.adm_grid.refresh(this.reference_pop_composition);
          this.adm_grid.renderArray(this.reference_pop_composition);
        },

        doColumns: function(response)
        {
          this.columns = [];
          var c = json.parse(response);
/*
          this.columns.push(editor({ field: "a_popid", label: "Id", id: "col1", editor: "InlineEditBox", editOn: "click"}));
          this.columns.push(editor({ field: "a_popname", label: "Population Name", id: "col2", editor: "InlineEditBox", editOn: "click"}));
*/
          for(var i=0; i<c.length; i++)
          {
            var field = "a_" + c[i].id;
            var label = c[i].name + " (" + c[i].id + ")";
            var id = "c_" + c[i].id;
            this.columns.push(editor({ field: field, label: label,  id: id, editor: "InlineEditBox", editOn: "click"}));
          }
          this.columns.push(editor({ field: "a_total", label: "Total", id: "col0", editor: "InlineEditBox", editOn: "click"}));
          request("services/getParticipantAdmixture.php?rc=" + this.rc + "&gpid=" + this.gpid).then(lang.hitch(this, this.doGrid));
        },

        doGrid: function(response)
        {
// Redo it for just one row
          this.reference_pop_composition = [{}];
          var ac = [];
          var c = json.parse(response);

          for(var i=0; i<c.length; i++)
          {
            var d = c[i];
            console.log("d:", d);
            ac["a_" + d.popid] = d.share;
          }
          // ac["a_id"] = 0;
          this.reference_pop_composition[0] = ac;

          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);

          this.adm_grid = new CellSelectionGrid({columns: this.columns, selectionMode: "single", width: "1300px"}, "adm_matrix_div");
          this.doTotal();
          this.adm_grid.on("dgrid-datachange", lang.hitch(this, this.gridDataChange));

        },

        gridDataChange: function(evt)
        {
          var v;
          var evt1 = evt;
          console.log("gridDataChange: value:", evt.value);
          console.log("gridDataChange: column:", evt.cell.column.field);
          console.log("gridDataChange: population:", evt.cell.row.data.a_popid);
          console.log("gridDataChange: evt1:", evt1);
          var obj = {popid: evt.cell.row.data.a_popid, shareof: evt.cell.column.field, value: evt.value};
          this.updates.push(obj);
          this.reference_pop_composition[0][evt.cell.column.field] = evt.value;
          v = parseFloat(evt.value);
          this.adm_save_button.set('disabled', false);
          if(isNaN(v))
          {
            this.adm_save_button.set('disabled', true);
          }
          else
          {
            this.doTotal();
          }
          this.adm_undo_button.set('disabled', false);
        },

        layoutContainers: function()
        {
          console.log("layoutContainers: this:", this);
          this.borderContainer5.startup();
          request("services/getPops.php").then(lang.hitch(this, this.doColumns));
          this.updates = [];
        },

        startup: function()
        {
          console.log("ReferencePopulations startup(): this:", this);
          window.global.app.widgets.ReferencePopulations = this;
          setTimeout(lang.hitch(this, this.layoutContainers), 500);
          this.adm_save_button.onClick = lang.hitch(this, this.onSaveButtonClick);
          this.adm_undo_button.onClick = lang.hitch(this, this.onUndoButtonClick);
          this.adm_save_button.set('disabled', true);
          this.adm_undo_button.set('disabled', true);
        }

    });
});
