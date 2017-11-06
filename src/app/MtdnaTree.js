define([
    "dojo/parser",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/request",
    "dojo/json",
    "dojo/dom",
    "dojo/ready",
    "dojo/_base/window",
    "dojo/store/Memory",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/TabContainer",
    "dijit/layout/TabController",
    "dijit/Dialog",
    "dojo/dom-style",
    "dojo/text!./templates/MtdnaTree.html",
    "dojo/domReady!"
], function(parser, declare, lang, request, json, dom,  ready, window, Memory, ObjectStoreModel, Tree, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Button, ContentPane, BorderContainer, TabContainer, TabController, Dialog, style, template, dom1) {
 
     console.log("window:", window);
     if(window.global.app.treeInitialState == "expanded")
     {
       var myDialog = new Dialog({
         title: "Please wait while application loads",
         content: "<center><img src='app/images/rotating_arrow.gif'></center>",
         style: "height: 60px; width: 250px;"
       });
       style.set(myDialog.closeButtonNode, "display", "none");
       myDialog.show();
       window.global.app.WaitDialog = myDialog;
     }

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        global_window: window,
        mtdnaTree: null,
        yTree: null,
        dijit_mtdnaTree: null,
        dijit_yTree: null,

        initializeMtdnaTree: function(text)
        {
          this.mtdnaTree = json.parse(text);
          this.mtdnaTree[0].root = true;
          var myStore = new Memory({
            data: this.mtdnaTree,
            getChildren: function(object){
             return this.query({parent: object.id});
            }
          });

          // Create the model
          var myModel = new ObjectStoreModel({
            store: myStore,
            query: {root: true},
            labelAttr: "name"
          });

          var MyTreeNode = declare(Tree._TreeNode, {
            _setLabelAttr: {node: "labelNode", type: "innerHTML"}
          });

          // Create the Tree, specifying an onClick method
          ready(function(){
            this.dijit_mtdnaTree = new Tree({
                model: myModel,
                onClick: function(item){
                    // Get the URL from the item, and navigate to it
                    console.log(item.hgname, window, item);
                    window.global.app.widgets.Dispatcher.onHaplogroupChange("MtdnaTree", item.hgname, 'm');
                },
                _createTreeNode: function(args){
                  return new MyTreeNode(args);
                }
            });
            this.dijit_mtdnaTree.placeAt(dom.byId("theTree1")).startup();
            if(window.global.app.treeInitialState == "expanded")
            {
              var expandAll_promise = this.dijit_mtdnaTree.expandAll();
              expandAll_promise.then(function(arg){
                console.log("status change on mtree", this);
                console.log("window.global.app:", window.global.app);
                window.global.app.WaitDialog.destroy();
              });
            }
           
          });
        },

        initializeYTree: function(text)
        {
          this.yTree = json.parse(text);
          this.yTree[0].root = true;
          var myStore = new Memory({
            data: this.yTree,
            getChildren: function(object){
             return this.query({parent: object.id});
            }
          });

          // Create the model
          var myModel = new ObjectStoreModel({
            store: myStore,
            query: {root: true},
            labelAttr: "name"
          });

          var MyTreeNode = declare(Tree._TreeNode, {
            _setLabelAttr: {node: "labelNode", type: "innerHTML"}
          });

          // Create the Tree, specifying an onClick method
          ready(function(){
            this.dijit_yTree = new Tree({
                model: myModel,
                onClick: function(item){
                    // Get the URL from the item, and navigate to it
                    console.log(item.hgname, window);
                    window.global.app.widgets.Dispatcher.onHaplogroupChange("MtdnaTree", item.hgname, 'y');
                },
                _createTreeNode: function(args){
                  return new MyTreeNode(args);
                }
            });
            this.dijit_yTree.placeAt(dom.byId("theTree2")).startup();
            if(window.global.app.treeInitialState == "expanded")
            {
              var expandAll_promise = this.dijit_yTree.expandAll();
              expandAll_promise.then(function(arg){
                console.log("status change on ytree", this);
              });
            }
          });
          this.allDone();
        },

        onMShow: function(x)
        {
          var hgSearchStackController = this.getParent().getParent().global_window.global.hgSearcher;
          c_array = hgSearchStackController.getChildren();
          hgSearchStackController.selectChild(c_array[0]);
          var assetStackController = this.getParent().getParent().global_window.global.assetsSwitcher;
          c_array = assetStackController.getChildren();
          assetStackController.selectChild(c_array[0]);
          console.log("mshow");
        },

        onYShow: function(x)
        {
          var hgSearchStackController = this.getParent().getParent().global_window.global.hgSearcher;
          c_array = hgSearchStackController.getChildren();
          hgSearchStackController.selectChild(c_array[1]);

          var assetStackController = this.getParent().getParent().global_window.global.assetsSwitcher;
          c_array = assetStackController.getChildren();
          assetStackController.selectChild(c_array[1]);
          console.log("yshow");
        },

        allDone: function()
        {
          dom.byId("y_download").onclick = this.ytreeDownload;
          dom.byId("m_download").onclick = this.mtreeDownload;
        },

        mtreeDownload: function()
        {
          var myDialog = new Dialog({
          title: "Download MtDNA Tree",
          content: "Click <a href=services/getMtdnaTree.php?download=1 target='_blank'>here</a> to download the MtDNA Tree",
          style: "height: 60px; width: 250px;"
          });
          myDialog.show();
        },
        ytreeDownload: function()
        {
          var myDialog = new Dialog({
          title: "Download Y Tree",
          content: "Click <a href=services/getYTree.php?download=1 target='_blank'>here</a> to download the Y Tree",
          style: "height: 60px; width: 250px;"
          });
          myDialog.show();
        },

        postCreate: function()
        {
          var localcontext_initializeMtdnaTree = lang.hitch(this, this.initializeMtdnaTree);
          var localcontext_initializeYTree = lang.hitch(this, this.initializeYTree);
          request("services/getMtdnaTree.php").then(localcontext_initializeMtdnaTree);
          request("services/getYTree.php").then(localcontext_initializeYTree);
          console.log("MtDNA Tree postCreate:", this);
          this.ytreepane.onShow = this.onYShow;
          this.mtreepane.onShow = this.onMShow;
          window.global.app.widgets.MtdnaTree = this;
        }
    });
});
