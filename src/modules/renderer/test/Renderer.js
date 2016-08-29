'use strict';

import Renderer from '../'
import {renderer as rendererProxy} from '../'

describe("Renderer", () => {
  var app;
  describe("Load", () => {
    it("should not be null", () => {
      Renderer.should.not.be.null
      rendererProxy.should.not.be.null
    })

  });
});
