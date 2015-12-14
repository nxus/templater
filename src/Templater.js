/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2015-12-14
*/

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird');

export default class Templater {

  constructor(app) {
    this.app = app

    this._templates = {}

    app.get('templater').gather('template', this._register.bind(this));
    app.get('templater').respond('render', this._render.bind(this));

  }

  _register([name, type, filename]) {
    this._templates[name] = {type, filename}
  }

  _render(name, args) {
    if(!this._templates[name]) throw new Error('Template name '+name+' not found')
    var opts = this._templates[name]
    return this.app.get('renderer').request('renderFile', opts.filename, args);
  }
}
