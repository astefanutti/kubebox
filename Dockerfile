FROM node:12.16.2-alpine3.11 as builder

WORKDIR /kubebox

COPY lib lib/
COPY package.json package-lock.json index.js webpack.config.js webpack.hjs.language.js webpack.node.js ./

RUN npm install
RUN npm run bundle

FROM alpine:3.11

ENV TERM xterm-256color
ENV TERMINFO=/lib/terminfo
ENV LANG C.UTF-8

# Blessed fails to parse Terminfo database from the ncurses-terminfo package,
# and the ncurses-terminfo-base does not contain xterm-256color. So let's copy
# from another distribution.
COPY --from=node:12.16.2-stretch-slim /lib/terminfo /lib/terminfo

# Node.js
COPY --from=builder /usr/local/bin/node /usr/local/bin/
COPY --from=builder /usr/lib/libgcc* /usr/lib/libstdc* /usr/lib/

# Kubebox
COPY --from=builder /kubebox/bundle.js /kubebox/client.js

RUN addgroup -g 1000 node && \
    adduser -u 1000 -G node -s /bin/sh -D node && \
    chown node:node /kubebox

WORKDIR /kubebox

USER node

ENTRYPOINT ["node", "client.js"]
