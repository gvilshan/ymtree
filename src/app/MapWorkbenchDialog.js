define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/MapWorkbench",
  "dojo/domReady!"
], function (Dialog, parser, declare, MapWorkbench, dom) 
  {
    console.log("ENTERED MapWorkbench");

    return declare(Dialog, {
      title: 'Map Workbench',
      style: "height: 670px; width: 950px;",
      content: '',
      contentpane: null,
      startup: function()
      {
        console.log("MapWorkbench startup:", this);
        this.contentpane = new MapWorkbench();
        this.contentpane.startup();
        this.set('content', this.contentpane);
      },
      onCancel: function()
      {
        console.log("MapWorkbenchDialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
