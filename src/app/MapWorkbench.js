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
    "dojox/gfx",
    "dgrid/Grid",
    "dojo/text!./templates/MapWorkbench.html"
], function(parser, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, gfx, Grid, template) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        rc: null,
        gpid: null,
        neighbors: null,
        dialogSize: {},

        postCreate: function()
        {
          console.log("postCreate:", this);
        },
        onButtonClick: function(arg)
        {
          console.log("button:", this);
          console.log("arg:", arg);
        },

        drawNeighbors: function()
        {
          var surface = gfx.createSurface("surfaceElement", 1500, 750);
          console.log("surface:", surface);
          
          var image = surface.createImage({width: 1500, height: 750, src: "app/maps/basemap.jpg"});
          // var rectangle = surface.createRect({x:100, y: 50, width: 200, height: 100}).setFill("yellow").setStroke("blue");;
          var circle = surface.createCircle({cx:200, cy: 200, r: 5}).setFill("white").setStroke("white");;
          console.log("circle:", circle);
          console.log("image:", image);
          console.log("hidden-image:", dom.byId("basemap"));
          circle.connect("onmouseout", function(e)
          {
            circle.setFill("white");
            surface.remove(circle);
            console.log("e:", e);
          });
          circle.connect("onmouseover", function(e)
          {
            circle.setFill("red");
            console.log("e:", e);
          });
        },
 
        neighborsReceived: function(data)
        {
          var resp = json.parse(data);
          if(resp.errorno == "0")
          {
            this.neighbors = resp.neighbors;
            var outdata = "";
            for(var i=0; i<this.neighbors.length; i++)
            {
              var e = this.neighbors[i];
              // console.log("e:", e);
              outdata = outdata + i + " " + e.gpid + " " + e.mhg + " " + e.distance + " " + e.ring + "\n";
            }
            // (remove for now) this.communitySourceData.set('value', outdata);
            this.drawNeighbors();
          }
        },

        getNeighbors: function()
        {
          request("/cgi-bin/getNeighborsM3?gpid=" + this.rc + this.gpid, {user: "qaperson", password: "makeitbetter"}).then(lang.hitch(this, this.neighborsReceived));
        },

        startup: function()
        {
          console.log("MapWorkbench startup(): this:", this);
          window.global.app.widgets.MapWorkbench = this;
          this.rc = window.global.app.widgets.GpidPane.local_rc;
          this.gpid = window.global.app.widgets.GpidPane.local_gpid;
          this.getNeighbors();
          // this.TheButton.onClick = this.onButtonClick;
        }

    });
});
