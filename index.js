// vars
var port = 6969;

//  reqs
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var multipart = require('connect-multiparty');
var fs = require('fs');
var Twitter = require('twitter');

var multipartMiddleware = multipart();
var app = express();


var imgur = require('imgur');




var client = new Twitter({
  consumer_key: 'X5eCHte2RATTHYIR6AFRpexpK',
  consumer_secret: 'sOc3defPu7uKWh6xHHeWmmMaSu6RaE26lQGF3ddT9Ew5otFeOO',
  access_token_key: '3329781613-Rqy3kncZNPwmB1tWTtec0zODmSbXvwRCT1T5J9v',
  access_token_secret: 'Nru2xSmeg9Nv5vKl4zGsIpvcDy4reAp5YCuxJDAC2FpSy'
});





//Server
var server = http.createServer(app);

// set env
var env = process.argv[2] || 'dev';
switch (env) {
    case 'dev':
        var mongoDatabase = 'mongodb://localhost/realMap';
        break;
    case 'prod':
        var mongoDatabase = 'will:pass@ds035503.mongolab.com:35503/heroku_wb5mrk1g';
        break;
}


server.listen(process.env.PORT || port, function(){
	console.log('Listening on port ' + port);
});

//Serving Static Files
app.use(express.static(__dirname + '/public'));

//Mongo Intialization

mongoose.connect( mongoDatabase);
var db = mongoose.connection;
db.on('error', function (err) {
	console.log('connection error', err);
});
db.once('open', function () {
	console.log('connected.');
});

//Define Schema
var Schema = mongoose.Schema;

var squidSchema = new Schema({
	lat : Number,
	long : Number,
	img_link: String,
	squid: Number,
});

// Schema to DB Model
var Squid = mongoose.model('Squid', squidSchema);


// API

var apirouter = express.Router();              // get an instance of the express Router

// middleware to use for all requests
apirouter.use(function(req, res, next) {
    // do logging
    console.log('Something is .');
    next(); // make sure we go to the next routes and don't stop here
});


apirouter.route('/markers')

	.get(function(req, res) {
        Squid.find(function(err, squids) {
            if (err){res.send(err)};
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
            res.json(squidObj);

				})
        });

// add img to squid
		apirouter.route('/new_image')
			.post( multipartMiddleware, function(req, res, next) {
				var newerPath ;
				// imgur stuff
				imgur.setClientId('c495aa665a64c56');

				imgur.uploadFile(req.files.file.path)
				.then(function (json) {
					fs.unlink(req.files.file.path);
						res.send("success");
						console.log(req.body);
						var squid = new Squid({
							lat : req.body.lat,
							long: req.body.long,
							img_link: json.data.link,
						});
						console.log(squid);
						squid.save(function (err, data) {
						if (err) console.log(err);
						// else console.log('Saved : ', data );
						});
						res.send("success");

					}
				)
				.catch(function (err) {
					console.error(err.message);
				});
			})

// new squid
		apirouter.route('/new_squid')
		.post( multipartMiddleware, function(req, res, next) {
			var counter ;
			var newerPath ;
			// imgur stuff
			imgur.setClientId('c495aa665a64c56');
			Squid.count(function(err, c){
					counter = c
			});
            // imgur Intialization
						console.log(req.body);
                    imgur.uploadFile(req.files.file.path)
              			    .then(function (json) {
													console.log(json.data.link)
                          var squid = new Squid({
                            lat : req.body.latitude,
                            long: req.body.longitude,
                            img_link: json.data.link,
														squid: counter + 1,
                            });
                            console.log("Lat: " + req.body.latitude)
                            client.post('statuses/update', {
                              status: 'New Squid! ' + json.data.link,
                              lat: req.body.latitude,
                              long: req.body.longitude,
                              display_coordinates: true,
                             },  function(error, tweet, response){
                              if(error) throw error;
                              console.log(tweet);  // Tweet body.

                            });

														console.log(squid);
                            squid.save(function (err, data) {
                            if (err) console.log(err);
                            // else console.log('Saved : ', data );
                            fs.unlink(req.files.file.path);
                            });
                            res.send("success");
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

var viewRoutes = express.Router();
viewRoutes.use(function(req, res, next) {
    // do logging
    console.log('Something is view wise.');
		console.log(db.squid.count())
    next(); // make sure we go to the next routes and don't stop here
});
viewRoutes.route('/add')
.get(function(req, res) {
			res.sendfile('./public/add.html');
});
viewRoutes.route('/all_squids')
.get(function(req, res) {
			res.sendfile('./public/all_squids.html');
});
app.use('/view/', viewRoutes);
