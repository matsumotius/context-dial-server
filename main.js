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
    app.dynamicHelpers({ config : config });
    app.use(express.session({ store : store, secret: 'string', cookie: { httpOnly: false } }));
});
app.get('/:user_id/display', function(req, res){
    res.render('display.jade', {
        locals : { 
            user_id : req.params.user_id
        }
    });
});
app.get('/:user_id/controller', function(req, res){
    res.render('controller.jade', {
        locals : { 
            user_id : req.params.user_id
        }
    });
});
app.post('/:user_id/change', function(req, res){
    io.sockets.in('display-'+req.params.user_id).emit('change', { key : 'link', value : 1 }); 
    res.send('send<br>');
});
app.listen(3000);
console.log("Express server listening on port %d", app.address().port);
var socket_types = ['controller', 'video', 'extension'];
var io = require('socket.io').listen(app);
io.sockets.on('connection', function (socket){
    // name schema : "#{type}-#{id}"
    socket.on('change', function(message){
        socket.get('name', function(error, name){
            if(!error){
                var type = message.to;
                var id = name.split('-')[1];
                io.sockets.in(type+'-'+id).emit('change', message);
            }
        });
    });
    socket.on('replace', function(message){
        socket.get('name', function(error, name){
            if(!error){
                var type = message.to;
                var id = name.split('-')[1];
                io.sockets.in(type+'-'+id).emit('replace', message);
            }
        });
    });
    socket.on('enter', function(message){
        socket.get('name', function(error, name){
            if(!error){
                var type = message.to;
                var id = name.split('-')[1];
                io.sockets.in(type+'-'+id).emit('enter', message);
            }
        });
    });
    socket.on('join', function(message){
        if('type' in message && socket_types.indexOf(message.type) > -1){
            socket.join(message.type+'-'+message.id);
            socket.set('name', message.type+'-'+message.id, function(){
                if(message.type == 'controller'){
                    io.sockets.in('extension-'+message.id).emit('join');
                    io.sockets.in('video-'+message.id).emit('join');
                } else {
                    io.sockets.in('controller-'+message.id).emit('join');
                }
            });
        }
    });
    socket.on('disconnect', function(){});
});

