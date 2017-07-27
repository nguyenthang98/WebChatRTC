var socket = io.connect('localhost:3000');
/*peer js*/

var makeID = function () {
  // Math.random should be unique because of its seeding algorithm.
  // Convert it to base 36 (numbers + letters), and grab the first 9 characters
  // after the decimal.
  return Math.random().toString(36).substr(2, 9);
};

socket.on('server-send-yourID',(id)=>{
	$('#MyID').html(id);
})

var myPeerID = makeID();
console.log('myPeerID: ',myPeerID);

var peer = new Peer(myPeerID/*$('#MyID').html()*/, {
	host: location.hostname,
	port: location.port || (location.protocol === 'https:' ? 443 : 80),
	path: '/peerjs'
})

/*var peer = new Peer($('#MyID').html(),{
	key: 'nuh31xwbve2buik9'
})*/

// console.log(peer);

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


const option = {audio: false, video: /*true*/{width: 300, height: 300}};
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