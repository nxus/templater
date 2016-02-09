/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2016-02-09
*/

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird');
import fs from 'fs';
import glob from 'glob';

import Promise from 'bluebird';
var globAsync = Promise.promisify(glob);

import DefaultTemplate from '../templates/default'

export default class Templater {

  constructor(app) {

    new DefaultTemplate(app)

    this.app = app

    this._templates = {}

    app.get('templater').use(this)
    .gather('template')
    .gather('templateDir')
    .respond('render')
    .respond('renderPartial')
  }

  template(name, type, handler) {
    this._templates[name] = {type, handler}
  }

  templateDir(type, dir, namespace = "") {
    var opts = {
      cwd: dir,
      dot: true,
      mark: true
    }

    if(namespace.length > 0) namespace = namespace+"-"

    let pattern = "*."+type

    return globAsync(pattern, opts).then((files) => {
      files.forEach((file) => {
        var name = file.replace("."+type, "")
        this.template(namespace+name, type, dir+"/"+file)
      })
    });
  }

  renderPartial(filePath, baseName, args = {}) {
    if(fs.existsSync(filePath)) {
      if(!args.filename) args.filename = filePath
      return this.app.get('renderer').renderFile(filePath, args).then((content) => {
        args.content = content
        return this.render(baseName, args)
      })
    } else {
      return this.render(filePath, args).then((content) => {
        args.content = content
        return this.render(baseName, args)
      })
    }
  }

  render(name, args = {}) {
    if(!this._templates[name]) throw new Error('Template name '+name+' not found')
    var opts = this._templates[name]
    if(typeof opts.handler === 'string') {
      args.filename = opts.handler
      return this.app.get('renderer').renderFile(opts.handler, args);
    } else { //assume its a callable returning a promise
      return Promise.resolve(opts.handler(name, args)).then((template) => {
        return this.app.get('renderer').render(opts.type, template, args)
      })
    }
  }
}
