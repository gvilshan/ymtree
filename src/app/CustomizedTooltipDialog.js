define([
   "dojo/_base/declare",
   "dojo/parser",
   "dijit/TooltipDialog",
   "dojo/_base/window",
   "dojo/_base/lang",
   "app/CustomizedTooltipDialogPane",
   "dojo/domReady!"
], function(declare, parser, _TooltipDialog, window, lang, CustomizedTooltipDialogPane)
{
    console.log("ENTERED CustomizedTooltipDialog");
    return declare(_TooltipDialog, {
      content: "loaded OK",
      contentpane: null,
      caller: null,

      startup: function()
      {
        this.contentpane = new CustomizedTooltipDialogPane({caller: this.caller});
        this.contentpane.startup();
        this.set('content', this.contentpane);
         
      }
    });

});
