$(document).ready(function() {
    // TODO Replace click function with on.
    $(".btn-send").click(function() {
        sendMessage();
    });
    
    $("#message").keyup(function(e) {
        // Pressed enter
        if (e.keyCode === 13) {
            sendMessage();
        }
    });
});

function sendMessage() {
    var messageToSend = $("#message").val();

    $.post("/insert", messageToSend, function (data) {
        addUIMessage("Human", messageToSend);
        getAnswer(messageToSend);

        if (messageToSend[messageToSend.length - 1] === "?") {
            addUIMessage("", "Robotul își formulează răspunsul...");
        }
    });
}

function getAnswer(message) {

    var talk = $("#talk").attr("checked");

    var dataToSend = { 
        "message": message, 
        "talk": talk 
    };

    $.post("/get", JSON.stringify(dataToSend), function (data) {
        
        if (!data) { return; }
        try { JSON.parse(data); } catch(e) { return; }

        data = JSON.parse(data); 
        
        var mp3Link = data.mp3Link;
        var message = data.message;

        if (!message) { return; }
        addUIMessage("Robot", data.message);

        if (!mp3Link) { return; }
        var embedPlayer = '<embed src="' + mp3Link + '"' +
                          '&amp;height=20&amp;width=320&amp;autostart=true"' + 
                          ' width="0" height="0">'; 

        $(".player-container").html("");
        $(".player-container").append(embedPlayer);
    });
}

function addUIMessage(user, message) {
    $(".console").prepend("\n" + user + (user ? ": ": "") + message);
}
