var net = require('net');
var argv = require('minimist')(process.argv.slice(2));

var port = argv.port === undefined ? 80 : argv.port; 
var host = 'localhost';
var id = 0;

var socket = new net.Socket();
var processTask = function(task) {
    let result = 1.0;
    for(let i = 0;  i < 100000000; i++) {
        result = task.a * task.b;
    }
    return result;
};

socket.on('data', function(data) {
    let json = JSON.parse(data);
    switch (json.message) {
        case 'task':
            var result = processTask(json);
            var done = {
                message: 'done',
                result: result
            }
            socket.write(JSON.stringify(done));
            break;
        case 'init':
            var ready = {
                message: 'ready'
            };
            socket.write(JSON.stringify(ready));
            break;
        default:
            console.log('unknown message:') + data;
    }
    console.log(json);
});

socket.on('close', function() {    
    console.log('Connection closed');
});

socket.on('error', function(error) {
    console.log(error);
});

socket.connect(port, host, function() {
    console.log('Connecting...')
});

