module.exports = {
    appName : 'Novistec Iot app',
    uart : '/dev/ttyS0',
	serverHost : '192.168.0.100',
	serverPort : 9090,
    baudRate : 115200,
	tloop : 30,
	tbd3s : [
				{tout:10, tbd3:'$Tbd3=83:100:1:100\n'},
				{tout:20, tbd3:'$Tbd3=83:100:1:100\n'},
				{tout:30, tbd3:'$Tbd3=83:100:1:100\n'},
			  ],
	channel : 32,
	wclk : 0,
	groupid : 4105,
	remoteHost : '1.234.53.16',
	remotePort : 20000,
	debug : true,
};
