var socket; // websocket connection

function getBaseURL() {
    var href = window.location.href.substring(7); // strip "http://"
    var idx = href.indexOf("/");
    return "ws://" + href.substring(0, idx);
}

function updateFileList() {
    let j = new Object();
    j.operation = "filelist-update";
    console.log(j);
    let str = JSON.stringify(j);
    console.log(str);
    socket.send(str);
}

function addFile(path) {
    let str = path.toString();
    console.log(str);
    $("#files").append("<div class=\"file\" id=\"" + path + "\"><div class=\"pad\">" + str + "</div></div>");
}

function connect() {
    console.log("connecting to server...");
    socket = new WebSocket(getBaseURL() + "/host");
    socket.onopen = function() {
        $("#files").html("");
        console.log("connected to server.");
        updateFileList();
        // var jsonObj = new Object;
        // jsonObj.operation = "filelist-update";
        // console.log(JSON.stringify(jsonObj));
        // socket.send(JSON.stringify(jsonObj));
    }
    socket.onmessage = function(message) {
        let json = JSON.parse(message.data);
        switch (json.operation)
        {
            default: console.log("undefined operation: " + json.operation); break;
            case "filelist-update":
                for (let i = 0; i < json.elements; i++)
                {
                    // $("#files").append("<br>" + json.data[i]);
                    console.log(json.data[0][i]);
                    addFile(json.data[0][i]);
                }
            break;
            case "fileop-read":
                //TODO: ace.js document.setValue(json.data);
                editor.setValue(json.data);
            break;
        }
    }
    socket.onclose = function(event) {
        console.log("socket closed");
        // $("#files").html("[error] socket closed");
        // connect();
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
