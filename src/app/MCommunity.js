define([
    "dojo/parser",
    "dojo/dom-construct",
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
    "dijit/form/Select",
    "dojox/gfx",
    "dgrid/Grid",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dgrid/extensions/DijitRegistry",
    "dojo/text!./templates/MCommunity.html",
    "dojo/_base/array",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/CellSelection",
    "dgrid/Keyboard",
    "dojo/domReady!"
], function(parser, domConstruct, window, lang, on, json, request, dom, domStyle,  declare, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Form, ValidationTextBox, SimpleTextarea, Button, Select, gfx, Grid, ContentPane, BorderContainer, DijitRegistry, template, arrayUtil, OnDemandGrid, Selection, CellSelection, Keyboard, domReady) {

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        rc: null,
        gpid: null,
        neighbors: null,
        diagramSize: 610,
        neighborLocation: {},

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
          console.log("drawNeighbors: this:", this);
          var surface = gfx.createSurface("surfaceElement", this.diagramSize, this.diagramSize);
          console.log("surface:", surface);
          
          var image = surface.createImage({width: this.diagramSize, height: this.diagramSize, src: "app/images/empty_diagram_medium.png"});
          // var rectangle = surface.createRect({x:100, y: 50, width: 200, height: 100}).setFill("yellow").setStroke("blue");;

          var circle = surface.createCircle({cx:200, cy: 200, r: 5}).setFill("white").setStroke("white");
          console.log("circle:", circle);
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
          domConstruct.destroy("surfaceElement0");
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
            this.populateYouMutations();
            // this.retrieveHsheMutations('NG', 'Q3X5DG2F');
            this.populateThem(resp.neighbors);
          }
        },
        themSelection: function(evt)
        {
          var evtType = evt.type;
          var cells = evt.cells[0];
          console.log("evt:", evt);
          console.log("length(evtType):", evtType.length);
          var column = cells.column.field;
          var gpid10 = cells.row.data.gpid10;
          var mhg = cells.row.data.mhg;
          var dist = cells.row.data.dist;
          var ring = cells.row.data.ring;
          if(evtType == "dgrid-deselect")
          {
            if(column == "gpid10")
            {
              console.log("User does not want mutations for gpid=", gpid10);
              domStyle.set("m_hshe", "display", "none");
            }
            if(column == "mhg")
            {
              console.log("User wants to see all neighbors with mhg=", mhg);
            }
            if(column == "dist")
            {
              console.log("User wants to see all neighbors with dist=", dist);
            }
            if(column == "ring")
            {
              console.log("User wants to see all neighbors with ring=", ring);
            }
          }
          if(evtType == "dgrid-select")
          {
            if(column == "gpid10")
            {
              console.log("User wants mutations for gpid=", gpid10);
              this.retrieveHsheMutations(gpid10.substr(0,2), gpid10.substr(2));
            }
            if(column == "mhg")
            {
              console.log("User wants to see all neighbors with mhg=", mhg);
            }
            if(column == "dist")
            {
              console.log("User wants to see all neighbors with dist=", dist);
            }
            if(column == "ring")
            {
              console.log("User wants to see all neighbors with ring=", ring);
            }
          }
          console.log("themSelection complete");
        },
        populateThem: function(neighbors)
        {
          var columns = {
            gpid10: "GPID",
            mhg: "MHG",
            dist: "Dist",
            ring: "R"
          };
          var data = [];
          for(var i=0; i<neighbors.length; i++)
          {
            var e = neighbors[i];
            var p = e.mhg.indexOf(';');
            if(p > 0) e.mhg = e.mhg.substr(0, p);
            data.push({gpid10: e.gpid, mhg: e.mhg, dist: e.distance, ring: e.ring});
          }
          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);
          
          this.m_neighbors_grid = new CellSelectionGrid({columns: columns, selectionMode: "single"}, "m_them");
          this.m_neighbors_grid.refresh(data);
          this.m_neighbors_grid.renderArray(data);
          on(this.m_neighbors_grid, "dgrid-select,dgrid-deselect", lang.hitch(this, this.themSelection));
        },
        populateYouMutations: function()
        {
          var mhg = window.global.app.widgets.GpidPane.p_mhg.value;
          var markers = window.global.app.widgets.GpidPane.p_m_mutations.value.replace(/ /g, "").split(",");
          var columns = {
            marker: "Your SNPs"
          };
          var data = [];
          for(var i=0; i<markers.length; i++) data.push({marker: markers[i]});
          this.m_grid = new Grid({columns: columns}, "m_you1");
          this.m_grid.refresh(data);
          this.m_grid.renderArray(data);
        },
        retrieveHsheMutations: function(rc, gpid)
        {
          request("services/getParticipantData.php?rc=" + rc + "&gpid=" + gpid).then(lang.hitch(this, this.populateHsheMutations));
        },
        populateHsheMutations: function(response)
        {
          domStyle.set("m_hshe", "display", "block");
          var participant = json.parse(response);
          console.log("populateHsheMutations: participant:", participant);
          var hshe_mhg = participant['gprecord'].mhg;
          var rc = participant['gprecord'][0].rc;
          var gpid = participant['gprecord'][0].gpid;
          var mut = participant['msnps'];
          var data = [];
          for(var i=0; i<mut.length; i++)
          {
            var elem = mut[i];
            var marker;
            if(elem.what == "R")
            {
              marker = elem.position + elem.value;
            }
            if(elem.what == "D")
            {
              marker = elem.position + "d";
            }
            if(elem.what == "I")
            {
              marker = elem.position + ".1" + elem.value;
            }
            data.push({marker: marker});
          }
          console.log("populateHsheMutations: data:", data);
          console.log("populateHsheMutations: rc + gpid:", rc + gpid);
          
          var columns = {
            marker: rc + gpid
          };
          this.m_hshe_grid = new Grid({columns: columns}, "m_hshe");
          this.m_hshe_grid.refresh(data);
          this.m_hshe_grid.renderArray(data);
        },

        getNeighbors: function()
        {
          request("/cgi-bin/getNeighborsM3?gpid=" + this.rc + this.gpid, {user: "qaperson", password: "makeitbetter"}).then(lang.hitch(this, this.neighborsReceived));
        },

        layoutContainers: function()
        {
          console.log("layoutContainers: this:", this);
          this.borderContainer3.startup();
          // this.borderContainer4.startup();
          this.getNeighbors();
        },

        startup: function()
        {
          console.log("MCommunity startup(): this:", this);
          window.global.app.widgets.MCommunity = this;
          this.rc = window.global.app.widgets.GpidPane.local_rc;
          this.gpid = window.global.app.widgets.GpidPane.local_gpid;
          setTimeout(lang.hitch(this, this.layoutContainers), 500);
          // this.TheButton.onClick = this.onButtonClick;
        }

    });
});
