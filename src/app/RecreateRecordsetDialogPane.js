define([
    "dojo/parser",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/json",
    "dojo/request",
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dojo/text!./templates/RecreateRecordsetDialogPane.html",
    "dojo/domReady!"
], function(parser, window, lang, on, json, request, declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Button, ContentPane, template, domReady) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        caller: null,
        recordsetName: null,
        recordsetNumber: -1,
        createDate: null,
        recordsCount: 1,
        confirmationStatus: null,

        postCreate: function()
        {
          this.clicked_recreate_button.onClick = lang.hitch(this, this.clicked_recreate);
          this.clicked_delete_button.onClick = lang.hitch(this, this.clicked_delete);
          this.recordset_name.innerHTML = this.recordsetName;
          this.records_count.innerHTML = this.recordsCount;
          this.create_date.innerHTML = this.createDate;
        },
        clicked_delete: function(arg)
        {
          var a;
          if(this.confirmationStatus == "delete")
            a = lang.hitch(this.caller, this.caller.confirmDeleteButtonClicked1);
          else
            a = lang.hitch(this.caller, this.caller.deleteButtonClicked1);

          a(this.recordsetName, this.recordsetNumber, this);
        },
        clicked_recreate: function(arg)
        {
          var a;
          if(this.confirmationStatus == "recreate")
            a = lang.hitch(this.caller, this.caller.confirmRecreateButtonClicked1);
          else
            a = lang.hitch(this.caller, this.caller.recreateButtonClicked1);

          a(this.recordsetName, this.recordsetNumber, this);
        },
        show_confirm_recreate: function(arg)
        {
          this.clicked_recreate_button.set('label', "Confirm Re-create");
          this.clicked_delete_button.set('disabled', true);
          this.confirmationStatus = "recreate";
        },
        show_confirm_delete: function(arg)
        {
          this.clicked_delete_button.set('label', "Confirm Delete");
          this.clicked_recreate_button.set('disabled', true);
          this.confirmationStatus = "delete";
        }
    });
});
