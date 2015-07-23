// vars
var port = 6969;

//  reqs
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var bodyParser = require("body-parser");
var app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

//Server
var server = http.createServer(app);



server.listen(port, function(){
	console.log('Listening on port ' + port);
});

//Serving Static Files
app.use(express.static(__dirname + '/public'));

//Mongo Intialization

mongoose.connect('mongodb://localhost/squidMaps');
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

//Test DB Object
var squid = new Squid({
lat : 37.805375,
long: -122.420868,
img_paths: [ '/squid1.jpg', '/squid2.jpg' ]
});

 //Save DB Object
squid.save(function (err, data) {
if (err) console.log(err);
else console.log('Saved : ', data );
});

// API

var router = express.Router();              // get an instance of the express Router

// middleware to use for all requests
router.use(function(req, res, next) {
    // do logging
    console.log('Something is happening.');


    next(); // make sure we go to the next routes and don't stop here
});

// test route to make sure everything is working (accessed at GET http://localhost:8080/api)
router.get('/', function(req, res) {
    res.json({ message: 'hooray! welcome to our api!' });
});
router.route('/test')

	.get(function(req, res) {
        Squid.find(function(err, squids) {
            if (err)
                res.send(err);
            res.json(squids);
        });

		router.route('/new_squid')
		.post(function(req, res, next) {
			console.log(req.body)
			})

	});

// more routes for our API will happen here

// REGISTER OUR ROUTES -------------------------------
// all of our routes will be prefixed with /api
app.use('/api', router);
