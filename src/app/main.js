define(
/* Dep: */ [ 'dojo/has', 'require' ],

function (has, require) 
/* Code: */
{
  require([
    "dojo/window",
    "dojo/on",
    "dojo/dom-class",
    "dijit/layout/TabContainer",
    "dijit/layout/BorderContainer",
    "dijit/layout/ContentPane",
    "app/Dispatcher",
    "app/MtdnaTree",
    "app/LoginPane",
    "app/StoryEditor",
    "app/HgSearch",
    "app/GpidPane",
    "app/GpidPaneUser",
    "dojo/domReady!"
], function(DojoWindow, on, DomClass, TabContainer, BorderContainer, ContentPane, Dispatcher, MtdnaTree, LoginPane, StoryEditor, HgSearch, GpidPane, GpidPaneUser){

    var dispatcher = new Dispatcher();
    // create a BorderContainer as the top widget in the hierarchy
    var vs = DojoWindow.getBox();
    var viewport = {};
    viewport.height = vs.h;
    viewport.width = vs.w;
    dispatcher.viewport = viewport;
    dispatcher.browser_name = browser_name;
    console.log("viewport:", viewport);
    this.bc = new BorderContainer({
        style: "height: " + viewport.height + "px; width: " + viewport.width + "px;"
    });
    bc.design = "headline";
    
    // create a ContentPane as the top pane in the BorderContainer - it will contain login/logout button, background image and tree selector.
    var cp_top_login;
    var cp_top_gpid;

    cp_top_login = new LoginPane({
      region: "top",
      style: "height: 132px",
      id: "topPane",
      content: "TOP"
    });
    cp_top_gpid = new GpidPane({
      region: "top",
      style: "height: 132px"
    });
    cp_top_gpid_user = new GpidPaneUser({
      region: "top",
      style: "height: 132px"
    });

    dispatcher.mainContainer = bc;
    dispatcher.loginContainer = cp_top_login;
    dispatcher.gpidContainer = cp_top_gpid;
    dispatcher.gpidUserContainer = cp_top_gpid_user;

    bc.addChild(cp_top_login);

    // create a ContentPane as the left pane in the BorderContainer - it will contain the actual tree.
    var cp_left = new MtdnaTree({
        region: "left",
        style: "width: 48%",
        splitter: "true",
        content: "LEFT"
    });
    bc.addChild(cp_left);
    
    // create a ContentPane as the center pane in the BorderContainer - it will contain editable story.
    var cp_center = new StoryEditor({
        region: "right",
        style: "width: 40%",
        content: "RIGHT"
    });
    bc.addChild(cp_center);

    // create a HgSearch as the center pane in the BorderContainer - it will Haplogroup Search Tool.
    var cp_center = new HgSearch({
        region: "center",
        content: "CENTER"
    });
    bc.addChild(cp_center);



    // put the top level widget into the document, and then call startup()
    bc.placeAt(document.body);
    bc.startup();
    // DomClass.add("topPane", "topImage");
    console.log("cp_left:", cp_left);
  });

});
