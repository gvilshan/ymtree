define([
    "dojo/_base/window",
    "dojo/on",
    "dojo/json",
    "dojo/dom",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dijit/_WidgetBase"
], function(_window, on, json, dom, declare, lang, _WidgetBase) {
     console.log("ENTERED Dispatcher");
     _window.global.app = {
       name: "ymtree",
       treeInitialState: "collapsed", // can be "expanded" and "collapsed".
       widgets: {}
     };
     _window.global.resizer = null;
     return declare([_WidgetBase], {
       widgetLabel: "Dispatcher",
       postCreate: function()
       {
         console.log("Dispatcher postCreate:", this);
         console.log("Dispatcher _window:", _window);
         _window.global.app.widgets.Dispatcher = this;
         var self=this;
         on(window, "resize", function()
         {
           if(_window.global.resizer != null)
           {
             clearTimeout(_window.global.resizer);
             _window.global.resizer = null;
           }
           _window.global.resizer = setTimeout(self.runResizer, 1000, this.location.href);
         });
         // Was I just resized or I was indeed logged off?
         var username = "";
         var humanname = "";
         var admin = "";
         var name1 = "username=";
         var name2 = "humanname=";
         var name3 = "admin=";
         var ca = document.cookie.split(';');
         for(var i=0; i<ca.length; i++)
         {
           var c = ca[i];
           while (c.charAt(0)==' ') c = c.substring(1);
           if (c.indexOf(name1) == 0) username = c.substring(name1.length,c.length);
           if (c.indexOf(name2) == 0) humanname = c.substring(name2.length,c.length);
           if (c.indexOf(name3) == 0) admin = c.substring(name3.length,c.length);
         }
         if(username != "") setTimeout(this.runRestoration, 1000, username, humanname, admin);
       },

       runRestoration: function(username, humanname, admin)
       {
         var data = json.stringify({humanname: humanname, admin: admin});
         var lp = _window.global.app.widgets.LoginPane;
         if(lp !== undefined)
         {
           var a = lang.hitch(lp, _window.global.app.widgets.LoginPane.loginFinished);
           a(data);
         }
       },

       runResizer: function(h)
       {
         window.location.assign(h);
       },

       reopenMTree: function()
       {
         dijit_mtdnaTree.set('paths', [ _window.global.app.widgets.MtdnaTree.mpath, _window.global.app.widgets.MtdnaTree.mpath]);
       },
       reopenYTree: function()
       {
         dijit_yTree.set('paths', [ _window.global.app.widgets.MtdnaTree.ypath, _window.global.app.widgets.MtdnaTree.ypath]);
       },
       collapseComplete: function(tree)
       {
         console.log("Collapse complete; paths:", _window.global.app.widgets.MtdnaTree.mpath, _window.global.app.widgets.MtdnaTree.ypath);
         if(tree == "m")
         {
           setTimeout(this.reopenMTree, 4000);
         }
         else
         {
           setTimeout(this.reopenYTree, 4000);
         }
       },
       collapseAndReopenTree: function(tree)
       {
         console.log("Dispatcher: collapseTree", tree);
         var treePane = _window.global.app.widgets.MtdnaTree;
         console.log("Dispatcher: treePane", treePane);
         if(tree == "m")
         {
           console.log("dijit_mtdnaTree:", dijit_mtdnaTree);
           dijit_mtdnaTree.collapseAll().then(this.collapseComplete(tree));
         }
         else
         {
           dijit_yTree.collapseAll().then(this.collapseComplete(tree));
         }
       },
       collapseTree: function(tree)
       {
         console.log("Dispatcher: collapseTree", tree);
         var treePane = _window.global.app.widgets.MtdnaTree;
         console.log("Dispatcher: treePane", treePane);
         if(tree == "m")
         {
           console.log("dijit_mtdnaTree:", dijit_mtdnaTree);
           dijit_mtdnaTree.collapseAll();
         }
         else
         {
           dijit_yTree.collapseAll();
         }
       },

       showGpidPane: function()
       {
         console.log("Dispatcher showGpidPane:", this);
         this.mainContainer.removeChild(this.loginContainer);
         if(this.admin == "admin")
         {
           this.mainContainer.addChild(this.gpidContainer);
           var node = dom.byId("greeting");
           node.innerHTML = "Welcome,<br>" + this.humanname + "!";
         }
         else
         {
           this.mainContainer.addChild(this.gpidUserContainer);
           node = dom.byId("greeting_user");
           node.innerHTML = "Welcome,<br>" + this.humanname + "!";
         }
         var a = lang.hitch(_window.global.app.widgets.SearchPane, _window.global.app.widgets.SearchPane.userLoggedIn);
         a();
         a = lang.hitch(_window.global.app.widgets.SearchPaneUser, _window.global.app.widgets.SearchPaneUser.userLoggedIn);
         a();
       },

       showLoginPane: function()
       {
         console.log("Dispatcher showLoginPane:", this);
         this.mainContainer.removeChild(this.gpidContainer);
         this.mainContainer.removeChild(this.gpidUserContainer);
         this.mainContainer.addChild(this.loginContainer);
         console.log("Dispatcher showLoginPane _window:", _window);
         var sp = _window.global.app.widgets.SearchPane;
         if(sp !== undefined)
         {
           for(var i=0; i<sp.tooltips.length; i++)
           {
             sp.tooltips[i].destroyRecursive();
             sp.tooltips1[i].destroyRecursive();
           }
         }
         var spu = _window.global.app.widgets.SearchPaneUser;
         if(spu !== undefined)
         {
           for(var i=0; i<spu.tooltips.length; i++)
           {
             spu.tooltips[i].destroyRecursive();
             spu.tooltips1[i].destroyRecursive();
           }
         }
         _window.global.app.widgets.LoginPane.animateLogo();
       },

       generateHgInfo: function(newhg, treename)
       { // Given Haplogroup name and the tree it belongs to ('m' or 'h'), produce:
         // hg_path: array of haplogroups all the way to the root;
         // id_path: array of tree ids all the way to the root;
         // heatmap_id: name of haplogroup or marker for which the heatmap is available;
         // heatmap_file: file name from which to load the heatmap image;
         // mutations: set of markers or mutations for haplogroup;
         // shorthand: shorthand notation for YHG (yhg only; empty for Mtdna).
         var response = {};
         var id_path = [];
         var hg_path = [];
         var heatmap_id = "";
         var heatmap_file = "";
         var mutations = "";
         var shorthand = "";
         var hgname = newhg;
         if(treename == 'm')
         {
           var tree = _window.global.app.widgets.MtdnaTree.mtdnaTree;
           // Find tree node by name
           var node_id = -1;
           for(var i=0; i<tree.length; i++)
           {
             if(tree[i].hgname == hgname)
             {
               node_id = i;
               break;
             }
           }
           if(node_id == -1) return response;
           // travrse up
           var current_id = node_id.toString();
           while(current_id != -1)
           {
             id_path.unshift(current_id.toString());
             hg_path.unshift(tree[Number(current_id)].hgname);
             current_id = tree[Number(current_id)].parent;
           }
           // Find heatmap info 
           for(var i=0; i<id_path.length; i++)
           {
             if(tree[id_path[i]].heatmap == "t") heatmap_id = tree[id_path[i]].hgname;
           }
           heatmap_file = "app/maps/heatmaps/" + treename + "/" + heatmap_id + ".png";
           // Find mutations info
           var mhgList = _window.global.app.widgets.HgSearch.mhgList;
           var mut = [];
           for(var i=0; i<mhgList.length; i++)
           {
             if(mhgList[i].name == hgname)
             {
               mut = mhgList[i].mutations.split(",");
               break;
             }
           }
         }
         if(treename == 'y')
         {
           var tree = _window.global.app.widgets.MtdnaTree.yTree;
           var assetIndex = _window.global.app.widgets.HgSearch.assetIndex;

           // Find tree node by name
           var node_id = -1;
           for(var i=0; i<tree.length; i++)
           {
             if(tree[i].hgname == hgname)
             {
               node_id = i;
               break;
             }
           }
           if(node_id == -1) return response;
           // travrse up
           var current_id = node_id.toString();
           while(current_id != "-1")
           {
             id_path.unshift(current_id);
             // hg_path.unshift(tree[Number(current_id)].hgname);
             var mut_string = tree[current_id].mutations;
             var mut = mut_string.split(",");
             for(var i=0; i<mut.length; i++)
             {
               for(var j=0; j<assetIndex.length; j++)
               {
                 if(mut[i] == assetIndex[j].snp_name)
                 {
                   hg_path.unshift(mut[i]);
                   if(assetIndex[j].heatmap_image != null)
                   {
                     heatmap_id = assetIndex[j].snp_name;
                     heatmap_file = "app/maps/heatmaps/" + treename + "/" + heatmap_id + ".png";
                   }
                 }
               }
             }
             current_id = tree[current_id].parent;
           }
           // Find mutations info
           var yhgList = _window.global.app.widgets.HgSearch.yhgList;
           var mut = [];
           for(var i=0; i<yhgList.length; i++)
           {
             if(yhgList[i].name == hgname)
             {
               mut = yhgList[i].mutations.split(",");
               shorthand = yhgList[i].shorthand;
               break;
             }
           }
         }
         response.mutations = mut;
         response.id_path = id_path;
         response.hg_path = hg_path;
         response.heatmap_id = heatmap_id;
         response.heatmap_file = heatmap_file;
         response.shorthand = shorthand;
         console.log("response by generateHgInfo:", response);
         return response;
       },
       onHaplogroupChange: function(origin, newhg, tree)
       {
         console.log("Dispatcher onHaplogroupChange from ", origin, newhg, tree);
         var response = this.generateHgInfo(newhg, tree);
         if(origin == "HgSearch")
         {
           console.log("response:", response);
           // Fill out Editor panes
           _window.global.app.widgets.StoryEditor.onHaplogroupChange("Dispatcher",
             response.hg_path,
             response.id_path,
             tree,
             response.heatmap_id,
             response.heatmap_file
           );
           // Open the tree path
           console.log("dijit_ytree:", dijit_yTree);
           if(tree == 'y')
           {
             _window.global.app.widgets.MtdnaTree.ypath = response.id_path;
             this.collapseAndReopenTree("y");
             // dijit_yTree.set('paths', [ response.id_path, response.id_path ]);
             var infoNode = dom.byId("shorthand");
             infoNode.innerHTML = "Shorthand:<br>" + response.shorthand;
             _window.global.app.widgets.HgSearch.populateMarkerList("y_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.y_mutations.set("displayedValue", response.mutations);
           }
           if(tree == 'm')
           {
             _window.global.app.widgets.MtdnaTree.mpath = response.id_path;
             this.collapseAndReopenTree("m");
             // dijit_mtdnaTree.set('paths', [ response.id_path, response.id_path ]);
             _window.global.app.widgets.HgSearch.populateMarkerList("m_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.m_mutations.set("displayedValue", response.mutations);
           }
         }
         if(origin == "MtdnaTree")
         {
           // Fill out Editor panes
           _window.global.app.widgets.StoryEditor.onHaplogroupChange("Dispatcher",
             response.hg_path,
             response.id_path,
             tree,
             response.heatmap_id,
             response.heatmap_file
           );
           // Don't need to open tree path
           // but need to fill out HgSearch stuff
           if(tree == 'y')
           {
             var infoNode = dom.byId("shorthand");
             infoNode.innerHTML = "Shorthand:<br>" + response.shorthand;
             _window.global.app.widgets.HgSearch.populateMarkerList("y_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.y_mutations.set("displayedValue", response.mutations);
             _window.global.app.widgets.HgSearch.yhgSelect.set("value", response.id_path[response.id_path.length - 1]);
           }
           if(tree == 'm')
           {
             _window.global.app.widgets.HgSearch.populateMarkerList("m_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.m_mutations.set("displayedValue", response.mutations);
             _window.global.app.widgets.HgSearch.mhgSelect.set("value", response.id_path[response.id_path.length - 1]);
           }
         }
         if(origin == "GpidPane")
         {
           // Fill out Editor panes
           _window.global.app.widgets.StoryEditor.onHaplogroupChange("Dispatcher",
             response.hg_path,
             response.id_path,
             tree,
             response.heatmap_id,
             response.heatmap_file
           );
           // Open the tree path
           console.log("dijit_ytree:", dijit_yTree);
           if(tree == 'y')
           {
             _window.global.app.widgets.MtdnaTree.ypath = response.id_path;
             this.collapseAndReopenTree("y");
             // dijit_yTree.set('paths', [ response.id_path, response.id_path ]);
             var infoNode = dom.byId("shorthand");
             infoNode.innerHTML = "Shorthand:<br>" + response.shorthand;
             _window.global.app.widgets.HgSearch.populateMarkerList("y_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.y_mutations.set("displayedValue", response.mutations);
           }
           if(tree == 'm')
           {
             _window.global.app.widgets.MtdnaTree.mpath = response.id_path;
             this.collapseAndReopenTree("m");
             // dijit_mtdnaTree.set('paths', [ response.id_path, response.id_path ]);
             _window.global.app.widgets.HgSearch.populateMarkerList("m_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.m_mutations.set("displayedValue", response.mutations);
           }

           // Fill out HgSearch stuff
           if(tree == 'y')
           {
             var infoNode = dom.byId("shorthand");
             infoNode.innerHTML = "Shorthand:<br>" + response.shorthand;
             _window.global.app.widgets.HgSearch.populateMarkerList("y_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.y_mutations.set("displayedValue", response.mutations);
             _window.global.app.widgets.HgSearch.yhgSelect.set("value", response.id_path[response.id_path.length - 1]);
           }
           if(tree == 'm')
           {
             _window.global.app.widgets.HgSearch.populateMarkerList("m_mutations_grid", response.mutations);
             //// _window.global.app.widgets.HgSearch.m_mutations.set("displayedValue", response.mutations);
             _window.global.app.widgets.HgSearch.mhgSelect.set("value", response.id_path[response.id_path.length - 1]);
           }
         }
       }
     });
});
