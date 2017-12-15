FROM node:7.4.0-alpine

ENV NODE_ENV production

WORKDIR /kubebox

# Client
COPY xterm xterm/
COPY kubebox.js ./
COPY FiraCode-Regular.woff2 ./
COPY index.html ./

# Server
COPY package.json ./
COPY server.js ./

RUN chown -R node:node /kubebox

RUN npm install express

USER node

EXPOSE 8080

CMD ["node", "server.js"]
