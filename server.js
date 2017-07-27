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

/*Socket io*/
var IDarr = [];
io.on('connection',function (socket) {
	// console.log('has connection with : ',socket.id);
	/*Event handler*/
	socket.emit('server-send-yourID',socket.id);
	IDarr.push(socket.id);
	socket.emit('server-send-idList',IDarr);
	socket.broadcast.emit('server-send-newID',socket.id);

	socket.on('disconnect',function(){
		//console.log('missing connection with : ',socket.id);
		/*disconnect handler*/
		IDarr.splice(IDarr.indexOf(socket.id), 1);
		io.emit('server-send-newIdList',IDarr);
	})
})