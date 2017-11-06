define([
    "dojo/parser",
    "dojo/request",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/_base/window",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dijit/layout/ContentPane",
    "dojox/widget/TitleGroup",
    "dijit/TitlePane",
    "dijit/layout/TabContainer",
    "dijit/layout/StackContainer",
    "dijit/layout/StackController",
    "dijit/form/HorizontalSlider",
    "dijit/form/HorizontalRule",
    "dijit/form/HorizontalRuleLabels",
    "dojo/text!./templates/StoryEditor.html",
    "dojo/domReady!",
    "dijit/Editor",
    "dojox/editor/plugins/Save",
    "dojox/gfx",
    "dojo/dom-construct",
    "dojo/dom",
    "dojo/json",
    "app/MMigrationMapDialog"
], function(parser, request, declare, lang, window, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Button, ContentPane, TitleGroup, TitlePane, TabContainer, StackContainer, StackController, HorizontalSlider, HorizontalRule, HorizontalRuleLabels, template, dom, Editor, Save, gfx, domConstruct, dojo_dom, json, MMigrationMapDialog) {

     console.log("ENTERED StoryEditor");
 
     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,

        current_mhg: null,
        current_yhg: null,
        current_mhg_path: null,
        current_yhg_path: null,
        m_surface: null,
        y_surface: null,
        scalingFactor: 1,
        curvesDrawn: null,
        m_migPath: null,

        postCreate: function()
        {
          console.log("StoryEditor postCreate:", this);
          console.log("StoryEditor window:", window);
          window.global.app.widgets.StoryEditor = this;
          
          // this.heatMapImage.src = "app/maps/A.png";
          this.migrationMapContentPane.onShow = lang.hitch(this, this.migrationMapShows);
          this.y_migrationMapContentPane.onShow = lang.hitch(this, this.y_migrationMapShows);
          this.maximizeMMap.onClick = lang.hitch(this, this.maximizeMMap_callback);
        },

        maximizeMMap_callback: function(hgnum)
        {
          console.log("maximizeMMap_callback");
          var h = window.global.app.widgets.Dispatcher.viewport.height - 20;
          var w = window.global.app.widgets.Dispatcher.viewport.width - 20;
          var size = "width: " + w + "px; height: " + h + "px;";
          this.mMigrationMapDialog = new MMigrationMapDialog({style: size});
          this.mMigrationMapDialog.show();
        },

        y_sliderMoved: function(hgnum)
        {
          console.log("Now pointing to:", this.current_yhg_path[hgnum]);
          this.y_drawPath(this.y_migPath, this.current_yhg_path[hgnum].replace(/'/g, "~"));
        },

        m_sliderMoved: function(hgnum)
        {
          console.log("Now pointing to:", this.current_mhg_path[hgnum]);
          this.drawPath(this.m_migPath, this.current_mhg_path[hgnum].replace(/'/g, "~"));
        },
        m_migPathServerResponded: function(data)
        {
          var migPath = json.parse(data);
          this.m_migPath = migPath;
          console.log("data:", data);
          console.log("migPath:", migPath);
          this.drawPath(migPath, "");
        },
        y_migPathServerResponded: function(data)
        {
          var migPath = json.parse(data);
          this.y_migPath = migPath;
          console.log("data:", data);
          console.log("migPath:", migPath);
          this.y_drawPath(migPath, "");
        },

        y_drawPath: function(migPath, limit)
        {
          console.log("drawPath:", migPath, limit);
          if(this.curvesDrawn != null)
          {
            for(var i=0; i<this.curvesDrawn.length; i++)
            {
              this.curvesDrawn[i].removeShape();
            }
          }
          this.curvesDrawn = new Array();
          for(var i=0; i<migPath.length; i++)
          {
            if(migPath[i].label == limit) break;
            if(migPath[i].geometry != null)
            {
             
              var sectionGeometry = migPath[i].geometry; 
              if(sectionGeometry != null)
              {
                for(var j=0; j<sectionGeometry.length; j++)
                {
                  var s_x, s_y;
                  var e_x, e_y;
                  var c_x, c_y;
  
                  var elementGeometry = sectionGeometry[j];
                  var arrowEnded = elementGeometry.arrowEnded;
  
                  s_x = elementGeometry.start.x/this.scalingFactor;
                  s_y = elementGeometry.start.y/this.scalingFactor;
  
                  c_x = elementGeometry.control.x/this.scalingFactor;
                  c_y = elementGeometry.control.y/this.scalingFactor;
  
                  e_x = elementGeometry.end.x/this.scalingFactor;
                  e_y = elementGeometry.end.y/this.scalingFactor;

                  // draw path
                  this.curvesDrawn.push(
                    this.y_surface.createPath()
                      .moveTo(s_x, s_y)
                      .qCurveTo(c_x, c_y, e_x, e_y)
                      // .closePath()
                      .setStroke({color: "white", width: 1})
                      .setFill(null)
                  );
  
                  // draw arrow at the end of it
                  if(arrowEnded)
                  {
                    var al=2;
                    var ldx = e_x - c_x;
                    var ldy = e_y - c_y;
                    var lcp = Math.sqrt(ldx*ldx + ldy*ldy);
                    var px = al * ldx / lcp;
                    var py = al * ldy / lcp;
    
                    var ne_x = e_x - px;
                    var ne_y = e_y - py;
                    this.curvesDrawn.push(
                      this.y_surface.createPath()
                        .moveTo(e_x, e_y)
                        .lineTo(ne_x, ne_y)
                        .setStroke({color: "white", width: 1})
                        .setFill(null)
                    );
          
                    var ne_x1 = ne_x - px;
                    var ne_y1 = ne_y - py;
                    var ps0 =   this.y_surface.createPath()
                        .moveTo(ne_x, ne_y)
                        .lineTo(ne_x1, ne_y1)
                        .setStroke({color: "white", width: 3})
                        .setFill(null);
                    this.curvesDrawn.push(ps0);
          
                    var ne_x2 = ne_x1 - px;
                    var ne_y2 = ne_y1 - py;
                    var ps=
                      this.y_surface.createPath()
                        .moveTo(ne_x1, ne_y1)
                        .lineTo(ne_x2, ne_y2)
                        .setStroke({color: "white", width: 5})
                        .setFill(null);
                    this.curvesDrawn.push(ps);
                  }
                }
              }
            }
          }
        },
        drawPath: function(migPath, limit)
        {
          console.log("drawPath:", migPath, limit);
          if(this.curvesDrawn != null)
          {
            for(var i=0; i<this.curvesDrawn.length; i++)
            {
              this.curvesDrawn[i].removeShape();
            }
          }
          this.curvesDrawn = new Array();
          for(var i=0; i<migPath.length; i++)
          {
            if(migPath[i].label == limit) break;
            if(migPath[i].geometry != null)
            {
             
              var sectionGeometry = migPath[i].geometry; 
              if(sectionGeometry != null)
              {
                for(var j=0; j<sectionGeometry.length; j++)
                {
                  var s_x, s_y;
                  var e_x, e_y;
                  var c_x, c_y;
  
                  var elementGeometry = sectionGeometry[j];
                  var arrowEnded = elementGeometry.arrowEnded;
  
                  s_x = elementGeometry.start.x/this.scalingFactor;
                  s_y = elementGeometry.start.y/this.scalingFactor;
  
                  c_x = elementGeometry.control.x/this.scalingFactor;
                  c_y = elementGeometry.control.y/this.scalingFactor;
  
                  e_x = elementGeometry.end.x/this.scalingFactor;
                  e_y = elementGeometry.end.y/this.scalingFactor;

                  // draw path
                  this.curvesDrawn.push(
                    this.m_surface.createPath()
                      .moveTo(s_x, s_y)
                      .qCurveTo(c_x, c_y, e_x, e_y)
                      // .closePath()
                      .setStroke({color: "white", width: 1})
                      .setFill(null)
                  );
  
                  // draw arrow at the end of it
                  if(arrowEnded)
                  {
                    var al=2;
                    var ldx = e_x - c_x;
                    var ldy = e_y - c_y;
                    var lcp = Math.sqrt(ldx*ldx + ldy*ldy);
                    var px = al * ldx / lcp;
                    var py = al * ldy / lcp;
    
                    var ne_x = e_x - px;
                    var ne_y = e_y - py;
                    this.curvesDrawn.push(
                      this.m_surface.createPath()
                        .moveTo(e_x, e_y)
                        .lineTo(ne_x, ne_y)
                        .setStroke({color: "white", width: 1})
                        .setFill(null)
                    );
          
                    var ne_x1 = ne_x - px;
                    var ne_y1 = ne_y - py;
                    var ps0 =   this.m_surface.createPath()
                        .moveTo(ne_x, ne_y)
                        .lineTo(ne_x1, ne_y1)
                        .setStroke({color: "white", width: 3})
                        .setFill(null);
                    this.curvesDrawn.push(ps0);
          
                    var ne_x2 = ne_x1 - px;
                    var ne_y2 = ne_y1 - py;
                    var ps=
                      this.m_surface.createPath()
                        .moveTo(ne_x1, ne_y1)
                        .lineTo(ne_x2, ne_y2)
                        .setStroke({color: "white", width: 5})
                        .setFill(null);
                    this.curvesDrawn.push(ps);
                  }
                }
              }
            }
          }
        },
        m_drawMigrationPath: function()
        {
          request("services/getMigrationPathGeometry.php?hg_path=" + json.stringify(this.current_mhg_path) + "&path=m").then(lang.hitch(this, this.m_migPathServerResponded));
        },

        migrationMapShows: function()
        {
          var mapAreaNode = dojo_dom.byId("m_mig_map").parentNode;
          var mapAreaWidth = mapAreaNode.offsetWidth - 8; 
          var mapAreaHeight = mapAreaNode.parentNode.parentNode.offsetHeight - 8; 
          var mapImageWidth = 2820;
          var mapImageHeight = 1760;
          var ratioWidth = mapImageWidth / mapAreaWidth;
          var ratioHeight = mapImageHeight / mapAreaHeight;
          this.scalingFactor = ratioWidth;
          if(ratioWidth < ratioHeight) this.scalingFactor = ratioHeight;

          var surfaceWidth = mapImageWidth / this.scalingFactor;
          var surfaceHeight = mapImageHeight / this.scalingFactor;

          console.log("StoryEditor: this.scalingFactor:", this.scalingFactor);
          if(this.m_surface != null) this.m_surface.destroy();
          this.m_surface = gfx.createSurface("m_mig_map", surfaceWidth, surfaceHeight);
          var image = this.m_surface.createImage({width: surfaceWidth, height: surfaceHeight, src: "app/maps/basemap.jpg"});
          if(this.current_mhg_path != null)
          {
            this.m_drawMigrationPath();
          }
        },
        y_drawMigrationPath: function()
        {
          request("services/getMigrationPathGeometry.php?hg_path=" + json.stringify(this.current_yhg_path) + "&path=y").then(lang.hitch(this, this.y_migPathServerResponded));
        },

        y_migrationMapShows: function()
        {
          var mapAreaNode = dojo_dom.byId("y_mig_map").parentNode;
          var mapAreaWidth = mapAreaNode.offsetWidth - 8; 
          var mapAreaHeight = mapAreaNode.parentNode.parentNode.offsetHeight - 8; 
          var mapImageWidth = 2820;
          var mapImageHeight = 1760;
          var ratioWidth = mapImageWidth / mapAreaWidth;
          var ratioHeight = mapImageHeight / mapAreaHeight;
          this.scalingFactor = ratioWidth;
          if(ratioWidth < ratioHeight) this.scalingFactor = ratioHeight;

          var surfaceWidth = mapImageWidth / this.scalingFactor;
          var surfaceHeight = mapImageHeight / this.scalingFactor;

          console.log("StoryEditor: this.scalingFactor:", this.scalingFactor);
          if(this.y_surface != null) this.y_surface.destroy();
          this.y_surface = gfx.createSurface("y_mig_map", surfaceWidth, surfaceHeight);
          var image = this.y_surface.createImage({width: surfaceWidth, height: surfaceHeight, src: "app/maps/basemap.jpg"});
          if(this.current_yhg_path != null)
          {
            this.y_drawMigrationPath();
          }
        },

        serverResponded: function(data)
        {
          console.log("pane:", this);
          console.log("title:", this.title);
          console.log("data:", data);
          if(data == "")
          {
            this.set("title", this.title + " (No Story)");
            this.set("disabled", 'disabled');
          }
          this.set('content', data);
        },
        setDataInsideContentPane: function(tp, url)
        {
          request(url).then(lang.hitch(tp, this.serverResponded));
        },

        serverResponded_editor: function(data)
        {
          console.log("serverResponded_editor:", data);
          console.log("title pane:", this);
          if(data == "")
          {
            this.set("title", this.title + " (No Story)");
          }
          var editorId = "id_" + this.story + "_" + this.tree + "_" + this.hg.replace(/'/g, "_");
          
          this.set('content', '<div id=' + editorId + '></div>');
          var widgetEditor = new Editor({value: data, extraPlugins: [{name: 'save', url: 'services/saveStory.php?tree=' + this.tree + "&story=" + this.story + "&hg=" + this.hg + "&author=" + window.global.app.widgets.Dispatcher.humanname}]}, editorId);
          widgetEditor.startup();
          console.log("editor:", widgetEditor);
        },
        setEditorInsideContentPane: function(tp, url, story, tree, hg)
        {
          tp.tree = tree;
          tp.story = story;
          tp.hg = hg;
          request(url).then(lang.hitch(tp, this.serverResponded_editor));
        },

        onHaplogroupChange: function(origin, hg_path, id_path, tree, heatmap_id, heatmap_file)
        {
          var mapLabels = [];
          var y_mapLabels = [];
          if(tree == 'm')
          {
            this.current_mhg_path = hg_path;
            var tp;
            var widgetEditor;
            // Clean up all Intro tabs and editors
            if(this.introStoryStack != undefined) this.introStoryStack.destroyRecursive(false);

            this.introStoryStack = new TitleGroup({}, "introSpace");
            for(var i=0; i<hg_path.length; i++)
            {
              var c = "Intro for: " + hg_path[i];        

              tp = new TitlePane({
                title: hg_path[i],
                open: false
              });
              this.introStoryStack.addChild(tp);

              if(window.global.app.widgets.Dispatcher.humanname == undefined)
                this.setDataInsideContentPane(tp, "services/getIntro.php?hg=" + hg_path[i] + "&tree=" + tree);
              else
                this.setEditorInsideContentPane(tp, "services/getIntro.php?hg=" + hg_path[i] + "&tree=" + tree, 'intro', tree, hg_path[i]);
              if(i%2 == 1 && hg_path.length > 8)
                mapLabels.push("<br>" + hg_path[i]);
              else
                mapLabels.push(hg_path[i]);
            }
            this.introStoryStack.startup();
  
            // restore introSpace
            domConstruct.place("<div id='introSpace'></div>", "introAnchor", "after");
  
            // Clean up all Detailed tabs and editors
            if(this.detailedStoryStack != undefined) this.detailedStoryStack.destroyRecursive(false);
  
            this.detailedStoryStack = new TitleGroup({}, "detailedSpace");
            for(var i=0; i<hg_path.length; i++)
            {
              if(hg_path[i] == "root" || hg_path[i] == "RSRS") continue;
              var c = "Detailed for: " + hg_path[i];        
              tp = new TitlePane({
                title: hg_path[i],
                open: false
              });
              this.detailedStoryStack.addChild(tp);

              if(window.global.app.widgets.Dispatcher.humanname == undefined)
                this.setDataInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree);
              else
                this.setEditorInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree, 'detailed', tree, hg_path[i]);
              // this.setDataInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree);
            }
            this.detailedStoryStack.startup();
            this.assetContainer.selectChild(this.detailedStoryContentPane);
            this.assetContainer.selectChild(this.introStoryContentPane);
  
            // restore introSpace
            domConstruct.place("<div id='detailedSpace'></div>", "detailedAnchor", "after");

            // Migration Map

            if(this.sliderRules != undefined) this.sliderRules.destroyRecursive(false);
            if(this.sliderRuleLabels != undefined) this.sliderRuleLabels.destroyRecursive(false);
            if(this.slider != undefined) this.slider.destroyRecursive(false);

            this.sliderRules = new HorizontalRule(
            {
              count: mapLabels.length,
              style: {height: "10px"}
            });

            this.sliderRuleLabels = new HorizontalRuleLabels(
            {
              labels: mapLabels
            });

            this.sliderProps =
            {
              value: mapLabels.length - 1,
              name: "slider",
              "aria-label":"programmatic slider",
              slideDuration: 0,
              onChange: lang.hitch(this, this.m_sliderMoved),
              style: {width:"600px"},
              minimum: 0,
              maximum: mapLabels.length - 1,
              discreteValues: mapLabels.length,
              intermediateChanges: "false",
              showButtons: "true"
            };

            this.slider = new HorizontalSlider(this.sliderProps, "migrationSpace");
            this.sliderRules.placeAt("migrationSpace");
            this.sliderRuleLabels.placeAt("migrationSpace");
            this.slider.startup();
            this.sliderRules.startup();
            this.sliderRuleLabels.startup();
            // restore migrationSpace
            domConstruct.place("<div id='migrationSpace'></div>", "migrationAnchor", "after");
  
            this.heatMapImage.src = heatmap_file;
            this.heatMap.set("title", "Heat Map (for " + heatmap_id + ")");
          }
          if(tree == 'y')
          {
            this.current_yhg_path = hg_path;
            var tp;
            var ytree = window.global.app.widgets.MtdnaTree.yTree;
            // Clean up all Intro tabs and editors
            if(this.y_introStoryStack != undefined) this.y_introStoryStack.destroyRecursive(false);
  
            this.y_introStoryStack = new TitleGroup({}, "y_introSpace");
             
            for(var i=0; i<hg_path.length; i++)
            {
              if(hg_path[i] == "root" || hg_path[i] == "RSRS") continue;
              var k = Number(id_path[i]);
              var hg_name = ytree[k].hgname;
              var c = "Intro for: " + hg_path[i];        
              tp = new TitlePane({
                title: hg_path[i] + " (from haplogroup " + hg_name + ")",
                open: false
              });
              this.y_introStoryStack.addChild(tp);

              if(window.global.app.widgets.Dispatcher.humanname == undefined)
                this.setDataInsideContentPane(tp, "services/getIntro.php?hg=" + hg_path[i] + "&tree=" + tree);
              else
                this.setEditorInsideContentPane(tp, "services/getIntro.php?hg=" + hg_path[i] + "&tree=" + tree, 'intro', tree, hg_path[i]);
              if(i%2 == 1 && hg_path.length > 8)
                y_mapLabels.push("<br>" + hg_path[i]);
              else
                y_mapLabels.push(hg_path[i]);
            }
            this.y_introStoryStack.startup();
  
            // restore introSpace
            domConstruct.place("<div id='y_introSpace'></div>", "y_introAnchor", "after");
  
            // Clean up all Detailed tabs and editors
            if(this.y_detailedStoryStack != undefined) this.y_detailedStoryStack.destroyRecursive(false);
  
            this.y_detailedStoryStack = new TitleGroup({}, "y_detailedSpace");
            for(var i=0; i<hg_path.length; i++)
            {
              if(hg_path[i] == "root" || hg_path[i] == "RSRS") continue;
              var k = Number(id_path[i]);
              var hg_name = ytree[k].hgname;
              var c = "Detailed for: " + hg_path[i];        
              tp = new TitlePane({
                title: hg_path[i] + " (from haplogroup " + hg_name + ")",
                open: false
              });
              this.y_detailedStoryStack.addChild(tp);

              if(window.global.app.widgets.Dispatcher.humanname == undefined)
                this.setDataInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree);
              else
                this.setEditorInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree, 'detailed', tree, hg_path[i]);
              // this.setDataInsideContentPane(tp, "services/getDetailed.php?hg=" + hg_path[i] + "&tree=" + tree);
            }
            this.y_detailedStoryStack.startup();
            this.y_assetContainer.selectChild(this.y_detailedStoryContentPane);
            this.y_assetContainer.selectChild(this.y_introStoryContentPane);
  
            // restore introSpace
            domConstruct.place("<div id='y_detailedSpace'></div>", "y_detailedAnchor", "after");

            // Y Migration Map

            if(this.y_sliderRules != undefined) this.y_sliderRules.destroyRecursive(false);
            if(this.y_sliderRuleLabels != undefined) this.y_sliderRuleLabels.destroyRecursive(false);
            if(this.y_slider != undefined) this.y_slider.destroyRecursive(false);

            this.y_sliderRules = new HorizontalRule(
            {
              count: y_mapLabels.length,
              style: {height: "10px"}
            });

            this.y_sliderRuleLabels = new HorizontalRuleLabels(
            {
              labels: y_mapLabels
            });

            this.y_sliderProps =
            {
              value: y_mapLabels.length - 1,
              name: "slider",
              "aria-label":"programmatic slider",
              slideDuration: 0,
              onChange: lang.hitch(this, this.y_sliderMoved),
              style: {width:"600px"},
              minimum: 0,
              maximum: y_mapLabels.length - 1,
              discreteValues: y_mapLabels.length,
              intermediateChanges: "false",
              showButtons: "true"
            };

            this.y_slider = new HorizontalSlider(this.y_sliderProps, "y_migrationSpace");
            this.y_sliderRules.placeAt("y_migrationSpace");
            this.y_sliderRuleLabels.placeAt("y_migrationSpace");
            this.y_slider.startup();
            this.y_sliderRules.startup();
            this.y_sliderRuleLabels.startup();
            // restore migrationSpace
            domConstruct.place("<div id='y_migrationSpace'></div>", "y_migrationAnchor", "after");
            this.y_heatMapImage.src = heatmap_file;
            this.y_heatMap.set("title", "Heat Map (for " + heatmap_id + ")");
          }
        }
    });
});
