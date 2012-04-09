$('document').ready(function(){
	startGame();
	sendCommand("size");
	$('#message').html('getting size of board from server...');
});


var REFRESHTIMEOUT = 2500;

function startGame() {
	//i need to get the size
	
	var size = 0;
	var board = new Array();
	
	//a fallback if the size command isn't installed
	var boardCreated = false;
	setTimeout(function(){
		if (!boardCreated) {
			var sizePrompt = 'Your server has not provided a size for the board, so enter it below.\n'+
							'This will happen automatically if your size command responds with "size:<the size of the board>"\n'
			size = parseInt(prompt(sizePrompt));
			createNewBoard(size);
			startLookLoop();
		}
	},5000)
	
	var lastDig = null;
	var loopIntervalId = 0;
	
	var gameHandler = function(e) {
		var message = e.message;
		if (!message.valid) {
			return;
		}
		
		if (message.type == "silze") {
			
			size = message.board;
			createNewBoard(size);
			startLookLoop();
			
			
		} else if (message.type == "pcount") {
			updatePCount(message.board);
		} else if (message.boom) {
			handleBoom(lastDig);
		} else if (message.board != null) {
			updateBoard(message.board);
		}	
	};
	$('body').on('messageReceived',gameHandler);
	
	var createNewBoard = function(size) {
		///creates a size x size board of divs
		
		if (boardCreated) {
			return false;
		}
		
		var parent = $('#minesweeperDiv');
		var row;
		var square;
		for (i=0;i<size;i++) {
			row = document.createElement("div");
			$(row).addClass('row');
			for (j=0;j<size;j++) {
				square = document.createElement("div");
				$(square).addClass('square');
				square.coordString = j+" "+i;
				board.push(square);
				row.appendChild(square);
			}
			parent.append(row);
		}
		
		//the handlers!
		$('.square')
		.click(function(e) {
			lastDig = this;
			sendCommand("dig "+this.coordString);
		})
		.bind('contextmenu', function(e){
		    e.preventDefault();
			var targ = $(this);
			targ.toggleClass('flagged');
			if (targ.hasClass('flagged')) {
				sendCommand("flag "+this.coordString);
			} else {
				sendCommand("deflag "+this.coordString);
			}
		    return false;
		})
		.on('undug',function() {
			$(this)
			.removeClass('dug')
			.removeClass('bomb')
			.removeClass('flagged')
			.html('');
		})
		.on('dug',function(e,neighbors) {
			var numberHTML = "";
			if (neighbors > 0) {
				numberHTML = neighbors;
			}
			$(this)
			.removeClass('flagged')
			.removeClass('bomb')
			.addClass('dug')
			.html(numberHTML);
		})
		.on('flag',function() {
			$(this)
			.removeClass('dug')
			.removeClass('bomb')
			.addClass('flagged')
			.html('');
		})
		.on('bomb',function() {
			$(this)
			.addClass('bomb')
			.removeClass('flagged')
			.removeClass('dug');
		});
		
		boardCreated = true;
		
	}
	
	
	var startLookLoop = function() {
		if (loopIntervalId == 0) {
			loopFunc = function() {
				sendCommand("look");
				sendCommand("pcount");
			};
			loopFunc();
			loopIntervalId = setInterval(loopFunc,REFRESHTIMEOUT);
		}
	};
	
	var updateBoard = function(newboard) {
		
		var square;
		var inputSquare;
		
		for (i=0;i<board.length;i++) {
			square = board[i];
			input = newboard[i];
			
			if (input.match(/^dug/)) {
				$(square).trigger('dug',input.split(':')[1]);
			} else {
				$(square).trigger(input);
			}
			
		}
	};
	var handleBoom = function() { 
		$(lastDig)
		.addClass('exploded')
		.addClass('bomb')
		.addClass('dug');
		clearInterval(loopIntervalId);
		$('.square')
		.off('click')
		.unbind('contextmenu');
		
		$('#message')
		.addClass('error')
		.html('<b>BOOM YOU LOSE</b> (refresh to reconnect)');
	};
	
	var updatePCount = function(count) {
		$('#message').html(count + " players playing right now.");
	};
}