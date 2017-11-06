define([
   "dojo/_base/declare",
   "dojo/parser",
   "dijit/TooltipDialog",
   "dojo/_base/window",
   "dojo/_base/lang",
   "app/RecreateRecordsetDialogPane",
   "dojo/domReady!"
], function(declare, parser, _TooltipDialog, window, lang, RecreateRecordsetDialogPane)
{
    console.log("ENTERED RecreateRecordsetDialog");
    return declare(_TooltipDialog, {
      content: "loaded OK",
      contentpane: null,
      recordsetName: null,
      recordsetNumber: -1,
      caller: null,

      startup: function()
      {
        this.contentpane = new RecreateRecordsetDialogPane({caller: this.caller, recordsetName: this.recordsetName, createDate: this.createDate, recordsCount: this.recordsCount, recordsetNumber: this.recordsetNumber});
        this.contentpane.startup();
        this.set('content', this.contentpane);
         
      }
    });

});
