define([
    "dojo/parser",
    "dojo/_base/window",
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
    "dojo/text!./templates/YCommunity.html"
], function(parser, window, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, template) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        onButtonClick: function(arg)
        {
          console.log("button:", this);
          console.log("arg:", arg);
        },
        startup: function()
        {
          console.log("YCommunity startup(): this:", this);
          window.global.app.widgets.InfoPane = this;
          // this.TheButton.onClick = this.onButtonClick;
        }

    });
});
