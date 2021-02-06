var readline = require('readline');
const r = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

r.setPrompt('> ');

r.on('line', (line) => {
 // console.log(`Received: ${line}`);
	if(line == 'exit')
	{
		r.close();
		return;
	}

	if(line != ''){

		startLoop();
		socket.emit("uartcmd", line);
	}else{
		r.prompt();
	}

	//
});

r.on('close', ()=>{
	console.log("Thank you!");
	socket.emit("uartstart", true);
	process.exit();
});

var loopIntervalID = -1;
var beforeTime = 0;
var limitTime = 7000;
var startTime = 0;
var currentTime = 0;
var buffText = "";
var buffer = "";

var socket = require('socket.io-client')('http://localhost:10001');
socket.on('connect', function(){
	console.log('device Conneted');
	socket.emit("uartstart", false);

	r.prompt();
});
socket.on('uartmsg', function(data){
	if(loopIntervalID != -1){
		beforeTime= Date.now();
		var prev = 0, next;
		// data = data.toString('utf8'); // assuming utf8 data...
		while ((next = data.indexOf('\n', prev)) > -1) {
			buffer += data.substring(prev, next);

			// do something with `buffer` here ...
			console.log(buffer);

			buffer = '';
			prev = next + 1;
		}
		buffer += data.substring(prev);
		//buffText += data;
	}
	//console.log(data)
});

function startLoop(){
	beforeTime= Date.now();
	startTime = beforeTime;
	currentTime= beforeTime;
	buffText = "";
	loopIntervalID = setInterval(function(){
		loop();
	}, 1000);  
}


function clearLoop(){
	clearInterval(loopIntervalID);
	loopIntervalID = -1;
}

function loop(){
	currentTime= Date.now();
	//아무응답이 없을 경우
	if(startTime == beforeTime){
		if(currentTime - beforeTime >= 2000){
			clearLoop();
			buffText = "";
			r.prompt();

			return;
		}
	}

	//응답이 있을경우 또는 계속적으로 응답이 올경우
	if(currentTime - beforeTime >= 2000 || currentTime - startTime > limitTime){
		clearLoop();
		
		//console.log("=======================");
		//console.log(buffText);
		//console.log("=======================");
		//buffText = "";
		r.prompt();
	}
}