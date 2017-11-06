define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/MCommunity",
  "dojo/domReady!"
], function (Dialog, parser, declare, MCommunity, dom) 
  {
    console.log("ENTERED MCommunity");

    return declare(Dialog, {
      title: 'M Community Diagram',
      style: "height: 670px; width: 1100px;",
      content: 'Loaded successfully!',
      contentpane: null,
      startup: function()
      {
        console.log("MCommunityDialog startup:", this);
        this.contentpane = new MCommunity();
        this.contentpane.startup();
        this.set('content', this.contentpane);
        this.set('title', this.title + " " + this.rc + this.gpid);
      },
      onCancel: function()
      {
        console.log("Dialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
