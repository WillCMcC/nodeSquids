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

// imgur Intialization

var imgurAlbum
imgur.createAlbum()
    .then(function(json) {
        console.log(json);
				imgurAlbum = json.data.deletehash;
    })
    .catch(function (err) {
        console.error(err.message);
    });





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
	img_paths: Array,
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


apirouter.route('/test')

	.get(function(req, res) {
        Squid.find(function(err, squids) {
            if (err)
                res.send(err);

            for(var i=0;i<squids.length;i++){
              var imgurl = squids[i]["img_paths"][0];
              var imgCode = imgurl.slice(19, -4);

              imgur.getInfo(imgCode)
                .then(function(json, squids) {
                  // console.log(json)
                   console.log(squids[i]["img_paths"][0])
                   if(i== (squids.length - 1)){
                     res.send(squids);
                   }
              })
              .catch(function (err) {
                console.error(err.message);
              });
            }



        });

		apirouter.route('/new_squid')
		.post( multipartMiddleware, function(req, res, next) {
			var newerPath ;
			// imgur stuff
			imgur.setClientId('9ed2f79c3a04e08');
			imgur.uploadFile(req.files.file.path, imgurAlbum)
			    .then(function (json) {
			        console.log(json.data.link);
							var squid = new Squid({
								lat : req.body.latitude,
								long: req.body.longitude,
								img_paths: [json.data.link],
								});
								squid.save(function (err, data) {
								if (err) console.log(err);
								// else console.log('Saved : ', data );
								console.log(squid);
								fs.unlink(req.files.file.path);
								});
								res.send("success");

			    })
			    .catch(function (err) {
			        console.error(err.message);
			    });

				// fs.readFile(req.files.file.path, function (err, data) {
				// 	var nameString = "/public/pictures/"
				// 	nameString += req.files.file.name;
				// 	newerPath =  __dirname +  nameString;
				//
				//
				//
				// 	// var pic = data;
				// 	// var picData = data.toString("binary")
				// 	// var exifObj = piexif.load(picData);
				// 	//
				//
				// 	//  zeroth[piexif.ImageIFD.Orientation] = 2;
				// 	//  var newData = {"0th":zeroth, "Exif":exif, "GPS":gps};
				// 	//  var exifbytes = piexif.dump(newData);
				// 	//  var photos = piexif.insert(exifbytes, picData);
				// 	// var squidPic = new Buffer(photos, "binary");
				//
				//   fs.writeFile(newerPath, data, function (err) {
				// 		if(err){console.log(err)}
				//
				// 	});
				// });


			})

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
