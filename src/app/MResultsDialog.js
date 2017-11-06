define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/MResults",
  "dojo/domReady!"
], function (Dialog, parser, declare, MResults, dom) 
  {
    console.log("ENTERED YResults");

    return declare(Dialog, {
      title: 'M Calling Results',
/*       style: "height: 670px; width: 1100px;", */
      content: 'Loaded successfully!',
      contentpane: null,
      startup: function()
      {
        console.log("MResults startup: height:", this.containerNode.style.height);
        this.contentpane = new MResults({rc: this.rc, gpid: this.gpid, dialog: this, table: this.table});
        this.contentpane.startup();
        this.set('content', this.contentpane);
        this.set('title', this.title + " " + this.rc + this.gpid + " (" + this.tree + ")");
        // console.log("MResultsDialog:", this);
      },
      onCancel: function()
      {
        console.log("Dialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
