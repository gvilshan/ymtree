define([
    "dojo/parser",
    "dojo/_base/declare",
    "dojo/_base/lang",
    "dojo/request",
    "dojo/json",
    "dojo/dom",
    "dojo/on",
    "dojo/ready",
    "dojo/_base/window",
    "dojo/store/Memory",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/form/Button",
    "dijit/form/FilteringSelect",
    "dijit/layout/ContentPane",
    "dijit/layout/BorderContainer",
    "dijit/layout/StackContainer",
    "dijit/layout/StackController",
    "dijit/form/SimpleTextarea",
    "dijit/form/Textarea",
    "dijit/Tooltip",
    "app/Dispatcher",
    "dgrid/Grid",
    "dgrid/OnDemandGrid",
    "dgrid/Selection",
    "dgrid/CellSelection",
    "dgrid/Keyboard",
    "dgrid/extensions/DijitRegistry",
    "dojo/dom-style",
    "dojo/text!./templates/HgSearch.html",
    "dojo/domReady!"
], function(parser, declare, lang, request, json, dom, on, ready, window, Memory, _WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, Button, FilteringSelect, ContentPane, BorderContainer, StackContainer, StackController, SimpleTextarea, Textarea, Tooltip, Dispatcher, Grid, OnDemandGrid, Selection, CellSelection, Keyboard, DijitRegistry, style, template, dom1) {
 
     console.log("HgSearch window:", window);

     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        mhgList: null,
        posList: null,
        yhgList: null,
        snpList: null,
        mhgStore: null,
        posStore: null,
        yhgStore: null,
        snpStore: null,
        y_grid: null,
        m_grid: null,
        mhg_grid: null,
        yhg_grid: null,
        current_pos: null,
        current_snp: null,

        snpSelected: function(arg)
        {
          if(this.snpSelect.state == "")
          {
            if(arg != this.current_snp)
            {
              this.current_snp = arg;
              console.log("selected snp", arg, this.snpList[arg]);
              this.populateYhgList(arg);
            }
          }
        },

        snpInput: function(arg)
        {
          // console.log("input snp.", arg);
          if(arg.charCode == 0 && arg.key == "Enter")
          {
            var snp = this.snpSelect.get('value');
            var dv = this.snpSelect.get('displayedValue');
            for(var i=0; i<this.snpList.length; i++)
            {
              if(this.snpList[i].name == dv)
              {
                this.snpSelected(snp);
                break;
              }
            }
          }
        },

        posSelected: function(arg)
        {
          if(this.posSelect.state == "")
          {
            if(arg != this.current_pos)
            {
              this.current_pos = arg;
              console.log("selected pos.", arg, this.posList[arg]);
              this.populateMhgList(arg);
            }
          }
        },

        posInput: function(arg)
        {
          // console.log("input pos.", arg);
          if(arg.charCode == 0 && arg.key == "Enter")
          {
            var pos = this.posSelect.get('value');
            var dv = this.posSelect.get('displayedValue');
            for(var i=0; i<this.posList.length; i++)
            {
              if(this.posList[i].name == dv)
              {
                this.posSelected(pos);
                break;
              }
            }
          }
        },

        mhgSelected: function(arg)
        {
          var tree = window.global.app.widgets.MtdnaTree.mtdnaTree;
          window.global.app.widgets.Dispatcher.onHaplogroupChange("HgSearch", tree[Number(arg)].hgname, "m");
        },

        yhgSelected: function(arg)
        {
          var tree = window.global.app.widgets.MtdnaTree.yTree;
          window.global.app.widgets.Dispatcher.onHaplogroupChange("HgSearch", tree[arg].hgname, "y");
        },

        initializeSnpFilteringSelect: function(text)
        {
          this.snpList = json.parse(text);
          this.snpStore = new Memory();
          this.snpStore.setData(this.snpList);
          this.snpSelect.set("store", this.snpStore);
          console.log("snpSelect:", this.snpSelect);
          this.snpSelect.onChange = lang.hitch(this, this.snpSelected);
          this.snpSelect.onInput = lang.hitch(this, this.snpInput);
        },

        initializePosFilteringSelect: function(text)
        {
          this.posList = json.parse(text);
          this.posStore = new Memory();
          this.posStore.setData(this.posList);
          this.posSelect.set("store", this.posStore);
          console.log("posSelect:", this.posSelect);
          this.posSelect.onChange = lang.hitch(this, this.posSelected);
          this.posSelect.onInput = lang.hitch(this, this.posInput);
        },

        initializeMhgFilteringSelect: function(text)
        {
          this.mhgList = json.parse(text);
          this.mhgStore = new Memory();
          this.mhgStore.setData(this.mhgList);
          this.mhgSelect.set("store", this.mhgStore);
          this.mhgSelect.onChange = lang.hitch(this, this.mhgSelected);
          this.m_tab_search.selectChild(this.m_by_mutation);
          this.m_tab_search.selectChild(this.m_by_hg);
        },

        initializeYhgFilteringSelect: function(text)
        {
          this.yhgList = json.parse(text);
          this.yhgStore = new Memory();
          this.yhgStore.setData(this.yhgList);
          this.yhgSelect.set("store", this.yhgStore);
          this.yhgSelect.onChange = lang.hitch(this, this.yhgSelected);
        },

        initializeAssetIndex: function(text)
        {
          this.assetIndex = json.parse(text);
        },

        yhgSelection: function(evt)
        {
          console.log("yhg selection", evt);

          var evtType = evt.type;
          if(evtType == "dgrid-select")
          {
            var cells = evt.cells[0];
            var yhg = cells.row.data.yhg;
            console.log("yhg:", yhg);
            window.global.app.widgets.Dispatcher.onHaplogroupChange("HgSearch", yhg, "y");
            for(var i=0; i<this.yhgList.length; i++)
            {
              if(this.yhgList[i].name == yhg)
              {
                this.yhgSelect.set('value', this.yhgList[i].id);
                break;
              }
            }
          }
        },

        mhgSelection: function(evt)
        {
          console.log("mhg selection", evt);

          var evtType = evt.type;
          if(evtType == "dgrid-select")
          {
            var cells = evt.cells[0];
            var mhg = cells.row.data.mhg;
            console.log("mhg:", mhg);
            window.global.app.widgets.Dispatcher.onHaplogroupChange("HgSearch", mhg, "m");
            for(var i=0; i<this.mhgList.length; i++)
            {
              if(this.mhgList[i].name == mhg)
              {
                this.mhgSelect.set('value', this.mhgList[i].id);
                break;
              }
            }
          }
        },

        populateYhgList: function(snpIndex)
        {
          console.log("populateYhgList this:", this);
          var columns = {
            yhg: "Y Haplogroups"
          };
          var data = [];
          var item = this.snpList[snpIndex];
          var yhgs = item.yhgs; // .split(" ");
          for(var i=0; i<yhgs.length; i++)
          {
            var o = {yhg: yhgs[i]};
            data.push(o);
          }

          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);
          if(this.yhg_grid == null)
          { 
            this.yhg_grid = new CellSelectionGrid({columns: columns, style: "height:auto;"}, "y_yhg_grid");
            on(this.yhg_grid, "dgrid-select", lang.hitch(this, this.yhgSelection));
          }
          this.yhg_grid.refresh(data);
          this.yhg_grid.renderArray(data);
        },

        populateMhgList: function(posIndex)
        {
          console.log("populateMhgList this:", this);
          var columns = {
            mhg: "MtDNA Haplogroups"
          };
          var data = [];
          var item = this.posList[posIndex];
          var mhgs = item.mhgs.split(" ");
          for(var i=0; i<mhgs.length; i++)
          {
            var o = {mhg: mhgs[i]};
            data.push(o);
          }
            
          var CellSelectionGrid = declare([OnDemandGrid, CellSelection, Keyboard]);
          if(this.mhg_grid == null)
          {
            this.mhg_grid = new CellSelectionGrid({columns: columns, style: "height:auto;"}, "m_mhg_grid");
            on(this.mhg_grid, "dgrid-select", lang.hitch(this, this.mhgSelection));
          }
          this.mhg_grid.refresh(data);
          this.mhg_grid.renderArray(data);
        },

        populateMarkerList: function(gridname, markers)
        {
          console.log("populateMarkerList this:", this);
          var columns = {
            marker: "Markers"
          };
          var data = [];
          for(var i=0; i<markers.length; i++)
          {
            var o = {marker: markers[i]};
            data.push(o);
          }
            
          if(gridname == "m_mutations_grid")
          {
            if(this.m_grid == null)
              this.m_grid = new Grid({columns: columns, style: "height:auto;"}, "m_mutations_grid");
            this.m_grid.refresh(data);
            this.m_grid.renderArray(data);
          }
          if(gridname == "y_mutations_grid")
          {
            if(this.y_grid == null)
              this.y_grid = new Grid({columns: columns, style: "height:auto;"}, "y_mutations_grid");
            this.y_grid.refresh(data);
            this.y_grid.renderArray(data);
          }
        },

        postCreate: function()
        {
          var localcontext_initializeMhgFilteringSelect = lang.hitch(this, this.initializeMhgFilteringSelect);
          var localcontext_initializePosFilteringSelect = lang.hitch(this, this.initializePosFilteringSelect);
          var localcontext_initializeSnpFilteringSelect = lang.hitch(this, this.initializeSnpFilteringSelect);
          var localcontext_initializeYhgFilteringSelect = lang.hitch(this, this.initializeYhgFilteringSelect);
          var localcontext_initializeAssetIndex = lang.hitch(this, this.initializeAssetIndex);
          request("services/getMtdnaHgs.php").then(localcontext_initializeMhgFilteringSelect);
          request("services/getMtdnaPositions.php").then(localcontext_initializePosFilteringSelect);
          request("services/getYHgs.php").then(localcontext_initializeYhgFilteringSelect);
          request("services/getYSNPs.php").then(localcontext_initializeSnpFilteringSelect);
          request("services/getYHgs.php").then(localcontext_initializeYhgFilteringSelect);
          request("services/getAssetIndex.php").then(localcontext_initializeAssetIndex);
  
          window.global.app.widgets.HgSearch = this;
          label = "browser: " + window.global.app.widgets.Dispatcher.browser_name + "<br>Width: " +
                  window.global.app.widgets.Dispatcher.viewport.width + "<br>Height: " +
                  window.global.app.widgets.Dispatcher.viewport.height;
          this.tooltip = new Tooltip({
            connectId: [this.browser_stats, this.browser_stats1],
            label: label,
            position: ["before"]
          });


        }
    });
});
