define([
    "dojo/parser",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/on",
    "dojo/json",
    "dojo/request",
    "dojo/dom",
    "dojo/dom-style",
    "dojo/_base/declare",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Form",
    "dijit/form/ValidationTextBox",
    "dijit/form/SimpleTextarea",
    "dijit/form/Button",
    "dijit/tree/ObjectStoreModel",
    "dijit/Tree",
    "dojo/store/Memory",
    "dojo/text!./templates/YResults.html"
], function(parser, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, ObjectStoreModel, Tree, Memory, template) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        tree: "/var/www/cgi-bin/c_ytree2014a.txt",

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        startup: function()
        {
          console.log("YResults startup(): this:", this);
          window.global.app.widgets.InfoPane = this;
          // this.TheButton.onClick = this.onButtonClick;
          if(window.global.app.widgets.Dispatcher.admin == "admin")
          {
            request("/cgi-bin/getAssetPathY?gpid=" + this.rc + this.gpid + "&classify=true&tree=" + this.tree).then(lang.hitch(this, this.callDataReady));
          }
          else
          {
            request("/cgi-bin/getAssetPathY_user?gpid=" + this.rc + this.gpid + "&classify=true&tree=" + this.tree).then(lang.hitch(this, this.callDataReady));
          }
        },
        callDataReady: function(response)
        {
          // console.log("callDataReady: response:", response);
          this.yresults.set('value', response);

          var r = json.parse(response);
          var r1 = r.path;
          // this.yResultsResponse = json.parse('[' + response.replace("\n", "") + ']');
          this.yResultsResponse = r1;
          // this.yResultsTreeData[0].root = true;
          console.log("Upper Node:", this.yResultsResponse[0][0]);
          console.log("y_node2:", this.yresultstree2);

          this.yResultsTreeData = [];

          this.yResultsTreeData[0] = {id: "0", name: "YHG Called: " + this.yResultsResponse[0][0].yhg, parent: "none", root: true};
          var j = 0;
          for(var i=0; i<this.yResultsResponse.length; i++)
          {
            j++;
            this.yResultsTreeData[j] = {id: "yhg_" + j, name: "YHG node: " + this.yResultsResponse[i][0].yhg, parent: "0"};
            var parent = "yhg_" + j;
            for(var k=0; k<this.yResultsResponse[i].length; k++)
            {
              j++;
              if(this.yResultsResponse[i][k].explicit == '+')
                this.yResultsTreeData[j] = {id: "snp_" + j, name: "Marker: <b>" + this.yResultsResponse[i][k].snp + "</b>", parent: parent};
              else
                this.yResultsTreeData[j] = {id: "snp_" + j, name: "Marker: " + this.yResultsResponse[i][k].snp, parent: parent};
            }
          }
          console.log("this.yResultsTreeData:", this.yResultsTreeData);
          
          var myStore = new Memory({
            data: this.yResultsTreeData,
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

          var YResultsTreeNode = declare(Tree._TreeNode, {
            _setLabelAttr: {node: "labelNode", type: "innerHTML"}
          });

          // Create the Tree, specifying an onClick method
          this.dijit_Tree = new Tree({
            model: myModel,
            onClick: function(item){
              // Get the URL from the item, and navigate to it
              console.log(item.hgname, window, item);
              // window.global.app.widgets.Dispatcher.onHaplogroupChange("MtdnaTree", item.hgname, 'm');
            },
            _createTreeNode: function(args){
              return new YResultsTreeNode(args);
            }
          });
          this.dijit_Tree.placeAt(this.yresultstree2).startup();

        }

    });
});
