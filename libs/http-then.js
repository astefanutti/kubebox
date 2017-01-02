'use strict';

const http  = require('http'),
      https = require('https');

module.exports.get = function (options, generator, async = true) {
  return generator ? getStream(options, generator, async) : getBody(options);
};

// we may want to support cancellation of the returned pending promise
function getBody(options) {
  return new Promise((resolve, reject) => {
    const client = (options.protocol || 'http').startsWith('https') ? https : http;
    client.get(options, response => {
      if (response.statusCode >= 400) {
        const error    = new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`);
        // standard promises don't handle multi-parameters reject callbacks
        error.response = response;
        response.destroy(error);
        return;
      }
      const body = [];
      response
        .on('data', chunk => body.push(chunk))
        .on('end', () => {
          response.body = Buffer.concat(body);
          resolve(response);
        });
    }).on('error', reject);
  })
}

function getStream(options, generator, async = true) {
  let request, clientAbort, serverAbort;
  const promise = new Promise((resolve, reject) => {
    const client = (options.protocol || 'http').startsWith('https') ? https : http;
    request      = client.get(options, response => {
      if (response.statusCode >= 400) {
        const error    = new Error(`Failed to get resource ${options.path}, status code: ${response.statusCode}`);
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
    }).on('error', reject)
      .on('abort', () => clientAbort = true)
      .on('upgrade', (response, socket, head) => {
        // TODO: we may want to offer an API to pipe the socket
        if (response.statusCode !== 101) {
          const error    = new Error(`Failed to upgrade resource ${options.path}, status code: ${response.statusCode}`);
          // standard promises don't handle multi-parameters reject callbacks
          error.response = response;
          response.destroy(error);
          return;
        }

        const gen = generator();
        gen.next();

        socket
          .on('data', chunk => {
            // TODO: read single unmasked frame opcodes to skip the correct message size
            // See: https://tools.ietf.org/html/rfc6455#section-5.7
            const res = gen.next(chunk.slice(4));
            if (res.done) {
              socket.end();
              response.body = res.value;
              // ignored for async as it's already been resolved
              resolve(response);
            }
          })
          .on('end', () => {
            if (!clientAbort) {
              try {
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
              }
              // else swallow for generators that ignore aborted requests
            }
          });
        if (async) {
          resolve(response);
        }
      });
  });
  return {
    promise     : promise,
    cancellation: () => {
      try {
        // TODO: should the socket be ended instead of aborted?
        // destroy the http.ClientRequest on cancellation
        if (request) request.abort();
      } catch (error) {
        // swallow error to handle 'Error: socket hang up' on close
        // it happens for containers that have not emitted any logs yet
      }
    }
  }
}