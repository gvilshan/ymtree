define([
    "dojo/parser",
    "dojo/_base/declare",
    "dojo/_base/window",
    "dojo/_base/lang",
    "dojo/dom",
    "dojo/on",
    "dojo/json",
    "dojo/request",
    "dojo/dom-style",
    "dijit/_WidgetBase",
    "dijit/_OnDijitClickMixin",
    "dijit/_TemplatedMixin",
    "dijit/_WidgetsInTemplateMixin",
    "dijit/layout/TabContainer",
    "dijit/layout/ContentPane",
    "dijit/layout/LayoutContainer",
    "dijit/form/Button",
    "dijit/form/ValidationTextBox",
    "dijit/form/TextBox",
    "dijit/form/Textarea",
    "dijit/form/SimpleTextarea",
    "dijit/Dialog",
    "dijit/TooltipDialog",
    "dijit/Tooltip",
    "dijit/popup",
    "dijit/layout/LinkPane",
    "dijit/PopupMenuItem",
    "app/YCommunityDialog",
    "app/MCommunityDialog",
    "app/MapWorkbenchDialog",
    "app/MResultsDialog",
    "app/YResultsDialog",
    "app/SearchPaneUser",
    "dojo/text!./templates/GpidPaneUser.html",
    "dojo/domReady!"
], function(parser, declare, window, lang, dom1, on, json, request,domStyle,_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin, TabContainer, ContentPane, LayoutContainer, Button, ValidationTextBox, TextBox, Textarea, SimpleTextarea, Dialog, TooltipDialog, Tooltip, popup, LinkPane, PopupMenuItem, YCommunityDialog, MCommunityDialog, MapWorkbenchDialog, MResultsDialog, YResultsDialog, SearchPaneUser, template, dom) {
     console.log("ENTERED GpidPaneUser");
 
     return declare([_WidgetBase, _OnDijitClickMixin, _TemplatedMixin, _WidgetsInTemplateMixin], {
        templateString: template,
        local_gpid: null,
        local_rc: null,
        textNodes: [],
        errorCodes: null,
        ylist: "",
        mlist: "",
        phenotype_tooltips: null,
        
        callYButton2012Clicked: function(arg)
        {
          console.log("GpidPaneUser callYButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          var h = window.global.app.widgets.Dispatcher.viewport.height - 20;
          var w = window.global.app.widgets.Dispatcher.viewport.width - 20;
          var size = "width: " + w + "px; height: " + h + "px;";
          this.callYResultsDialog = new YResultsDialog({style: size, rc: rc, gpid: gpid, tree: "/var/www/cgi-bin/c_ytree2012.txt"});
          this.callYResultsDialog.show();
        },
        
        callYButton2014Clicked: function(arg)
        {
          console.log("GpidPaneUser callYButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          var h = window.global.app.widgets.Dispatcher.viewport.height - 20;
          var w = window.global.app.widgets.Dispatcher.viewport.width - 20;
          var size = "width: " + w + "px; height: " + h + "px;";
          this.callYResultsDialog = new YResultsDialog({style: size, rc: rc, gpid: gpid, tree: "/var/www/cgi-bin/c_ytree2014a.txt"});
          this.callYResultsDialog.show();
        },
        
        doMHGCall: function(table, title)
        {
          console.log("doMHGCall:", table);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          var h = window.global.app.widgets.Dispatcher.viewport.height - 20;
          var w = window.global.app.widgets.Dispatcher.viewport.width - 20;
          var size = "width: " + w + "px; height: " + h + "px;";
          if(gpid !== undefined)
          {
            if(gpid != "")
            {
              this.callMResultsDialog = new MResultsDialog({style: size, rc: rc, gpid: gpid, table: table, tree: title});
              this.callMResultsDialog.show();
            }
          }
        },
        callM_B14full: function(arg)
        {
          var table;
          var title = "Build 14 (all SNPs)";
          table = "geno.mhg_map";
          this.doMHGCall(table, title);
        },

        callM_B14chip: function(arg)
        {
          var table;
          var title = "Build 14 (only chip SNPs)";
          table = "geno.mhg_map2014";
          this.doMHGCall(table, title);
        },

        callM_B16full: function(arg)
        {
          var table;
          var title = "Build 16 (all SNPs)";
          table = "geno.mhg_map2014aug";
          this.doMHGCall(table, title);
        },

        callM_B16chip: function(arg)
        {
          var table;
          var title = "Build 16 (only chip SNPs)";
          table = "geno.mhg_map2014aug_chip";
          this.doMHGCall(table, title);
        },

        mapWorkbenchButtonClicked: function(arg)
        {
          console.log("GpidPaneUser mapWorkbenchButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          var h = window.global.app.widgets.Dispatcher.viewport.height - 20;
          var w = window.global.app.widgets.Dispatcher.viewport.width - 20;
          var size = "width: " + w + "px; height: " + h + "px;";
          this.mapWorkbenchDialog = new MapWorkbenchDialog({style: size});
          this.mapWorkbenchDialog.show();
        },

        mCommunityButtonClicked: function(arg)
        {
          console.log("GpidPaneUser mCommunityButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          this.mCommunityDialog = new MCommunityDialog({rc: rc, gpid: gpid});
          this.mCommunityDialog.show();
        },

        yCommunityButtonClicked: function(arg)
        {
          console.log("GpidPaneUser yCommunityButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          this.yCommunityDialog = new YCommunityDialog();
          this.yCommunityDialog.show();
        },

        participantDataReady: function(data)
        {
          var participantData = json.parse(data);
          this.local_gpid = participantData['gprecord'][0].gpid;
          this.local_rc = participantData['gprecord'][0].rc;
          document.cookie="rc1=" + this.local_rc; 
          document.cookie="gpid1=" + this.local_gpid;
          console.log("participantDataReady:", this);
          this.gpidSelector.set('title', 'RID ' + this.local_rc + this.local_gpid);
          var tables = ['gprecord'];
          for(var i=0; i<tables.length; i++)
          {
            var table = tables[i];
            var tabledata = participantData[table];
            for(var prop in tabledata[0])
            {
              if(this['q_' + prop] != undefined)
              {
                var v = tabledata[0][prop];
                if(v == null) continue;
                if(prop == 'lastupdated' || prop == 'ratified' || prop == 'create_date')
                {
                  var p = v.indexOf('.');
                  if(p > 0) v = v.substr(0, p);
                }
                this['q_' + prop].set('value', v);
              }
            }
            if(tabledata[0]['alt_rc'] != null)
            {
              this.alt_gpid_input.set('value', tabledata[0]['alt_rc'] + tabledata[0]['alt_gpid']);
            }
            else
            {
              this.alt_gpid_input.set('value', '');
            }
          }
          if(participantData['haplotype'] !== false)
          {
            var strs = "";
            for(var i=0; i<participantData['haplotype'].length; i++)
            { 
              if(i > 0) strs = strs + ", ";
              strs = strs + "DYS" + participantData['haplotype'][i].dys + ": " + participantData['haplotype'][i].value;
            }
            this.q_str_mutations.set("displayedValue", strs);
          }
          tables = ['phenotype'];
          console.log("gpid pane:", this);
          // Clear old phenotype data
          var html = this.phenotypeData.domNode.innerHTML;
          while((p=html.indexOf('"q_')) > 0)
          {
            var att = html.substr(p+1);
            q = att.indexOf('"');
            var att1 = att.substr(0, q);
            var node = dom1.byId(att1);
            node.innerHTML = '';
            html = att;
          }
          for(var i=0; i<tables.length; i++)
          {
            var table = tables[i];
            var tabledata = participantData[table];
            for(var prop in tabledata[0])
            {
              var node = dom1.byId('q_' + prop);
              if(node != undefined)
              {
                var v = tabledata[0][prop];
                if(prop == 'dob')
                {
                  if(v == undefined) v = "";
                  else
                  {
                    var p = v.indexOf('-');
                    if(p > 0) v = v.substr(0, p);
                  }
                }
                this.textNodes.push('q_' + prop);
                node.innerHTML = v;
              }
            }
          }
          var mut = "";
          for(var i=0; i<participantData['msnps'].length; i++)
          {
            if(i > 0) mut = mut + ", ";
            mut = mut + participantData['msnps'][i].position + participantData['msnps'][i].value;
          }
          this.q_m_mutations.set("displayedValue", mut);
          this.mlist = mut;

          mut = "";
          for(var i=0; i<participantData['haplosnps'].length; i++)
          {
            if(i > 0) mut = mut + ", ";
            mut = mut + participantData['haplosnps'][i].snp;
          }
          this.q_mutations.set("displayedValue", mut);

          var popdata = ["", "", ""];
          for(var i=0; i<participantData['admixture'].length; i++)
          {
            var popid = Number(participantData['admixture'][i].popid);
            var id = 2;
            if(popid < 100) id=1;
            if(popid < 10) id=0;
            var dataline = participantData['admixture'][i].popid + " " + participantData['admixture'][i].name  + "                     ";
            dataline = dataline.substr(0, 30) + participantData['admixture'][i].share + "\n";
            popdata[id] = popdata[id] + dataline;
          }
          this.ancientPopulations.set('value', popdata[0]);
          this.regionalPopulations.set('value', popdata[1]);
          this.closestPopulations.set('value', popdata[2]);
          if(participantData['gprecord'][0].status == "6")
            this.expandButton.set('disabled', false);

          domStyle.set(this.callMHGMenu.domNode, "visibility", "visible");
          domStyle.set(this.callYHGMenu.domNode, "visibility", "hidden");
          if(mut != "") domStyle.set(this.callYHGMenu.domNode, "visibility", "visible");
          this.ylist = mut;

          this.setPhenotypeTooltips();
        },

        findButtonClicked: function(arg)
        {
          console.log("GpidPaneUser findButtonClicked:", this, arg);
          var gpid10 = this.gpid_input.value;
          var rc = gpid10.substr(0,2);
          var gpid = gpid10.substr(2);
          request("services/getParticipantData.php?rc=" + rc + "&gpid=" + gpid).then(lang.hitch(this, this.participantDataReady));
          request("services/getAutosomalFileData.php?rc=" + rc + "&gpid=" + gpid).then(lang.hitch(this, this.autosomalFileDataReady));
        },

        logoutButtonClicked: function()
        {
          // Invalidate session
          request("services/invalidateSession.php");
          // Clean all fields
          for(var prop in this)
          {
            if(prop.substr(0, 2) == "q_")
            {
              this[prop].set('value', "");
            }
          }
          this.gpid_input.set('value', '');
          this.alt_gpid_input.set('value', '');
          this.gpidSelector.set('title', 'RID&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;');
    
          for(var i=0; i<this.textNodes.length; i++)
          {
            var node = dom1.byId(this.textNodes[i]);
            node.innerHTML = "";
          }
          this.textNodes = [];
          this.participantContainer.selectChild(this.gpidSelector);
          this.expandButton.set('disabled', true);
          this.ancientPopulations.set('value', '');
          this.regionalPopulations.set('value', '');
          this.closestPopulations.set('value', '');
          domStyle.set(this.callMHGMenu.domNode, "visibility", "hidden"); 
          domStyle.set(this.callYHGMenu.domNode, "visibility", "hidden");
          window.global.app.widgets.Dispatcher.username = null;
          window.global.app.widgets.Dispatcher.humanname = null;
          window.global.app.widgets.Dispatcher.admin = null;
          document.cookie = "username=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          document.cookie = "admin=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          document.cookie = "humanname=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          document.cookie = "gpid1=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          document.cookie = "rc1=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
          window.global.app.widgets.Dispatcher.showLoginPane();
        },

        gpidExistenceCheckDone: function(data)
        {
          var data1 = json.parse(data);
          if(data1.length == 1) this.searchGpid.set('disabled', false);
        },

        gpidExists: function(arg_rc, arg_gpid)
        {
          request("services/getGprecord.php?rc=" + arg_rc + "&gpid=" + arg_gpid).then(lang.hitch(this, this.gpidExistenceCheckDone));
        },

        mmarkerValidator: function(value, constraints)
        {
          var node_found = dom1.byId("m_snp_found");
          var node_not_found = dom1.byId("m_snp_not_found");
          var textnode = this.q_m_mutations.domNode;
          if(value == "")
          {
            console.log("NONE", value);
            node_found.style.display="none";
            node_not_found.style.display="none";
            console.log("textnode:", textnode);
            console.log("q_m_mutations:", this.q_m_mutations);
            return true;
          }
          value1 = value.toUpperCase();
          values = [];
          var i = -1;
          var found = -1;
          var s;
          values[0] = value1 + "A";
          values[1] = value1 + "C";
          values[2] = value1 + "G";
          values[3] = value1 + "T";
          for(var j=0; j<4; j++)
          {
            s = " " + values[j] + ",";
            i = this.mlist.indexOf(s);
            if(i == -1)
            {   
              s = " " + values[j];
              i = this.mlist.indexOf(s);
              if(i != this.mlist.length - s.length)
              { 
                s = values[j] + ",";
                i = this.mlist.indexOf(s);
                if(i == 0)
                {
                  found = i;
                  break;
                }
              } 
              else
              {
                found = i;
                break;
              }
            }   
            else
            {
              found = i;
              break;
            }
          }   
          if(found == -1)
          {
            console.log("FALSE", value);
            node_found.style.display="none";
            node_not_found.style.display="inline";
            textnode.scrollTop = 0;
            return true;
          }
          var spaces = "....................";
          this.mlist1 = this.mlist.substr(0, i) + " " + spaces.substr(0, s.length - 1) + this.mlist.substr(i + s.length);
          var outOf = this.mlist.length;
          var max = textnode.scrollHeight;
          var scrollAmount = (i * max) / outOf - textnode.clientHeight + 20;
          if(scrollAmount < 0) scrollAmount = 0;
          console.log("scrollAmount", scrollAmount);
          node_found.style.display="inline";
          node_not_found.style.display="none";
          textnode.scrollTop = scrollAmount;
          // Blinking:
          this.blinkCount = 0;
          setTimeout(lang.hitch(this, this.blink_m), 500);
          return true;
        },

        blink_m: function()
        {
          this.blinkCount++;
          if(this.blinkCount % 2 == 0) this.q_m_mutations.set("displayedValue", this.mlist); 
          else this.q_m_mutations.set("displayedValue", this.mlist1);
          if(this.blinkCount < 6) setTimeout(lang.hitch(this, this.blink_m), 500);
        },

        ymarkerValidator: function(value, constraints)
        {
          var node_found = dom1.byId("snp_found");
          var node_not_found = dom1.byId("snp_not_found");
          var textnode = this.q_mutations.domNode;
          if(value == "")
          {
            console.log("NONE", value);
            node_found.style.display="none";
            node_not_found.style.display="none";
            console.log("textnode:", textnode);
            console.log("q_mutations:", this.q_mutations);
            return true;
          }
          value1 = value.toUpperCase();
          var s = " " + value1 + ",";
          var i = this.ylist.indexOf(s);
          if(i == -1)
          {
            s = " " + value1;
            i = this.ylist.indexOf(s);
            if(i != this.ylist.length - s.length)
            {
              s = value1 + ",";
              i = this.ylist.indexOf(s);
              if(i != 0)
              {
                console.log("FALSE", value);
                node_found.style.display="none";
                node_not_found.style.display="inline";
                textnode.scrollTop = 0;
                return true;
              }
            }
            else
            {
              lastone = 1;
            }
          }
          var spaces = "....................";
          console.log("s:" + s + ";i:", i, ";s.length:", s.length, ";ylist.length:", this.ylist.length);
          this.ylist1 = this.ylist.substr(0, i) + " " + spaces.substr(0, s.length - 1) + this.ylist.substr(i + s.length);
      
          var outOf = this.ylist.length;
          var max = textnode.scrollHeight;
          var scrollAmount = (i * max) / outOf - textnode.clientHeight + 20;
          if(scrollAmount < 0) scrollAmount = 0;
          console.log("scrollAmount", scrollAmount);
          node_found.style.display="inline";
          node_not_found.style.display="none";
          textnode.scrollTop = scrollAmount;
          // Blinking:
          this.blinkCount = 0;
          setTimeout(lang.hitch(this, this.blink), 500);
          return true;
        },

        blink: function()
        {
          this.blinkCount++;
          if(this.blinkCount % 2 == 0) this.q_mutations.set("displayedValue", this.ylist); 
          else this.q_mutations.set("displayedValue", this.ylist1);
          if(this.blinkCount < 6) setTimeout(lang.hitch(this, this.blink), 500);
        },

        gpidValidator: function(value, constraints)
        {
          value1 = value.toUpperCase();
/*
          switch(value1)
          {
            case '1':
              this.gpid_input.set('value', 'NGLXTVCVTU');
              break;
            case '2':
              this.gpid_input.set('value', 'NGQBCYS52W');
              break;
            case '3':
              this.gpid_input.set('value', 'NGVYF22EWF');
              break;
            case '4':
              this.gpid_input.set('value', 'NGPU6RN2ZV');
              break;
            case '5':
              this.gpid_input.set('value', 'NGBXEX8TA8');
              break;
            case '6':
              this.gpid_input.set('value', 'NGZ4QQNT8E');
              break;
            case '7':
              this.gpid_input.set('value', 'NGAXYRL3P4');
              break;
            case '8':
              this.gpid_input.set('value', 'NGF8HJGJHD');
              break;
            case '9':
              this.gpid_input.set('value', 'NGUKJ63TAY');
              break;
            case 'C':
              this.gpid_input.set('value', 'NGPM4QQVWQ');
              break;
            case 'D':
              this.gpid_input.set('value', 'NGYV433PHE');
              break;
            case 'E':
              this.gpid_input.set('value', 'NGAAEJJFF6');
              break;
            case 'F':
              this.gpid_input.set('value', 'NGAKE2YTV5');
              break;
            case 'G':
              this.gpid_input.set('value', 'NG6AMCY83N');
              break;
            case 'H':
              this.gpid_input.set('value', 'NGVD4KVJRY');
              break;
            case 'I':
              this.gpid_input.set('value', 'NGFJN2SU62');
              break;
            case 'K':
              this.gpid_input.set('value', 'NGD3Y2LQ2K');
              break;
            case 'L':
              this.gpid_input.set('value', 'NGX9GDVF74');
              break;
            case 'Q':
              this.gpid_input.set('value', 'NGPMHXPTC2');
              break;
            case 'R':
              this.gpid_input.set('value', 'NG29YDHH2R');
              break;
            case 'U':
              this.gpid_input.set('value', 'NGKQLQBCET');
              break;
            case 'V':
              this.gpid_input.set('value', 'NG34WEJY2U');
              break;
            case 'W':
              this.gpid_input.set('value', 'NG9YDCJU4Q');
              break;
          }
*/
            
          if(value1.length == 10)
          {
            if(value1.substr(0,2) == 'HX' || value1.substr(0,2) == 'XT' || value1.substr(0,2) == 'GE' || value1.substr(0,2) == 'UN' || value1.substr(0,2) == 'NG' || value1.substr(0,2) == 'FW' || value1.substr(0,2) == 'PA' || value1.substr(0,2) == 'MI' || value1.substr(0,2) == 'BH' || value1.substr(0,2) == 'BA' || value1.substr(0,2) == 'BT' || value1.substr(0,2) == 'JG' || value1.substr(0,2) == 'MW' || value1.substr(0,2) == 'SI' || value1.substr(0,2) == 'NZ' || value1.substr(0,2) == 'AC')
            {
              this.gpidExists(value1.substr(0,2), value1.substr(2));
              return true;
            }
          }
          this.searchGpid.set('disabled', true);
          return false;
        },

        expandButtonClicked: function()
        {
          var mhg=this.q_mhg.value;
          var yhg=this.q_yhg.value;
          if(yhg.length > 0) window.global.app.widgets.Dispatcher.onHaplogroupChange("GpidPane", yhg, "y");
          if(mhg.length > 0) window.global.app.widgets.Dispatcher.onHaplogroupChange("GpidPane", mhg, "m");
        },

        autosomalFileDataReady: function(data)
        {
          var autosomalFileData = json.parse(data);
          console.log("Autosomal File data:", autosomalFileData);
          this.q1_autosomal_file_name.innerHTML = autosomalFileData.file;
          this.q1_autosomal_file_size.innerHTML = autosomalFileData.size;
          this.q1_autosomal_file_date.innerHTML = autosomalFileData.date;

          this.q1_y_total.innerHTML = autosomalFileData.ysnps;
          this.q1_m_total.innerHTML = autosomalFileData.msnps;
          this.q1_a_total.innerHTML = autosomalFileData.asnps;

          this.q1_y_failed.innerHTML = autosomalFileData.ysnps_fail;
          this.q1_m_failed.innerHTML = autosomalFileData.msnps_fail;
          this.q1_a_failed.innerHTML = autosomalFileData.asnps_fail;

          this.q1_y_called.innerHTML = autosomalFileData.ysnps - autosomalFileData.ysnps_fail;
          this.q1_m_called.innerHTML = autosomalFileData.msnps - autosomalFileData.msnps_fail;
          this.q1_a_called.innerHTML = autosomalFileData.asnps - autosomalFileData.asnps_fail;
        },

        errorCodesReady: function(data)
        {
          this.errorCodes = json.parse(data);
          console.log("Error Codes:", this.errorCodes);
        },

        tableViewChosen: function()
        {
          console.log("table");
          this.demographicViewer.selectChild(this.tableViewPane);
        },

        treeViewChosen: function()
        {
          console.log("tree");
          this.demographicViewer.selectChild(this.treeViewPane);
          // Attach tooltips to participant's genealogic tree
          if(this.phenotype_tooltips == null)
          {
            this.createPhenotypeTooltips();
          }
          // If a RID already chosen, initialize the tooltip values.
          if(this.local_gpid != null && this.local_rc != null)
          {
            this.setPhenotypeTooltips();
          }
        },

        createPhenotypeTooltips: function()
        {
          this.phenotype_tooltips = {'participant': null, 'father': null, 'mother': null, 'pat_grandfather': null,
                                     'pat_grandmother': null, 'mat_grandfather': null, 'mat_grandmother': null,
                                     'earliest_pat_ancestor': null, 'earliest_mat_ancestor': null
                                    };

          for(var pr in this.phenotype_tooltips)
          {
            this.phenotype_tooltips[pr] = new Tooltip({
              connectId: ["user_" + pr],
              label: pr,
              position: ["below"]
            });
          }
        },

        setPhenotypeTooltips: function()
        {
          if(this.phenotype_tooltips != null)
          {
            var text;

            node = dom1.byId("user_participant");
            node.innerHTML = '<img src="app/images/blank.png">';
            if(dom1.byId('q_gender').innerHTML == 'F') node.innerHTML = '<img src="app/images/female.png">';
            if(dom1.byId('q_gender').innerHTML == 'M') node.innerHTML = '<img src="app/images/male.png">';

            text = "Participant<br>Age:" + dom1.byId('q_age').innerHTML + "<br>" +
                                  "DOB:" + dom1.byId('q_dob').innerHTML + "<br>" +
                                  "Gender:" + dom1.byId('q_gender').innerHTML;
            this.phenotype_tooltips['participant'].set('label', text);

            text = "Father<br>Ethnicity:" + dom1.byId('q_father_ethnicity').innerHTML + "<br>" +
                             "Languages:" + dom1.byId('q_father_languages').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_father_place_of_birth').innerHTML;
            this.phenotype_tooltips['father'].set('label', text);

            text = "Mother<br>Ethnicity:" + dom1.byId('q_mother_ethnicity').innerHTML + "<br>" +
                             "Languages:" + dom1.byId('q_mother_languages').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_mother_place_of_birth').innerHTML;
            this.phenotype_tooltips['mother'].set('label', text);

            text = "Paternal Grandfather<br>Ethnicity:" + dom1.byId('q_pat_grandfather_ethnicity').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_pat_grandfather_place_of_birth').innerHTML;
            this.phenotype_tooltips['pat_grandfather'].set('label', text);

            text = "Paternal Grandmother<br>Ethnicity:" + dom1.byId('q_pat_grandmother_ethnicity').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_pat_grandmother_place_of_birth').innerHTML;
            this.phenotype_tooltips['pat_grandmother'].set('label', text);

            text = "Maternal Grandfather<br>Ethnicity:" + dom1.byId('q_mat_grandfather_ethnicity').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_mat_grandfather_place_of_birth').innerHTML;
            this.phenotype_tooltips['mat_grandfather'].set('label', text);

            text = "Maternal Grandmother<br>Ethnicity:" + dom1.byId('q_mat_grandmother_ethnicity').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_mat_grandmother_place_of_birth').innerHTML;
            this.phenotype_tooltips['mat_grandmother'].set('label', text);

            text = "Earliest Paternal Ancestor<br>Ethnicity:" + dom1.byId('q_earliest_pat_ancestor_ethnicity').innerHTML + "<br>" +
                             "Languages:" + dom1.byId('q_earliest_pat_ancestor_language').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_earliest_pat_ancestor_place_of_birth').innerHTML;
            this.phenotype_tooltips['earliest_pat_ancestor'].set('label', text);

            text = "Earliest Maternal Ancestor<br>Ethnicity:" + dom1.byId('q_earliest_mat_ancestor_ethnicity').innerHTML + "<br>" +
                             "Languages:" + dom1.byId('q_earliest_mat_ancestor_language').innerHTML + "<br>" +
                             "Place of Birth:" + dom1.byId('q_earliest_mat_ancestor_place_of_birth').innerHTML;
            this.phenotype_tooltips['earliest_mat_ancestor'].set('label', text);
          }
        },

        postCreate: function()
        {
          console.log("GpidPaneUser postCreate:", this);
          this.gpid_input.validator = lang.hitch(this, this.gpidValidator);
          this.ymarker_input.validator = lang.hitch(this, this.ymarkerValidator);
          this.mmarker_input.validator = lang.hitch(this, this.mmarkerValidator);
          this.searchGpid.onClick = lang.hitch(this, this.findButtonClicked);
          this.expandButton.onClick = lang.hitch(this, this.expandButtonClicked);
          // this.yCommunityButton.onClick = lang.hitch(this, this.yCommunityButtonClicked);
          // this.mCommunityButton.onClick = lang.hitch(this, this.mCommunityButtonClicked);
          // this.mapWorkbenchButton.onClick = lang.hitch(this, this.mapWorkbenchButtonClicked);
	  this.callYButton2012.onClick = lang.hitch(this, this.callYButton2012Clicked);
	  this.callYButton2014.onClick = lang.hitch(this, this.callYButton2014Clicked);

          this.callMButtonB14full.onClick = lang.hitch(this, this.callM_B14full);
          this.callMButtonB14chip.onClick = lang.hitch(this, this.callM_B14chip);
          this.callMButtonB16full.onClick = lang.hitch(this, this.callM_B16full);
          this.callMButtonB16chip.onClick = lang.hitch(this, this.callM_B16chip);

          this.searchGpid.set('disabled', true);
          this.gpid_input.set('value', '');
          this.logoutButton.onClick = lang.hitch(this, this.logoutButtonClicked);
          this.tableView.onClick = lang.hitch(this, this.tableViewChosen);
          this.treeView.onClick = lang.hitch(this, this.treeViewChosen);

          domStyle.set(this.callMHGMenu.domNode, "visibility", "hidden");
          domStyle.set(this.callYHGMenu.domNode, "visibility", "hidden");

          var vp = window.global.app.widgets.Dispatcher.viewport;
          // if(vp.width < 1600) domStyle.set(this.timestamps1.domNode, "display", "none");
          // if(vp.width < 1400) domStyle.set(this.status1.domNode, "display", "none");

          if(vp.width < 1392)
          {
            var diff = 1392 - vp.width;
            var w = 700 - diff;
            domStyle.set(this.q_m_mutations.domNode, "width", w + "px");
            domStyle.set(this.q_mutations.domNode, "width", w + "px");
            domStyle.set(this.q_str_mutations.domNode, "width", w + "px");
          }

          window.global.app.widgets.GpidPaneUser = this;
          request("services/getErrorCodes.php").then(lang.hitch(this, this.errorCodesReady));
          rid_text = "RID identifiers are NOT the original participant GPIDs."; 
          var myTooltipDialog1 = new TooltipDialog({
           id: 'myTooltipDialog1',
           style: "width: 200px;",
           content: rid_text,
           onMouseLeave: function(){
             popup.close(myTooltipDialog1);
           }
         });
         
         on(this.rid, 'mouseover', function(){
           console.log("mouseover");
           popup.open({
             popup: myTooltipDialog1,
             around: dom1.byId('rId1')
           });
         });
        
       }
    });
});
