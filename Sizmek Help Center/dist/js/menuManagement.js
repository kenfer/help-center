$(document).ready(function(){var t='<li class="addNew"><a class="addNewButton">+ ADD</a></li>';if(menuObj={},currentItems=[],$mainWrapper=$("#main-wrap"),dropdownValue="",editChildren=[],lastModifiedParent="",articles=[],sections=[],sectionsFirstIndex=0,sectionsLastIndex=0,articlesChangeLOC=[],articleUpdate=!1,sectionUpdate=!1,oldIndex=0,newIndex=0,-1!==jQuery.inArray("view_support_content",HelpCenter.user.tags)&&$("#user-menu").append("<a id='menuAdmin' role='menuitem' href='/hc/en-us/articles/360007566192'>Menu Management</a>"),-1<window.location.href.indexOf("360007566192")){function e(e){e.parent().append('<select class="type" style="background-color: #ffffff;"><option value="text">Text</option><option value="category">Category</option><option value=section>Section</option><option value="custom">Custom</option></select><select class="visibility" style="background-color: #ffffff;"><option value="1">Visible to everyone</option><option value="2">Agents and Manager</option><option value="3">Signed-in users</option><option value="4">User Segment:</option></select><a class="saveButton" style="display:inline;" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a><a class="cancelButton" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a>')}function l(){storage.clear(),sessionStorage.clear()}$("form").remove(),$(".incident-wrapper").remove(),$mainWrapper=$("#main-wrap"),$mainWrapper.append('<button id="save-changes" type="button" class="btn btn-primary" disabled>Save</button>'),n(),$("body").on("change","#products",function(){f(),i()}),$("body").on("click",".menuManagement .fa.fa-angle-right, .menuManagement .fa.fa-angle-down",function(){var t=$(this).parent(),e=t.children("ul");if(t.css("background-color","white"),e.length)e.is(":visible")?(e.slideUp().css("display","none"),n(!0)):(e.slideDown().css("display","block"),n(!1));else if("category"===t.children(".type").val())!function(c){var e=JSON.parse(storage.getItem(HelpCenter.user.email+"-allSections"+helpCenterVer+currentLang)),t=(e.length,""),n=parseInt(c.children("select.type").attr("id")),a=!0;sections=e.filter(function(e){return e.category===n}),c.append('<ul class="sections"></ul>'),c.children("i.fa-angle-down, i.fa-angle-right, .categoryDrop").css({cursor:"wait"}),sections.forEach(function(e){t+='<li class="child-'+e.category+'" id="'+e.id+'"><i class="fa fa-th-large"></i><i class="fa fa-angle-right" style="font-size: 16px;"></i><div class="item-name"><a class="categoryDrop link-zendesk" href="/hc/admin/sections/'+e.id+'/edit" target="_blank">'+e.name+'</a></div><select class="type" id="select-'+e.id+'"><option value="section">Section</option><option value="text">Text</option><option value="category">Category</option><option value="custom">Custom</option></select><select class="visibility"><option>Visible to everyone</option><option>Agents and Manager</option><option>Signed-in users</option><option>User Segment:</option></select></li>'}),c.children("ul").append(t);for(var i=0;i<sections.length;i++)!function(a){var s="fa-eye-slash",l=!0,r="Show To All Shared Platform";$.get("/api/v2/help_center/en-us/sections/"+sections[a].id+"/articles").done(function(e){var t,i="mdx2"==(t=$("#products").val())?t:"sas"==t?"mdxnxt":"newDsp"==t?"newdsp":"dsp"==t?t:"dmp"==t?t:t=t;0<e.count&&!sections[a].description.includes("hidden")&&e.articles.forEach(function(e){var t=e.label_names,n=t.includes(i);"supportKb"!=i&&t.length||(n=!0),t.includes("mdx2")||t.includes("mdx_nxt")||t.includes("mdxnxt")||t.includes("newdsp")||t.includes("dsp")||t.includes("dmp")||(n=!0),!n||e.draft||t.includes("hidden")||(l=!(s="fa-eye"),r="Hide To All Shared Platform")}),c.find("#"+sections[a].id).append('<a class="section-visibility"><i class="fa '+s+'" style="font-size: 20px;" title="'+r+'"></i></a>'),l&&c.find("#"+sections[a].id).children(".item-name").children(".categoryDrop").addClass("lineTrough");var n=b(e.articles);(!e.count||n)&&c.find("#"+sections[a].id).find(".section-visibility").css({"pointer-events":"none"}),a===sections.length-1&&c.children("i.fa-angle-down, i.fa-angle-right, .categoryDrop").css({cursor:"pointer"})})}(i);c.children("ul.sections").nestedSortable({disableParentChange:!0,protectRoot:!0,items:"> li",placeholder:"ui-state-highlight",listType:"ul",handle:".fa-th-large",relocate:function(e,t){var n=$("#mainUL #"+t.item[0].id).index(),i=sections.findIndex(function(e){return e.id==t.item[0].id});a&&(sectionsFirstIndex=oldIndex,sectionsLastIndex=i,a=!1),sectionsFirstIndex>sectionsLastIndex&&(sectionsFirstIndex+=sectionsLastIndex,sectionsLastIndex=sectionsFirstIndex-sectionsLastIndex,sectionsFirstIndex-=sectionsLastIndex),i<n?(i<sectionsFirstIndex&&(sectionsFirstIndex=i),n>sectionsLastIndex&&(sectionsLastIndex=n)):n<i&&(n<sectionsFirstIndex&&(sectionsFirstIndex=n),i>sectionsLastIndex&&(sectionsLastIndex=i)),y(sections,i,n),v(),sectionUpdate=!0}})}(t),i(),n(!1),e.slideDown("fast").css("display","block");else if("section"===t.children(".type").val())!function(m){loc3=loc2=loc1=m.attr("id");var g="/api/v2/help_center/en-us/sections/"+m.attr("id")+"/articles";m.children("i.fa-angle-down, i.fa-angle-right, .categoryDrop").css({cursor:"wait"}),articles=[],m.append('<ul class="articles"></ul>'),function h(){var f=!0;$.get(g).done(function(e){g=e.next_page;for(var t=0;t<e.articles.length;t++)if(!e.articles[t].draft){articles.push(e.articles[t].id);for(var n=e.articles[t].label_names.map(function(e){return e.toUpperCase()}),i="fa-eye",a="Hide",s="",l=x(e.articles[t].label_names),r=e.articles[t].label_names,c=0;c<r.length;c++)"hidden"===r[c]&&(i="fa-eye-slash",a="Show",s="lineTrough");var o='<li id="'+e.articles[t].id+'" class="menu-admin-article"><i class="fa fa-th-large"></i></i><div class="item-name"><a class="article '+s+' link-zendesk" href="https://sizmek.zendesk.com/knowledge/articles/'+e.articles[t].id+'" target="_blank">'+e.articles[t].name+"</a></div>"+l+'<select class="type" disabled><option value="article">Article</option><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option><option value="custom">Custom</option></select><a class="article-visibility" title="'+a+'"><i class="fa '+i+'" style="font-size: 20px;"></i></a><ul style="display:none;"></ul></li>';if(n.includes("LOC_1")||n.includes("LOC_2")||n.includes("LOC_3")||n.includes("LOC_4")||n.includes("LOC_5")){if(n.includes("LOC_2"))loc2=e.articles[t].id,loc3=0,0,$("#mainUL #"+loc1).children("ul").addClass("LOC_2").append(o),0===$("#mainUL #"+loc1).children("i.fa.fa-angle-right").length&&($('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($("#mainUL #"+loc1).children("i.fa.fa-th-large")),$("#mainUL #"+loc1).children("a.article").css("padding-left","0px"));else if(n.includes("LOC_3")){loc3=e.articles[t].id,0;var d=loc2;d||(d=loc1),$("#mainUL #"+d).children("ul").addClass("LOC_3").append(o),0===$("#mainUL #"+d).children("i.fa.fa-angle-right").length&&($('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($("#mainUL #"+d).children("i.fa.fa-th-large")),$("#mainUL #"+d).children("a.article").css("padding-left","0px"))}else if(n.includes("LOC_4")){var p=loc3;p||(p=loc2),p||(p=loc1),$("#mainUL #"+p).children("ul").addClass("LOC_4").append(o),0===$("#mainUL #"+p).children("i.fa.fa-angle-right").length&&($('<i class="fa fa-angle-right" style="font-size: 16px;"></i>').insertAfter($("#mainUL #"+p).children("i.fa.fa-th-large")),$("#mainUL #"+p).children("a.article").css("padding-left","0px"))}}else m.children("ul").addClass("LOC_1").append(o),loc1=e.articles[t].id,loc2=0,loc3=0,0}if(null===g){m.children(".fa-angle-right, .fa-angle-down, .categoryDrop").css({cursor:"pointer"});var u="";$("ul.articles").nestedSortable({forcePlaceholderSize:!0,expandOnHover:100,items:"li",placeholder:"ui-state-highlight",maxLevels:5,listType:"ul",opacity:1,isTree:!0,handle:".fa-th-large",isAllowed:function(e,t,n){return!!e.parents("ul.articles").length},start:function(e,t){var n=t.item[0].id;u=w(n)},relocate:function(e,t){var n=t.item[0].id,i=C(n),a=I(n);f&&(oldIndex<newIndex?(oldIndex=i,newIndex=a):(oldIndex=a,newIndex=i),f=!1),newIndex=i<a?(oldIndex=oldIndex<i?oldIndex:i,newIndex>a?newIndex:a):(oldIndex=oldIndex<a?oldIndex:a,newIndex>i?newIndex:i),y(articles,i,a);var s=w(n);u!=s&&D({id:n,loc:s}),L(),v(),articleUpdate=!0}})}else h()})}()}(t),n(!1),e.slideDown("fast").css("display","block");else if("article"===t.children(".type").val()){n(!1);t.next(".label").text();"block"===t.parent().children("li.article").css("display")?t.parent().children("li.article").slideDown().css("display","none"):t.parent().children("li.article").slideDown().css("display","block")}function n(e){e?t.children("i.fa-angle-down").toggleClass("fa-angle-right").toggleClass("fa-angle-down"):t.children("i.fa-angle-right").toggleClass("fa-angle-right").toggleClass("fa-angle-down")}}),$("body").on("click","a.addNewButton",function(){h("text",$(this).parent()),e($(this)),$(this).remove()}),$("body").on("click","a.add-child-button",function(){h("category",$(this).parent()),e($(this)),$(this).parent().children(".saveButton").attr("class","save-child-button"),$(this).parent().children(".cancelButton").attr("class","cancel-child-button"),$(this).parent().children(".type")[0][0].remove(),$(this).remove()}),$("body").on("click","a.cancelButton",function(){$(this).parent().append('<a class="addNewButton">+ ADD</a>'),$(this).parent().children("input, a.save-child-button,a.saveButton,a.cancelButton, select, .select2").remove()}),$("body").on("click","a.cancel-child-button",function(){$(this).parent().append('<a class="add-child-button">+ ADD</a>'),$(this).parent().children("input, a.save-child-button,a.cancel-child-button, select, .select2").remove()}),$("body").on("change","li.addNew select.type",function(){h($(this).find(":selected").val(),$(this).parent())}),$("body").on("click",".menuManagement .saveButton",function(){var e=$(this).parent();confirm("Save "+e.children(".type").val()+" ?")&&(currentItems.splice(currentItems.length-1,0,g(e,currentItems.length-1)),d(),m())}),$("body").on("click",".menuManagement .save-child-button",function(){var e=$(this).parent();if(confirm("Save "+e.children("select.type").val()+"?")){var t=e.parent().parent().index(),n=g(e,currentItems[t-1].children.length);currentItems[t-1].children.push(n),lastModifiedParent=e.parent().parent().attr("id"),d(),m()}}),$("body").on("click",".menuManagement .editButton",function(){var e=$(this).parent();e.children(".item-name, .fa").css("display","none"),e.children(".type").toggleClass("currentSelect"),e.children("select").removeAttr("disabled").css("background-color","#ffffff"),dropdownValue=e.children("select.type").val(),h(e.children("select.type").find(":selected").text().toLowerCase(),e),e.children("a.editButton, a.deleteButton").css("display","none"),e.children("a.editSaveButton, a.editCancelButton").css("display","inline")}),$("body").on("change",".menuManagement .currentSelect",function(){h($(this).find(":selected").text().toLowerCase(),$(this).parent())}),$("body").on("click",".menuManagement .editSaveButton",function(){if(confirm("Edit "+$(this).parent().children("select.type").val()+" ?")){for(var e=currentItems.length,t=!0,n={},i=$(this).parent().attr("id"),a=0;t&&a<e;a++)currentItems[a].id==i&&(editChildren=currentItems[a].children,n=g($(this).parent(),a),currentItems[a]=n,d(),m(),t=!1);$(this).parent().children("select").attr("disabled","disabled")}}),$("body").on("click",".menuManagement .editCancelButton",function(){var e=$(this).parent();e.children(".select2").remove(),e.children("select.type").toggleClass("currentSelect"),e.children("input, #sectionDropdown, #categoryDropdown").remove(),e.children(".item-name, .fa").css("display","block"),e.children("select.type").val(dropdownValue),e.children("select").css("background-color","#e0e0e0").attr("disabled","disabled"),e.children(".editSaveButton, .editCancelButton").css("display","none"),e.children(".editButton, .deleteButton").css("display","inline")}),$("body").on("click",".menuManagement .deleteButton",function(){if(confirm("Delete "+$(this).parent().children(".type").val()+"?"))for(var e=$(this).parent().attr("id"),t=!0,n=0;n<currentItems.length&&t;n++)e==currentItems[n].id&&(currentItems.splice(n,1),d(),m(),t=!1)}),$("body").on("click",".delete-child-button",function(){var e=$(this).parent();confirm("Delete "+e.children("select.type").val()+"?")&&(a($(this).parent()),lastModifiedParent=e.parent().parent().attr("id"),d(),m())}),$("body").on("click",".edit-child-button",function(){var e=$(this).parent();e.children(".item-name, .fa").css("display","none"),e.children(".type").toggleClass("currentSelect"),e.children("select").removeAttr("disabled").css("background-color","#ffffff"),dropdownValue=e.children("select.type").val(),h(e.children("select.type").find(":selected").text().toLowerCase(),e),e.children(".edit-save-child, .cancel-edit-child").css("display","inline"),e.children(".edit-child-button, .delete-child-button").css("display","none")}),$("body").on("click",".cancel-edit-child",function(){var e=$(this).parent();e.children(".select2").remove(),e.children("select.type").toggleClass("currentSelect"),e.children("input, #sectionDropdown, #categoryDropdown").remove(),e.children(".item-name, .fa").css("display","block"),e.children("select.type").val(dropdownValue),e.children("select").attr("disabled","disabled").css("background-color","#e0e0e0"),e.children(".edit-save-child, .cancel-edit-child").css("display","none"),e.children(".edit-child-button, .delete-child-button").css("display","inline")}),$("body").on("click",".edit-save-child",function(){var e=$(this).parent();if(confirm("Edit "+e.children("select.type").val()+"?")){var t=e.parent().parent().index(),n=a(e),i=g(e,n);currentItems[t-1].children.splice(n,0,i),lastModifiedParent=e.parent().parent().attr("id"),d(),m()}}),$("body").on("click","#save-changes",function(){articleUpdate?(function(){var e=oldIndex,t=newIndex,n=[];if((t=oldIndex<newIndex?(e=oldIndex,newIndex):(e=newIndex,oldIndex))!=e){for(;e<=t;e++)i=e,a=void 0,a=$.ajax({url:"/api/v2/help_center/articles/"+articles[i]+".json",type:"PUT",dataType:"json",contentType:"application/json",data:JSON.stringify({article:{position:e}})}),n.push(a);$.when.apply(null,n)}var i,a}(),function(){for(var a=[],s=[],e=articlesChangeLOC.length,l=0;l<e;l++)!function(n){if(null!=articlesChangeLOC[n].labels)for(var i=articlesChangeLOC[n].labels,e=0;e<i.length;e++)!function(e){if(i[e].name.includes("LOC")){var t=$.ajax({url:"/api/v2/help_center/articles/"+articlesChangeLOC[n].id+"/labels/"+i[e].id+".json",type:"DELETE"});s.push(t)}}(e);if(""!=articlesChangeLOC[l].loc){var t=$.ajax({url:"/api/v2/help_center/articles/"+articlesChangeLOC[n].id+"/labels.json",type:"POST",data:{label:{name:articlesChangeLOC[l].loc}}});a.push(t)}}(l);$.when.apply(null,s).done(function(){$.when.apply(null,a).done(function(){$("#save-changes").attr("disabled","disabled")})})}()):sectionUpdate?function(){if(sectionsFirstIndex!==sectionsLastIndex){for(var e=[],t=sectionsFirstIndex;t<=sectionsLastIndex;t++){var n=$.ajax({url:"/api/v2/help_center/sections/"+sections[t].id,type:"PUT",data:{section:{position:t}}});e.push(n)}$.when.apply(null,e).done(function(){$("#save-changes").attr("disabled","disabled")})}}():($(this).css({cursor:"wait"}),d(),m())}),$("body").on("click",".enabled",function(){$(this).attr("disabled","disabled");var s=$(this).parent().attr("id"),l=$(this).attr("class").split(" ")[0],r=[],c=[];o(s).done(function(e){for(var t=0;t<e.labels.length;t++){var n=e.labels[t].name;if(n.includes(l)){n=n.replace(/tags:/g,"");var i=$.ajax({url:"/api/v2/help_center/en-us/articles/"+s+"/labels/"+e.labels[t].id+".json",type:"DELETE"});c.push(i);var a=$.ajax({url:"/api/v2/help_center/articles/"+s+"/labels.json",type:"POST",data:{label:{name:"DT:"+n}}});r.push(a)}}console.log("labelClass: "+l)}),$(this).removeClass("enabled").addClass("disabled"),$("#products").val().toLowerCase()==l.toLowerCase()&&($(this).parent().find(".article ").addClass("lineTrough"),console.log("products: "+$("#products").val().toLowerCase()),console.log("labels: "+l.toLowerCase()),$(this).parent().children(".article-visibility").children("i").hasClass("fa-eye")&&$(this).parent().children(".article-visibility").children("i").toggleClass("fa-eye").toggleClass("fa-eye-slash")),$(this).removeAttr("disabled")}),$("body").on("click",".disabled",function(){$(this).attr("disabled","disabled");var n=$(this).parent().attr("id"),i="DT:"+$(this).attr("class").split(" ")[0],a=$(this).attr("class").split(" ")[0];o(n).done(function(e){for(var t=0;t<e.labels.length;t++)if(e.labels[t].name==i){e.labels[t].name;s(n,e.labels[t].id).done(function(){r(n,a,!1)})}}),$(this).removeClass("disabled").addClass("enabled"),$(this).parent().find(".article ").removeClass("lineTrough"),$(this).parent().children(".article-visibility").children("i").hasClass("fa-eye-slash")&&$(this).parent().children(".article-visibility").children("i").toggleClass("fa-eye").toggleClass("fa-eye-slash"),$(this).removeAttr("disabled")}),$("body").on("click",".parent-visibility",function(){$(this).attr("disabled","disabled");var e=$(this).children("i.fa").hasClass("fa-eye")?0:1;currentItems[$(this).parent().index()-1].v=e,m(),$(this).children("i.fa").toggleClass("fa-eye-slash").toggleClass("fa-eye"),setTimeout(function(){location.reload()},100)}),$("body").on("click",".child-visibility",function(){$(this).attr("disabled","disabled");var e=$(this).children("i.fa").hasClass("fa-eye")?0:1,t=$(this).parent().parent().parent().index()-1;currentItems[t].children[$(this).parent().index()-1].v=e,lastModifiedParent=currentItems[t].id,m(),$(this).children("i.fa").toggleClass("fa-eye-slash").toggleClass("fa-eye"),setTimeout(function(){location.reload()},100)}),$("body").on("click",".section-visibility",function(){var n=$(this),i=$(this).parent(),a=i.attr("id"),s=$(this).children("i.fa").hasClass("fa-eye")?0:1;n.addClass("unclickable"),$.get("/api/v2/help_center/sections/"+a).done(function(e){var t=e.section.description;t=s?t.replace(/hidden/g,""):t+"hidden";$.ajax({url:"/api/v2/help_center/sections/"+a,type:"PUT",data:{section:{description:t}}}).done(function(){s?i.find(".categoryDrop").removeClass("lineTrough"):i.find(".categoryDrop").addClass("lineTrough"),n.children("i.fa").toggleClass("fa-eye-slash").toggleClass("fa-eye").removeClass("unclickable"),l(),location.reload()})})}),$("body").on("click",".article-visibility",function(){$(this).attr("disabled","disabled");var n=$(this).parent().attr("id");($(this).children("i.fa").hasClass("fa-eye")?0:1)?(o(n).done(function(e){var t=e.labels.filter(function(e){return e.name.includes("hidden")});s(n,t[0].id)}),$(this).parent().find(".article ").removeClass("lineTrough")):($(this).parent().find(".article ").addClass("lineTrough"),r(n,"hidden",!1)),$(this).children("i.fa").toggleClass("fa-eye-slash").toggleClass("fa-eye");var e=$(this).parent(),t=e.parent(".articles").parent();e.parent().find(".fa-eye").length<1?(t.find(".fa-eye").toggleClass("fa-eye-slash").toggleClass("fa-eye"),t.find(".categoryDrop").addClass("lineTrough")):(e.parent("ul.articles").prev(".section-visibility").children(".fa").removeClass("fa-eye-slash"),t.find(".categoryDrop").removeClass("lineTrough"),!e.parent(".articles").prev(".section-visibility").children(".fa").hasClass("fa-eye")&&e.parent(".articles").prev(".section-visibility").children(".fa").addClass("fa-eye")),l()})}function o(e){return $.get("/api/v2/help_center/en-us/articles/"+e+"/labels.json")}function s(e,t){return $.ajax({url:"/api/v2/help_center/en-us/articles/"+e+"/labels/"+t+".json",type:"DELETE"})}function r(e,t,n){var i=t;if(n)i="DT:"+t;return $.ajax({url:"/api/v2/help_center/articles/"+e+"/labels.json",type:"POST",data:{label:{name:i}}})}function a(e){for(var t=e.attr("id"),n=currentItems[e.parent().parent().index()-1].children,i=0;i<n.length;i++)if(t==n[i].id)return currentItems[e.parent().parent().index()-1].children.splice(i,1),i}function n(){$.get("/api/v2/help_center/en-us/articles/360017844052").done(function(e){menuObj=JSON.parse(e.article.body),$("article").css("display","none"),$mainWrapper.children("ul, li").remove(),$("#products").is(":visible")||function(){for(var e='<select id="products">',t=0;t<menuObj.products.length;t++)e+='<option value="'+menuObj.products[t].value+'">'+menuObj.products[t].text+"</option>";$mainWrapper.append(e+"</select>");var n=(i=storage.getItem("global-filterSetting"),"mdx_2_0"===i?"mdx2":"mdx_nxt"===i?"sas":"newdsp"==i?"newDsp":"dsp"===i?"dsp":"dmp"===i?"dmp":"support_kb"===i?"supportKb":"mdx2");var i;$("#products").val(n)}(),c(),p(),i(),$("#"+lastModifiedParent).children("i").click(),$mainWrapper.children("ul").prepend(t)})}function i(){$(".type, .visibility").attr("disabled","disabled")}function c(){var e=$("select#products option:selected").val();"mdx2"===e?currentItems=menuObj.mdx2:"sas"===e?currentItems=menuObj.sas:"newDsp"===e?currentItems=menuObj.newDsp:"dsp"===e?currentItems=menuObj.dsp:"dmp"===e?currentItems=menuObj.dmp:"supportKb"===e&&(currentItems=menuObj.supportKb)}function d(){var e=$("select#products option:selected").val();"mdx2"===e?menuObj.mdx2=currentItems:"sas"===e?menuObj.sas=currentItems:"newDsp"===e?menuObj.newDsp=currentItems:"dsp"===e?menuObj.dsp=currentItems:"dmp"===e?menuObj.dmp=currentItems:"supportKb"===e&&(menuObj.supportKb=currentItems)}function p(){$("select#products option:selected").val();var e=currentItems.length;$mainWrapper.append('<ul class="menuManagement" id="mainUL"></ul>');for(var t=0;t<e;t++)if($(".menuManagement").append(u(currentItems[t])),void 0!==currentItems[t].children){for(var n="",i=0;i<currentItems[t].children.length;i++)n+=u(currentItems[t].children[i],!0);$("#children-"+currentItems[t].id).append('<li class="addNew"><a class="add-child-button">+ ADD</a></li>'+n).css("display","none")}$("#mainUL").nestedSortable({items:" > li:not(.addNew)",placeholder:"ui-state-highlight",listType:"ul",disableParentChange:!0,protectRoot:!0,handle:".fa-th-large",update:function(e,t){var n=currentItems.findIndex(function(e){return e.id==t.item[0].id});y(currentItems,n,$("#mainUL #"+t.item[0].id).index()-1),v()}}),$("ul.sublist").nestedSortable({disableParentChange:!0,protectRoot:!0,items:" > li:not(.addNew)",placeholder:"ui-state-highlight",listType:"ul",handle:".fa-th-large",update:function(e,t){var n=$("#mainUL #"+t.item[0].id).parent().parent().index()-1,i=currentItems[n].children.findIndex(function(e){return e.id==t.item[0].id});y(currentItems[n].children,i,$("#mainUL #"+t.item[0].id).index()-1),lastModifiedParent=$("#mainUL #"+t.item[0].id).parent().parent().attr("id"),v()}})}function v(){$("#save-changes").removeAttr("disabled")}function y(e,t,n){for(;t<0;)t+=e.length;for(;n<0;)n+=e.length;if(n>=e.length)for(var i=n-e.length;1+i--;)e.push(void 0);return e.splice(n,0,e.splice(t,1)[0]),e}function u(e,t){var n=e.v?"fa-eye":"fa-eye-slash",i=t?"child-visibility":"parent-visibility",a='<select class="type" id="'+e.id+'"><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option><option value="custom">Custom</option></select>';"category"==e.type?a='<select class="type" id="'+e.id+'"><option value="category">Category</option><option value="text">Text</option><option value="section">Section</option><option value="custom">Custom</option></select>':"section"==e.type?a='<select class="type" id="'+e.id+'"><option value="section">Section</option><option value="text">Text</option><option value="category">Category</option><option value="custom">Custom</option></select>':"custom"==e.type&&(a='<select class="type" id="'+e.id+'"><option value="custom">Custom</option><option value="text">Text</option><option value="category">Category</option><option value="section">Section</option></select>');var s=null==e.children?'<a class="'+i+'" title="Hide"><i class="fa '+n+'" style="font-size: 20px;"></i></a><a class="edit-child-button" title="Edit"><i class="fa fa-pencil" style="font-size: 20px;"></i></a><a class="delete-child-button" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a><a class="edit-save-child" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a><a class="cancel-edit-child" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a>':'<a class="'+i+'" title="Hide"><i class="fa '+n+'" style="font-size: 20px;"></i></a><a class="editButton" title="Edit"><i class="fa fa-pencil" style="font-size: 20px;"></i></a><a class="deleteButton" title="Delete"><i class="fa fa-trash" style="font-size: 20px;"></i></a><a class="editSaveButton" title="Save"><i class="fa fa-check" style="font-size: 20px;"></i></a><a class="editCancelButton" title="Cancel"><i class="fa fa-times" style="font-size: 20px;"></i></a><ul class="sublist" id="children-'+e.id+'"></ul></li>',l="",r="",c="text"!=e.type?"link-zendesk":"";return"custom"===e.type?r="href="+e.url:(l='<i class="fa fa-angle-right" style="font-size: 16px;"></i>',"text"!=e.type&&(r='href="/hc/admin/categories/'+e.id+'/edit"')),'<li id="'+e.id+'"><i class="fa fa-th-large"></i>'+l+'<div class="item-name"><a class="categoryDrop '+c+'" '+r+' target="_blank">'+e.title+"</a></div>"+a+s}function h(e,t){var n=JSON.parse(storage.getItem(HelpCenter.user.email+"-allCategories"+helpCenterVer+currentLang)),i=n.length;if($(".menuManagement .select2").remove(),"text"==e)$(".menuManagement #categoryDropdown").remove(),$(".menuManagement #sectionDropdown").remove(),$(".menuManagement input").remove(),t.prepend('<input type="text" placeholder="Text..">'),t.children('input[type="text"]').val(t.children(".item-name").children("a.categoryDrop").text());else if("category"===e){for(var a='<select id="categoryDropdown">',s=0;s<i;s++)a+='<option value="'+n[s].id+'">'+n[s].name+"</option>";a+="</select>",t.children("input").remove(),$(".menuManagement #sectionDropdown").remove(),t.prepend(a),$(".menuManagement #categoryDropdown").val(t.attr("id")).select2()}else if("section"===e){for(var l=JSON.parse(storage.getItem(HelpCenter.user.email+"-allSections"+helpCenterVer+currentLang)),r=l.length,c='<select id="sectionDropdown">',o=0;o<i;o++){c+='<optgroup class="'+n[o].id+'" label="'+n[o].name+'">';for(var d=0;d<r;d++)n[o].id===l[d].category&&(c+='<option class="'+n[o].id+'" value="'+l[d].id+'">'+l[d].name+"</option>"),d+1===r&&(c+="</optgroup>")}c+="</select>",t.children("input").remove(),$(".menuManagement #categoryDropdown").remove(),t.prepend(c),$(".menuManagement #sectionDropdown").val(t.attr("id")).select2(),$("#sectionDropdown").children("option").wrap("<span/>")}else"custom"===e&&(t.children('input[type="text"]').remove(),$(".menuManagement #categoryDropdown").remove(),$(".menuManagement #sectionDropdown").remove(),t.prepend('<input type="url" placeholder="URL...">'),t.prepend('<input type="text" placeholder="Text...">'),t.children('input[type="text"]').val(t.find(".categoryDrop").text()),t.children('input[type="url"]').val(t.find(".categoryDrop").attr("href")))}function f(){$("#save-changes").css("cursor","default").attr("disabled","disabled"),$mainWrapper.children("ul, li").remove(),c(),p(),$mainWrapper.children("ul").prepend(t)}function m(){$.ajax({url:"/api/v2/help_center/articles/360017844052/translations/en-us.json",type:"PUT",dataType:"json",contentType:"application/json",data:JSON.stringify({translation:{body:JSON.stringify(menuObj)}})}).done(function(){f(),n()})}function g(e,t){var n=e.children("select.type").val(),i=e.children('input[type="text"]').val(),a=e.children("select#categoryDropdown"),s=e.children("select#sectionDropdown"),l="10000000-1000-4000-8000-100000000000".replace(/[018]/g,function(e){return(e^crypto.getRandomValues(new Uint8Array(1))[0]&15>>e/4).toString(16)});a.is(":visible")&&(i=a.find(":selected").text(),l=parseInt(a.find(":selected").val())),s.is(":visible")&&(i=s.find(":selected").text(),l=parseInt(s.find(":selected").val()));var r={title:i,id:l,position:t,type:n,v:1};return"text"===n&&(r.children=editChildren),"custom"===n&&(r.url=e.children('input[type="url"]').val()),r}function b(e){for(var t=0;t<e.length;t++)if(!e[t].draft)return!1;return!0}function x(e){for(var t=e.length,n="",i=0;i<t;i++)e[i].includes("DT")||!e[i].includes("mdx2")&&!e[i].includes("kbmdx")?e[i].includes("DT")&&(e[i].includes("mdx2")||e[i].includes("kbmdx"))&&(e[i].includes("kbmdx")?n+='<span class="kbmdx disabled">MDX 2.0</span>':n+='<span class="mdx2 disabled">MDX 2.0</span>'):e[i].includes("kbmdx")?n+='<span class="kbmdx enabled">MDX 2.0</span>':n+='<span class="mdx2 enabled">MDX 2.0</span>',(e[i].includes("mdxnxt")||e[i].includes("kbmdxnxt")||e[i].includes("kbsas"))&&!e[i].includes("DT")?e[i].includes("mdxnxt")?n+='<span class="mdxnxt enabled">SAS</span>':e[i].includes("kbmdxnxt")?n+='<span class="kbmdxnxt enabled">SAS</span>':e[i].includes("kbsas")&&(n+='<span class="kbsas enabled">SAS</span>'):e[i].includes("DT")&&(e[i].includes("mdxnxt")||e[i].includes("kbmdxnxt")||e[i].includes("kbsas"))&&(e[i].includes("mdxnxt")?n+='<span class="mdxnxt disabled">SAS</span>':e[i].includes("kbmdxnxt")?n+='<span class="kbmdxnxt disabled">SAS</span>':e[i].includes("kbsas")&&(n+='<span class="kbsas disabled">SAS</span>')),e[i].includes("newdsp")&&!e[i].includes("DT")?n+='<span class="newdsp enabled">NEW DSP</span>':e[i].includes("newdsp")&&e[i].includes("DT")&&(n+='<span class="newdsp disabled">NEW DSP</span>'),e[i].includes("dsp")&&!e[i].includes("DT")?n+='<span class="dsp enabled">DSP</span>':e[i].includes("dsp")&&e[i].includes("DT")&&(n+='<span class="dsp disabled">DSP</span>'),e[i].includes("dmp")&&!e[i].includes("DT")?n+='<span class="dmp enabled">DMP</span>':e[i].includes("dmp")&&e[i].includes("DT")&&(n+='<span class="dmp disabled">DMP</span>');return n}function C(e){for(var t=articles.length,n=0;n<t;n++){if(articles[n]==e){return n}}}function I(e){for(var t=$("#mainUL #"+e).parentsUntil("ul.articles","ul"),n=0,i=$("#mainUL #"+e).prevAll("li.menu-admin-article"),a=0;a<i.length;a++){n+=$(i[a]).find("li").addBack().length}for(var s=0;s<t.length;s++){n+=$(t[s]).parent().prevAll("li.menu-admin-article").addBack().length;i=$(t[s]).parent().prevAll("li.menu-admin-article");for(var a=0;a<i.length;a++){n+=$(i[a]).find("li").length}}return n}function w(e){var t=$("#mainUL #"+e).parentsUntil("ul.articles","ul");return t.length<1?"":"LOC_"+(t.length+1)}function D(e){for(var t=true,n=0;n<articlesChangeLOC.length;n++){if(articlesChangeLOC[n].id===e.id){t=false;articlesChangeLOC[n].loc=e.loc}}t&&articlesChangeLOC.push({id:e.id,loc:e.loc})}function L(){for(var e=articlesChangeLOC.length,t=0;t<e;t++){(function(t){if(undefined===articlesChangeLOC[t].labels){$.get("/api/v2/help_center/articles/"+articlesChangeLOC[t].id+"/labels.json").done(function(e){articlesChangeLOC[t].labels=e.labels})}})(t)}}});