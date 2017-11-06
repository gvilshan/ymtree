define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/YResults",
  "dojo/domReady!"
], function (Dialog, parser, declare, YResults, dom) 
  {
    console.log("ENTERED YResults");

    return declare(Dialog, {
      title: 'Y Calling Results',
//      style: "height: 670px; width: 1100px;",
      content: 'Loaded successfully!',
      contentpane: null,
      startup: function()
      {
        console.log("YResults startup:", this);
        this.contentpane = new YResults({rc: this.rc, gpid: this.gpid, tree: this.tree});
        this.contentpane.startup();
        this.set('content', this.contentpane);
        this.set('title', this.title + " " + this.rc + this.gpid + " (tree: " + this.tree + ")");
      },
      onCancel: function()
      {
        console.log("Dialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
