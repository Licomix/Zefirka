FROM node:alpine

RUN mkdir -p /usr/src/bot
WORKDIR /usr/src/bot

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run build

CMD ["npm", "start"]
