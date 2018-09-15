class HashMemory {
    constructor(data) {
        this.data = data;
    }
    type(hash) {
        for (let i = 0; i < this.data.folders.length; i++) {
            if (this.data.folders[i].hash == hash) {
                return "folder";
            }
        }
        for (let i = 0; i < this.data.files.length; i++) {
            if (this.data.files[i].hash == hash) {
                return "file";
            }
        }
        return "unknown";
    }
    toPath(hash) {
        for (let i = 0; i < this.data.folders.length; i++) {
            if (this.data.folders[i].hash == hash) {
                return this.data.folders[i].path;
            }
        }
        for (let i = 0; i < this.data.files.length; i++) {
            if (this.data.files[i].hash == hash) {
                return this.data.files[i].path;
            }
        }
        return "unknown";
    }
}

var websocket;
var hashMemory;
var currentPath;

function findHash(data, path) {
    for (let i = 0; i < data.length; i++) {
        if (data[i].path == path)
            return data[i].hash;
    }
    return "";
}

function serverRequest(fn) {
    websocket = new WebSocket("ws://code.reece.ooo/host");
    websocket.onopen = function() {
        console.log("websocket connected to server");
        fn();
    }
    websocket.onmessage = function(message) {
        let json = JSON.parse(message.data);
        switch (json.operation) {
            default:
                console.log("unknown operation: " + json.operation);
            break;
            case "filelist-update":
                let data = JSON.parse(json.data);
                console.log(data.files);
                console.log(data.folders);
                hashMemory = new HashMemory(data);
                for (let i = 0; i < data.folders.length; i++) {
                    if  (data.folders[i] != "") {
                        let tok = data.folders[i].path.split("/");
                        let confident = data.folders[i].path.substring(0, data.folders[i].path.lastIndexOf("/"));
                        // console.log("real: " + data.folders[i].path + " confident: " + confident);
                        let parent = tok.length == 1 ? "file-container" 
                                    : findHash(data.folders, confident);//data.folders[i-1].hash;
                        $("#" + parent).append("<div class=\"pad\" id=\"" + data.folders[i].hash +
                                        "\"><div class=\"folder\" id=\"" + data.folders[i].hash + 
                                        "\"><b id=\"" + data.folders[i].hash + "\">- " + tok[tok.length-1] + "</b></div></div>");
                        $("#" + data.folders[i].hash).droppable();
                    }
                }
                // after doing folders we can add files
                for (let i = 0; i < data.files.length; i++) {
                    if (data.files[i] != "") {
                        let folder = data.files[i].path.substring(0, data.files[i].path.lastIndexOf("/"));
                        let hash = findHash(data.folders, folder);
                        let tok = data.files[i].path.split("/");
                        $("#" + hash).append(
                            "<div class=\"file pad\" id=\"" + data.files[i].hash + "\">" + tok[tok.length-1] + "</div>" 
                        );
                        $("#" + data.files[i].hash).draggable({
                            axis: "y"
                        });
                    }
                }
            break;
            case "fileop-read":
                editor.setValue(json.data);
                editor.setHighlightActiveLine(false);
            break;
        }
        websocket.close();
    }
    websocket.onclose = function(event) {
        console.log("socket closed: " + event.code);
    }
}

// create editor on page load
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

serverRequest(function() {
    $("#file-container").html("<br>");
    let j = new Object();
    j.operation = "filelist-update";
    let str = JSON.stringify(j);
    websocket.send(str);
});

$(function() {
    $("#file-container").click(function(e) {
        console.log("clicked: " + e.target.id);
        let type = hashMemory.type(e.target.id);
        switch (type) {
            default: console.log("unknown type"); break;
            case "folder":
                let value = $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display");
                if (value == "none") {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "inline");
                    $("b[id='" + e.target.id.toString() + "']").html("- " + $("b[id='" + e.target.id.toString() + "']").html().toString().substring(1));
                }
                else {
                    $("#" + e.target.id.toString()).children("div :not(#" + e.target.id.toString() + ")").css("display", "none");
                    $("b[id='" + e.target.id.toString() + "']").html("+ " + $("b[id='" + e.target.id.toString() + "']").html().toString().substring(1));
                }
            break;
            case "file":
                serverRequest(function() {
                    let j = new Object();
                    j.operation = "fileop-read";
                    j.file = hashMemory.toPath(e.target.id);
                    currentPath = j.file;
                    let str = JSON.stringify(j);
                    websocket.send(str);
                });
            break;
            }
    });
    $("#context-menu").menu({
        position: {
            my:'left top',
            at:'left bottom'
        }
    });
    $("#file-container").resizable({
        handles: 'e, w'
    });
    
});

$(document).keydown(function(e) {
    if (e.keyCode == 83 && e.ctrlKey) {
        e.preventDefault();
        serverRequest(function() {
            let j = new Object();
            j.operation = "fileop-write";
            j.file = currentPath;
            j.data = editor.getValue();
            let str = JSON.stringify(j);
            websocket.send(str);
        });
    }
});