# Build this docker file using: docker build . -t image_name
# Run this docker file using: docker run -p 3001:3001 image_name

FROM node:14-alpine as client

LABEL version="1.0"
LABEL description="Assa abloy certification UI" 

WORKDIR /usr/app
RUN npm install react-scripts -g
COPY client/package.json .
RUN npm install --production
COPY client .
RUN npm run build

FROM node:14-alpine 

LABEL version="1.0"
LABEL description="Assa abloy certification NodeJs server"

WORKDIR /usr/app
COPY package*.json .
COPY .env .
RUN npm install --production
COPY . .
COPY --from=client /usr/app/build artifact
EXPOSE 3001
CMD ["node", "server.js"]