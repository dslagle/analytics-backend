FROM node:7-alpine

ENV NODE_ENV production

RUN mkdir -p /usr/src/app
WORKDIR /usr/src/app

COPY package.json /usr/src/app
RUN npm install

COPY /public /usr/src/app

EXPOSE 9000

CMD ["npm", "run", "docker-start"]