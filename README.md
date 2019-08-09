# WayFarer-API
WayFarer is a public bus transportation booking server

[![Build Status](https://travis-ci.org/ticobrahe/WayFarer-API.svg?branch=develop)](https://travis-ci.org/ticobrahe/WayFarer-API) [![Coverage Status](https://coveralls.io/repos/github/ticobrahe/WayFarer-API/badge.svg?branch=develop)](https://coveralls.io/github/ticobrahe/WayFarer-API?branch=develop)

## Documentation
   Endpoint documentation available [here](https://documenter.getpostman.com/view/8323373/SVYrsyCR)

## Prerequisites
To get the app ready, you need to have node.js and the npm package installed in your computer

## Getting Started
This application is built with Node.js

Clone the repository by running
```bash
https://github.com/ticobrahe/WayFarer-API.git
```
Install the dependencies by running

```bash
npm install
```
create a .env file in your root directory and follow the example.env

### Database Setup

 Create a database to postgresql

####  Add table to database
```bash
npm run migrate
```

## Start Application
Start the application by running
```bash
npm run dev
```

## Testing Application
Test the application by running
```bash
npm run test
```