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
    "dojo/text!./templates/CustomizedTooltipDialogPane.html",
    "dojo/domReady!"
], function(parser, window, lang, on, json, request, declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Button, ContentPane, template, domReady) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        caller: null,

        postCreate: function()
        {
          this.clicked_del_button.onClick = lang.hitch(this, this.clicked_del);
          this.clicked_cancel_button.onClick = lang.hitch(this, this.clicked_cancel);
        },
        clicked_del: function(arg)
        {
          var a = lang.hitch(this.caller, this.caller.clicked_del);
          a();
        },
        clicked_cancel: function(arg)
        {
          var a = lang.hitch(this.caller, this.caller.clicked_cancel_del);
          a();
        }
    });
});
