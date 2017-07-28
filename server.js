var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
var ExpressPeerServer = require('peer').ExpressPeerServer;
var path = require('path');

/*peer server*/
var options = {
    debug: true
}

var port = process.env.PORT || 3000;
server.listen(port, () =>{
	console.log('app now listen on port : ',port)
})
app.use('/peerjs', ExpressPeerServer(server, options));

/*set static folder and route*/
app.use(express.static(path.join(__dirname,'client','public')));
app.get('/',(req,res) =>{
	res.sendFile(path.join(__dirname,'client','index.html'));
})

/*Make ID*/
var makeID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 9);
};
/*Socket io*/
var IDarr = [];
io.on('connection',function (socket) {
	// generate new peer ID
	socket.peerID = makeID();
	/*Event handler*/
	socket.emit('server-send-yourID',socket.peerID);
	IDarr.push(socket.peerID);
	socket.emit('server-send-idList',IDarr);
	socket.broadcast.emit('server-send-newID',socket.peerID);

	socket.on('disconnect',function(){
		console.log('missing connection with : ',socket.peerID);
		/*disconnect handler*/
		IDarr.splice(IDarr.indexOf(socket.peerID), 1);
		io.emit('server-send-newIdList',IDarr);
	})
})