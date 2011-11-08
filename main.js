var express = require('express');
var config = require('./config.js');
var app = module.exports = express.createServer();
var store = new (require('connect').session.MemoryStore)()
app.configure(function(){
    app.set('views', __dirname + '/view');
    app.set('view options', { layout : false, filename : __dirname + '/view/index.jade' });
    app.set('view engine', 'jade');
    app.use(express.static(__dirname + '/static'));
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(express.session({ store : store, secret: 'string', cookie: { httpOnly: false } }));
});
app.get('/:user_id/display', function(req, res){
    res.render('display.jade', {
        locals : { 
            user_id : req.params.user_id,
            config : config
        }
    });
});
app.get('/:user_id/controller', function(req, res){
    res.render('controller.jade', {
        locals : { 
            user_id : req.params.user_id,
            config : config
        }
    });
});
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
var reverse = function(type){ return type == 'display' ? 'controller' : 'display'; };
var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket){
    // name schema : "#{type}-#{id}"
    socket.on('change', function(message){
        socket.get('name', function(error, name){
            if(!error){
                var type = name.split('-')[0];
                var id = name.split('-')[1];
                io.sockets.in(reverse(type)+'-'+id).emit('change', message);
            }
        });
    });
    socket.on('enter', function(message){
        socket.get('name', function(error, name){
            if(!error){
                var type = name.split('-')[0];
                var id = name.split('-')[1];
                io.sockets.in(reverse(type)+'-'+id).emit('enter', message);
            }
        });
    });
    socket.on('join', function(message){
        if('type' in message && (message.type == 'controller' || message.type == 'display')){
            socket.join(message.type+'-'+message.id);
            socket.set('name', message.type+'-'+message.id, function(){
                socket.emit('message', 'success');
            });
        }
    });
    socket.on('disconnect', function(){});
});

