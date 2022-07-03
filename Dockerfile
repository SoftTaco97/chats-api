FROM node:14
WORKDIR /chats-api 
COPY . .
RUN npm ci
RUN npm run build
CMD npm start
