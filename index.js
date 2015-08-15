// vars
var port = 6969;

//  reqs
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var multipart = require('connect-multiparty');
var fs = require('fs');

var multipartMiddleware = multipart();
var app = express();

var piexif = require("piexifjs");
var Jimp = require("jimp");
var imgur = require('imgur');







//Server
var server = http.createServer(app);



server.listen(port, function(){
	console.log('Listening on port ' + port);
});

//Serving Static Files
app.use(express.static(__dirname + '/public'));

//Mongo Intialization

mongoose.connect('mongodb://localhost/realMap');
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
	album: String,
});

// Schema to DB Model
var Squid = mongoose.model('Squid', squidSchema);

// //Test DB Object
// var squid = new Squid({
// lat : 37.805375,
// long: -122.420868,
// img_paths: [ '/squid1.jpg', '/squid2.jpg' ]
// });
//
//  //Save DB Object
// squid.save(function (err, data) {
// if (err) console.log(err);
// else console.log('Saved : ', data );
// });

// API

var apirouter = express.Router();              // get an instance of the express Router

// middleware to use for all requests
apirouter.use(function(req, res, next) {
    // do logging
    console.log('Something is .');
    next(); // make sure we go to the next routes and don't stop here
});


apirouter.route('/all')

	.get(function(req, res) {
    imgur.setClientId('c495aa665a64c56');
    imgur.setCredentials('squidmapSF@gmail.com', 'Zamar123', 'c495aa665a64c56');
        Squid.find(function(err, squids) {
            if (err){res.send(err)};

            var responseArr = [];
            var counter = 0;

            for(var i = 0 ;i<squids.length;i++){
              var album = squids[i].album;
              var squidId = i;
              imgur.getAlbumInfo(album)
              .then(function(json) {
                eachObj = {}
                eachObj.albumData = json
                eachObj.dbData = squids[squidId];
                responseArr.push(eachObj);

                if(responseArr.length == squids.length){
                  res.json(responseArr);
                }
              })
              .catch(function (err) {
                console.error(err.message);
              });

            }

        })});

// add img to squid
apirouter.route('/new_image')
.post( multipartMiddleware, function(req, res, next) {
  var newerPath ;
  // imgur stuff
  imgur.setClientId('c495aa665a64c56');
  imgur.setCredentials('squidmapSF@gmail.com', 'Zamar123', 'c495aa665a64c56');

                // save squid
                imgur.uploadFile(req.files.file.path, req.body.album)
                    .then(function (json) {
                        fs.unlink(req.files.file.path);
                        // console.log(json)
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
			var newerPath ;
			// imgur stuff
			imgur.setClientId('c495aa665a64c56');
      imgur.setCredentials('squidmapSF@gmail.com', 'Zamar123', 'c495aa665a64c56');

            // imgur Intialization
            imgur.createAlbum()
                .then(function(json) {
            				imgurAlbum = json.data.id;

                    // save squid
                    imgur.uploadFile(req.files.file.path, imgurAlbum)
              			    .then(function (json) {
                          var squid = new Squid({
                            lat : req.body.latitude,
                            long: req.body.longitude,
                            album: imgurAlbum,
                            });
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


			    })
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
