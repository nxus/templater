/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2016-04-10
*/
/**
 * [![Build Status](https://travis-ci.org/nxus/templater.svg?branch=master)](https://travis-ci.org/nxus/templater)
 * 
 * Templates are markup (html, ejs, etc) that Nxus modules can use to render a UX.  The Templater module provides a common API for defining and accessing templates.  Specifically, you can use partials and templates defined by other modules, meaning you write less code for common components.
 * 
 * ## Installation
 * 
 *     > npm install @nxus/templater --save
 * 
 * ## Parsers
 * 
 * Templater supports EJS and HTML as default template types.  If you'd like to add in additional parsers, check out the @nxus/renderer documentation.
 * 
 * ## Namespacing
 * 
 * All templates share a single namespace, so its a good idea to add a prefix to your template names to avoid conflicts.  For example `mymodule-mytemplate`.
 * 
 * ## Usage
 * 
 * ### Register a Template
 * 
 * If you would like to register a single template, you can use the template provider and specify a file:
 * 
 *     app.get('templater').template('default', 'ejs', 'path/to/some/file')
 * 
 * You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the template content, or a Promise that resolves to a string. The handler will be passed in the name of the template requested, as well as any render options specified.
 * 
 *     var handler = function(name, args) {
 *       return "<html>.....";
 *     }
 *     app.get('templater').template('default', 'ejs', handler)
 * 
 * ### Register a Template File
 * 
 * As a shorthand for a file-based template, whose type is the file extension, you can use
 * 
 *     app.get('templater').templateFile('default', 'path/to/some/file.ejs')
 * 
 * And in the common case where the filename is the desired template name, even shorter:
 * 
 *     app.get('templater').templateFile('path/to/some/default.ejs')
 * 
 * ### Registering a Template Directory
 * 
 * Alternatively, you can register a directory. Templater will define a new template for every file in the directory with the specified type extension.
 * 
 *     app.get('templater').templateDir('path/to/some/dir')
 * 
 * For example, given the following directory structure:
 * 
 *     - /templates
 *       |- my-template.ejs
 * 
 * Templater will expose `my-template` as a new template.
 * 
 * Alternatively, you can supply a third argument that will be used to namespace the templates.
 *
 *     app.get('templater').templateDir('path/to/some/dir', 'custom')
 * 
 * For example, given the following directory structure:
 * 
 *     - /templates
 *       |- my-template.ejs
 * 
 * Templater will expose `custom-my-template` as a new template.
 * 
 * You may pass an optional `type` parameter to templateDir to only include files with that extension.
 *
 *     app.get('templater').templateDir('path/to/some/dir', 'custom', 'ejs')
 *
 * ### Render content using a Template
 * 
 *     let opts = {content: "some content"}
 * 
 *     app.get('templater').render('default', opts).then((content) => {
 *       console.log('rendered content', content)
 *     })
 * 
 * ### Render a Template as the contents of another Template
 * 
 * If you've defined a partial template you would like wrapped in another template, use the `render` request and specify a template in which the partial will be wrapped as `contents`.
 * 
 *     app.get('templater').render('partial-template', 'wrapper-template', opts).then((content) => {
 *       console.log('rendered complete content', content)l
 *     })
 *
 * ### Render a partial from within a template
 *
 * In place of EJS' `include` function for rendering sub-templates, you can use the `render` function to use a templater-registered template name within a template:
 * 
 *    <%- render('app-nav`) %>
 * 
 * ### Provide additional context opts for rendering (scripts, etc)
 * 
 * Modules can provide additional context options to be available to templates. :
 * 
 *     app.get('templater').on('templateContext', () => {return {username: 'Steve'}})
 * 
 * The event handler is passed the original template name and args, so if `req` or other is provided it is available to you, or if you want to only provide context for some templates, but you do not need to return the whole modified args:
 * 
 *     app.get('templater').on('templateContext', (name, args) => {return {username: args.req ? args.req.user : '' }})
 * 
 * Values that are arrays are treated specially, so that for instance `scripts` can collect script URLs from many modules:
 * 
 *     app.get('templater').on('templateContext', () => {return {scripts: ['/url/script.js']}})
 *     app.get('templater').on('templateContext', () => {return {scripts: ['/url/other.js']}})
 * 
 * Will result in `scripts` containing an array with both these values. The list will be filtered to only have unique values, so you can specify scripts in dependency order and not worry if other modules are asking for the same common js files repeatedly. The default set of templates provided by this module include rendering of this `scripts` variable automatically.
 * 
 * # API
 * -----
 */

'use strict';

require('babel-runtime/core-js/promise').default = require('bluebird')
import fs from 'fs'
import path from 'path'
import glob from 'glob'
import uuid from 'node-uuid'
import _ from 'underscore'

import Promise from 'bluebird'
var globAsync = Promise.promisify(glob)

