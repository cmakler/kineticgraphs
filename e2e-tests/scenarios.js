'use strict';

/* https://github.com/angular/protractor/blob/master/docs/toc.md */

describe('my app', function() {

  browser.get('index.html');

  it('should automatically redirect to /graph1 when location hash/fragment is empty', function() {
    expect(browser.getLocationAbsUrl()).toMatch("/graph1");
  });


  describe('graph1', function() {

    beforeEach(function() {
      browser.get('index.html#/graph1');
    });


    it('should render graph1 when user navigates to /graph1', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 1/);
    });

  });


  describe('graph2', function() {

    beforeEach(function() {
      browser.get('index.html#/graph2');
    });


    it('should render graph2 when user navigates to /graph2', function() {
      expect(element.all(by.css('[ng-view] p')).first().getText()).
        toMatch(/partial for view 2/);
    });

  });
});
