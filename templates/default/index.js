/* 
* @Author: Mike Reich
* @Date:   2016-02-04 16:41:53
* @Last Modified 2016-04-10
*/

'use strict';

module.exports = function(app){
  var templater = app.get('templater')

  templater.templateDir("ejs", __dirname);

  app.get('router').default().static("/dist", __dirname+"/dist")
  app.get('router').default().static("/js", __dirname+"/js")
  app.get('router').default().static("/bower_components", __dirname+"/bower_components")
}
