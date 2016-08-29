/* 
* @Author: Mike Reich
* @Date:   2015-07-22 09:45:05
* @Last Modified 2016-05-19
*/
/**
 * [![Build Status](https://travis-ci.org/nxus/templater.svg?branch=master)](https://travis-ci.org/nxus/templater)
 * 
 * Templates are markup (html, ejs, etc) that Nxus modules can use to render a UX.  The Templater module provides a common API for defining and accessing templates.  Specifically, you can use partials and templates defined by other modules, meaning you write less code for common components.
 * 
 * ## Installation
 * 
 *     > npm install nxus-templater --save
 * 
 * ## Parsers
 * 
 * Templater supports EJS and HTML as default template types.  If you'd like to add in additional parsers, check out the renderer documentation.
 * 
 * ## Namespacing
 * 
 * All templates share a single namespace, so its a good idea to add a prefix to your template names to avoid conflicts.  For example `mymodule-mytemplate.ejs`.
 * 
 * 
 * ## Usage
 * 
 *   import {templater} from 'nxus-templater'
 * 
 * ### Register a Template
 *
 * There are three types of templates you can register.
 * 
 * #### Template File
 * 
 * If you would like to register a single template, you can use the template provider and specify a file:
 * 
 *     templater.template('path/to/some/file.ejs')
 *
 * Based on the filename, the template will be given the name `file` and rendered using the EJS renderer.
 *
 * Optionally, you can specify another template to wrap the output (for partial style templates).
 *
 *     templater.template('path/to/some/file.ejs', 'page')
 *
 * #### Template Directory
 *
 * Alternatively, if you have a folder with all your templates, you can add them all using `templateDir`.
 * 
 * For example, given the following directory structure:
 * 
 *     - /templates
 *       |- my-template.ejs
 * 
 * Templater will expose `my-template` as a new template.
 *
 *      templater.templateDir('path/to/some/dir/')
 *
 * Each template will be processed using the `template` function above.  You can also specify a wrapper template.
 *
 *      templater.templateDir('path/to/some/dir/', 'page')
 *
 * Alt you can specify a glob pattern to only register certain files:
 *
 *      templater.templateDir('path/to/some/dir/myname-*.ejs', 'page')
 *
 * #### Function
 * 
 * You can also pass in a handler method instead of a file path. Templater expects that this handler returns a string with the rendered content, or a Promise that resolves to a string. 
 * 
 * The handler will be passed in the name of the template requested, as well as any render options specified.
 * 
 *     var handler = function(args, name) {
 *       return "<html>.....";
 *     }
 *     templater.templateFunction('default', handler)
 *
 * ### Render content using a Template
 * 
 *     let opts = {content: "some content"}
 * 
 *     templater.render('default', opts).then((content) => {
 *       console.log('rendered content', content)
 *     })
 * 
 * ### Override the template wrapper
 *
 * If you want to specify a different wrapper template than was originally set, you can add a `template` key to the opts object.
 *
 *     opts.template = 'new-template'
 *     templater.render('partial-template', opts).then((content) => {
 *       console.log('rendered complete content', content)l
 *     })
 *
 * ### Render a partial from within a template
 *
 * In place of EJS' `include` function for rendering sub-templates, you can use the `render` function to use a templater-registered template name within a template:
 * 
 *    <%- render('app-nav`) %>
 *
 * or with specific options
 *
 *    <%- render('app-nav', navItems) %>
 * 
 * ### Provide additional context opts for rendering (scripts, etc)
 * 
 * Modules can provide additional context options to be available to templates. :
 * 
 *     templater.on('renderContext', () => {return {username: 'Steve'}})
 * 
 * The event handler is passed the original template name and args, so if `req` or other is provided it is available to you, or if you want to only provide context for some templates, but you do not need to return the whole modified args:
 * 
 *     templater.on('renderContext', (args, name) => {return {username: args.req ? args.req.user : '' }})
 *
 * Templater will also fire a template specific event
 *
 *     templater.on('renderContext.my-template', () => {return {username: 'Steve'}}) 
 * 
 * Values that are arrays are concated rather than overwritten, so that for instance `scripts` can collect script URLs from many modules:
 * 
 *     templater.on('renderContext', () => {return {scripts: ['/url/script.js']}})
 *     templater.on('renderContext', () => {return {scripts: ['/url/other.js']}})
 * 
 * Will result in `scripts` containing an array with both these values. The list will be filtered to only have unique values, so you can specify scripts in dependency order and not worry if other modules are asking for the same common js files repeatedly. The default set of templates provided by this module include rendering of this `scripts` variable already.
 * 
 * # API
 * -----
 */