import DefaultTemplate from '../templates/default'

/** 
 * Templater provides a template layer, built on top of the Nxus Renderer
 */
export default class Templater {

  constructor(app) {

    new DefaultTemplate(app)

    this.app = app

    this._templates = {}

    app.get('templater').use(this)
    .gather('template')
    .gather('templateFile')
    .gather('templateDir')
    .respond('render')
    .respond('getTemplate')
    .respond('getTemplates')

    app.get('renderer').before('render', this.locals.bind(this))
    app.get('renderer').after('render', this.localsAfter.bind(this))
  }

  /**
   * Define a new template
   * @param  {string} name    A name for the template
   * @param  {string} [type]    Templating engine used with the template. Should map to an installed `@nxus/renderer` type. Optional if handler is a filepath with extension
   * @param  {string|function} handler Either a filepath or a callback function which returns a promise that resolves to rendered content.
   */
  template(name, type, handler) {
    this.app.log.debug('Registering template', name)
    this._templates[name] = {type, handler}
  }

  /**
   * Define a new template from a filename
   * @param  {string} name    A name for the template
   * @param  {string} [filepath] Path to file to use as template
   */
  templateFile(name, handler) {

    if (handler === undefined) {
      handler = name
      name = path.basename(handler).split(".")[0]
    }
    let type = path.extname(handler).replace(".", "")
    this.template(name, type, handler)
  }
  
  /**
   * Convenience function to crawl a directory and register all matching files as a template.
   * @param  {string} type      File extension of files to import as templates
   * @param  {string} dir       The directory to crawl
   * @param  {String} namespace An optional namespace to append to the front of the template name
   */
  templateDir(dir, namespace = "", type="*") {
    var opts = {
      cwd: dir,
      dot: true,
      mark: true
    }

    if (namespace.length > 0) namespace = namespace+"-"

    let pattern = "*."+type

    return globAsync(pattern, opts).then((files) => {
      return Promise.map(files, (file) => {
        let ext = type
        if (ext == '*') {
          ext = this._typeFromFile(file)
        }
        var name = file.replace("."+ext, "")
        return this.provide('template', namespace+name, ext, dir+"/"+file)
      })
    });
  }

  _typeFromFile(filename) {
    return path.extname(filename).replace(".", "")
  }
  
  /**
   * Returns the specified template if it exists
   * @param  {String} name The name of the template.
   * @return {Object}      A template object, with `type` and `handler` attributes.
   */
  getTemplate(name) {
    return this._templates[name]
  }

  /**
   * Returns all registered templates
   * @return {Object}      An array of template object, with `type` and `handler` attributes.
   */
  getTemplates() {
    return this._templates
  }

  /**
   * Renders a template
   * @param  {string} name The name of the registered template to render
   * @param  {string} [basename] A parent template name to render into as contents
   * @param  {Object} args The arguments to pass to the template
   * @return {Promise}      A promise for the rendered content
   */
  render(name, basename = '', args = {}) {
    if(!this._templates[name]) throw new Error('Template name '+name+' not found')
    if(_.isEmpty(args) && !_.isString(basename)) {
      args = basename
      basename = ''
    }
    return this.emit('templateContext', name, args).then((newArgs) => {
      args = this._mergeArgs(args, newArgs)
      return this._render(name, args).then((content) => {
        if (basename.length > 0) {
          args.content = content
          return this.render(basename, args)
        } else {
          return content
        }
      })
    })
  }

  _render(name, args) {
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

  _mergeArgs(oldArgs, newArgs) {
    let args = {}
    // undo Dispatcher._squashArrayResults
    if (newArgs === undefined) {
      newArgs = []
    } else if (!_.isArray(newArgs)) {
      newArgs = [newArgs]
    }
    for (let arg of [].concat(oldArgs, newArgs)) {
      for (let key in arg) {
        let val = arg[key]
        if (_.isArray(args[key])) {
          args[key] = _.uniq(args[key].concat(val))
        } else {
          args[key] = val
        }
      }
    }
    return args
  }
  
  locals([type, content, opts]) {
    if (!opts.render) {
      opts.render = (name, newOpts) => {
        if (!newOpts) {
          newOpts = _.extend({}, opts)
        }
        if (!opts._renderedPartials) {
          opts._renderedPartials = {}
        }
        let id = uuid.v4()
        opts._renderedPartials[id] = this.render(name, newOpts)
        return "<<<"+id+">>>"
      }
    }
    return [type, content, opts]
  }
  
  localsAfter(result, [type, content, opts]) {
    if (opts._renderedPartials) {
      return Promise.mapSeries(_.keys(opts._renderedPartials), (id) => {
        return opts._renderedPartials[id].then((part) => {
          result = result.replace('<<<'+id+'>>>', part)
          return result
        })
      }).then(() => {
        return result
      })
    }
    return result
  }
}
