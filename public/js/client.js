var conversations = {
    "possible": [
        ".human-robot",
        ".robot-robot",
        ".robot-teacher"
    ],
    "active": ".human-robot"
};

$(document).ready(function() {
    $(".btn-send").on("click", function() {
        sendMessage();
    });
    
    $(".btn-clear-cache").on("click", function () {
        clearCache();
    });

    setKeyUp();

    $(".expander-title").on("click", function () {
        var conversation = $(this).next();
        conversation.slideToggle("slow", function () {
            var display = conversation.css("display"); 
            if (display !== "none") {
                conversations.active = "." + conversation.parent().attr("data-section");
            }
            else {
                conversations.active = "";
            }
        });
    });

    addUIMessage(".robot", "Salut.");
});

function setKeyUp () {
    for (var i in conversations.possible) { 
        $(conversations.possible[i]).find(".message").on("keyup", function(e) {
            // pressed enter
            if (e.keyCode === 13) {
                sendMessage();
            }
        });
    }
}

var loading = {
    start: function () {
        $(conversations.active).find(".loading").fadeIn();
    },
    stop: function () {
        $(conversations.active).find(".loading").fadeOut();
    }
}

function sendMessage() {
    var textBox = $(conversations.active).find(".message");
    var messageToSend = textBox.val();
    textBox.val("");

    addUIMessage(".human", messageToSend);
    getAnswer(messageToSend);

    if (messageToSend[messageToSend.length - 1] === "?") {
        addUIMessage(".loading", "Robotul își formulează răspunsul...");
    }
}

function getAnswer(message) {

    var talk = $("#talk").attr("checked");

    var dataToSend = { 
        "message": message, 
        "talk": talk 
    };

    if (message[message.length - 1] === "?") {
        loading.start();
    }

    $.post("/get", JSON.stringify(dataToSend), function (data) {
        
        loading.stop();
    
        if (!data) { return; }
        try { JSON.parse(data); } catch(e) { return; }

        data = JSON.parse(data); 
        
        var mp3Link = data.mp3Link;
        var message = data.message;

        if (!message) { return; }
        addUIMessage(".robot", data.message);

        if (!mp3Link) { return; }
        var embedPlayer = '<embed src="' + mp3Link + '"' +
                          '&amp;height=20&amp;width=320&amp;autostart=true"' + 
                          ' width="0" height="0">'; 

        $(".player-container").html("");
        $(".player-container").append(embedPlayer);
    });
}

function addUIMessage(type, message) {
    if (!message) { return; }
    var row = $(".templates").find(type).clone().removeClass(type);
   
    row.find(".message-text").text(message).hide().fadeIn();
    var active = $(conversations.active);
    active.find(".loading").before(row);
    active.find(".messages").animate({scrollTop: $(".messages").prop("scrollHeight")}, 500);
}

function clearCache(callback) {
    $.get("/clearCache", callback);
}
