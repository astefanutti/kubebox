FROM node:7.4.0-alpine

ENV TERM xterm-color

WORKDIR /kubebox

COPY package.json ./
COPY lib lib/
COPY index.js ./

RUN npm install

ENTRYPOINT ["node", "index.js"]
