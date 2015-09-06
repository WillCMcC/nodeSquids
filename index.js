// Initial Varibales

var port = 6969;



//  Requirements
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var multipart = require('connect-multiparty');
var fs = require('fs');
var Twitter = require('twitter');
var imgur = require('imgur');

// Set up multipart middleware
var multipartMiddleware = multipart();

// Set up  app
var app = express();

// init server
var server = http.createServer(app);
// server listen on port
server.listen(port, function(){
	console.log('Listening on port ' + port);
});
//set Static Files
app.use(express.static(__dirname + '/public'));


//Database Intialization

// set env variables for Database
// 'node index.js prod'  will use the hosted production Database
// 'node index.js' or 'node index.js dev' use the local Database

var env = process.argv[2] || 'dev';
switch (env) {
    case 'dev':
        var mongoDatabase = 'mongodb://localhost/realMap';
        break;
    case 'prod':
        var mongoDatabase = 'will:pass@ds035503.mongolab.com:35503/heroku_wb5mrk1g';
        break;
}
//  connect to database
mongoose.connect( mongoDatabase);
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('connection error', err);
});
db.once('open', function () {
	console.log('connected.');
});

//Define Squid Schema
var Schema = mongoose.Schema;
var squidSchema = new Schema({
	lat : Number,
	long : Number,
	img_link: String,
	squid: Number,
});

// Schema to DB Model
var Squid = mongoose.model('Squid', squidSchema);

//  Twitter API Sign In
var client = new Twitter({
  consumer_key: 'X5eCHte2RATTHYIR6AFRpexpK',
  consumer_secret: 'sOc3defPu7uKWh6xHHeWmmMaSu6RaE26lQGF3ddT9Ew5otFeOO',
  access_token_key: '3329781613-Rqy3kncZNPwmB1tWTtec0zODmSbXvwRCT1T5J9v',
  access_token_secret: 'Nru2xSmeg9Nv5vKl4zGsIpvcDy4reAp5YCuxJDAC2FpSy'
});


// get an instance of the express Router
var apirouter = express.Router();


// API routes

// middleware to use for all requests
apirouter.use(function(req, res, next) {
    // do logging
    console.log('Something is .');
  // make sure we go to the next routes and don't stop here
    next();
});

// Route for /api/markers
// used to get all image data, organize into squids, and send to front end for
// use in Google Maps API Markers

apirouter.route('/markers')
	.get(function(req, res) {
      Squid.find(function(err, squids) {
          if (err){res.send(err)};
          var squidObj = querysetToSquids(squids);
          res.json(squidObj);

  		})
  });

// Route for /api/new_image
// takes a file upload and saves it to DB
apirouter.route('/new_image')
    .post( multipartMiddleware, function(req, res, next) {
				// imgur setup and upload
				imgur.setClientId('c495aa665a64c56');
				imgur.uploadFile(req.files.file.path)
        // callback for image upload
				.then(function (json) {
          // remove picture from local memory
					fs.unlink(req.files.file.path);
					res.send("success");

            // save image to DB
						var squid = new Squid({
							lat : req.body.lat,
							long: req.body.long,
							img_link: json.data.link,
						});
						squid.save(function (err, data) {
					}
				)
				.catch(function (err) {
					console.error(err.message);
				});
			})
    })
// route for /api/new_squid
// takes a file upload, uploads to imgur, saves to DB
		apirouter.route('/new_squid')
		.post( multipartMiddleware, function(req, res, next) {

			// imgur setup and upload
			imgur.setClientId('c495aa665a64c56');
      imgur.uploadFile(req.files.file.path)
      // upload callback
			    .then(function (json) {
            res.send("success");
            // delete from temp memory
            fs.unlink(req.files.file.path);
            // create object to save to DB
            var squid = new Squid({
              lat : req.body.latitude,
              long: req.body.longitude,
              img_link: json.data.link,
              });
              //  save squid
              squid.save(function (err, data) {
              if (err) console.log(err);
              });
              //  tweet new squid!
              client.post('statuses/update', {
                status: 'New Squid! ' + json.data.link,
                lat: req.body.latitude,
                long: req.body.longitude,
                display_coordinates: true
               },
               function(error, tweet, response){
                if(error) throw error;
              });
          }
                )
                .catch(function (err) {
                    console.error(err.message);
                });
			});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', apirouter);

//  Routes for View
//  init router for views
var viewRoutes = express.Router();

//  middleware for all view routes
viewRoutes.use(function(req, res, next) {
    next(); // make sure we go to the next routes and don't stop here
});

app.use('/view/', viewRoutes);


// factory to turn a set of DB objects, images, into an object sorted by which
// squid each image belongs to

function querysetToSquids(squids){
  var squidObj = {};
  var squidCounter = 0;
  for(var i = 0; i < squids.length; i++){
    if(!squidObj.hasOwnProperty(squids[i].lat)){
      squidObj[squids[i].lat] = {
        'images' : [squids[i].img_link],
        "lat" : squids[i].lat,
        "long" : squids[i].long,
        "id" : squidCounter
      }
      squidCounter ++ ;
    }else{
      if(squids[i].lat != undefined){
        var latter = squids[i].lat;
        squidObj[squids[i].lat].images.push(squids[i].img_link)
      }
    }
  }
  return squidObj;
}
