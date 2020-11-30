const Mine = -1;
const direction = [[0, 1], [0, -1], [1, 0], [-1, 0], [1, 1], [-1, -1], [1, -1], [-1, 1]];
const size = "40px";
const victory = 1;
const Open = 0;
const fail = -1;
const Color = {
    "-1": "#888A85",
    "0": "#DEDEDC",
    "1": "#DDFAC3",
    "2": "#ECEDBF",
    "3": "#EDDAB4",
    "4": "#EEC684",
    "5": "#FF969F",
    "6": "#FFA27F",
    "7": "#FF7D60",
    "8": "#FF323C"
}
const flag_path = "../images/flag.png";
const mine_path = "../images/mine.png";
const unknow_path = "../images/unknow.png";
const flag = 2;
const unknow = 3;

var row = 8;
var col = 8;
var count = 10;
var map = [];
var user_map = [];
var over = Open;
var user_count = 0;
var sys_id = null;
$("body").ready(function() {
    var map_message = localStorage.getItem("map_message");
    if(map_message == null) {
        row = 8;
        col = 8;
        count = 10;
    }
    else {
        map_message = map_message.split("_");
        row = parseInt(map_message[1]);
        col = parseInt(map_message[0]);
        count = parseInt(map_message[2]);
        localStorage.removeItem("map_message");
    }
    Init();
});

function judge(x, y) {
    return x > 0 && y > 0 && x <= row && y <= col;
}

function get_mine(x, y) {
    if(map[x][y] == -1) return -1;
    var res = 0;
    for(var i = 0; i < direction.length; ++i) {
        var dx = x + direction[i][0], dy = y + direction[i][1];
        if(!judge(dx, dy)) continue;
        res += (map[dx][dy] == Mine);
    }
    return res;
}

function Init() {
    var width = 100 / col;
    var Map = document.getElementById("map");
    $(Map).html("");
    Map.oncontextmenu = function(e) {
        e.preventDefault();
    };
    for(var i = 1; i <= row; ++i) {
        var div_row = document.createElement("div");
        $(div_row).css("display", "flex");
        $(div_row).css("width", "100%");
        div_row.oncontextmenu = function(e) {
            e.preventDefault();
        };
        for(var j = 1; j <= col; ++j) {
            var div_col = document.createElement("div");
            //$(div_col).css("width", width + "%");
            $(div_col).css("width", size);
            $(div_col).css("margin-top", "3px");
            $(div_col).css("margin-left", "3px");
            //$(div_col).css("padding-top", width + "%");
            $(div_col).css("padding-top", size);
            $(div_col).css("position", "relative");
            div_col.oncontextmenu = function(e) {
                e.preventDefault();
            };
            var div = document.createElement("div");
            $(div).attr("id", i + "_" + j);
            $(div).attr("class", "map_cell");
            $(div).attr("onclick", "Click(this)");
            $(div).attr("ondblclick", "dbClick(this)");
            div.oncontextmenu = function(e) {
                e.preventDefault();
            };
            div.onmouseup = function(e) {
                if(!e.button) oEvent = window.event;
                else if(e.button == 2) show_flag(this);
            }
            div_col.append(div);
            div_row.append(div_col);
        }
        Map.append(div_row);
    }
    $("#side").css("height", Map.clientHeight);

    map = [];
    user_map = [];

    for(var i = 0; i <= row; ++i) {
        var tmp = [];
        var ttmp = [];
        for(var j = 0; j <= col; ++j) {
            tmp.push(0);
            ttmp.push(0);
        }
        map.push(tmp);
        user_map.push(ttmp);
    }

    for(var i = 1; i <= count; ++i) {
        var x = Math.max(Math.floor(Math.random() * row + 0.5), 1);
        var y = Math.max(Math.floor(Math.random() * col + 0.5), 1);
        x = Math.min(x, row);
        y = Math.min(y, col);
        while(map[x][y] == Mine) {
            x = Math.max(Math.floor(Math.random() * row + 0.5), 1);
            y = Math.max(Math.floor(Math.random() * col + 0.5), 1);
            x = Math.min(x, row);
            y = Math.min(y, col);
        }
        map[x][y] = Mine;
    }

    for(var i = 1; i <= row; ++i) {
        for(var j = 1; j <= col; ++j) {
            if(map[i][j] == -1) continue;
            map[i][j] = get_mine(i, j);
            //$("#" + i + "_" + j).text(map[i][j]);
        }
    }
    if(sys_id) clearInterval(sys_id);
    over = Open;
    user_count = 0;
    $("#num").text(user_count + "/" + count);
    $("#time").text("00:00");
    sys_id = setInterval(() => {
        var time = $("#time").text().split(":");
        var minute = parseInt(time[0]), second = parseInt(time[1]);
        second += 1;
        if(second >= 60) {
            second %= 60;
            minute += 1;
        }
        second < 10 && (second = "0" + second);
        minute < 10 && (minute = "0" + minute);
        $("#time").text(minute + ":" + second);
    }, 1000);
    $("#stop").text("暂停");
    $("#stop").attr("name", "stop");
    $("#stop").attr("disabled", false);
}

