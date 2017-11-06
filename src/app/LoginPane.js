define([
    "dojo/parser",
    "dojo/_base/window",
    "dojo/on",
    "dojo/_base/lang",
    "dojo/_base/fx",
    "dojo/fx/easing",
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
    "dijit/form/TextBox",
    "dijit/form/Button",
    "dijit/TooltipDialog",
    "dijit/popup",
    "dijit/layout/LinkPane",
    "dojo/text!./templates/LoginPane.html",
    "dojo/domReady!"
], function(parser, window, on, lang, fx, easing, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, TextBox, Button, TooltipDialog, popup, LinkPane, template) {
 
    var username = "";
    var name = "username=";
    var ca = document.cookie.split(';');
    for(var i=0; i<ca.length; i++) 
    {
      var c = ca[i];
      while (c.charAt(0)==' ') c = c.substring(1);
      if (c.indexOf(name) == 0) username = c.substring(name.length,c.length);
    }
    if(username == "") request("services/invalidateSession.php");
    return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
       templateString: template,

       loginFinished: function(data) // Login finished but not necessarily successfully
       {
         var errmsg_node = dom.byId("errmsg");
         console.log("loginFinished:", data);
         var resp = json.parse(data);
         var humanname = resp.humanname;
         var admin = resp.admin;
         this.loginButton.set('disabled', false);
         this.skypeUsername.set('value','');
         this.skypePassword.set('value','');

         domStyle.set("rot_arrow", "display", "none");
         if(humanname.length == 0)
         {
           // Login failed.
           errmsg_node.innerHTML = "Login failed.";
         }
         else
         {
           // Login succeeded.
           errmsg_node.innerHTML = "";
           window.global.app.widgets.Dispatcher.username = this.username;
           window.global.app.widgets.Dispatcher.humanname = humanname;
           window.global.app.widgets.Dispatcher.admin = admin;
           window.global.app.widgets.Dispatcher.showGpidPane();
           console.log("login successful; window:", window);
           document.cookie="username=" + this.username;
           document.cookie="humanname=" + humanname;
           document.cookie="admin=" + admin;
         }

       },

       postCreate: function()
       {
         console.log("postCreate:", this);
       },
       onButtonClick: function(x)
       {
         var username = this.skypeUsername.value;
         var password = this.skypePassword.value;
         this.username = username;
         domStyle.set("rot_arrow", "display", "inline");
         this.loginButton.set('disabled', true);

         request("services/createSession.php?username=" + username + "&password=" + password).then(lang.hitch(this, this.loginFinished));
         //  request("services/invalidateSession.php");
       },
       startup: function()
       {
         window.global.app.widgets.LoginPane = this;
         domStyle.set("rot_arrow", "display", "none");
         console.log("LoginPane this:", this);
         this.loginButton.onClick = lang.hitch(this, this.onButtonClick);

         whyskype="People from several organizations (NGS, FTDNA, Celerity) collaborate on this project. We don't have a common user registry - but still need to authenticate. And I would hate to create yet another user registry specifically for this application, because for me it means extra work maintaining it, and for you it means another userid/password pair to remember.<br>Since we all collaborate using Skype, we will be using our Skype id and password to log in.<br>However, a valid Skype id and password is not enough - I will not allow every Skype user to access the application before providing an extra layer of security.<br>You must have a valid <b>certificate</b> that I (Gregory Vilshansky) will generate for you and you must place it into your Skype profile.";

         var myTooltipDialog = new TooltipDialog({
           id: 'myTooltipDialog',
           style: "width: 500px;",
           content: whyskype,
           onMouseLeave: function(){
             popup.close(myTooltipDialog);
           }
         });
         on(dom.byId('skypeId1'), 'mouseover', function(){
           console.log("mouseover");
           popup.open({
             popup: myTooltipDialog,
             around: dom.byId('skypeId1')
           });
         });
         setTimeout(lang.hitch(this,this.animateLogo), 3000);
       },
       animateLogo: function()
       {
         if(window.global.app.widgets.Dispatcher.username == null || window.global.app.widgets.Dispatcher.username == "")
         {
           var window_width = window.global.app.widgets.Dispatcher.viewport.width;
           var form_width = this.form1.domNode.clientWidth;
           var logo_width = window_width - form_width - 20;
           if(dom.byId("landm") != null)
           {
             fx.animateProperty({
               node:"landm",
               easing: easing.backOut,
               duration: 3000,
               properties: {
                 width: logo_width,
                 marginLeft: {start: 0, end: form_width, unit: "px"}
               }
             }).play();
           }
         }
       }
     });
});
