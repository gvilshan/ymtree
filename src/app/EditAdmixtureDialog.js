define([ 
  "dijit/Dialog",
  "dojo/_base/window",
  "dojo/_base/lang",
  "dojo/parser",
  "dojo/_base/declare",
  "app/EditAdmixture",
  "dojo/domReady!"
], function (Dialog, window, lang, parser, declare, EditAdmixture, dom) 
  {
    console.log("ENTERED EditAdmixture");

    return declare(Dialog, {
      title: '',
//      style: "height: 670px; width: 1100px;",
      content: 'Loaded Successfully!',
      contentpane: null,
      rc: null,
      gpid: null,

      startup: function()
      {
        console.log("EditAdmixtureDialog startup:", this);
        this.contentpane = new EditAdmixture({rc: this.rc, gpid: this.gpid});
        this.contentpane.startup();
        this.set('content', this.contentpane);
/*
        this.set('title', this.title + " " + this.rc + this.gpid + " (tree: " + this.tree + ")");
*/
      },
      onCancel: function()
      {
        console.log("EditAdmixture Dialog being closed");
        var gpidPane = window.global.app.widgets.GpidPane;
        var field = gpidPane.gpid_input;
        field.set('value', this.rc + this.gpid);
        var a = lang.hitch(gpidPane, gpidPane.findButtonClicked);
        a("");
        this.contentpane.destroyRecursive(false);
      }
  });

});
