
function check_settings(){
    chrome.storage.sync.get("bulkbookmarker_settings", function(obj){
        console.log("check_setting:")
        console.log(obj)
        if(typeof settings_obj !== "undefined" && typeof settings_obj.bulkbookmarker_settings.save_folder_id !== "undefined"){
            console.log("設定あり")
        }else{
            console.log("設定なし")
        }
    });
}
check_settings()

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
    var evp = this.eventParam
    chrome.storage.sync.get("bulkbookmarker_settings", function(settings_obj){
        console.log(settings_obj)
        console.log(settings_obj.bulkbookmarker_settings.save_folder_id)
        if(typeof settings_obj === "undefined" || typeof settings_obj.bulkbookmarker_settings === 'undefined' || typeof settings_obj.bulkbookmarker_settings.save_folder_id === "undefined"){
            console.log("なし")
            chrome.storage.sync.set({"bulkbookmarker_settings" : {save_folder_id: evp}}, folder_change_view({save_folder_id: evp})) 
        }
        else{
            console.log("あり")
            var new_settings_obj = settings_obj.bulkbookmarker_settings
            new_settings_obj.save_folder_id = evp
            console.log(new_settings_obj)
            chrome.storage.sync.set({"bulkbookmarker_settings" : new_settings_obj}, folder_change_view(new_settings_obj))
        }
    })
}

$(function(){
    console.log("make_bookmark_view")
    chrome.bookmarks.getTree(function(arr_btn){
        make_bookmark_view(arr_btn[0].children, root_str)
    });
});

function folder_change_view(settings_obj){
    $('#bookmark_dir').empty()
    console.log(settings_obj)
    if(typeof settings_obj !== "undefined" && typeof settings_obj.save_folder_id !== "undefined"){
        chrome.bookmarks.get(settings_obj.save_folder_id, function(arr){
            var folder_name = arr[0].title
            $('#bookmark_dir').append('<p>' + folder_name + '</p>')
        });
    }else{
        $('#bookmark_dir').append('<p> No settings</p>')
    }
}

function folder_setting_view(){
    $('#bookmark_dir').empty()
    chrome.storage.sync.get("bulkbookmarker_settings", function(settings_obj){
        console.log(settings_obj)
        if(typeof settings_obj !== "undefined" ||typeof settings_obj.bulkbookmarker_settings === 'undefined' || typeof settings_obj.bulkbookmarker_settings.save_folder_id !== "undefined"){
            var current_id = settings_obj.bulkbookmarker_settings.save_folder_id
            chrome.bookmarks.get(current_id, function(arr){
                var folder_name = arr[0].title
                $('#bookmark_dir').append('<p>' + folder_name + '</p>')
            });
        }else{
            $('#bookmark_dir').append('<p> No settings</p>')
        }
    });
}

$(function(){
    folder_setting_view()
});