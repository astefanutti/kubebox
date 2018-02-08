FROM node:9.5.0-alpine

ENV NODE_ENV production
ENV TERM xterm-256color
ENV LANG C.UTF-8

WORKDIR /kubebox

COPY package*.json ./
COPY lib lib/
COPY index.js ./

RUN chown -R node:node /kubebox

USER node

RUN npm install

ENTRYPOINT ["node", "index.js"]
