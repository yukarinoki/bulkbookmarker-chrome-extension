var tabs　= []
var tabs_marked = {}
var it = 0
function print_tabs_of_window(window){
    tabs = window.tabs
    console.log(window)
    console.log(tabs)
    for(var tab of tabs){
        tabs_marked['id_'+tab.id] = {flag: true, content: tab};
        console.log(tab.title)
        $(".current_tabs").append('<tr id=id_' + tab.id + ' class="on"><td>' + tab.title.slice(0,28) + "</td></tr>");
        var sel = document.querySelector("#"+"id_"+tab.id)
        sel.eventParam = tab.id
        console.log(sel);
        sel.addEventListener('click', change_mark, false)
    }
    console.log(tabs_marked);
}

function change_mark(){
    console.log(this.id)
    tabs_marked[this.id].flag = !tabs_marked[this.id].flag
    if(tabs_marked[this.id].flag) this.className = 'on'
    else this.className = 'off'
    console.log(tabs_marked)
}

chrome.windows.getCurrent({populate: true}, print_tabs_of_window)

$(function(){ 
    console.log("ほい");
});

$(function(){
    $('#reload_button').click(function(){
        console.log("reload!");
        $('.current_tabs').empty();
        chrome.windows.getCurrent({populate: true}, print_tabs_of_window)
    });
});

$(function(){
    $('#bookmark_button').click(function(){
        console.log("bookmark!");
        chrome.bookmarks.create({title: "testmake"})
        
    });
});