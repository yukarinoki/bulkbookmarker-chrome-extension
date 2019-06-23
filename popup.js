var tabs　= []
var tabs_marked 
function print_tabs_of_window(window){
    tabs = window.tabs
    console.log(window)
    console.log(tabs)
    for(var tab of tabs){
        tabs_marked += true
        console.log(tab.title)
        $("#current_tabs").append("<tr id=" + tab.id + "\" class='on'><td>" + tab.title.slice(0,28) + "</td></tr>");
    }
}

chrome.windows.getCurrent({populate: true}, print_tabs_of_window)

$(function(){ 
    console.log("ほい");
});

$(function(){
    $('#reload_button').click(function(){
        console.log("reload!");
        $('#current_tabs').empty();
        chrome.windows.getCurrent({populate: true}, print_tabs_of_window)
    });
});