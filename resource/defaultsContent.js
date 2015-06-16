// VERSION 1.0.0

Services.scriptloader.loadSubScript("resource://puzzlebars/modules/utils/content.js", this);

this.puzzleBars = this.__contentEnvironment;
delete this.__contentEnvironment;

this.puzzleBars.objName = 'puzzleBars';
this.puzzleBars.objPathString = 'puzzlebars';
this.puzzleBars.init();
