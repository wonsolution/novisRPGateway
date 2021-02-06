//상수 받아오기
var constants = require('./constants');
//기본 모듈 정의하기
var SerialPort = require("serialport"); 
var reconnect= require('./bnwReConnectSock');
var Parser = require('binary-parser').Parser;
var loopIntervalID = 0;
//로컬타임 설정
var moment = require('moment');
require('moment-timezone');
moment.tz.setDefault("Asia/Seoul");

//글러벌 변수 선언
var receiveBuffer = new Buffer.alloc(2048);
var offset = 0;
var isConnectServer = false;
var loopView = false;
var isPosition = false;
var port = null;
var loopCnt = 0;

//client 정의 
var client = new reconnect({port: constants.serverPort, host:constants.serverHost, reconnectInterval: 10000});

client.on('connect', () => {
	console.log('Client - Connection to Server OK !');
		isConnectServer = true;
});

client.on('reconnect', () => {
	console.log('Client -  Connection to Server Reconnected.');
	isConnectServer = false;
})

client.on('data', (data) => {
	if(port.isOpen){
			//port.write('$Wblkp=1\n');
			port.write(data);
			//port.write('$Wblkp=0\n');
	}

});

client.on('close', () => {
	console.log('Client - Client Disconnected / Not able to connect to broker !');
	isConnectServer = false;
});

client.on('error', (err) => {
	console.log('Client - Connection to Broker Not Ok - ${err}!')

});

function requireUncached(module){
    delete require.cache[require.resolve(module)]
    return require(module)
}


var connectPort = function() {
	
	SerialPort = requireUncached("serialport");
	port =  new SerialPort(constants.uart, { baudRate: constants.baudRate });
 
	port.on('data', function (data) {
		//console.log('Data: ' + data.toString('hex'));
		if(loopIntervalID == -1){
			io.emit("uartmsg", data.toString());
			socketP2P.emit("uartmsg", data.toString());
		}else{
			receivePacket(data);
		}
	});

	port.on('open', function() {
		console.log("isOpen Start",port.isOpen);
		port.write('$Wgid=1:'+constants.channel+'\n');
		port.write('$Wflash=\n');
	});

	port.on('close', function(err) {
		console.log("close",err);
		reconnectPort();
	})

	port.on('error', function(err) {
		console.log("error",err);
		reconnectPort();
	})

}

var reconnectPort = function () {
	//console.log('INITIATING RECONNECT');
	setTimeout(function(){
		console.log('RECONNECTING TO UART');
		connectPort();
	}, 2000);
};

function init(){
	connectPort();
	createLoop();
	createWClockLoop();
}

function loop(){
	loopCnt++;
	if(loopCnt >  constants.tloop){
		loopCnt = 0;
	}
	if(port == null)
		return;

	if(port.isOpen){
		var tbdlen = constants.tbd3s.length;
		for(var i = 0; i < tbdlen; i++){
			if(constants.tbd3s[i].tout > 0 && constants.tbd3s[i].tout == loopCnt){	
				port.write(constants.tbd3s[i].tbd3);
				console.log('port write', constants.tbd3s[i].tout, constants.tbd3s[i].tbd3);
			}
		}

	}
}



function loopClock(){
        if(port == null){
                return;
        }

        if(port.isOpen){
                var nowtime = moment(new Date()).format('YYYYMMDDhhmmss');
                //console.log(nowtime);
                var cmdClock = '%Wclk=' + nowtime + '\n';
                //console.log(cmdClock);
                port.write(cmdClock);
        }
}

function createWClockLoop(){
        if(constants.wclk > 0){
                setInterval(function(){
                        loopClock();
                }, constants.wclk * 1000);
        }
}



function createLoop(){
	loopCnt = 0;
	 if(constants.tloop > 0){
		loopIntervalID = setInterval(function(){
			loop();
		},  1000);  
	 }
}

function clearLoop(){
	clearInterval(loopIntervalID);
	loopIntervalID = -1;
}


function receivePacket(data){
	if(data){
		data.copy(receiveBuffer,offset);
		offset += data.length;
	}
	try{
		if(offset > 1){
			var headerInt = receiveBuffer.readInt16BE(0);
			if(headerInt != 21930){
				if(data){
					console.log("error", data.toString('hex'));
				}else{
					console.log("error");
				}
				offset = 0;
				receiveBuffer.fill(0);
				return;
			}
		}

		var checkHeader = isHeader.parse(receiveBuffer);
		//console.log(checkHeader);
		if(checkHeader.start == 21930 ){
			var datalen = checkHeader.packetLength + 10;
			if(offset >=datalen){
				var curBuffer = new Buffer.alloc(datalen);
				receiveBuffer.copy(curBuffer);
				
				if(loopView){
					io.emit("uartmsg", curBuffer.toString('hex') + "\n");
					socketP2P.emit("uartmsg", curBuffer.toString('hex') + "\n");
				}
		
				if(isConnectServer){
					
					if(checkSum(curBuffer)){
						client.write(curBuffer,'binary');
						console.log("data", curBuffer.toString('hex') );
					}else{
						console.log("data", "checksum error" );
					}

				}
				
				receiveBuffer.copy(receiveBuffer,0, datalen)
				offset -= datalen;

				if(offset >  10){
					receivePacket(null);
				}
			}
		}
	}catch (err) {
		console.log(err);
	} //tr
}

var checkSum = function(datas){
	var last = datas.length -1;
	var sum = 0;
	for(var i=0;i < datas.length;i++){
		if(i < last){
			sum += datas[i];
		}
	}

	var check = 0xFF - (sum & 0xFF);
	return check == datas[last];
	
}

const io = require('socket.io')();
const socketAsPromised = require('socket.io-as-promised');

