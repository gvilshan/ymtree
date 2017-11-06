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
    "dojo/text!./templates/ReferencePopulations.html",
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
          request("services/saveRefPops.php?updates=" + updates_json);
          this.updates = [];
          this.ref_save_button.set('disabled', true);
          this.ref_undo_button.set('disabled', true);
        },
        onUndoButtonClick: function(arg)
        {
          console.log("undo button:", this);
          console.log("arg:", arg);
          this.updates = [];
          request("services/getRefPops.php").then(lang.hitch(this, this.redoGrid));
          this.ref_save_button.set('disabled', true);
          this.ref_undo_button.set('disabled', true);
        },

        redoGrid: function(response)
        {
          this.reference_pop_composition_data = [];
          this.reference_pop_composition = [];
          var c = json.parse(response);
          for(var i=0; i<c.length; i++)
          {
            this.reference_pop_composition[c[i].refpop] = {a_id: c[i].refpop};
          }

          for(var i=0; i<c.length; i++)
          {
            var d = c[i];
            this.reference_pop_composition[d.refpop].a_popid = d.refpop;
            this.reference_pop_composition[d.refpop].a_popname = d.name;
            this.reference_pop_composition[d.refpop]["a_" + d.shareof] = d.share;
          }
          console.log("this.reference_pop_composition:", this.reference_pop_composition);

          for(var i=0; i<this.reference_pop_composition.length; i++)
          {
            var e = this.reference_pop_composition[i];
            if(e !== undefined)
            {
              this.reference_pop_composition_data.push(e);
            }
          }

          this.ref_grid.refresh(this.reference_pop_composition_data);
          this.ref_grid.renderArray(this.reference_pop_composition_data);

        },


        doColumns: function(response)
        {
          this.columns = [];
          var c = json.parse(response);
          this.columns.push(editor({ field: "a_popid", label: "Id", id: "col1", editor: "InlineEditBox", editOn: "click"}));
          this.columns.push(editor({ field: "a_popname", label: "Population Name", id: "col2", editor: "InlineEditBox", editOn: "click"}));
          for(var i=0; i<c.length; i++)
          {
            var field = "a_" + c[i].id;
            var label = c[i].name + " (" + c[i].id + ")";
            var id = "c_" + c[i].id;
            this.columns.push(editor({ field: field, label: label,  id: id, editor: "InlineEditBox", editOn: "click"}));
          }
          this.columns.push(editor({ field: "a_total", label: "Total", id: "col0", editor: "InlineEditBox", editOn: "click"}));
          request("services/getRefPops.php").then(lang.hitch(this, this.doGrid));
        },

        doGrid: function(response)
        {
          this.reference_pop_composition_data = [];
          this.reference_pop_composition = [];
          var c = json.parse(response);
          for(var i=0; i<c.length; i++)
          {
            this.reference_pop_composition[c[i].refpop] = {a_id: c[i].refpop};
          }

          for(var i=0; i<c.length; i++)
          {
            var d = c[i];
            this.reference_pop_composition[d.refpop].a_popid = d.refpop;
            this.reference_pop_composition[d.refpop].a_popname = d.name;
            this.reference_pop_composition[d.refpop]["a_" + d.shareof] = d.share;
          }
          console.log("this.reference_pop_composition:", this.reference_pop_composition);

          for(var i=0; i<this.reference_pop_composition.length; i++)
          {
            var e = this.reference_pop_composition[i];
            if(e !== undefined)
            {
              this.reference_pop_composition_data.push(e);
            }
          }

          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);

          this.ref_grid = new CellSelectionGrid({columns: this.columns, selectionMode: "single", width: "1300px"}, "ref_matrix_div");
          console.log("this.reference_pop_composition_data:", this.reference_pop_composition_data);

          this.ref_grid.refresh(this.reference_pop_composition_data);
          this.ref_grid.renderArray(this.reference_pop_composition_data);
          this.ref_grid.on("dgrid-datachange", lang.hitch(this, this.gridDataChange));

        },

        gridDataChange: function(evt)
        {
          var evt1 = evt;
          console.log("gridDataChange: value:", evt.value);
          console.log("gridDataChange: column:", evt.cell.column.field);
          console.log("gridDataChange: population:", evt.cell.row.data.a_popid);
          console.log("gridDataChange: evt1:", evt1);
          var obj = {popid: evt.cell.row.data.a_popid, shareof: evt.cell.column.field, value: evt.value};
          this.updates.push(obj);
          this.ref_save_button.set('disabled', false);
          this.ref_undo_button.set('disabled', false);
        },

        layoutContainers: function()
        {
          console.log("layoutContainers: this:", this);
          this.borderContainer4.startup();
          request("services/getPops.php").then(lang.hitch(this, this.doColumns));
          this.updates = [];
        },

        startup: function()
        {
          console.log("ReferencePopulations startup(): this:", this);
          window.global.app.widgets.ReferencePopulations = this;
          setTimeout(lang.hitch(this, this.layoutContainers), 500);
          this.ref_save_button.onClick = lang.hitch(this, this.onSaveButtonClick);
          this.ref_undo_button.onClick = lang.hitch(this, this.onUndoButtonClick);
          this.ref_save_button.set('disabled', true);
          this.ref_undo_button.set('disabled', true);
        }

    });
});
