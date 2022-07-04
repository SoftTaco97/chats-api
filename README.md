# chats-api

An Express API for creating and retrieving chat messages in a MySQL database. Written in Typescript. 

---
##  Set up

To run the project follow these steps:

### Environment variables

Use the `.env.example` to create a `.env` file in the root of the project with the appropriate information.

### Docker

This project has a [docker](https://www.docker.com/) configuration to run the API and database using [docker compose](https://docs.docker.com/compose/).

To build and run the containers for the project run the following command in the root of the project:

```bash
docker-compose up
```

### Non docker

To run the project without docker / docker compose ensure you have [Node.js](https://nodejs.org/en/) installed on your machine, as well as access to a MySQL database, then run the following commands

```bash
# install the packages
npm i

# build the project
npm run build

# start the project
npm run start
```

Optionally, you can run the project in development mode which will enable hot reloading by running this command

```bash
npm run dev
```
---

## Tests

To run the project tests use this command

```bash
npm run test
```

---

## API Routes

### /chats

#### POST requests

Post requests to the `/chats` route will create a chat for a user.

##### Parameters

| Param      | Type      | Required  |
| ---------- | --------- | --------- |
| `username` | `string`  | Yes       |
| `text`     | `string`  | Yes       |
| `timeout`  | `integer` | No        |


##### Return information

If a chat was succcesfully created the unqiue id for the chat message will be returned.

#### GET requests

Get requests to the `/chats` route will retrieve a chat message for an id **or** all of the chats for a user.

##### Parameters

| Param      | Type      | Required  |
| ---------- | --------- | --------- |
| `username` | `string`  | No        |
| `id`       | `string`  | No        |


##### Return information

When provided with an `id` parameter, the chat information for the id provided will be returned.

When provided when a `username` parameter, the chat history for the user will be provided.

---

## Database tables

### Chat

| Column            | Type              | Default           |
| ----------------- | ----------------- | ----------------- |
| `id`              | `integer` PK      | Auto Increment    |
| `uuid`            | `string`          | None              |
| `text`            | `string`          | None              |
| `user_id`         | `integer` FK      | None              |
| `expiration_date` | `datetime`        | None              |
| `updated_at`      | `datetime`        | CURRENT_TIMESTAMP |
| `created_at`      | `datetime`        | CURRENT_TIMESTAMP |


### User

| Column            | Type              | Default           |
| ----------------- | ----------------- | ----------------- |
| `id`              | `integer` PK      | Auto Increment    |
| `username`        | `string`          | None              |
| `updated_at`      | `datetime`        | CURRENT_TIMESTAMP |
| `created_at`      | `datetime`        | CURRENT_TIMESTAMP |

