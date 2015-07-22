/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:40:16
* @Last Modified 2015-07-22
*/

'use strict';

var TemplateManager = require('./lib/TemplateManager')

module.exports = function(app, loaded) {
  return new TemplateManager(app, loaded)
}