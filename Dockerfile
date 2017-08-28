FROM node:7.4.0-alpine

ENV NODE_ENV production
ENV TERM xterm-color

WORKDIR /kubebox

COPY package.json ./
COPY lib lib/
COPY index.js ./

RUN chown -R node:node /kubebox

USER node

RUN npm install

ENTRYPOINT ["node", "index.js"]
