/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2015-12-16
*/

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird');
import fs from 'fs';

export default class Templater {

  constructor(app) {
    this.app = app

    this._templates = {}

    app.get('templater').gather('template', this._register.bind(this));
    app.get('templater').respond('render', this._render.bind(this));
    app.get('templater').request('renderPartial', this._renderPartial.bind(this));
  }

  _register(name, type, handler) {
    this._templates[name] = {type, handler}
  }

  _renderPartial(filePath, baseName, args = {}) {
    
    if(fs.existsSync(filePath)) {
      if(!args.filename) args.filename = filePath
      console.log('file partial')
      return this.app.get('renderer').request('renderFile', filePath, args).then((content) => {
        args.content = content
        return this._render(baseName, args)
      })
    } else
      return this._render(filePath, args).then((content) => {
        ags.content = content
        return this._render(baseName, args)
      })
  }

  _render(name, args = {}) {
    if(!this._templates[name]) throw new Error('Template name '+name+' not found')
    var opts = this._templates[name]
    if(typeof opts.handler === 'string') {
      args.filename = opts.handler
      return this.app.get('renderer').request('renderFile', opts.handler, args);
    } else { //assume its a callable returning a promise
      return opts.handler(name, args).then((template) => {
        return this.app.get('renderer').request('render', opts.type, template, args)
      })
    }
  }
}
