var net = require('net'); 
var argv = require('minimist')(process.argv.slice(2));

var port = argv.port === undefined ? 80 : argv.port; 
var nextId = 0;

var clients = [];

var getClientIndex = function(id) {
    let len = clients.length;
    for (let i=0; i < len; i++) {
        if (clients[i].id == id) {
            return i;
        }
    }
    return -1;
};

var getClient = function(id) {
    let index = getClientIndex(id);
    if (index == -1) { return undefined; }
    return clients[index];
}

var produceTask = function(id) {
    return {
        message: 'task',
        id: id,
        a: Math.random(),
        b: Math.random()     
    }; 
};

var connect = function(socket) {
    
    // create a new client
    let id = ++nextId;
    console.log('Client ' + id +  ' connected'); 
    clients.push({
        id: id,
        socket: socket
    });
    
    socket.on('data', function(data) {
        let json = JSON.parse(data);
        switch (json.message) {
            case 'done':
                var task = produceTask(id);
                socket.write(JSON.stringify(task)); 
                break;
            case 'ready':
                var task = produceTask(id);
                socket.write(JSON.stringify(task)); 
                break;
            default:
                console.log('unknown message' + data);
        }
        console.log(json);
    });
    
    socket.on('error', function(error) {
       console.log(error); 
    });
    
    socket.on('close', function() {
        let index = getClientIndex(id); 
        console.log('Closing ' + id);
        clients.splice(index, 1);
    });
    
    var init = {
        message: "init",
        data: "someglobaldata"
    }
    socket.write(JSON.stringify(init));
    
};

var server = net.createServer(connect);
server.on('error', function(error) {
    console.log(error);
}); 

console.log('Starting Master Server');
console.log('Port: ' + port); 

server.listen(port);

console.log('Server listening');