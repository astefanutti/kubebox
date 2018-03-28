FROM node:9.5.0-alpine as builder

ENV NODE_ENV production

WORKDIR /kubebox

COPY lib lib/
COPY package.json package-lock.json index.js ./

RUN npm install
RUN npm install -g browserify
RUN npm run bundle

FROM alpine:3.7

ENV TERM xterm-256color
ENV LANG C.UTF-8

# Node.js
COPY --from=builder /usr/local/bin/node /usr/local/bin/
COPY --from=builder /usr/lib /usr/lib

# Kubebox
COPY --from=builder /kubebox/bundle.js /kubebox/client.js

RUN addgroup -g 1000 node && \
    adduser -u 1000 -G node -s /bin/sh -D node && \
    chown node:node /kubebox

WORKDIR /kubebox

USER node

ENTRYPOINT ["node", "client.js"]
