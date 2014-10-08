'use strict';

describe('kineticGraphs.version module', function() {
  beforeEach(module('kineticGraphs.version'));

  describe('version service', function() {
    it('should return current version', inject(function(version) {
      expect(version).toEqual('0.1');
    }));
  });
});
