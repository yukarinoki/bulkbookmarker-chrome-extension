var settings
function reload_settings(){
    chrome.storage.local.get("bulkbookmarker_settings", function(obj){settings = obj});
}
reload_settings()
////////////////////////////
/*   Impl of Tab system   */
////////////////////////////

var view_tabs;
var pages;
var current_page = "tabs_tab"

$(function(){
    view_tabs = document.getElementById('tabcontrol').getElementsByTagName('a');
    pages = document.getElementById('tabbody').children;
});

$(function(){
    for(var page of pages){
        if(current_page == page.id) page.style.display = "block"
        else page.style.display = "none"
    }
});

$(function(){
    for(var tabc of view_tabs){
        tabc.eventParam = tabc.id
        tabc.addEventListener("click", change_tab, false)
    }
});

function change_tab(){
    current_page = this.eventParam+"_tab"
    for(var page of pages){
        if(current_page == page.id) page.style.display = "block"
        else page.style.display = "none"
    }
}

////////////////////////////
/*    Impl of Tabs tab    */
////////////////////////////
var tabs　= []
var tabs_marked = {}
var it = 0

function print_tabs_of_window(window){
    tabs = window.tabs
    for(var tab of tabs){
        tabs_marked['id_'+tab.id] = {flag: true, content: tab};
        $(".current_tabs").append('<tr id=id_' + tab.id + ' class="on"><td>' + tab.title.slice(0,28) + "</td></tr>");
        var sel = document.querySelector("#"+"id_"+tab.id)
        sel.eventParam = tab.id
        sel.addEventListener('click', change_mark, false)
    }
}

function change_mark(){
    tabs_marked[this.id].flag = !tabs_marked[this.id].flag
    if(tabs_marked[this.id].flag) this.className = 'on'
    else this.className = 'off'
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

////////////////////////////
/*  Impl of Bookmark tab  */
////////////////////////////


////////////////////////////
/*  Impl of Settings tab  */
////////////////////////////
var root_str = '.bookmark_view'

function make_bookmark_view(arr_btn, str){
    for(var btn of arr_btn){
        if(!btn.url){
            $(str).append('<details id=bkid_' + btn.id + '><summary id=suid_'+ btn.id + '>' + btn.title + '</summary></details>')
            
            var sel = document.querySelector("#"+"suid_"+btn.id)
            sel.eventParam = btn.id
            sel.addEventListener('click', set_save_folder, false)

            var next_str = '#bkid_' + btn.id
            make_bookmark_view(btn.children, next_str)
        }
    }
}

function set_save_folder(){
    if(typeof settings === "undefined"){
        chrome.storage.sync.set({"bulkbookmarker_settings" : {save_folder_id: this.eventParam}}) 
    }
    else{
        settings.save_folder_id = this.eventParam
        chrome.storage.sync.set({"bulkbookmarker_settings": settings})
        folder_setting_view()
    }
}

$(function(){
    console.log("make_bookmark_view")
    chrome.bookmarks.getTree(function(arr_btn){
        make_bookmark_view(arr_btn[0].children, root_str)
    });
});

function folder_setting_view(folder_id){
    $('#bookmark_dir').empty()
    if(typeof settings !== "undefined" && typeof settings.save_folder_id !== "undefined"){
        chrome.bookmarks.get(settings.save_folder_id, function(arr){
            var folder_name = arr[0].title
            $('#bookmark_dir').append('<p>' + folder_name + '</p>')
        });
    }else{
        $('#bookmark_dir').append('<p> No settings</p>')
    }
}
$(function(){
    folder_setting_view()
});