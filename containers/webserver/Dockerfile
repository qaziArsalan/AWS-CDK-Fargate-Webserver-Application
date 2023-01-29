FROM --platform=linux/amd64 node:16-alpine AS builder
WORKDIR /app
COPY . .

RUN npm install

COPY . .
RUN npm run build


FROM --platform=linux/amd64 node:16-alpine AS server

WORKDIR /app
COPY package* ./
RUN npm install --production
COPY --from=builder "/app/dist/" "/app/dist"
COPY --from=builder "/app/node_modules/" "/app/node_modules/"
COPY --from=builder "/app/package.json" "/app/package.json"

EXPOSE 8080

CMD ["node", "dist/index.js"]


# Here we create two stages, one for building the server and the other for running the server. 
# In the builder stage, we generate Javascript code from the Typescript files. Then in the server stage, 
# we copy the generated files from the builder stage to the server stage. In the Server stage, we need only production dependencies, 
# that's why we will pass the --production flag to the npm install command.

# Dockerfile: 

# FROM node:12-alpine AS builder
# WORKDIR /app
# COPY package*.json ./
# RUN npm install
# COPY . .
# RUN npm run build

# FROM node:12-alpine AS server
# WORKDIR /app
# COPY package* ./
# RUN npm install --production
# COPY --from=builder ./app/public ./public
# COPY --from=builder ./app/build ./build
# EXPOSE 8000
# CMD ["npm", "start"]
