/* 
* @Author: Mike Reich
* @Date:   2015-12-06 07:20:10
* @Last Modified 2016-02-09
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

  describe("Render Content", () => {
    it('call the passed render function', (done) => {
      templater.template('test', 'test', () => {})
      app.emit('load').then(() => {
        templater.render('test', {}).then(() => {
          done()
        })
      })
    })
  })
});