var request = require("request");
var querystring = require('querystring');

exports.ro = function (message, callback) {

    if (!message) {
        callback("No message provided.");
    }

    var dict = {
        "textul": message,
        "vorbeste": "vorbeşte/speak",
        "hh": 1368298762
    };

    var body = querystring.stringify(dict);
    
    request.post({
            headers: {
                "content-type" : "application/x-www-form-urlencoded"
            },
            url: "http://www.phobos.ro/demos/tts/vorbeste.html",
            body: body
    }, function (err, res, body) {
        
        if (err) { return callback(err); }
        
        var selector = "<embed src=\"";
        
        var mp3Link = body.substring(body.indexOf(selector) + selector.length);
        mp3Link = mp3Link.substring(0, mp3Link.indexOf("\""));
        mp3Link = "http://www.phobos.ro/demos/tts/" + mp3Link;

        callback(null, mp3Link);
    });
}

