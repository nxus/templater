/* 
* @Author: Mike Reich
* @Date:   2016-02-04 16:41:53
* @Last Modified 2016-02-04
*/

'use strict';

module.exports = function(app){
  var templater = app.get('templater')

  templater.provide('templateDir', 'ejs', __dirname, "default");

  templater.provide('template', "default", "ejs", __dirname+"/default.ejs");

  app.get('router').provide('static', "/dist", __dirname+"/dist")
  app.get('router').provide('static', "/js", __dirname+"/js")
  app.get('router').provide('static', "/bower_components", __dirname+"/bower_components")
}
