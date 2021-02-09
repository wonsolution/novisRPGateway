
var SerialPort = require('serialport')
const PORT = '/dev/ttyS0'
const BAUDRATE = 115200

var serialport = new SerialPort(PORT,{baudRate:BAUDRATE})


serialport.on('open', function() {
    console.log("open ",serialport.isOpen);

});


serialport.on('data', function (data) {
    console.log(" receive ",data);
    console.log('receive',data.toString('utf-8'));
});


serialport.on('error', function (msg) {
    console.log(" Error ",msg.message);
    process.exit()
    
});

serialport.on('close', function () {
    console.log(" Close ");
});
