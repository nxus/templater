/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2015-07-22
*/

'use strict';

var _ = require('underscore')
var ejs = require('ejs')
var fs = require('fs')

class TemplateManager {

  constructor(app, loaded) {

    this._templates = {}

    app.on('app.startup', () => {
      app.emit('templates.gatherTemplates', (name, callback) => {
        this._templates[name] = callback
      })
    })

    app.on('template.render', (name, opts, callback) => {
      if(_.isFunction(opts)) {
        callback = opts
        opts = {}
      }
      if(!this._templates[name]) return callback('Template not found', null)
      return this._templates[name](opts, callback)
    })

    app.on('partial.render.ejs', (path, opts, callback) => {
      try {
        var content = this._render(path, opts)
      } catch(e) {
        callback(e.toString(), null)
      }
      return callback(null, content)
    })

    loaded()
  }

  _render(filename, args) {
    return ejs.render(fs.readFileSync(filename, {encoding: 'utf8'}), args)
  }
}

module.exports = TemplateManager
