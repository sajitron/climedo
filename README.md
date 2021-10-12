# Climedo Health

## Node Version

- node v14

## Tools

- Node.js/TypeScript
- Express
- MongoDB
- Redis
- Docker
- Jest

## Starting the App

- Create and Populate the _.env_ file in the root directory with the appropriate environment variables.

### Starting Locally (without Docker)

- Run _yarn_ from the root of the directory to install the required dependencies.
- You should have redis installed on your computer. Run _redis-server_ to start up redis.
- Run _yarn start:dev_ to start the app in development mode

### Starting with docker

- Update the .env file with the following variables.

  - REDIS_URL=redis://redis:6379
  - MONGO_URI=mongodb://mongo:27017/climedo

- Run `yarn build`
- Run _docker build . -t <tagname>_ e.g `docker build . -t climedo`
- Run _docker-compose up_ from the root directory.
- Run _docker ps_ from the root directory (in another terminal window) to get the available port.
