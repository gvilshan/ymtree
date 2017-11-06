define([ 
  "dijit/Dialog",
  "dojo/parser",
  "dojo/_base/declare",
  "app/YCommunity",
  "dojo/domReady!"
], function (Dialog, parser, declare, YCommunity, dom) 
  {
    console.log("ENTERED YCommunity");

    return declare(Dialog, {
      title: 'Y Community Diagram',
      style: "height: 670px; width: 950px;",
      content: 'Loaded successfully!',
      startup: function()
      {
        console.log("YCommunityDialog startup:", this);
        var cp = new YCommunity();
        cp.startup();
        this.set('content', cp);
      }
  });

});