'use strict';

import fs from 'fs'
import path from 'path'
import glob from 'glob'
import _ from 'underscore'

import Promise from 'bluebird'
var globAsync = Promise.promisify(glob)

import {application, NxusModule} from 'nxus-core'
import {renderer} from './modules/renderer'


/** 
 * Templater provides template registering and rendering, built on top of the renderer
 */
class Templater extends NxusModule {

  constructor(app) {
    super(app)

    this._templates = {}
  }

  /**
   * Returns the specified template if it exists
   * @param  {String} name The name of the template.
   * @return {Object}      A template object, with `type` and `handler` attributes.
   */
  template(filename, wrapper, name=null) {
    if (name === null) {
      name = path.basename(filename).split(".")[0]
    }
    this.log.debug('registering template', name, filename)
    this._templates[name] = {filename, wrapper}
  }

  templateDir(dirname, wrapper, type="*") {
    var opts = {
      dot: true,
      mark: true
    }

    if (! dirname.includes("*")) {
      dirname += "*." + type
    }

    return globAsync(dirname, opts).then((files) => {
      return Promise.map(files, (file) => {
        return this.template(dirname+"/"+file, wrapper)
      })
    });
  }

  templateFunction(name, wrapper, handler) {
    this.log.debug ('registering template', name, "as function")
    if(!handler) {
      handler = wrapper
      wrapper = null
    }
    this._templates[name] = {handler, wrapper}
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
   * Render a registered template with arguments
   * @param  {String} name The name of the template.
   * @param  {Object} args Variables to make available to the template
   * @return {Promise}     The rendered content as a string
   */
  render(name, args = {}) {
    if(!this._templates[name]) throw new Error('Template name '+name+' not found')
    return this.emit('renderContext', args, name).then((args1) => { 
      args = this._mergeArgs(args, args1)
      return this.emit('renderContext.'+name, args, name)
    }).then((newArgs) => {
      args = this._mergeArgs(args, newArgs)
      return args
    }).then((args) => {
      return this._render(name, args)
    })
  }

  _render(name, args = {}) {
    var opts = this._templates[name]
    var promise = Promise.resolve();

    if(opts.filename){
      args.filename = opts.filename
      promise = this.app.get('renderer').renderFile(opts.filename, args)
    }
    
    if(opts.handler)
      promise = Promise.resolve(opts.handler(args, name))

    if (opts.wrapper || args.template) {
      let template = args.template || opts.wrapper
      delete args.template
      return promise.then((content) => {
        return this.render(template, Object.assign(args, {content}))
      })
    } 
    return promise
  }

  _mergeArgs(oldArgs, newArgs) {
    if(_.isArray(newArgs)) {
      newArgs.forEach((a) => {
        oldArgs = this._mergeArgs(oldArgs, a)
      })
      return oldArgs
    }
    _.each(newArgs, (value, key) => {
      if (_.isArray(value) && _.isArray(oldArgs[key])) {
        oldArgs[key] = _.uniq(oldArgs[key].concat(value))
      } else {
        oldArgs[key] = value
      }
    })
    return oldArgs
  }
  
}

let templater = Templater.getProxy()
export {Templater as default, templater}
