FROM node:9.5.0-alpine as builder

WORKDIR /kubebox

COPY package.json package-lock.json ./
COPY lib lib/
COPY index.js ./
COPY server.js ./

RUN npm install
RUN npm install -g browserify
RUN browserify index.js -o client.bundle.js -i pty.js --bare
RUN browserify server.js -o server.bundle.js -i pty.js -u bufferutil -u utf-8-validate --bare

FROM node:9.5.0-alpine

ENV TERM xterm-256color
ENV LANG C.UTF-8

WORKDIR /kubebox

#TODO: should ideally be factorized
COPY --from=builder /kubebox/client.bundle.js /kubebox/client.js
COPY --from=builder /kubebox/server.bundle.js /kubebox/server.js

COPY docs/fonts docs/fonts
COPY docs/libs docs/libs
COPY index.html ./

# RUN echo -e '#!/bin/sh\nnode /kubebox/server.js $*' > /usr/bin/kubebox && \
#     chmod a+x /usr/bin/kubebox

RUN chown node:node /kubebox

USER node

ENTRYPOINT ["node", "client.js"]
