FROM node:7.4.0-alpine

ENV NODE_ENV production

WORKDIR /kubebox

# Client
COPY libs libs/
COPY fonts fonts/
COPY kubebox.js ./
COPY index.html ./

# Server
COPY package.json ./
COPY server.js ./

RUN chown -R node:node /kubebox

RUN npm install express

USER node

EXPOSE 8080

CMD ["node", "server.js"]
