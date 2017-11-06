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
    "dojo/text!./templates/MResults.html"
], function(parser, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, ObjectStoreModel, Tree, Memory, template) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        dialog: null,

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        startup: function()
        {
          console.log("MResults startup(): this:", this);
          window.global.app.widgets.InfoPane = this;
          // this.TheButton.onClick = this.onButtonClick;
          if(window.global.app.widgets.Dispatcher.admin == "admin")
          {
            request("/cgi-bin/getAssetPathM?gpid=" + this.rc + this.gpid + "&verbose=true&only_position=1&classify=true&table=" + this.table).then(lang.hitch(this, this.callDataReady));
          }
          else
          {
            request("/cgi-bin/getAssetPathM_user?gpid=" + this.rc + this.gpid + "&verbose=true&only_position=1&classify=true&table=" + this.table).then(lang.hitch(this, this.callDataReady));
          }
        },
        callDataReady: function(response)
        {
/*
          var dialogHeight = this.dialog.domNode.clientHeight;
          var dialogWidth = this.dialog.domNode.clientWidth;
          var titleHeight = this.dialog.titleBar.clientHeight;
          var paneHeight = dialogHeight - titleHeight - 26;
          var paneWidth = dialogWidth - 22;
     
          this.dialog.containerNode.style.height = paneHeight + "px";
          this.dialog.containerNode.style.width = paneWidth + "px";
*/

          this.mResultsResponse = json.parse(response.replace("\n", ""));

          this.mResultsTreeData = [];
          this.mResultsTreeData[0] = {id: "0", name: "MHG Called: " + this.mResultsResponse.result.mhg + "; database MHG: " + this.mResultsResponse.result.dar_mhg.replace(/~/g, "'"), parent: "none", root: true};
          this.mResultsTreeData[1] = {id: "1", name: "Participant Markers", parent: "0"};
          this.mResultsTreeData[2] = {id: "2", name: "Attempted Paths", parent: "0"};
          this.mResultsTreeData[3] = {id: "3", name: "Best Path", parent: "0"};

          // Participant Markers
          var j = 3;
          var p_markerset = " ";
          for(k=0; k<this.mResultsResponse.markerset.length; k++)
          {
            j++;
            this.mResultsTreeData[j] = {id: "marker_" + j, name: this.mResultsResponse.markerset[k].position + this.mResultsResponse.markerset[k].value, parent: "1"};
            p_markerset = p_markerset + this.mResultsResponse.markerset[k].position + this.mResultsResponse.markerset[k].what + this.mResultsResponse.markerset[k].value + " ";
          }

          // Attempted Paths
          for(k=0; k<this.mResultsResponse.attempted_paths.length; k++)
          {
            j++;
            this.mResultsTreeData[j] = {id: "attempted_path_" + j, name: this.mResultsResponse.attempted_paths[k].starting_mutation.position + this.mResultsResponse.attempted_paths[k].starting_mutation.value, parent: "2"};
            var pn = "attempted_path_" + j;
            var locations = this.mResultsResponse.attempted_paths[k].locations_in_tree;

            for(var k1=0; k1<locations.length; k1++)
            { 
              var current_path = locations[k1].path;
              if(current_path == undefined) continue;

              j++;
              this.mResultsTreeData[j] = {id: "attempted_path_" + j, name: locations[k1].mhg + " (" + locations[k1].path_rating + ")", parent: pn};
              var specific_pn = "attempted_path_" + j;
            
              for(var k2 = 0; k2 < current_path.length; k2++)
              {
                j++;
                this.mResultsTreeData[j] = {id: "attempted_path_" + j, name: current_path[k2].mhg.replace(/~/g, "'"), parent: specific_pn};
                var markerset = current_path[k2].markerset;
                node_markers = markerset.split(" ");
                markerset = " ";
                for(var m=0; m<node_markers.length; m++)
                { 
                  var search_target = " " + node_markers[m] + " ";
                  n = p_markerset.indexOf(search_target);
                  if(n < 0)
                  { 
                    if(locations[k1].repeating_markers.indexOf(search_target) >= 0)
                    {
                      markerset = markerset + "<b><i>" + node_markers[m].replace("R", "") + "</i></b> ";
                    }
                    else
                    {
                      markerset = markerset + node_markers[m].replace("R", "") + " ";
                    }
                  }
                  else
                  {
                    markerset = markerset + "<b>" + node_markers[m].replace("R", "") + "</b> ";
                  }
                }
                markerset = markerset + "(" + current_path[k2].matching_markers_value + ")";
                j1 = j;
                j++;
                this.mResultsTreeData[j] = {id: "ap_matching_markers_" + j, name: markerset, parent: "attempted_path_" + j1};
                
              }
            }
          }
          // Best Path
          var found = 0;
          var rekord_node = this.mResultsResponse.result.rekord_node;
          for(var k=0; k<this.mResultsResponse.attempted_paths.length; k++)
          {
            var locations = this.mResultsResponse.attempted_paths[k].locations_in_tree;
            for(var k1=0; k1<locations.length; k1++)
            {
              if(rekord_node == locations[k1].node)
              {
                // Assign it to the tree
                var best_path = locations[k1].path;
                if(found == 0)
                {
                  for(var k2 = 0; k2 < best_path.length; k2++)
                  {
                    j++;
                    this.mResultsTreeData[j] = {id: "best_path_" + j, name: best_path[k2].mhg.replace(/~/g, "'"), parent: "3"};
                    this.mResultsTreeData[3] = {id: "3", name: "Best Path (" + locations[k1].path_rating + ")", parent: "0"};
                    // Show SNP match results
                    var j1 = j;
                    j++;
                    var markerset = best_path[k2].markerset;
                    node_markers = markerset.split(" ");
                    markerset = " ";
                    for(var m=0; m<node_markers.length; m++)
                    {
                      var search_target = " " + node_markers[m] + " ";
                      n = p_markerset.indexOf(search_target);
                      if(n < 0)
                      {
                        if(locations[k1].repeating_markers.indexOf(search_target) >= 0)
                        {
                          markerset = markerset + "<b><i>" + node_markers[m].replace("R", "") + "</i></b> ";
                        }
                        else
                        {
                          markerset = markerset + node_markers[m].replace("R", "") + " ";
                        }
                      }
                      else
                      {
                        markerset = markerset + "<b>" + node_markers[m].replace("R", "") + "</b> ";
                      }
                    }

                    markerset = markerset + "(" + best_path[k2].matching_markers_value + ")";
                    this.mResultsTreeData[j] = {id: "matching_markers_" + j, name: markerset, parent: "best_path_" + j1};
                  }
                  found = 1;
                }
              }
            }
          }

          var myStore = new Memory({
            data: this.mResultsTreeData,
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

          var MResultsTreeNode = declare(Tree._TreeNode, {
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
              return new MResultsTreeNode(args);
            }
          });
          this.dijit_Tree.placeAt(this.mresultstree2).startup();

        }

    });
});
