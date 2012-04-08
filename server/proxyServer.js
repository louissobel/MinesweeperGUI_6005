/* This will use socket.io 
 * It will simply pass json messages recieved from socket
 * To the minesweeper server
 * it will parse responsed, and return a json response (with the board hopefully)
 */





var args = process.argv.splice(2);

if (args.length != 2) {
	console.log("Must recieve two argumnets: <SERVEPORT> <MINESWEEPERPORT>")
}
var MINESWEEPERPORT = parseInt(args[1]);
var SERVEPORT = parseInt(args[0]);

var net = require('net');


var io = require('socket.io').listen(SERVEPORT);
var fs = require('fs');

io.set('log level',1);
io.sockets.on('connection',function(socket) {
	
	console.log('[websocket] new connection');
	var minesweeperClient = net.connect(MINESWEEPERPORT); //localhost by default
	
	
	minesweeperClient.on('data',function(response) {


		outJson = interpretMinesweeperResponse(response)
		socket.emit('response',outJson);
		if (outJson.boom) {
			socket.disconnect('boom');
		}

	});
	
	socket.on('message',function(message) {
		
		var minesweeperString = message + '\n';
		minesweeperClient.write(minesweeperString);
		
	});
	
	socket.on('disconnect',function() {
		console.log("[websocket] connection closed")
		minesweeperClient.write('bye\n');
	});
	
});


function interpretMinesweeperResponse(response) {
	//boom
	//the board
	//valid
	
	var response = response.toString();
	
	var type=null;
	var outObject = new Object();
	
	if (response.match(/^(size|pcount):\d+/)) {
		var commandVal = response.split(':');
		var responseInt = parseInt(commandVal[1]);
		type=commandVal[0];
		outObject = {boom:false,board:responseInt,valid:true};
	} else if (response.match(/^Invalid/)) {
		outObject = {boom:false,board:null,valid:false};
	} else if (response.match(/^BOOM/)) {
		outObject = {boom:true,board:null,valid:true};
	} else if (response.match(/^Welcome/)) {
		outObject = {boom:false,board:null,valid:true};
	} else {
		
		var outArray = new Array();
		
		var lines = response.split('\n');
		for (var lineIndex in lines) {
			var line = lines[lineIndex];
			
			for (i = 0; i<line.length; i+=2) {
				var theChar = line.charAt(i);
				var theOut = null;
				if (theChar == '-') {
					theOut = 'undug';
				} else if (theChar == 'F') {
					theOut = 'flag';
				} else if (theChar == 'o') {
					theOut = 'bomb';
				} else if (theChar == ' ') {
					theOut = 'dug:0';
				} else if (theChar.match(/\d/)) {
					theOut = 'dug:'+theChar;
				}
				outArray.push(theOut);
			}
		}
		type="board";
		outObject = {boom:false,board:outArray,valid:true};
	}
	
	outObject.rawMessage = response;
	outObject.type = type;
	return outObject;

}
