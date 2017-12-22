'use strict';

const http  = require('http'),
      https = require('https'),
      os    = require('os'),
      URI   = require('urijs');

module.exports.get = function (options, { stream, async = true, cancellable = false } = {}) {
  if (stream) {
    if (os.platform() === 'browser' && WebSocket) {
      return getWebSocketStream(options, stream, async);
    } else {
      return getStream(options, stream, async);
    }
  } else {
    return getBody(options, cancellable);
  }
};

function getBody(options, cancellable = false) {
  let cancellation = Function.prototype;
  const promise = new Promise((resolve, reject) => {
    const client = (options.protocol || 'https').startsWith('https') ? https : http;
    let clientAbort, finished;
    const request = client.get(options, response => {
      if (response.statusCode >= 400) {
        const error = new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`);
        // standard promises don't handle multi-parameters reject callbacks
        error.response = response;
        // IncomingMessage.destroy is not available in Browserify default shim
        // response.destroy(error);
        reject(error);
        return;
      }
      const body = [];
      response
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
          response.body = Buffer.concat(body);
          finished = true;
          resolve(response);
        });
    }).on('error', error => {
      finished = true;
      // 'Error: socket hang up' may be thrown on abort
      if (!clientAbort) reject(error);
    });
    cancellation  = () => {
      if (!finished) {
        clientAbort = true;
        request.abort();
        return true;
      }
    };
  });
  return cancellable ? { promise, cancellation: () => cancellation() } : promise;
}

function getWebSocketStream(options, generator, async = true) {
  let cancellation = Function.prototype;
  const promise = new Promise((resolve, reject) => {
    const url = new URI(options.path)
      .protocol((options.protocol || 'https').startsWith('https') ? 'wss' : 'ws')
      .hostname(options.hostname)
      .port(options.port);
    if (options.headers['Authorization']) {
      url.addQuery('access_token', options.headers['Authorization'].substring(7));
    }

    const socket = new WebSocket(url.toString(), ['binary.k8s.io']);
    socket.binaryType = 'arraybuffer';

    socket.addEventListener('error', event => {
      reject(Error(`WebSocket connection failed to ${event.target.url}`));
    });

    socket.addEventListener('open', event => {
      let clientAbort;
      cancellation = () => {
        clientAbort = true;
        socket.close();
      };

      const gen = generator();
      gen.next();

      socket.addEventListener('message', event => {
        const res = gen.next(new Buffer(event.data, 'binary'));
        if (res.done) {
          socket.close();
          event.body = res.value;
          // ignored for async as it's already been resolved
          resolve(event);
        }
      });

      socket.addEventListener('close', event => {
        if (!clientAbort) {
          const res = gen.next();
          // the generator may have already returned from the 'data' event
          if (!async && !res.done) {
            event.body = res.value;
            resolve(event);
          }
        }
        // ignored if the generator is done already
        gen.return();
      });

      if (async) {
        resolve(event);
      }
    });
  });

  return { promise, cancellation: () => cancellation() };
}

// TODO: add wrapper method getStreamAsync instead of a boolean flag
function getStream(options, generator, async = true) {
  let cancellation = Function.prototype;
  const promise = new Promise((resolve, reject) => {
    let clientAbort, serverAbort;
    const client = (options.protocol || 'https').startsWith('https') ? https : http;
    const request = client.get(options)
      .on('error', error => {
        // FIXME: check the state of the connection and the promise
        // 'Error: socket hang up' may be thrown on close
        // for containers that have not emitted any logs yet
        if (!clientAbort) reject(error);
      })
      .on('response', response => {
        if (response.statusCode >= 400) {
          const error = new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`);
          // standard promises don't handle multi-parameters reject callbacks
          error.response = response;
          response.destroy(error);
          return;
        }
        const gen = generator();
        gen.next();

        response
          .on('aborted', () => serverAbort = !clientAbort)
          .on('data', chunk => {
            // TODO: is there a way to avoid the client to deal with fragmentation?
            const res = gen.next(chunk);
            if (res.done) {
              // we may work on the http.ClientRequest if needed
              response.destroy();
              response.body = res.value;
              // ignored for async as it's already been resolved
              resolve(response);
            }
          })
          .on('end', () => {
            if (serverAbort || clientAbort && !async) {
              try {
                // FIXME: what happens when the generator is done already?
                const res = gen.throw(new Error('Request aborted'));
                // the generator may have already returned from the 'data' event
                if (!async && !res.done) {
                  response.body = res.value;
                  resolve(response);
                }
              } catch (e) {
                if (!async) {
                  reject(e);
                }
                // else swallow for generators that ignore aborted requests
              }
            } else if (!(clientAbort && async)) {
              const res = gen.next();
              // the generator may have already returned from the 'data' event
              if (!async && !res.done) {
                response.body = res.value;
                resolve(response);
              }
            }
            // ignored if the generator is done already
            gen.return();
          });

        if (async) {
          resolve(response);
        }
      })
      .on('upgrade', (response, socket, head) => {
        // TODO: verify 'Sec-WebSocket-Accept' during WebSocket handshake
        // TODO: we may want to offer an API to pipe the socket
        if (response.statusCode !== 101) {
          const error = new Error(`Failed to upgrade resource ${options.path}, status code: ${response.statusCode}`);
          // standard promises don't handle multi-parameters reject callbacks
          error.response = response;
          response.destroy(error);
          return;
        }
        cancellation = () => {
          clientAbort = true;
          socket.end();
        };

        const gen = decode(generator());
        gen.next();

        socket
          .on('data', frame => {
            // the server may still be sending some data as the socket
            // is ended, not aborted, on cancel
            if (!clientAbort) {
              const res = gen.next(frame);
              if (res.done) {
                socket.end();
                response.body = res.value;
                // ignored for async as it's already been resolved
                resolve(response);
              }
            } else {
              gen.return();
            }
          })
          .on('end', () => {
            if (!clientAbort) {
              const res = gen.next();
              // the generator may have already returned from the 'data' event
              if (!async && !res.done) {
                response.body = res.value;
                resolve(response);
              }
            }
            // ignored if the generator is done already
            // FIXME: avoid leaking the client generator
            gen.return();
          });
        if (async) {
          resolve(response);
        }
      });
    cancellation  = () => {
      clientAbort = true;
      request.abort();
    };
  });
  return { promise, cancellation: () => cancellation() };
}

