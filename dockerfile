FROM node:18-alpine as dev

WORKDIR /app

COPY package.json /app
COPY pnpm-lock.yaml /app

RUN npm install -g pnpm

RUN pnpm i 

COPY . /app

FROM node:18-alpine as build

RUN pnpm build