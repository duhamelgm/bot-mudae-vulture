FROM node:14
WORKDIR /usr/app
COPY package.json .
RUN npm install --quiet
COPY . .
RUN ./node_modules/.bin/prisma generate