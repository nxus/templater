import uuid from 'node-uuid'

import {NxusModule} from 'nxus-core'

import {renderer} from '../renderer'
import {templater} from '../../'

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
        }
        if (!opts._renderedPartials) {
          opts._renderedPartials = {}
        }
        opts._renderedPartials[id] = templater.render(name, newOpts)
        return "<<<"+id+">>>"
      }
    }
    return [type, content, opts]
  }
  
  _localsAfter(result, [type, content, opts]) {
    if (opts._renderedPartials) {
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