// TODO: handle fragmentation and continuation frame
function* decode(gen) {
  gen.next();
  let data, frame, payload, offset;
  while (data = yield) {
    if (!frame) {
      frame = decodeFrame(data);
      // handle connection close in the 'end' event handler
      if (frame.opcode === 0x8) {
        continue;
      }
      if (frame.payload.length === frame.length) {
        payload = frame.payload;
        offset  = payload.length;
      } else {
        payload = Buffer.alloc(frame.length);
        offset  = frame.payload.copy(payload);
      }
    } else {
      offset += data.copy(payload, offset);
    }

    if (offset === frame.length) {
      // all the payload data has been transmitted
      try {
        const res = gen.next(payload);
        if (res.done) {
          return res.value;
        }
      } finally {
        frame = undefined;
      }
    }
  }
  return gen.next().value;
}

// https://tools.ietf.org/html/rfc6455#section-5.2
// https://tools.ietf.org/html/rfc6455#section-5.7
function decodeFrame(frame) {
  const FIN    = frame[0] & 0x80;
  const RSV1   = frame[0] & 0x40;
  const RSV2   = frame[0] & 0x20;
  const RSV3   = frame[0] & 0x10;
  const opcode = frame[0] & 0x0F;
  const mask   = frame[1] & 0x80;
  let length   = frame[1] & 0x7F;

  // just return the opcode on connection close
  if (opcode === 0x8) {
    return { opcode };
  }

  let nextByte = 2;
  if (length === 126) {
    length = frame.readUInt16BE(nextByte);
    nextByte += 2;
  } else if (length === 127) {
    length = frame.readUInt64BE(nextByte);
    nextByte += 8;
  }

  let maskingKey;
  if (mask) {
    maskingKey = frame.slice(nextByte, nextByte + 4);
    nextByte += 4;
  }

  const payload = frame.slice(nextByte);
  if (maskingKey) {
    for (let i = 0; i < payload.length; i++) {
      payload[i] = payload[i] ^ maskingKey[i % 4];
    }
  }
  return { FIN, opcode, length, payload };
}