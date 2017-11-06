define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/ReferencePopulations",
  "dojo/domReady!"
], function (Dialog, parser, declare, ReferencePopulations, dom) 
  {
    console.log("ENTERED ReferencePopulations");

    return declare(Dialog, {
      title: '',
//      style: "height: 670px; width: 1100px;",
      content: 'Loaded Successfully!',
      contentpane: null,
      startup: function()
      {
        console.log("ReferencePopulationsDialog startup:", this);
        this.contentpane = new ReferencePopulations({rc: this.rc, gpid: this.gpid, tree: this.tree});
        this.contentpane.startup();
        this.set('content', this.contentpane);
/*
        this.set('title', this.title + " " + this.rc + this.gpid + " (tree: " + this.tree + ")");
*/
      },
      onCancel: function()
      {
        console.log("ReferencePopulations Dialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
