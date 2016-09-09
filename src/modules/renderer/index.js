/* 
* @Author: Mike Reich
* @Date:   2015-11-09 18:55:29
* @Last Modified 2016-09-09
*/
/**
 * # Renderer
 * 
 * The rendering framework for Nxus applications.
 * 
 * ## Usage
 * 
 *     import {renderer} from 'nxus-templater/modules/renderer'
 * 
 * ### Defining a renderer
 * 
 *     renderer.renderer(type, handler);
 * 
 * Where `type` is usually the filename extension and `handler` returns the rendered text when called with contents to render and an optional `opts` object.
 * 
 * ### Rendering a string
 * 
 *     renderer.render(type, text).then((renderedText) => {console.log(renderedText)});
 * 
 * You can pass an optional arugment `opts` for options to pass to the renderer.
 *
 *     renderer.render(type, text, {title: 'My Title'}).then((renderedText) => {console.log(renderedText)});
 * 
 * ### Rendering a file
 * 
 *     renderer.renderFile(type, filename).then((renderedText) => {});
 * 
 * You can pass an optional arugment `opts` for options to pass to the renderer.
 * 
 * # API
 * ------
 */
'use strict';

import Promise from 'bluebird';
import fs from 'fs';
import path from 'path';

Promise.promisifyAll(fs);

import {NxusModule} from 'nxus-core'


/**
 * Renderer renders different files and content using common rendering engines, like EJS and MarkDown.
 */
class Renderer extends NxusModule {
  
  constructor(app) {
    super(app)
    this._renderers = {};

  }

  /**
   * Provide a renderer for a particular type (file extension)
   * @param {string} type The type (e.g. 'html') this renderer should handle
   * @param {function} handler Function to receive (content, options) and return rendered content
   */
  renderer (type, handler) {
    if(typeof handler != "function") throw new Error("Renderer handler must be a callback")
    this._renderers[type] = handler;
  }

  /**
   * Request rendered content based on type
   * @param {string} type The type (e.g. 'html') of the content
   * @param {string} content The contents to render 
   * @param {object} opts Options for the renderer context
   * @return {Promise} The rendered content
   */
  render (type, content, opts = {}) {
    if(!this._renderers[type]) throw new Error('No matching renderer found: '+ type);
    return this._renderers[type](content, opts);
  }

  /**
   * Provide a renderer for a particular type (file extension)
   * @param {string} filename Path to content to render
   * @param {object} opts Options for the renderer context
   * @return {Promise} The rendered content
   */
  renderFile (filename, opts = {}) {
    return fs.readFileAsync(filename).then((content) => {
      content = content.toString()
      const type = path.extname(filename).replace(".", "");
      opts.filename = filename
      return this.request('render', type, content, opts)
    })
  }

}

let renderer = Renderer.getProxy()
export {Renderer as default, renderer}
