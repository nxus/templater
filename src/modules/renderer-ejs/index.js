/* 
* @Author: Mike Reich
* @Date:   2015-11-10 06:43:53
* @Last Modified 2016-04-14
*/

'use strict';

import ejs from 'ejs';
import _ from 'underscore';
import moment from 'moment';
import path from 'path';

import {NxusModule} from 'nxus-core'
import {renderer} from '../renderer'

class EjsRenderer extends NxusModule {
  
  constructor (app) {
    super(app)
    renderer.renderer('ejs', this._render);
    renderer.renderer('html', this._render);
  }

  _render (content, data) {
    var filename = data.filename || process.cwd();
    data._ = _
    data.moment = moment
    return ejs.render(content, data, {filename: filename});
  }
}

let ejsRenderer = EjsRenderer.getProxy()
export {EjsRenderer as default, ejsRenderer}