io.attach(10001);
io.origins(['localhost:*', '127.0.0.1:*','smartplug.idea9.co.kr:*', '*:*']);
io.use(socketAsPromised());

io.on('connection', socket => {
	console.log('connection');

	socket.on('uartcmd', async (cmd) =>{
		console.log('uartcmd', cmd);
		if(loopIntervalID == -1){
			if(port.isOpen){
				port.write( cmd + "\n");
			}else{
				
			}
		}
	});

	socket.on('uartstart', async (flag) =>{
		console.log('uartcmd', flag);
		if(flag){
			clearLoop();
			createLoop();
		}else{
			clearLoop();
		}
	});

	socket.on('uartloop', async (flag) =>{
		console.log('uartloop', flag);
		if(flag){
			clearLoop();
			createLoop();
			loopView = true;
		}else{
			clearLoop();
			loopView = false;
		}
	});

	socket.on('uartstate', async () =>{
		console.log('uartstate');
		if(loopIntervalID == -1){
			var obj = getConstantsObject();
			socket.emit("uartconfig",obj);
		}
	});

	socket.on('restart', async () =>{
		console.log('restart');
		socket.emit("msgsuccess");
		process.exit();
	});

	socket.on('uartsave', async (obj) =>{
		console.log('uartsave');

		var fs = require('fs');

		var lineReader = require('readline').createInterface({
		  input: require('fs').createReadStream('constants.js')
		});

		var data = "";
		lineReader.on('line', function (line) {
			data += parseConstantsLine(line, obj);
		  //console.log('Line from file:', line);
		 
		})
		.on('close', function(){
			lineReader.close();
			 console.log(data);
			fs.writeFileSync('constants.js', data);
		
			constants = requireUncached("./constants");
			socket.emit("msgsuccess");
			
		});
	
	});

});




var isHeader = new Parser()
		.uint16('start')
		.uint32('scpid')
		.uint8('pid')
		.uint8('sid')
		.uint8('packetLength')

var tcpHeader = new Parser()
    .uint16('start')
    .uint32('scpid')
    .uint8('pid')
    .uint8('sid')
    .uint8('packetLength')
    .array('src', {
        type: 'uint8',
        length: 'packetLength'
    })
   .uint8('checksum')



var socketP2P = require('socket.io-client')('http://'+constants.remoteHost+':' + constants.remotePort);
socketP2P.on('connect', function(){
	socketP2P.emit('createroom', constants.groupid);
	console.log('connect');
});
socketP2P.on('uartcmd', async (cmd) =>{
	console.log('uartcmd', cmd);
	if(loopIntervalID == -1){
		if(port.isOpen){
			port.write( cmd + "\n");
		}else{
			
		}
	}
});

socketP2P.on('uartstart', async (flag) =>{
	console.log('uartcmd', flag);
	if(flag){
		clearLoop();
		createLoop();
	}else{
		clearLoop();
	}
});

socketP2P.on('uartloop', async (flag) =>{
	console.log('uartloop', flag);
	if(flag){
		clearLoop();
		createLoop();
		loopView = true;
	}else{
		clearLoop();
		loopView = false;
	}
});

socketP2P.on('uartstate', async () =>{
	console.log('uartstate');
	if(loopIntervalID == -1){
		var obj = getConstantsObject();
		socketP2P.emit("uartconfig",obj);
	}
});

socketP2P.on('restart', async () =>{
	console.log('restart');
	socketP2P.emit("msgsuccess");
	process.exit();
});

socketP2P.on('uartsave', async (obj) =>{
	console.log('uartsave');

	var fs = require('fs');

	var lineReader = require('readline').createInterface({
	  input: require('fs').createReadStream('constants.js')
	});

	var data = "";
	lineReader.on('line', function (line) {
		data += parseConstantsLine(line,obj);
	})
	.on('close', function(){
		lineReader.close();
		 console.log(data);
		fs.writeFileSync('constants.js', data);
	
		constants = requireUncached("./constants");
		socketP2P.emit("msgsuccess");
		
	});

});

function getConstantsObject(){
	 constants = requireUncached("./constants");
	var obj ={};
	obj.serverHost = constants.serverHost;
	obj.serverPort = constants.serverPort;
	obj.tout = constants.tout;
	obj.tbd3 = constants.tbd3;
	obj.wclk = constants.wclk;
	obj.groupid = constants.groupid;
	obj.remoteHost = constants.remoteHost;
	obj.remotePort = constants.remotePort;
	obj.debug = constants.debug;

	return obj;
}

function parseConstantsLine(line,obj){
	if(line.indexOf('tout') > -1){	
			return "\ttout : " + obj.tout + ",\n";

		}else if(line.indexOf('tbd3') > -1){	
			return "\ttbd3 : '" + obj.tbd3 + "\\n',\n";

		}else if(line.indexOf('serverHost') > -1){	
			return "\tserverHost : '" + obj.serverHost + "',\n";

		}else if(line.indexOf('serverPort') > -1){	
			return "\tserverPort : " + obj.serverPort + ",\n";

		}else if(line.indexOf('remoteHost') > -1){	
			return "\tremoteHost : '" + obj.remoteHost + "',\n";

		}else if(line.indexOf('remotePort') > -1){	
			return "\tremotePort : " + obj.remotePort + ",\n";

		}else if(line.indexOf('wclk') > -1){	
			return "\twclk : " + obj.wclk + ",\n";

		}else if(line.indexOf('debug') > -1){	
			return "\tdebug : " + obj.debug + ",\n";

		}else if(line.indexOf('groupid') > -1){	
			return "\tgroupid : " + obj.groupid + ",\n";

		}

		return line + '\n';		
}

init();
