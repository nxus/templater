/* 
* @Author: Mike Reich
* @Date:   2015-12-06 07:20:10
* @Last Modified 2016-05-20
*/

'use strict';

import {application as app} from 'nxus-core'
import Templater from '../'
import {templater as templaterProxy} from '../'
import Renderer from '../modules/renderer'
import RendererEJS from '../modules/renderer-ejs'
import TemplaterEJS from '../modules/templater-ejs'

describe("Ejs render", () => {
  let templater
  before(() => {
    new Templater()
    new Renderer()
    new RendererEJS()
    new TemplaterEJS()
    return app.emit('load')

  })
  it("should render nested ejs templates", (done) => {
    templaterProxy.templateDir(__dirname+"/templates/*.ejs").then(() => {
      templaterProxy.render('page', {x: 1}).then((result) => {
          result.should.equal("Page Outer 1 Inner 1\n\n\n")
        done()
      })
    })
  })
});


describe("Templater", () => {
  var templater
  
  beforeEach(() => {
    templater = new Templater(app);
  });
  
  describe("Load", () => {
    it("should not be null", () => {
      Templater.should.not.be.null
      templaterProxy.should.not.be.null
    })

    it("should be instantiated", () => {
      templater.should.not.be.null;
    });
  });

  describe("Init", () => {
    it("should have _templates after load", () => {
      return app.emit('load').then(() => {
        templater.should.have.property('_templates');
      });
    });

  });

  describe("_mergeArgs", () => {
    it("should handle null and single-length", () => {
      let r = templater._mergeArgs({})
      r.should.eql({})
      r = templater._mergeArgs({}, {})
      r.should.eql({})
    })
    it("should merge objects", () => {
      let r = templater._mergeArgs({a: 1}, {b: 2})
      r.should.have.property("a", 1)
      r.should.have.property("b", 2)
    })
    it("should merge array of objects", () => {
      let r = templater._mergeArgs({a: 1}, [{b: 2}, {c: 3}])
      r.should.have.property("a", 1)
      r.should.have.property("b", 2)
      r.should.have.property("c", 3)
    })
    it("should concat for array values", () => {
      let r = templater._mergeArgs({a: [1]}, {a: [2, 3]})
      r.should.have.property("a")
      r.a.should.eql([1, 2, 3])
    })
    it("should uniq for array values", () => {
      let r = templater._mergeArgs({a: [1]}, {a: [1, 3]})
      r.should.have.property("a")
      r.a.should.eql([1, 3])
    })
  })
  
  describe("Register Renderer", () => {
    it("should register a renderer with the specified type", (done) => {
      templater.template('test', () => {})
      app.emit('load').then(() => {
        chai.should().exist(templater._templates['test'])
        done()
      })
    })
  })

  describe("Registering templates with template()", () => {
    it("should accept just a filename", () => {
      templater.template("path/to/filename.ejs")
      templater._templates.should.have.property("filename")
      templater._templates.filename.filename.should.eql('path/to/filename.ejs')
    })
    it("should accept just a name and filename", () => {
      templater.template("path/to/filename.ejs", 'default')
      templater._templates.should.have.property("filename")
      templater._templates.filename.filename.should.eql('path/to/filename.ejs')
      templater._templates.filename.layout.should.eql('default')
    })
  })

});

