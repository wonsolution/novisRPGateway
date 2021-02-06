fs = require('fs');

const filename =
    './data/AnyConMesh_071_v167_SLOPE_SUB Board_V5_2021.1.28 LTST.hex';

// 전체를 한번에 읽는 형태
function a() {
    fs.readFile(filename, 'utf8', function (err, data) {
        if (err) {
            return console.log(err);
        }
        console.log(data);
    });
}

// sync 형태로 읽기
function b() {
  
    try {
        const data = fs.readFileSync(filename, 'utf8');
        console.log(data);
    } catch (err) {
        console.error(err);
    }
}

// readline 을 이용한 형태
function c() {
    const readline = require('readline');

    const readInterface = readline.createInterface({
        input: fs.createReadStream(filename),
    //    output: process.stdout,    // 이걸 이용하면 stdout 에 바로 나오는 형태 
        console: false
    });
    
    // 호출하여 처리하는 형태 
    // 위에 output 을 설정하면 2번 나온다. 
    // 여기서도 호출되기 때문에
    readInterface.on('line', function(line) {
        console.log('-->',line);
    });
}


function d(){
    const lineReader = require('line-reader');

    //eachLine 을 이용한 형태
    lineReader.eachLine(filename,function(line){
        console.log('--->',line)
    })
    
    // open 을 이용한 형태
    // 다음 라인이 있을 경우를 처리하기 위해서 
    // window10 node14 에서는 동작하지 않는 함수 ==>  TypeError: Cannot read property 'hasNextLine' of undefined
    // lineReader.open(filename, function(reader) {
    //     if (reader.hasNextLine()) {
    //         reader.nextLine(function(line) {
    //             console.log(line);
    //         });
    //     }
    // });
}

function e(){

    const lineByLine = require('n-readlines');
    const liner = new lineByLine(filename);
    
    let line;
     
    // 출력이 Buffer 형태로 출력된다.
    // <Buffer 3a 31 30 39 37 46 30 30 30 37 34 30 32 30 30 32 30 37 34 33 36 30 30 30 30 37 45 39 34 30 30 30 38 30 31 32 43 30 33 31 41 43 35 0d>
    while (line = liner.next()) {
    
        // Buffer 출력
        console.log('--->',line);
    
        // 특정 영역 잘라서 출력 
        console.log('--->',line.slice(0,4));
    
        // :10985000EC041A60141A68041AA00C1A5C041A7C2E
        //console.log('--->',line.toString('utf-8'));
    }
       
}

function f(){
    var sleep = require('system-sleep');
    const gap = 10  // 1 sec 1000
    for (y = 0; y < 10; y++) {
        console.log(y);
        sleep(gap);
    }
}



