/* 
* @Author: Mike Reich
* @Date:   2016-02-04 16:41:53
* @Last Modified 2016-04-13
*/

'use strict';

import {NxusModule} from 'nxus-core'
import {router} from 'nxus-router'
import {templater} from '../..'

class TemplateDefault extends NxusModule {
  constructor(app) {
    super(app)
    let dir = __dirname+"/template"
    templater.default().template(dir+'/default.ejs');
    templater.default().template(dir+'/flash.ejs');
    templater.default().template(dir+'/page.ejs');
    templater.default().template(dir+'/admin.ejs');
    templater.default().template(dir+'/404.ejs');
    templater.default().template(dir+'/500.ejs');
    templater.default().template(dir+'/scripts.ejs');
    templater.default().template(dir+'/scripts_include.ejs');

    router.default().static("/dist", dir+"/dist")
    router.default().static("/js", dir+"/js")
    router.default().static("/bower_components", dir+"/bower_components")
  }

}
