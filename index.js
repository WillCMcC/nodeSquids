// vars
var port = 6969;

//  reqs
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var app = express();

//Server
var server = http.createServer(app);



server.listen(port, function(){
	console.log('Listening on port ' + port);
});

//Serving Static Files
app.use(express.static(__dirname + '/public'));

//Mongo Intialization

mongoose.connect('mongodb://localhost/firstCup');
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
// app.get('/test', function(request, response){
// 	var squids = Squid.find();
// 	console.log(squids);
// })
