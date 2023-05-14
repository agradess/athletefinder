
// Grading (a.k.a. TODOs)

// (40%) Application relies on Node.js and Express. [Fulfilled]
// (10%) Application relies on MongoDB.
// (10%) Application relies on at least one form. [Fulfilled]
// (5%) Application makes use of some CSS. [Fulfilled]
// (30%) Application makes use of some API. [Fulfilled]
// (5%) Application is deployed online
//      (e.g., using a company that provides a free-hosting
//      option e.g., https://render.com/).


/*

Brainstorming:

This is what we want:
https://www.thesportsdb.com/api.php
*use API key 3 for testing?

Possible API calls to make (for long jump events):

Search for event by event name
https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=Arsenal_vs_Chelsea
https://www.thesportsdb.com/api/v1/json/3/searchevents.php?e=Arsenal_vs_Chelsea&s=2016-2017

Event Results by Event Id
https://www.thesportsdb.com/api/v1/json/3/eventresults.php?id=652890


Premise:

Search for players by name:
const fresponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${pname}`);

Given a year, find all the long jump competitions within a year
List all leagues => find league id for world athletics => find events containing league id
https://www.thesportsdb.com/api/v1/json/3/all_leagues.php
lookup table by league id and season**
https://www.thesportsdb.com/api/v1/json/3/lookuptable.php?l=4328&s=2020-2021
then display them in a list (maybe store them temporarily, need to do more MongoDB research here)
once one of the events in the list is clicked on, then get more details about that event
then maybe store this in a separate 'collection' in MongoDB?

then later you can have a 'get saved long jump competitions' functionality

Code Distribution:

/node_modules
/credentials (TODO)
    .env (TODO)
/templates
    index.ejs - main page with the form (most of the CSS can be directed here)
    eventlist.ejs - this can be used for requests to the api and queries to MongoDB
    eventdetails.ejs - this is starting to feel like React, given an event id, find the LJ
        competition if necessary, and display the event details
    ...
README.md (TODO)

*/




const http = require('http');
const path = require("path");
const fetch = require('node-fetch');
const express = require('express');
const ejs = require('ejs');
/* NOTE: Module for file reading, commenting out for now */
// const fs = require("fs");
const bodyParser = require('body-parser');
const { exit } = require('process');
// These two below are for MongoDB
require("dotenv").config({ path: path.resolve(__dirname, 'credentials') }) 
const { MongoClient, ServerApiVersion } = require('mongodb');

const app = express();
const httpSuccessStatus = 200;
// TODO: uncomment later
const userName = process.env.MONGO_DB_USERNAME;
const password = process.env.MONGO_DB_PASSWORD;

/* Our database and collection */
const databaseAndCollection = {db: process.env.MONGO_DB_NAME, collection: process.env.MONGO_COLLECTION };

// TODO: insert a record into the database
/*
    How am I going to do this?
    when I do the post request, open the database, insert the record, close the database

    async function execMongoDBOperation(op_type, data)
*/

/*
type = 'insert', 'read', 'update', 'delete'
*/

async function execMongoDBOperation(type, documents) {
    
    const uri = `mongodb+srv://${userName}:${password}@cluster0.ulmanvi.mongodb.net/?retryWrites=true&w=majority`;
    const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

    try {
        await client.connect();
       
        /* Inserting multiple movies */
        // console.log("***** Inserting multiple movies *****");
        let testArr = [{name:"Batman", year:2021, stars: 1.5},
                               {name:"Wonder Women", year:2005, stars: 2.0},
                               {name:"When Harry Met Sally", year:1985, stars: 5},
                               {name:"Hulk", year:1985, stars: 5}
                              ];
        
        if (type === "insert") {
            const result = await client.db(databaseAndCollection.db)
                .collection(databaseAndCollection.collection)
                .insertOne(documents);

                // console.log(`Inserted ${result.insertedCount} documents`);
        }

    } catch (e) {
        console.error(e);
    } finally {
        await client.close();
    }
}

// execMongoDBOperation().catch(console.error);

process.stdin.setEncoding("utf8");

// NOTE: removing this so that maybe I can deploy it through app.cyclic
// if (process.argv.length != 3) {
//   process.stdout.write(`Usage node index.js PORT_NUMBER`);
//   process.exit(1);
// }

// helps parse incoming form data
app.use(bodyParser.urlencoded({ extended: true }));

/* able to add css from here */
app.use(express.static(__dirname + '/public'));

/* directory where templates will reside */
app.set("views", path.resolve(__dirname, "templates"));

/* view/templating engine */
app.set("view engine", "ejs");

//              endpoints reached with Express

// - This endpoint renders the main page of the application
// and it will display the contents of the index.ejs template
// file.
app.get("/", (request, response) => {
    
    response.render("index");
});

// document.querySelector("#fetch_button").addEventListener('click', async function() {
//     // const response = await fetch('url');
//     // const json = await response.json();

//     console.log("test");
// });

app.post("/displayathlete", async function(request, response) {
    
    let athleticsjson = {};
    
    // const seasonyr_int = Number(request.body.season); // TODO: validate
    let player_name = request.body.playname;
    let res_playernameimg, res_playerdesc; // TODO: validate
    // console.log(seasonyr_int);
    console.log(player_name);
    
    // league ids: Olympics = 4994, Diamond League = 5282
    
    // <%- playerdata %>
    // <%- playernameimg %>
    // <p id="player_desc">
    //     <%- playerdesc %>
    // </p>
    
    // Search player by name
    const fresponse = await fetch(`https://www.thesportsdb.com/api/v1/json/3/searchplayers.php?p=${player_name}`);
    athleticsjson = await fresponse.json();
    console.log(athleticsjson["player"][0]);
    const athletejson = athleticsjson["player"][0];
    
    res_playernameimg = `<img src="${athletejson["strThumb"]}" alt="${player_name}" >`;
    res_playerdesc = athletejson["strDescriptionEN"];
    player_name = athletejson["strPlayer"];
    const indexdotejsvars = {
        // playerrawjson: JSON.stringify(athleticsjson),
        playername: player_name,
        playernameimg: res_playernameimg,
        playerdesc: res_playerdesc
    }; // NOTE: still just displaying string
    // console.log(athleticsjson); // debug

    // TODO: handle the unhandled promise rejections
    
    // before rendering, update the database
    execMongoDBOperation("insert", indexdotejsvars).catch(console.error);
    response.render("display_player", indexdotejsvars);
});

// TODO: new route: searchathletehistory

// app.post("/searchplayerhistory", async function(request, response) {

//     response.render("display_player", vars);
// });

// const portNumber = Number(process.argv[2]);
const portNumber = 5340;
app.listen(portNumber); 
process.stdout.write(`Web server started and running at http://localhost:${portNumber}\n`);
process.stdout.write(`Stop to shutdown the server: `);


// listen for stdin (stop command)

process.stdin.on("readable", function () {
  let dataInput = process.stdin.read();
  
  if (dataInput !== null) {
    let command = dataInput.trim();
    
    if (command === "stop") {
      process.exit(0);
    }

    process.stdout.write(prompt);
    process.stdin.resume();
  }
});
