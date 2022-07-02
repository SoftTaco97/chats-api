FROM node:14
WORKDIR /chats-api 
COPY . .
RUN npm install
RUN npm run build
CMD npm start
