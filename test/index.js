/* 
* @Author: Mike Reich
* @Date:   2015-12-06 07:20:10
* @Last Modified 2016-02-26
*/

'use strict';

import Templater from '../src/'

import TestApp from '@nxus/core/lib/test/support/TestApp';

describe("Templater", () => {
  var templater;
  var app = new TestApp();
 
  beforeEach(() => {
    app = new TestApp();
    templater = new Templater(app);
  });
  
  describe("Load", () => {
    it("should not be null", () => Templater.should.not.be.null)

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

    it("should register a gather for templates", () => {
      return app.emit('load').then(() => {
        app.get.calledWith('templater').should.be.true;
        app.get().gather.calledWith('template').should.be.true;
      });
    })

    it("should register a gather for templateDirs", () => {
      return app.emit('load').then(() => {
        app.get.calledWith('templater').should.be.true;
        app.get().gather.calledWith('templateDir').should.be.true;
      });
    })

    it("should register a provider for render", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('render').should.be.true;
      });
    })

    it("should register a provider for renderPartial", () => {
      return app.emit('load').then(() => {
        app.get().respond.calledWith('renderPartial').should.be.true;
      });
    })
  });

  describe("Register Renderer", () => {
    it("should register a renderer with the specified type", (done) => {
      templater.template('test', 'test', () => {})
      app.emit('load').then(() => {
        chai.should().exist(templater._templates['test'])
        done()
      })
    })
  })

  describe("Registering templates with template()", () => {
    it("should accept just a filename", () => {
      templater.template("path/to/filename.ejs")
      templater._templates.should.have.property("filename", {type: 'ejs', handler: 'path/to/filename.ejs'})
    })
    it("should accept just a name and filename", () => {
      templater.template("defaultFilename", "path/to/filename.ejs")
      templater._templates.should.have.property("defaultFilename", {type: 'ejs', handler: 'path/to/filename.ejs'})
    })
    it("should accept all and path", () => {
      let handler = () => {}
      templater.template("filename", "path/to/filename.txt", "custom", 'ejs')
      templater._templates.should.have.property("custom-filename", {type: 'ejs', handler: 'path/to/filename.txt'})
    })
    it("should accept all and handler", () => {
      let handler = () => {}
      templater.template("handler", handler, "custom", "ejs")
      templater._templates.should.have.property("custom-handler", {type: 'ejs', handler: handler})
    })
  })
});
