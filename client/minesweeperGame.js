$('document').ready(function(){
	startGame();
	sendCommand("size");
});


var REFRESHTIMEOUT = 2500;

function startGame() {
	//i need to get the size
	
	var size = 0;
	var board = new Array();
	
	var lastDig = null;
	var loopIntervalId;
	
	var gameHandler = function(e) {
		console.log(e.message.type);
		var message = e.message;
		if (!message.valid) {
			return;
		}
		
		if (message.type == "size") {
			
			size = message.board;
			createNewBoard(size);
			loopIntervalId = startLookLoop();
			
			
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
		var parent = $('#minesweeperDiv');
		var row;
		var square;
		console.log(size+"{}");
		for (i=0;i<size;i++) {
			row = document.createElement("div");
			$(row).addClass('row');
			for (j=0;j<size;j++) {
				square = document.createElement("div");
				$(square).addClass('square');
				$(square).addClass('undug');
				square.coordString = j+" "+i;
				board.push(square);
				row.appendChild(square);
			}
			console.log(parent);
			parent.append(row);
			console.log(row);
		}
		
		//the handlers!
		$('.square')
		.click(function(e) {
			lastDig = this;
			console.log("digging "+this.coordString);
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
			.html();
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
			.html();
		})
		.on('bomb',function() {
			$(this)
			.addClass('bomb')
			.removeClass('flagged');
		});
		
	}
	
	
	var startLookLoop = function() {
		loopFunc = function() {
			sendCommand("look");
			sendCommand("pcount");
		};
		loopFunc();
		return setInterval(loopFunc,REFRESHTIMEOUT);
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
				console.log("triggering " +input)
				$(square).trigger(input);
			}
			
		}
	};
	var handleBoom = function() { 
		$(lastDig)
		.addClass('exploded')
		.addClass('bomb');
		clearInterval(loopIntervalId);
		$('.square')
		.off('click')
		.unbind('contextmenu');
		
		$('#message')
		.addClass('error')
		.html('BOOM YOU LOSE');
	};
	
	var updatePCount = function(count) {
		$('#message').html(count + " players playing right now.");
	};
}