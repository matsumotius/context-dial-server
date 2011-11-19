var onYouTubePlayerAPIReady;
var cds = {};
$(function(){
    // display dom
    var container = $('<div id="content" />').css('width', '100%');
    container.append($('<div id="showcase" />'));
    container.append($('<div id="player" />'));
    $('body').append(container);
    $('body').append('<br clear="all">');
    $('body').append('<div id="comment" />');
    $('body').append('<div id="log" />');
    var log = function(message){ $('#log').text(message) };
    cds.user_id = $('#user_id').text();
    cds.host= $('#host').text();
    // socket
    var socket = io.connect(cds.host);
    socket.emit('join', { type : 'display', id : cds.user_id });
    socket.on('message', function(message){ log(message); });
    socket.on('join', function(message){
        var current_time = YouTube.player.getCurrentTime() / YouTube.player.getDuration();
        socket.emit('change', { key : 'sound', value : YouTube.player.getVolume() });
        socket.emit('change', { key : 'time',  value : parseInt(current_time * 100) });
    });
    socket.on('change', function(message){
        YouTube.change[message.key](message.value);
    });
    socket.on('enter', function(message){
        YouTube.enter[message.key](message.value);
    });
    var YouTube = {};
    YouTube.options = { width :600, height : 400, player_vars : { 'wmode' : 'transparent' } };
    YouTube.relation = {};
    YouTube.comments = {};
    onYouTubePlayerAPIReady = function(){
        YouTube.player = create_player('heXQfgEC3kk');
        YouTube.player.addEventListener('onReady', function(){
            YouTube.player.playVideo();
            socket.emit('change', { key : 'sound', value : YouTube.player.getVolume() });
        });
    };
    var create_player = function(video_id){
        YouTube.get_related(video_id);
        YouTube.get_comment(video_id);
        return new YT.Player('player',{
            width : YouTube.options.width,
            height : YouTube.options.height,
            videoId : video_id,
            playerVars : YouTube.options.player_vars
        });
    };
    var change_video = function(video_id){
        YouTube.player = create_player(video_id);
        YouTube.player.addEventListener('onReady', function(){
            YouTube.player.playVideo();
        });
    };
    YouTube.get_related = function(video_id){
        var url = 'http://gdata.youtube.com/feeds/videos/'+video_id+'/related';
        var params = { alt : 'json' };
        $.get(url, params, function(data){ YouTube.relation = data; });
    };
    YouTube.get_comment = function(video_id){
        var url = 'http://gdata.youtube.com/feeds/api/videos/'+video_id+'/comments';
        var params = { alt : 'json' };
        $.get(url, params, function(data){ YouTube.comments = data; });
    };
    YouTube.id_exp = new RegExp("^http:\/\/gdata\.youtube\.com\/feeds\/videos\/([_a-zA-Z0-9&=\?-]+)");
    YouTube.change = {
        'sound' : function(value){
            YouTube.player.setVolume(value);
        },
        'time' : function(value){
            YouTube.player.seekTo(YouTube.player.getDuration() * value / 100);
        },
        'comment' : function(value){
            var comments = YouTube.comments.feed.entry;
            var comment = comments[parseInt(value) % comments.length];
            $('#comment').text(comment.author[0].name['$t'] + ' : ' + comment.content['$t']);
        },
        'video' : function(value){
            var videos = YouTube.relation.feed.entry;
            var video = videos[parseInt(value) % videos.length];
            var title = video.title['$t'];
            var author = video.author[0].name['$t'];
            var thumbnail = video.media$group.media$thumbnail[1].url;
            var tag = $('<div />').append('<p>'+title+'</p>').append('<p>'+author+'</p>');
            var img = $('<img />').attr('src', thumbnail).after('<br clear="all">');
            $('#showcase').html(tag.append(img));
        }
    };
    YouTube.enter = {
        'video' : function(value){
            var videos = YouTube.relation.feed.entry;
            var video = videos[parseInt(value) % videos.length];
            var id = video.id['$t'].match(YouTube.id_exp)[1];
            change_video(id);
        }
    };
});
