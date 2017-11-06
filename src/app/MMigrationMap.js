define([
    "dojo/ready",
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
    "dijit/form/HorizontalSlider",
    "dijit/form/HorizontalRule",
    "dijit/form/HorizontalRuleLabels",
    "dijit/Tree",
    "dijit/registry",
    "dojo/store/Memory",
    "dojox/gfx",
    "dojo/dom-construct",
    "dojo/text!./templates/MMigrationMap.html"
], function(ready, parser, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, ObjectStoreModel, HorizontalSlider, HorizontalRule, HorizontalRuleLabels, Tree, registry, Memory, gfx, domConstruct, template) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        dialog: null,

        mapAreaNode: null,
        mapAreaWidth: null,
        mapAreaHeight: null,
        mapImageWidth: 2820,
        mapImageHeight: 1760,
        ratioWidth: null,
        ratioHeight: null,
        scalingFactor: null,

        map_surface: null, 
        current_mhg_path: null, 

        waitTillDialogRendered: function()
        {
          var n;
          n = dom.byId("mmigrationmap");
          if(n == null)
          {
            setTimeout(lang.hitch(this, this.waitTillDialogRendered), 1);
            return;
          }
          this.mapAreaNode = n.parentNode;
          this.mapAreaWidth = this.mapAreaNode.offsetWidth;
          if(this.mapAreaWidth == 0)
          {
            setTimeout(lang.hitch(this, this.waitTillDialogRendered), 1);
            return;
          }
          this.dialogWindowOpened();
        },

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        startup: function()
        {
          console.log("startup:", this);
          setTimeout(lang.hitch(this, this.waitTillDialogRendered), 1);
        },

        moveNorth: function(evt)
        {
          console.log("north", evt);
        },
    
        dialogWindowOpened: function()
        {
          console.log("this.mmigrationmap.parentNode:", this.mmigrationmap.parentNode);
          this.mapAreaNode = dom.byId("mmigrationmap").parentNode; //this.mmigrationmap.domNode.parentNode;
          console.log("this.mapAreaNode:", this.mapAreaNode);

          this.mapAreaWidth = this.mapAreaNode.offsetWidth - 8;
          console.log("this.mapAreaWidth:", this.mapAreaWidth);
         
          this.mapAreaHeight = this.mapAreaNode.parentNode.parentNode.parentNode.offsetHeight - 8;
          console.log("this.mapAreaHeight:", this.mapAreaHeight);
          this.ratioWidth = this.mapImageWidth / this.mapAreaWidth;
          this.ratioHeight = this.mapImageHeight / this.mapAreaHeight;
          this.scalingFactor = this.ratioWidth;
          if(this.ratioWidth < this.ratioHeight) this.scalingFactor = this.ratioHeight;
 
          var surfaceWidth = this.mapImageWidth / this.scalingFactor;
          var surfaceHeight = this.mapImageHeight / this.scalingFactor;

          console.log("MMigrationMap: this.scalingFactor:", this.scalingFactor);

          if(this.map_surface != null) this.map_surface.destroy();
          this.map_surface = gfx.createSurface("mmigrationmap", surfaceWidth, surfaceHeight);
          var image = this.map_surface.createImage({width: surfaceWidth, height: surfaceHeight, src: "app/maps/basemap.jpg"});
          console.log("mpath:", window.global.app.widgets.MtdnaTree.mpath);
          this.current_mhg_path = window.global.app.widgets.StoryEditor.current_mhg_path;
          if(this.current_mhg_path != null)
          {
            this.drawMigrationPath();
          }
          this.m_north.onClick = lang.hitch(this, this.moveNorth);
        },

        m_sliderMoved: function(hgnum)
        {
          console.log("Now pointing to:", this.current_mhg_path[hgnum]);
          this.drawPath(this.m_migPath, this.current_mhg_path[hgnum].replace(/'/g, "~"));
        },

        drawMigrationPath: function()
        {
          request("services/getMigrationPathGeometry.php?hg_path=" + json.stringify(this.current_mhg_path) + "&path=m").then(lang.hitch(this, this.migPathServerResponded));
        },

        migPathServerResponded: function(data)
        {
          var migPath = json.parse(data);
          this.m_migPath = migPath;
          console.log("data (bigmap):", data);
          console.log("migPath (bigmap):", migPath);
          this.drawPath(migPath, "");
          this.createSlider(migPath);
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
                    this.map_surface.createPath()
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
                      this.map_surface.createPath()
                        .moveTo(e_x, e_y)
                        .lineTo(ne_x, ne_y)
                        .setStroke({color: "white", width: 1})
                       .setFill(null)
                    );

                    var ne_x1 = ne_x - px;
                    var ne_y1 = ne_y - py;
                    var ps0 =   this.map_surface.createPath()
                        .moveTo(ne_x, ne_y)
                        .lineTo(ne_x1, ne_y1)
                        .setStroke({color: "white", width: 3})
                        .setFill(null);
                    this.curvesDrawn.push(ps0);

                    var ne_x2 = ne_x1 - px;
                    var ne_y2 = ne_y1 - py;
                    var ps=
                      this.map_surface.createPath()
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
        createSlider: function(migPath)
        {
          var mapLabels = [];
          for(var i=0; i<migPath.length; i++)
          {
            if(i%2 == 1 && migPath.length > 8)
              mapLabels.push("<br>" + migPath[i].label.replace(/~/g, "'"));
            else
              mapLabels.push(migPath[i].label.replace(/~/g, "'"));
          }
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

          this.slider = new HorizontalSlider(this.sliderProps, "m_migrationSpace");
          this.sliderRules.placeAt("m_migrationSpace");
          this.sliderRuleLabels.placeAt("m_migrationSpace");
          this.slider.startup();
          this.sliderRules.startup();
          this.sliderRuleLabels.startup();
          // restore migrationSpace
          domConstruct.place("<div id='m_migrationSpace'></div>", "m_migrationAnchor", "after");
          var widget = registry.byId("m_migrationSpace");
          console.log("slider:", widget);
          var notches = widget.bottomDecoration.children[0].children;
          for(var i=0; i<notches.length; i++)
          {
            notches[i].style.border="1px solid rgb(255,255,255)";
          }
          var labels = widget.containerNode.children[1].children;
          for(var i=0; i<labels.length; i++)
          {
            labels[i].style.color="white";
          }
        }
    });
});
