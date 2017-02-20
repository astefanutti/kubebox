FROM node:7.4.0-alpine

ENV TERM xterm-color

WORKDIR /kubik

COPY package.json ./
COPY lib lib/
COPY kubik.js ./

RUN npm install

ENTRYPOINT ["node", "kubik.js"]
