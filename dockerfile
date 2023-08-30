FROM node:18-alpine as dev

WORKDIR /app

COPY package.json ./
COPY pnpm-lock.yaml ./

RUN npm install -g pnpm

RUN pnpm i 

COPY . .

FROM node:18-alpine as build

RUN pnpm build