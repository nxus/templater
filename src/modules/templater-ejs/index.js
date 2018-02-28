import Promise from 'bluebird'
import uuid from 'uuid'

import {NxusModule} from 'nxus-core'

import {renderer} from '../renderer'
import {templater} from '../../'
import _ from 'underscore'

class TemplaterEjs extends NxusModule {

  constructor(app) {
    super(app)
    renderer.before('render', ::this._locals)
    renderer.after('render', ::this._localsAfter)
  }

  _locals([type, content, opts]) {
    if (opts) {
      // {id: inner promise} for all renders inside the current template
      if (!opts._renderedPartials) {
        opts._renderedPartials = {}
      }
      opts.render = (name, newOpts) => {
        let id = uuid.v4()
        // new levels should get their own _renderedPartials and render
        if (!newOpts) {
          newOpts = _.omit(opts, "_renderedPartials", "render")
        }
        newOpts._inlineRenderId = id
        // save the promise for this render in the parent opts
        opts._renderedPartials[id] = templater.render(name, newOpts).catch((e) => {
          this.log.error('Error rendering inline partial', e)
        })

        return "<<<"+id+">>>"
      }
    }
    return [type, content, opts]
  }

  _localsAfter(result, [type, content, opts]) {
    if (opts._renderedPartials && _.isString(result)) {
      // replace the id placeholders in this template with the results of the renderedPartials promises
      return Promise.mapSeries(Object.keys(opts._renderedPartials), (id) => {
        if(opts._inlineRenderId == id) return Promise.resolve(result)
        return opts._renderedPartials[id].then((part) => {
          result = result.replace('<<<'+id+'>>>', part)
          delete opts._renderedPartials[id]
          return result
        })
      }).then(() => {
        return result
      })
    }
    return result
  }

}

let templaterEjs = TemplaterEjs.getProxy()
export {TemplaterEjs as default, templaterEjs}
