/* 
* @Author: Mike Reich
* @Date:   2016-02-04 16:41:53
* @Last Modified 2016-04-13
*/

'use strict';

module.exports = function(app){
  var templater = app.get('templater')

  templater.default().template(__dirname+'/default.ejs');
  templater.default().template(__dirname+'/flash.ejs');
  templater.default().template(__dirname+'/page.ejs');
  templater.default().template(__dirname+'/admin.ejs');
  templater.default().template(__dirname+'/404.ejs');
  templater.default().template(__dirname+'/500.ejs');
  templater.default().template(__dirname+'/scripts.ejs');

  app.get('router').default().static("/dist", __dirname+"/dist")
  app.get('router').default().static("/js", __dirname+"/js")
  app.get('router').default().static("/bower_components", __dirname+"/bower_components")
}
