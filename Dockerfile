# -------------------------
# BUILD DEV IMAGE
# -------------------------
FROM node:12-alpine as dev

RUN mkdir /www

ARG PORT=3000
ENV PORT $PORT

WORKDIR /
COPY package.json ./package.json
# install prod node_modules in root dir
RUN npm install --loglevel=error --no-package-lock --only=prod

WORKDIR /www
COPY package.json ./package.json
# install dev node_modules in /www dir
RUN npm install --loglevel=error --no-package-lock --only=dev

COPY . ./
RUN npm run build

CMD [ "npm", "start" ]

# -------------------------
# BUILD PROD IMAGE
# -------------------------
FROM node:12-alpine as prod

ARG PORT=3000
ENV PORT $PORT

RUN mkdir /www && chown node:node /www
WORKDIR /www
COPY --from=dev /www/lib ./lib
COPY --from=dev /www/package.json ./package.json
COPY --from=dev /node_modules ./node_modules

USER node
EXPOSE $PORT

CMD ["node", "lib/api/index.js"]
