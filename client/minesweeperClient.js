
//define websocket_port
//remember to change this if you change the port
var websocket_port=4445;

$('document').ready(function() {
	//attach listener to command prompt
	$('#commandInput').keypress(function(e) {
		if (e.which == 13) {
			sendCommand(this.value);
		}
	});
	
	initConnection('localhost',websocket_port);
	window.sendCommand = sendCommand;	
});

function initConnection(host,port) {
	console.log(host);
	

	var socket = io.connect('http://'+host+':'+port);
	//socket.connect();
	
	
	socket.on('response',function(message) {
		console.log("about to recieve");
		
		var receiveEvent = $.Event("messageReceived");
		receiveEvent.message = message;
		$('body').trigger(receiveEvent);
		
		writeOutput("Received:\n"+message.rawMessage);
	});
	
	$('body').on('sendMessage',function(e) {
		console.log('about to send');
		socket.emit('message',e.message);
	});
	
}


function sendCommand(string) {
	writeOutput('Sending:\n\t'+string);
	var sendEvent = $.Event('sendMessage');
	sendEvent.message = string;
	$('body').trigger(sendEvent);
}



function writeOutput(string) {
	$('#outputtextarea').prepend(string+"<br>");
}