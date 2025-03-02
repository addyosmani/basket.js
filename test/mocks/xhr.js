// Mock response data for test fixtures
const mockResponses = {
  'fixtures/jquery.min.js': '/* jQuery mock */',
  'fixtures/modernizr.min.js': '/* Modernizr mock */',
  'fixtures/fail-script.js': '/* Fail script mock */',
  'fixtures/executefalse.js': 'basket.executed = true;',
  'fixtures/largeScript.js': '/* Large script mock */',
  'fixtures/stamp-script.js': '/* Stamp script mock */'
};

// Mock XMLHttpRequest
class MockXMLHttpRequest {
  constructor() {
    this.readyState = 0;
    this.status = 0;
    this.responseText = '';
  }

  open(method, url) {
    this.method = method;
    this.url = url;
    this.readyState = 1;
  }

  send() {
    setTimeout(() => {
      if (mockResponses[this.url]) {
        this.readyState = 4;
        this.status = 200;
        this.responseText = mockResponses[this.url];
        this.onreadystatechange();
      } else {
        this.readyState = 4;
        this.status = 404;
        this.statusText = 'Not Found';
        this.onreadystatechange();
      }
    }, 0);
  }

  getResponseHeader(header) {
    return header === 'content-type' ? 'text/javascript' : null;
  }
}

global.XMLHttpRequest = MockXMLHttpRequest;