function show_open(x, y) {
    if(user_map[x][y]) return;
    $("#" + x + "_" + y).css("background-color", Color[map[x][y]]);
    user_map[x][y] = 1;
    for(var i = 0; i < direction.length; ++i) {
        var dx = x + direction[i][0], dy = y + direction[i][1];
        if(!judge(dx, dy) || user_map[dx][dy] || map[dx][dy] == Mine) continue;
        if(map[dx][dy]) {
            $("#" + dx + "_" + dy).css("background-color", Color[map[dx][dy]]);
            $("#" + dx + "_" + dy).html("<b>" + map[dx][dy] +"<b>");
            user_map[dx][dy] = 1;
        }
        else show_open(dx, dy);
    }
}

function Click(element) {
    if(over) return;
    var id = element.id.split("_");
    var x = parseInt(id[0]), y = parseInt(id[1]);
    if(user_map[x][y]) return;
    if(map[x][y] == Mine) {
        over = fail;
        failed(x, y);
        return;
    }
    if(map[x][y] == 0) show_open(x, y);
    else {
        user_map[x][y] = 1;
        $("#" + x + "_" + y).css("background-color", Color[map[x][y]]);
        $("#" + x + "_" + y).html("<b>" + map[x][y] +"<b>");
    }
    if_win();
}

function failed(x, y) {
    for(var i = 1; i <= row; ++i) {
        for(var j = 1; j <= col; ++j) {
            if(map[i][j] != Mine) continue;
            if(i == x && j == y) {
                $("#" + i + "_" + j).css("background-color", "red");
            }
            else {
                $("#" + i + "_" + j).css("background-color", "black");
            }
            $("#" + i + "_" + j).css({
                "background-image": "url(" + mine_path + ")",
                "background-size": "100% 100%"
            });
        }
    }
    $("#replay").text("再玩一遍");
    $("#stop").attr("disabled", "disabled");
    clearInterval(sys_id);
    sys_id = null;
}

function if_win() {
    if(user_count != count) return false;
    for(var i = 1; i <= row; ++i) {
        for(var j = 1; j <= col; ++j) {
            if(!user_map[i][j] && user_map[i][j] != flag) return;
            if(map[i][j] == Mine && user_map[i][j] != flag) return;
        }
    }
    if(sys_id) clearInterval(sys_id);
    over = victory;
    sys_id = null;
    $("#replay").text("再玩一遍");
    $("#stop").attr("disabled", true);
    setTimeout(() => {
        alert("o(*≧▽≦)ツ");
    }, 100);
}

function dbClick(element) {
    if(over) return;
    var id = element.id.split("_");
    var x = parseInt(id[0]), y = parseInt(id[1]);
    if(user_map[x][y] != 1 || map[x][y] <= 0) return;
    var num = 0;
    for(var i = 0; i < direction.length; ++i) {
        var dx = x + direction[i][0], dy = y + direction[i][1];
        if(!judge(dx, dy)) continue;
        if(user_map[dx][dy] == flag) ++num;
    }
    if(num != map[x][y]) return;
    for(var i = 0; i < direction.length; ++i) {
        var dx = x + direction[i][0], dy = y + direction[i][1];
        if(!judge(dx, dy)) continue;
        if(map[dx][dy] == Mine && user_map[dx][dy] == flag) continue;
        if(map[dx][dy] != Mine && user_map[dx][dy] == flag) {
            over = fail;
            failed(dx, dy);
            $("#" + dx + "_" + dy).css("background-color", "red");
        }
    }
    if(over) return;
    for(var i = 0; i < direction.length; ++i) {
        var dx = x + direction[i][0], dy = y + direction[i][1];
        if(!judge(dx, dy) || user_map[dx][dy] == flag) continue;
        if(!map[dx][dy]) show_open(dx, dy);
        else {
            user_map[dx][dy] = 1;
            $("#" + dx + "_" + dy).css("background-color", Color[map[dx][dy]]);
            $("#" + dx + "_" + dy).html("<b>" + map[dx][dy] +"<b>");
        }
    }
    if_win();
}

function show_flag(element) {
    if(over) return;
    var id = element.id.split("_");
    var x = parseInt(id[0]), y = parseInt(id[1]);
    if(user_map[x][y] == 1) return;
    if(user_map[x][y] == 0) {
        user_map[x][y] = flag;
        ++user_count;
        $("#" + x + "_" + y).css({
            "background-image": "url(" + flag_path + ")",
            "background-size": "100% 100%",
            "background-repeat": "no-repeat",
            "background-position": "center"
        });
    }
    else if(user_map[x][y] == unknow) {
        user_map[x][y] = 0;
        $("#" + x + "_" + y).css({
            "background-image": "none"
        });
    }
    else if(user_map[x][y] == flag) {
        user_map[x][y] = unknow;
        --user_count;
        $("#" + x + "_" + y).css({
            "background-image": "url(" + unknow_path + ")",
            "background-size": "100% 100%"
        });
    }
    $("#num").text(user_count + "/" + count);
    if_win();
}

function stop_or_go(element) {
    var name = element.name;
    if(name == "stop") {
        clearInterval(sys_id);
        sys_id = null;
        $(element).text("继续");
        $(element).attr("name", "go");
        over = fail;
    }
    else {
        if(sys_id) clearInterval(sys_id);
        sys_id = setInterval(() => {
            var time = $("#time").text().split(":");
            var minute = parseInt(time[0]), second = parseInt(time[1]);
            second += 1;
            if(second >= 60) {
                second %= 60;
                minute += 1;
            }
            second < 10 && (second = "0" + second);
            minute < 10 && (minute = "0" + minute);
            $("#time").text(minute + ":" + second);
        }, 1000);
        $(element).text("暂停");
        $(element).attr("name", "stop");
        over = Open;
    }
}