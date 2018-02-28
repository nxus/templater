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
    if (opts && !opts.render) {
      opts.render = (name, newOpts) => {
        let id = uuid.v4()
        if (!newOpts) {
          newOpts = { ...opts, _inlineRenderId: id}
          if (newOpts._renderedPartials) {
            delete newOpts._renderedPartials
          }
        }
        if (!opts._renderedPartials) {
          opts._renderedPartials = []
        }
        let innerRender = templater.render(name, newOpts).catch((e) => {
          this.log.error('Error rendering inline partial', e)
        })
        opts._renderedPartials.push([id, innerRender])
        return "<<<"+id+">>>"
      }
    }
    return [type, content, opts]
  }

  _localsAfter(result, [type, content, opts]) {
    if (opts._renderedPartials && _.isString(result)) {
      return Promise.mapSeries(opts._renderedPartials, ([id, innerRender]) => {
        if(opts._inlineRenderId == id) return Promise.resolve(result)
        return innerRender.then((part) => {
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
