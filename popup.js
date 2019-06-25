
function check_settings(){
    chrome.storage.sync.get("bulkbookmarker_settings", function(settings_obj){
        console.log("check_setting:")
        console.log(settings_obj)
        if(typeof settings_obj != "undefined" && typeof settings_obj.bulkbookmarker_settings.save_folder_id != "undefined"){
            console.log("exist")
            return true
        }else{
            console.log("not exist")
            return false
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
        chrome.storage.sync.get("bulkbookmarker_settings", function(settings_obj){
            if(typeof settings_obj === "undefined" || typeof settings_obj.bulkbookmarker_settings.save_folder_id === "undefined"){
                document.getElementById("result").innerHTML = "No setings of bookmark folder"
            }else{
                var bkid = settings_obj.bulkbookmarker_settings.save_folder_id
                var date = String(Date.now())
                chrome.bookmarks.create({parentId: bkid, title: date}, function(res){
                    for(var key in tabs_marked){
                        var e = tabs_marked[key]
                        if(e.flag) chrome.bookmarks.create({parentId: res.id, title: e.content.title, url: e.content.url})
                    }
                });
                document.getElementById("result").innerHTML = (date + " bulked!")
                reload_bookmarks_tab()
            }
        });
    });
})

////////////////////////////
/*  Impl of Bookmark tab  */
////////////////////////////

function reload_bookmarks_tab(){
    $('#bookmarks_area').empty()
    chrome.storage.sync.get("bulkbookmarker_settings", function(settings_obj){
        if(typeof settings_obj === "undefined" || typeof settings_obj.bulkbookmarker_settings === "undefined" || typeof settings_obj.bulkbookmarker_settings.save_folder_id === "undefined"){
            $('#bookmarks_area').append("<tr><td> No setings of bookmark folder </tr><td>")
        }else{
            var current_id = settings_obj.bulkbookmarker_settings.save_folder_id
            chrome.bookmarks.getChildren(current_id, function(pre_arr){
            var flag = false;
            console.log(105)
            var arr = pre_arr.reverse()
                for(var bk of arr){
                    if(typeof bk.url === "undefined"){
                        flag = true
                        $('#bookmarks_area').append('<tr id=mybkid_' + bk.id + '><td>' + bk.title + "</td></tr>")
                        var bookmark_elm = document.querySelector('#mybkid_'+bk.id)
                        bookmark_elm.eventParam = bk.id
                        bookmark_elm.addEventListener("dblclick", open_bulkbookmark, false)
                    }
                }
                if(!flag) $('#bookmarks_area').append("<tr><td> No bulkbookmarks in that folder </tr><td>")
            });
        }
    });
}

function open_bulkbookmark(){
    var bkid = this.eventParam
    var url_arr = []
    chrome.bookmarks.getChildren(bkid, function(arr){
        for(var bk of arr){
            if(typeof bk.url !== "undefined") url_arr.push(bk.url)
        }
        console.log(url_arr)
        chrome.windows.create({url: url_arr})
    })
}

$(function(){
    reload_bookmarks_tab()
});

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
            sel.addEventListener('dblclick', set_save_folder, false)

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
            $('#bookmark_dir').append('<p>　Save folder: ' + folder_name + '</p>')
        });
    }else{
        $('#bookmark_dir').append('<p> Save folder:　No settings</p>')
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
                $('#bookmark_dir').append('<p> Save folder: ' + folder_name + '</p>')
            });
        }else{
            $('#bookmark_dir').append('<p> Save folder: No settings</p>')
        }
    });
}

$(function(){
    folder_setting_view()
});