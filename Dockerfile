FROM node:alpine
LABEL authors=""
COPY . /app
WORKDIR /app
RUN yarn cache clean
RUN yarn
RUN yarn run build