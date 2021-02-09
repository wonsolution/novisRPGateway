fs = require('fs');
var sleep = require('system-sleep');
var gap = 100;
const lineByLine = require('n-readlines');
//var filename = '../data/AnyConMesh_071_v167_SLOPE_SUB Board_V5_2021.1.28 LTST.hex';

var myArgs = process.argv.slice(2);
console.log('myArgs: ', myArgs);

var SerialPort = require('serialport')
const PORT = '/dev/ttyS0'
const BAUDRATE = 115200

var serialport = new SerialPort(PORT,{baudRate:BAUDRATE})


serialport.on('open', function() {
    //console.log("open ",serialport.isOpen);

    //console.log(myArgs)
    if(myArgs.length<1)
    {
        console.log('----------------------')
        console.log('HOW TO USE')
        console.log('node novisHexWrite.js filename addr interval')
        console.log('ex) node novisHexWrite.js /home/pi/abc.hex 1234 1000')
        console.log('=> file /home/pi/abc.hex send to target address 1234 by 1 second interval ')
        console.log('----------------------')
        process.exit()
    }
    else if(myArgs.length === 3)
    {
        const filename = myArgs[0]
        const addr = myArgs[1]
        const interval = Number(myArgs[2])

        writeHex(filename,addr,interval)
    }
    
});


serialport.on('data', function (data) {
    console.log(" receive ",data);
    console.log('receive',data.toString('utf-8'));
});


//$OTA=1234:106510000AA90490FEF758F90128BED184A1FAF720\n
function writeHex(filename,addr,interval)
{
    console.log('------> start writeHex <-------------')
    const liner = new lineByLine(filename);
    let line;

    // 출력이 Buffer 형태로 출력된다.
    // <Buffer 3a 31 30 39 37 46 30 30 30 37 34 30 32 30 30 32 30 37 34 33 36 30 30 30 30 37 45 39 34 30 30 30 38 30 31 32 43 30 33 31 41 43 35 0d>
    while ((line = liner.next())) {
        // Buffer 출력
        //console.log('--->', line);
        //console.log('--->',line.toString('utf-8'));

        const msg = '$OTA='+addr+line.toString('utf-8')+'\n'
        console.log('--->',msg);
        sleep(interval);
    }
    console.log('end programe bye bye')
    process.exit();
}


