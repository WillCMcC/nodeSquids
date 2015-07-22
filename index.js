// vars
var port = 6969;
	
//  reqs
var http = require("http");
var express = require("express");
var mongoose = require("mongoose");
var app = express();

//Server
var server = http.createServer(app);

app.get('/bro', function(request, response){
	console.log(request.url);
})

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
var userSchema = new Schema({
	name : String,
});

// Schema to DB Model
var User = mongoose.model('User', userSchema);

//Test DB Object
var squid = new User({
name : 'Squad',
});
 
 //Save DB Object
squid.save(function (err, data) {
if (err) console.log(err);
else console.log('Saved : ', data );
});








