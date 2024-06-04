## Instructions to setup and run project
# Prerequisites 
npm install the following:
- npm install (base dependencies)
- cors (globally)
- axios (/client and /server (for npm test))
- express (/server)
- mongoose (/server)
- nodemon (/server or globally using $ npm install -g nodemon)
- bcryptjs (/server)
- jsonwebtoken (/server)
- cookie-parser (/server)
- express-session (/server)
## Start the MongoDB server
- run $ mongod 
- run $ mongosh
Database instance should now be running on mongodb://127.0.0.1:27017/fake_so
## Create Admin User
- in cd server $ node init.js [admin-username] [admin-password]
## Start the server
- cd server , $ npm install
= nodemon server.js
Server instance should now be running on https://localhost:8000
## Set up Client
- cd client , $ npm install
- npm start
The application should now be running on http://localhost:3000
## Run Tests
- NOTE: Shut down Application before testing
- cd server
- $ npm test
