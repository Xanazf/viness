# syntax=docker/dockerfile:1
# docker image directive

# Node.js v20
FROM node:20-alpine

# create /app directory
WORKDIR /app

# install git
RUN apk add --no-cache git

# clone repo
ARG REPO_URL
RUN git clone https://github.com/Xanazf/gotonic-test.git .

# install deps and build
RUN yarn install && yarn cache clean && yarn build

# frontend port
EXPOSE 3000

# backend port
EXPOSE 5000

# run
CMD ["npm", "run", "start"]
