FROM node:lts-alpine

RUN mkdir -p /usr/app/build

WORKDIR /usr/app

COPY . /usr/app/build
COPY ./node_modules/ usr/app/node_modules
COPY ./package.json /usr/app/package.json

RUN cd /usr/app && npm install --production

EXPOSE 3000

CMD [ "npm", "run", "start"]