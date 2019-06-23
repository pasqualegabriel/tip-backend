[![Build Status](https://travis-ci.org/pasqualegabriel/tip-backend.svg?branch=master)](https://travis-ci.org/pasqualegabriel/tip-backend)

# TIP-BACKEND

University Proyect of TIP - UNQ

### Members

Number |       Name              | UNQ-Records |    EMail
-------|-------------------------|-------------|------------------------
  1    |                         |             | 
  2    |                         |             | 
  3    |                         |             | 

### Trello
[tip - trello](https://trello.com/)

#### Installing node
Get the latest version of node from the [official website](https://nodejs.org/) or using [nvm](https://github.com/creationix/nvm)
Nvm approach is preferred.

#### Getting dependencies
- ```npm install```
- ```npm install -g sequelize sequelize-cli pg pg-hstore```

#### Database configuration
Before running the app, make sure you have [postgresql installed](https://www.digitalocean.com/community/tutorials/how-to-install-and-use-postgresql-on-ubuntu-14-04) and a db created, to create it run the following steps inside a psql terminal:
1. CREATE DATABASE db_project_name;
2. \c db_project_name
3. CREATE ROLE "project_name" LOGIN CREATEDB PASSWORD 'project_name';

Then, set in `.env` some variables:
- `DB_HOST=localhost`
- `DB_PORT=5432`
- `DB_NAME=db_project_name`
- `DB_USERNAME=project_name`
- `DB_PASSWORD=project_name`
- `NODE_API_DB_NAME_TEST=db_project_name_test`

**Remember not to push nor commit the `.env` file.**

### Migrations

To create a migration, run `sequelize migration:create --name="my-migration-name"  --migrations-path ./migrations/migrations`.

To run them, execute `npm run migrations`.

#### Starting your app
Now, to start your app run ```npm start``` in the rootpath of the project. Then access your app at **localhost:port**. The port is logged in the console where you ran the start script.

#### Testing your app
Now, to test your app run ```npm test``` in the rootpath of the project.
