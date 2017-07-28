var ConnectPromise = new Promise(function (resolve, reject) {
	var socket = io.connect(location.hostname+":"+location.port);
	socket.on('server-send-yourID',(id)=>{
		if(id){
			resolve({
				id : id,
				socket : socket
			});
		}else{
			reject({
				message : 'no ID recieved'
			})
		}
	})
	socket.on('server-send-idList',(ids)=>{
		ids.forEach((id)=>{
			$('#userOnline').append("<div class='well well-sm'>"+id+"</div>");
		})
	})
})
/*peer js*/
var myPeerID;
/*socket.on('server-send-yourID',(id)=>{
	$('#MyID').html(id);
	myPeerID = id;
})

var peer = new Peer(myPeerID, {
	host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
})*/

ConnectPromise.then((connect)=>{
	var id = connect.id;
	var socket = connect.socket;
	$('#MyID').html(id);
	myPeerID = id;

	var peer = new Peer(myPeerID, {
		/*host: location.hostname,
		port: location.port || (location.protocol === 'https:' ? 443 : 80),
		path: '/peerjs'*/
		key: 'nuh31xwbve2buik9'
	});
	handleSocketConnection(socket);
	handlePeerConnection(peer);
}).catch((err) =>{
	console.log(err.message);
})

/*var peer = new Peer($('#MyID').html(),{
	key: 'nuh31xwbve2buik9'
})*/
var handleSocketConnection = function (socket) {
	socket.on('server-send-idList',(ids)=>{
		ids.forEach((id)=>{
			$('#userOnline').append("<div class='well well-sm'>"+id+"</div>");
		})
	})
	socket.on('server-send-newID',(id)=>{
		$('#userOnline').append("<div class='well well-sm'>"+id+"</div>");
	})
	socket.on('server-send-newIdList',(ids) =>{
		$('#userOnline').empty();
		ids.forEach((id)=>{
			$('#userOnline').append("<div class='well well-sm'>"+id+"</div>");
		})
	})
};

const option = {audio: false, video: true};
var openStream = function () {
	return navigator.mediaDevices.getUserMedia(option);
}
var playStream = function (videoEleID,stream) {
	var video = document.getElementById(videoEleID);
	video.srcObject = stream;
	video.onloadedmetadata = function (e) {
		video.play();
	}
}

/*openStream()
	.then( stream=>{
		playStream('local-video',stream);
	})
	.catch( err =>{
		console.log(err);
	})*/
var handlePeerConnection = function (peer) {
	$('#call').click((event)=>{
		if($('#peer').val()){
			/**/
			var peerID = $('#peer').val();
			$('#PeerID').html($('#peer').val());
			$('#error').addClass('hidden');
			console.log(peerID);
			/*get MediaStream*/
			openStream()
				.then( function(stream){
					playStream('local-video',stream);
					var call = peer.call(peerID, stream);
					//console.log(call);
					call.on('stream', function(remoteStream) {
						// Show stream in some video/canvas element.
						playStream('peer-video',remoteStream);
					});
				})
				.catch( err =>{
					console.log(err);
				})
		}else{
			$('#error').removeClass('hidden');
		}
	});

	peer.on('call', function(call){
		//console.log(call.peer);
		$('#PeerID').html(call.peer);
		openStream()
			.then( stream =>{
				playStream('local-video',stream);
				call.answer(stream); // Answer the call with an A/V stream.
				call.on('stream', function(remoteStream) {
					// Show stream in some video/canvas element.
					playStream('peer-video',remoteStream);
				});
			})
			.catch( err =>{
				console.log(err);
			})
	})
}
