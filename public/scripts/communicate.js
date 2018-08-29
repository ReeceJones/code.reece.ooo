var socket; // websocket connection

function setText(text) {
    $("#content").html(text);
}

function appendText(text) {
    $("#content").append(text + "<br>");
}

function getBaseURL() {
    var href = window.location.href.substring(7); // strip "http://"
    var idx = href.indexOf("/");
    return "ws://" + href.substring(0, idx);
}

function connect() {
    setText("connecting to server...");
    socket = new WebSocket(getBaseURL() + "/host");
    socket.onopen = function() {
        appendText("connected to server.");
        var jsonObj = new Object;
        jsonObj.operation = "filelist-update";
        socket.send(JSON.stringify(jsonObj));
    }
    socket.onmessage = function(message) {
        appendText(message.data);
    }
    socket.onclose = function(event) {
        appendText("socket closed");
    }
}

connect();