define([ 
  "dijit/Dialog",
  "dojo/ready",
  "dojo/_base/lang",
  "dojo/_base/declare",
  "dojo/_base/window",
  "app/MMigrationMap",
  "dojo/domReady!"
], function (Dialog, ready, lang, declare, window, MMigrationMap, dom) 
  {
    console.log("ENTERED MMigrationMapDialog");

    return declare(Dialog, {
      title: 'MtDNA Migration Map',
      content: 'Loaded successfully!',
      contentpane: null,
      startup: function()
      {
        console.log("MMigrationMapDialog startup:", this);
        this.contentpane = new MMigrationMap({dialog: this});
        this.contentpane.startup();
        this.set('content', this.contentpane);
        this.set('title', this.title + " " + window.global.app.widgets.GpidPane.gpid_input.value);
        this.containerNode.style.padding="0";
      },
      onCancel: function()
      {
        console.log("MMigrationMapDialog being closed");
        this.contentpane.destroyRecursive(false);
      }
  });

});
