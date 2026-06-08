import '@testing-library/jest-dom';

// Ensure Request and Response are available for next/server
if (typeof Request === 'undefined') {
  global.Request = class Request {
    constructor() {}
  } as any;
}
if (typeof Response === 'undefined') {
  global.Response = class Response {
    constructor() {}
    static json(body: any, init?: any) {
      return {
        status: init?.status || 200,
        json: async () => body
      };
    }
  } as any;
}

// Ensure TextEncoder is available
if (typeof TextEncoder === 'undefined') {
  const { TextEncoder, TextDecoder } = require('util');
  global.TextEncoder = TextEncoder;
  global.TextDecoder = TextDecoder;
}
