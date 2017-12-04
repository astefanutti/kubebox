FROM node:7.4.0-alpine

ENV NODE_ENV production

WORKDIR /kubebox

COPY xterm xterm/
COPY kubebox.js ./
COPY FiraCode-Regular.woff2 ./
COPY index.html ./

RUN chown -R node:node /kubebox

RUN npm install -g http-server

USER node

CMD ["http-server", "-s"]
