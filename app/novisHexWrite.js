fs = require('fs');

var sleep = require('system-sleep');
const gap = 10;

const lineByLine = require('n-readlines');

const filename = '../data/AnyConMesh_071_v167_SLOPE_SUB Board_V5_2021.1.28 LTST.hex';


const liner = new lineByLine(filename);
let line;

// 출력이 Buffer 형태로 출력된다.
// <Buffer 3a 31 30 39 37 46 30 30 30 37 34 30 32 30 30 32 30 37 34 33 36 30 30 30 30 37 45 39 34 30 30 30 38 30 31 32 43 30 33 31 41 43 35 0d>
while ((line = liner.next())) {
    // Buffer 출력
    console.log('--->', line);
    sleep(gap);
}
