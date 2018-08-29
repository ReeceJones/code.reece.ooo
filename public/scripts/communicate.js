var socket; // websocket connection

function setText(text) {
    $("#output").html(text);
}

function appendText(text) {
    $("#output").append("<br>" + text);
}

function getBaseURL() {
    var href = window.location.href.substring(7); // strip "http://"
    var idx = href.indexOf("/");
    return "ws://" + href.substring(0, idx);
}

function updateFileList() {
    var jsonObject = new Object;
    jsonObject.operation = "filelist-update";
    console.log(JSON.stringify(jsonObject));
    socket.send(JSON.stringify(jsonObject));
}

function connect() {
    setText("connecting to server...");
    socket = new WebSocket(getBaseURL() + "/host");
    socket.onopen = function() {
        appendText("connected to server.");
        // var jsonObj = new Object;
        // jsonObj.operation = "filelist-update";
        // console.log(JSON.stringify(jsonObj));
        // socket.send(JSON.stringify(jsonObj));
    }
    socket.onmessage = function(message) {
        let json = JSON.parse(message.data);
        switch (json.operation)
        {
            default: console.log("undefined operation"); break;
            case "filelist-update":
                $("files").html("FILES:");
                for (let i = 0; i < json.elements; i++)
                {
                    $("#files").append("<br>" + json.data[i]);
                }
            break;
            case "fileop-read":
                //TODO: ace.js document.setValue(json.data);
                editor.setValue(json.data);
            break;
        }
    }
    socket.onclose = function(event) {
        appendText("socket closed");
        connect();
    }
}

var editor = ace.edit("editor");
editor.setTheme("ace/theme/ambiance");
editor.session.setMode("ace/mode/c_cpp");
editor.setOptions({
    enableBasicAutocompletion: true,
    enableLiveAutocompletion: true,
    highlightActiveLine: true,
    highlightSelectedWord: true,
    readOnly: false,
    cursorStyle: "slim",
    mergeUndoDeltas: true,
    behavioursEnabled: true,
    showPrintMargin: false,
    showFoldWidgets: true,
    showLineNumbers: true,
    showGutter: true,
    displayIndentGuides: true,
    scrollPastEnd: 1,
    enableSnippets: true,
    showInvisibles: true,
    highlightActiveLine: true
});

connect();