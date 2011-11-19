var cds = {};
$(function(){
    // controller
    var log = function(message){ $('#log').text(message) };
    cds.user_id = $('#user_id').text();
    cds.host = $('#host').text();
    cds.enter = ['root', 'video'];
    cds.context = { sound : 0, video : 0, time : 0 };
    // socket
    var socket = io.connect(cds.host);
    socket.emit('join', { type : 'controller', id : cds.user_id });
    socket.on('message', function(message){ log(message); });
    socket.on('change', function(message){
        context_dial.set_value(message.key, message.value);
    });
    // context-dial
    $('#content').append('<canvas id="canvas" width="640" height="640" />');
    var en_options = { x : 0, y : 0, radius : 80, type : 'fill' };
    var context_dial = $('#canvas').context_dial({ x : 320, y : 320, color : '#556b2f', radius : 320, type : 'fill' });
    var en_options = { x : 0, y : 0, radius : 80, type : 'fill', color : '#bdb76b' };
    context_dial.add('sound', { max : 100, min : 0, value_by_rot : 50, en : en_options });
    context_dial.add('time', { max : 100, min : 0, value_by_rot : 50, en : en_options });
    context_dial.add('video', { max : 100, min : 0, value_by_rot : 50, en : en_options });
    context_dial.set_image('sound', { url : '/image/sound.png', width : 80, height : 80 });
    context_dial.set_image('time', { url : '/image/media-player.png', width : 80, height : 80 });
    context_dial.set_image('video', { url : '/image/videos.png', width : 80, height : 80 });
    context_dial.on('change', function(context){
        if(context.key in cds.context || Math.abs(cds.context[context.key] - context.value) < 1) return;
        cds.context[context.key] = context.value;
        socket.emit('change', { key : context.key, value : parseInt(context.value) });
    });
    context_dial.on('touchend', function(context){
        if(cds.enter.indexOf(context.key) < 0) return;
        socket.emit('enter', { key : context.key, value : 1 });
    });
    // dom
    $('body').append('<p><div id="log" /></p>');
});
