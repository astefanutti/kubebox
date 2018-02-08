FROM node:9.5.0-alpine as builder

ENV NODE_ENV production

WORKDIR /kubebox

COPY package*.json ./
COPY lib lib/
COPY index.js ./

RUN npm install
RUN npm install -g browserify
RUN npm run bundle

FROM node:9.5.0-alpine

ENV TERM xterm-256color
ENV LANG C.UTF-8

WORKDIR /kubebox

COPY --from=builder /kubebox/bundle.js /kubebox/bundle.js

RUN chown -R node:node /kubebox

USER node

ENTRYPOINT ["node", "bundle.js"]
