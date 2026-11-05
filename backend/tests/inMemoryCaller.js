const { Duplex } = require('stream');
const http = require('http');

class VirtualSocket extends Duplex {
  constructor() {
    super();
    this.remoteAddress = '127.0.0.1';
    this.remotePort = 12345;
  }
  _read() {}
  _write(chunk, encoding, callback) {
    callback();
  }
}

function callExpress(app, options = {}) {
  return new Promise((resolve, reject) => {
    const socket = new VirtualSocket();
    const req = new http.IncomingMessage(socket);

    const bodyStr = options.body
      ? typeof options.body === 'string'
        ? options.body
        : JSON.stringify(options.body)
      : null;

    const headers = {
      host: 'localhost',
      'content-type': 'application/json',
    };

    if (options.headers) {
      for (const [k, v] of Object.entries(options.headers)) {
        headers[k.toLowerCase()] = v;
      }
    }

    if (bodyStr) {
      headers['content-length'] = Buffer.byteLength(bodyStr).toString();
    }

    req.method = options.method || 'GET';
    req.url = options.url || '/';
    req.headers = headers;

    const res = new http.ServerResponse(req);
    res.assignSocket(socket);

    let resBody = '';
    const originalWrite = res.write;
    const originalEnd = res.end;

    res.write = function (chunk, ...args) {
      if (chunk) resBody += chunk.toString();
      return originalWrite.apply(res, [chunk, ...args]);
    };

    res.end = function (chunk, ...args) {
      if (chunk) resBody += chunk.toString();
      originalEnd.apply(res, [chunk, ...args]);

      let parsed = null;
      try {
        parsed = resBody ? JSON.parse(resBody) : null;
      } catch (_) {
        parsed = resBody;
      }

      resolve({
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        data: parsed,
        raw: resBody,
      });
    };

    app(req, res);

    if (bodyStr) {
      req.push(bodyStr);
    }
    req.push(null);
  });
}

module.exports = { callExpress };
