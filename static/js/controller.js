var cds = {};
$(function(){
    // controller
    var log = function(message){ $('#log').text(message) };
    cds.user_id = $('#user_id').text();
    cds.host = $('#host').text();
    cds.enter = ['root', 'video'];
    cds.mode = 'extension';
    cds.context = { sound : 0, video : 0, time : 0, link : 0, scroll : 0 };
    // socket
    var socket = io.connect(cds.host);
    socket.emit('join', { type : 'controller', id : cds.user_id });
    socket.on('message', function(message){ log(message); });
    socket.on('change', function(message){
        context_dial.set_value(message.key, message.value);
    });
    socket.on('replace', function(message){
        if(message.value == 'video'){
            cds.mode = 'video';
            context_dial.remove('link');
            context_dial.remove('scroll');
            context_dial.remove('history');
            context_dial.add('sound', { max : 100, min : 0, value_by_rot : 50, en : en_options });
            context_dial.add('time', { max : 100, min : 0, value_by_rot : 50, en : en_options });
            context_dial.add('video', { max : 100, min : 0, value_by_rot : 50, en : en_options });
            context_dial.set_image('sound', { url : '/image/sound.png', width : 80, height : 80 });
            context_dial.set_image('time', { url : '/image/media-player.png', width : 80, height : 80 });
            context_dial.set_image('video', { url : '/image/videos.png', width : 80, height : 80 });
        } else {
            cds.mode = 'extension';
            context_dial.remove('sound');
            context_dial.remove('time');
            context_dial.remove('video');
            context_dial.add('link', { max : 9999, min : 0, value_by_rot : 50, en : en_options });
            context_dial.add('scroll', { max : 9999, min : 0, value_by_rot : 50, en : en_options });
            context_dial.add('history', { max : 100, min : -100, value_by_rot : 25, en : en_options });
            context_dial.set_image('link', { url : '/image/internet.png', width : 80, height : 80 });
            context_dial.set_image('scroll', { url : '/image/scroll.png', width : 80, height : 80 });
            context_dial.set_image('history', { url : '/image/media-player.png', width : 80, height : 80 });
        }
    });
    // context-dial
    $('#content').append('<canvas id="canvas" width="640" height="640" />');
    var en_options = { x : 0, y : 0, radius : 80, type : 'fill' };
    var context_dial = $('#canvas').context_dial({ x : 320, y : 320, color : '#333333', radius : 320, type : 'fill' });
    var en_options = { x : 0, y : 0, radius : 80, type : 'fill', color : '#ff8c00' };
    context_dial.add('link', { max : 9999, min : 0, value_by_rot : 50, en : en_options });
    context_dial.add('scroll', { max : 9999, min : 0, value_by_rot : 50, en : en_options });
    context_dial.add('history', { max : 100, min : -100, value_by_rot : 25, en : en_options });
    context_dial.set_image('link', { url : '/image/internet.png', width : 80, height : 80 });
    context_dial.set_image('scroll', { url : '/image/scroll.png', width : 80, height : 80 });
    context_dial.set_image('history', { url : '/image/media-player.png', width : 80, height : 80 });
    context_dial.on('change', function(context){
        socket.emit('change', { to : cds.mode, key : context.key, value : parseInt(context.value) });
    });
    context_dial.on('touchend', function(context){
        if(cds.enter.indexOf(context.key) < 0) return;
        socket.emit('enter', { to : cds.mode, key : context.key, value : 1 });
    });
    // dom
    $('body').append('<p><div id="log" /></p>');
});
