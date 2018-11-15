//static function definitions from master JS to reduce the filesize.
function expand() {
    $("#sectionloader").css("display", "block");
    if ($("body.support_kb").find("ul#show-data").length && $("#sectionloader").length) {
        $("body.support_kb").find(".article-list:first").css("display", "none");
        $("body.support_kb").find("ul#show-data").css({
            "display": "none",
            "padding-top": "0"
        });
        $("body.support_kb").find("#sectionloader").css("display", "block")
    }
    if ($("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").length) $("body.support_kb").find("ul#show-data li.treeline").prev("div.icon").nextUntil("div").slideUp(1E3, function() {
        $("ul#show-data").find("i").attr("class", "fa fa-plus");
        $("body.support_kb").find("ul#sectionloader").css("display", "none");
        $("body.support_kb").find("ul#show-data").css("display", "block");
        $("body.support_kb").find("p.bodytext").css("display", "block");
        $($(this)).find("a").addClass("subtopic")
    });
    else {
        $("body.support_kb").find("#sectionloader").css("display", "none");
        $("body.support_kb").find("ul#show-data").css("display", "block")
    }
}

function styleTicketTable() {
    $("#relatedTicketsTable").bootgrid({
        caseSensitive: false,
        sorting: true,
        columnSelection: true,
        selection: false,
        multiSelect: false,
        rowSelect: false,
        keepSelection: false,
        pagination: 10,
        rowCount: [10, 25, 50, 75, -1],
        searchSettings: {
            characters: 1
        },
        labels: {
            noResults: "No related tickets yet",
            search: "Search",
            all: "Show all",
            infos: "{{ctx.start}} to {{ctx.end}} of {{ctx.total}}",
            loading: "Loading...",
            refresh: "Refresh"
        },
        formatters: {
            "id": function(column, row) {
                return '<a href="https://sizmek.zendesk.com/agent/tickets/' + row[column.id] + '" target="_blank">' + row[column.id] + "</a>"
            },
            "status": function(column, row) {
                return '<span class="status-icon status-' + row[column.id] + '">' + row[column.id] + "</span>"
            }
        }
    })
}

//1
function toTitleCase(str) {
    return str.replace(/\w\S*/g, function(txt) {
        return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase()
    })
}

//2
function cleanTextOnly(txt) {
    txt = txt.trim().replace(/@[\w-\(|\)]+\s/ig, "");
    return txt;
}

//7
function isIE() {
    var myNav = navigator.userAgent.toLowerCase();
    return myNav.indexOf("msie") != -1 ? parseInt(myNav.split("msie")[1]) : false
}

//3
function changeDisplayUsername() {
    var uname = HelpCenter.user.name;
    var display = "";
    var res = uname.split(" ");
    for (var x = 0; x < res.length; x++) var display = display + res[x][0];
    $("#user-name").text(display)
}

//4
function updateKSelect(selected) {
    $("#switchTag").prev(".k-select").find(">ul").empty();
    $("#switchTag option").each(function() {
        var option = $(this).text();
        var value = $(this).val();
        if (selected == value) {
            $(this).parent().prev(".k-select").find("span").first().html(option);
            $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + "<span>" + value + "</span></li>")
        } else $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
    })
}

//5
function KSelect() {
    $(".wrapper .select-picker").each(function() {
        $(this).hide().addClass("k-selected").removeClass("select-picker");
        var selected = $(this).val();
        $(this).before('<div class="k-select" tabindex="-1"><span></span><ul></ul></div>');
        $(this).find("option").each(function() {
            var option = $(this).text();
            var value = $(this).val();
            if (selected == value) {
                $(this).parent().prev(".k-select").find("span").first().html(option);
                $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + "<span>" + value + "</span></li>")
            } else $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
        })
    })
};


function addIcons() {
    $("li.loc").each(function(i, obj) {
        try {
            var c = $(this).attr("class"),
                n = $(this).next("li.loc").attr("class"),
                s = c.toString().split(" "),
                g = n.toString().split(" "),
                nn = g[2].replace(/ /g, ".").replace(/\D/g, ""),
                cc = s[2].replace(/ /g, ".").replace(/\D/g, "")
        } catch (e$3) {}
        if (parseInt(nn) > parseInt(cc)) {
            if ($(this).find("i").length == 0) {
                $(this).prepend('<i class="fa fa-angle-right" style="margin-left:7px"></i>');
                $(this).addClass("has-arrow")
            }
        } else;
    })
}
//8
$(function() {

    // GA tracking 
    // Capture where ticket submit occurs (indicates these article may need improvements)
    $('a.submit-a-request, .article-more-questions a').on('click', function(e) {
        var path = window.location.pathname;
        ga('send', 'event', 'Open a ticket', 'Ticket requested from ', path);
    });


    var superCategories = $('.category.dsp > a , #nav-list > li > a');
    if (superCategories.length > 0) {
        if (isIE() == 8)
            if (window.location.href.indexOf("206321873") == -1) window.location.replace("/hc/" + currentLang + "/articles/206321873");
            else {
                $(".user-nav").hide();
                $(".search").hide();
                $(".in-this-articles").hide();
                $(".article-subscribe").hide();
                $(".notification").hide();
                $(".article-footer").hide();
                $(".article-comments").hide();
                $(".breadcrumbs").hide();
                $("body").css("font-family", "arial");
                $("main").show();
                return false
            }
        $('body').on('click', '.cssCircle.plusSign', function(event) {
            event.stopPropagation();
            var appendTag = $(this).parent().find(".tagName").text();
            var textQuery = $("#query");
            textQuery.val($("#query").val() + " " + appendTag);
            textQuery.focus();
            window.location.href = "https://support.sizmek.com/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(textQuery.val()) + "&commit=Search"
        });

        if (isIE() == 8)
            if (window.location.href.indexOf("206321873") == -1) window.location.replace("/hc/" + currentLang + "/articles/206321873#notice");
            else {
                $(".user-nav").hide();
                $(".search").hide();
                $(".in-this-articles").hide();
                $(".article-subscribe").hide();
                $(".notification").hide();
                $(".article-footer").hide();
                $(".article-comments").hide();
                $(".breadcrumbs").hide();
                $("body").css("font-family", "arial");
                $("main").show();
                return false
            }

        $('body').on('click', '.cssCircle.plusSign', function(event) {
            event.stopPropagation();
            var appendTag = $(this).parent().find(".tagName").text();
            var textQuery = $("#query");
            textQuery.val($("#query").val() + " " + appendTag);
            textQuery.focus();
            window.location.href = "https://support.sizmek.com/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(textQuery.val()) + "&commit=Search"
        });

        $('body').on('click', 'a.hashTags', function() {
            var currTag = $(this).find('.tagName:first').text();
            $("#query").val(currTag);
            $("#query").focus();
            window.location.href = "https://support.sizmek.com/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(currTag) + "&commit=Search";
        });

        $('body').on('mouseover', 'a.hashTags', function() {
            var currTag = $(this).find(".tagName:first").text().toLowerCase().substr(1);
            $(".hashTags." + currTag).css({
                "background-color": "#448df7",
                "color": "#fff",
                "border-color": "#448df7"
            });
        });
        $('body').on('mouseout', 'a.hashTags', function() {
            var currTag = $(this).find(".tagName:first").text().toLowerCase().substr(1);
            $(".hashTags." + currTag).css({
                "background-color": "",
                "color": "",
                "border-color": ""
            });
        });

        $("body").on("click", ".expand-control-text", function() {
            var expand_content = $(this).closest(".expand-container").find(".expand-content");
            if (expand_content.css("display") == "none") {
                $(this).addClass("arrowDown");
                expand_content.slideDown();
            } else {
                $(this).removeClass("arrowDown");
                expand_content.slideUp();
            }
        });

        $("#training_video").click(function(e) {
            e.preventDefault();
            $("#training_video").load(this.href).dialog("open")
        });
        $("a.expandingblocktemplate").unbind("click");
        $("a.jump:first").on("click", function() {
            $("div.expandingblock").slideDown()
        });
        $("a.jump:last").on("click", function() {
            $("div.expandingblock").slideUp()
        });
        $("a.expandingblocktemplate").unbind("click");
        $("a.expandingblocktemplate").on("click", function(e) {
            e.preventDefault();
            if ($(this).parent().next().attr("visible") == "true") {
                $(this).parent().next().slideUp();
                $(this).parent().next().attr("visible", "false")
            } else {
                $(this).parent().next().slideDown();
                $(this).parent().next().attr("visible", "true")
            }
            return false
        });
        $(".category-tree section.section").slideUp();
        $("section.category").find("a:first").attr("href",
            "#");
        $("section.category").find("a:first").attr("coll", "false");
        $("section.category").find("a:first").unbind("click");
        $("section.category").find("a:first").click(function(e) {
            e.preventDefault()
            if ($(this).attr("coll") == "false") {
                $(this).parent().parent().find("section.section").slideDown();
                $(this).attr("coll", "true");
                return false
            } else {
                $(this).parent().parent().find("section.section").slideUp();
                $(this).attr("coll", "false");
                return false
            }
            return false;
        });
        $(".nav li").each(function(i) {
            $(this).hover(function() {
                $(this).find("span").slice(0,
                    1).addClass("active");
                $(this).find("a").slice(0, 1).addClass("active")
            }, function() {
                $(this).find("span").slice(0, 1).removeClass("active");
                $(this).find("a").slice(0, 1).removeClass("active")
            })
        });
        $(".expandingblock").slideUp();
        $(".expandable").on("click", function() {
            var $this = $(this);
            if ($this.next(".expandingblock").css("display") == "none") {
                $(this).addClass("arrowDown");
                $this.next(".expandingblock").slideDown()
            } else {
                $(this).removeClass("arrowDown");
                $this.next(".expandingblock").slideUp()
            }
        });
        $(".expandable-procedure").on("click", function() {
            var $this = $(this);
            if ($this.next(".expandingblock").css("display") == "none") {
                $(this).addClass("arrowDown");
                $this.next(".expandingblock").slideDown()
            } else {
                $(this).removeClass("arrowDown");
                $this.next(".expandingblock").slideUp()
            }
        });
        $(".hp-expandingblock").slideUp();
        $(".sub-catblock").slideUp();
        $(".expandable-hp").on("click", function() {
            var $this = $(this);
            if ($this.next(".hp-expandingblock").css("display") == "none") {
                $(this).addClass("arrowDown");
                $this.next(".hp-expandingblock").slideDown()
            } else {
                $(this).removeClass("arrowDown");
                $this.next(".hp-expandingblock").slideUp()
            }
        });
        $(".share a").click(function(e) {
            e.preventDefault();
            window.open(this.href, "", "height = 500, width = 500")
        });
        $(".share-label").on("click", function(e) {
            e.stopPropagation();
            var isSelected = this.getAttribute("aria-selected") == "true";
            this.setAttribute("aria-selected", !isSelected);
            $(".share-label").not(this).attr("aria-selected", "false")
        });
        $(document).on("click",
            function() {
                $(".share-label").attr("aria-selected", "false")
            });
        $(".answer-body textarea").one("focus", function() {
            $(".answer-form-controls").show()
        });
        $(".comment-container textarea").one("focus", function() {
            $(".comment-form-controls").show()
        });
        $("a.submit-a-request").text("Contact Support");
        $(".fancybox").fancybox();
        $(".fancybox-media").fancybox({
            openEffect: "none",
            closeEffect: "none",
            helpers: {
                media: {}
            }
        });

        $(".incident-item-cont table:not([class*='msgboard'])").addClass("msgboard");
        if ($(".header").html().indexOf("Message Board") > -1) $(".article-body table:not([class*='msgboard']").addClass("msgboard");

        //6
        var thisVideo;
        var aURL = window.location.href;
        if ($("video").length > 0) {
            $("video").each(function() {
                thisVideo = this
            });
            thisVideo.addEventListener("play", trackEventGA("play"), false);
            thisVideo.addEventListener("pause", trackEventGA("pause"), false);
            thisVideo.addEventListener("ended", trackEventGA("end"), false)
        }

        function trackEventGA(ev) {
            ga("send", "event", "Videos", ev, aURL)
        }


        //10
        $(".language-picker").on("change", function() {
            window.location.href = $(this).val();
        });

        //12
        $("#nav-list > .mdxcat > .fa").click(function() {
            if ($(this).hasClass("fa-angle-down") == true) $(this).parent().css("background-color", "#00234e");
            else $(this).parent().css("background-color", "#001937")
        });
        $("#nav-list > .mdxcat > .categoryDrop").click(function() {
            if ($(this).prev(".fa").hasClass("fa-angle-down") == true) $(this).parent().css("background-color", "#00244d"), $(this).removeAttr("style");
            else $(this).parent().css("background-color", "rgb(0, 25, 55)"), $(this).css("color", "#fff")
        });
        $("#nav-list > .addtlResources > .categoryDrop").click(function() {
            if ($(this).prev(".fa").hasClass("fa-angle-down") == true) {
                $(this).parent().css("background-color", "#00244d"), $(this).removeAttr("style");
            } else {
                $(this).parent().css("background-color", "rgb(0, 25, 55)"), $(this).css("color", "#fff");
            }
        });
        $(".category.dsp > a , #nav-list > li > a").click(function() {
            if ($(this).parent().find("> i ").hasClass("fa-angle-right") == true) {
                $(this).parent().css("background-color", "#001937");
                $(this).css("color", "white")
            } else {
                $(this).parent().css("background-color", "#00244d");
                $(this).removeAttr("style")
            }
        });

        try {
            if (top.location.href.indexOf("/hc/admin") > -1) {
                $("html").css("display", "block");
                $("main").css("display", "block");
            }
        } catch (e$4) {}
    } else {
        setTimeout(arguments.callee, 100);
    }
})

function highlightCurrAddResPage(linkID) {
    (function() {
        var additionalResources = $(".addtlResources");
        if (additionalResources.length > 0) {
            $(".addtlResources ul").slideDown();
            $(".addtlResources #" + linkID).find("a").addClass("currPage");
            additionalResources.css("background-color", "#001937");
            additionalResources.find("a").eq(0).css("color", "white");
        } else {
            setTimeout(arguments.callee, 100);
        }
    })()
}

function setCertifiedLink() {
    if ($("#switchTag").val() == "dsp") {
        $("#certifiedLink").attr("href", "/hc/en-us/articles/360001069612");
    } else if ($("#switchTag").val() == "mdx_nxt") {
        $("#certifiedLink").attr("href", "/hc/en-us/categories/201269943");
    } else {
        $("#certifiedLink").attr("href", "/hc/en-us/categories/201131993");
    }
}
setCertifiedLink();


function showsearch() {
    function addStyleString(str) {
        var node = document.createElement("style");
        node.innerHTML = str;
        node.id = "showsearchinput";
        document.body.appendChild(node);
        $("#query").focus();
        var node1 = document.createElement("div");
        node1.className = "modal-backdrop  in";
        document.body.appendChild(node1);
    }
    if (vck == 1) {
        addStyleString(".sub-nav .search { position:fixed!important;z-index:9999999!important;top: 40vh!important;left: 35vw!important;padding: 10px!important;background:#003471;border-radius:10px;width:500px!important;}.sub-nav .search input[type=search] {margin-top:0px!important;}");
    }
}

/* - removed accordion codes
var accordion_head = $(".accordion > li > a");
var accordion_body = $(".accordion li > .sub-menu");
accordion_head.on("click", function(event) {
    event.preventDefault();
    if ($(this).attr("class") != "active") {
        accordion_body.slideUp("normal");
        $(this).next().stop(true, true).slideToggle("fast");
        accordion_head.removeClass("active");
        $(this).addClass("active");
        $(".accordion").children("li").children("ul").each(function() {
            $("li", this).css("border-bottom", "none");
            $("li:visible:last", this).css("border-bottom", "1px solid #BACAE4");
            $("li:visible:first", this).children("a").addClass("accordionFirst");
            $("li:visible:last", this).children("a").addClass("accordionLast")
        });
        $($(".accordion .active").parent().children("ul").children("li:not([class])")[0]).children("a").css("padding-top",
            "25px")
    } else {
        accordion_body.slideUp("normal");
        accordion_head.removeClass("active")
    }
});

//11
function isElemInView(elem) {
    var docViewTop = $(window).scrollTop();
    var docViewBottom = docViewTop + $(window).height();
    var elemTop = $(elem).offset().top;
    var elemBottom = elemTop + $(elem).height();
    return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
}

//* 25
var apiURL = "/api/v2/help_center/" + currentLang + "/categories.json?per_page=100";
if ($(".hero-unit").length == 1) {
    var getCategories = function() {
        $.get(apiURL).done(function(data) {
            apiURL = data.next_page;
            var categories = $.map(data.categories, function(category, i) {
                return {
                    "name": category.name,
                    "url": category.html_url,
                    "desc": category.description
                }
            });
            $.each(categories, function(i, category) {
                var newHTML = '<a href="' + category["url"] + '"><span style="display:none">' + category["desc"] + "</span>" + category["name"] + "</a>";
                var realHTML = $("<li>").html(newHTML);
                var exHTML = $("<li>").html(newHTML).html();
                if (category["desc"] !== "") {
                    if (category["desc"].indexOf("@") > -1)
                        if (category["desc"].split("@")[1].split(" ")[0].indexOf("--") > -1) {
                            var superCat = category["desc"].split("@")[1].split(" ")[0].split("--")[0].replace(/-/g, " ");
                            var superCatClass =
                                "tab" + toTitleCase(superCat).replace(/ /g, "");
                            var superSubCat = category["desc"].split("@")[1].split(" ")[0].split("--")[1].replace(/-/g, " ");
                            var superSubCatClass = "tab" + toTitleCase(superSubCat).replace(/[- )(]/g, "");
                            if ($("." + superCatClass + " ." + superSubCatClass).length) realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                            else {
                                var currHTML = $("." + superCatClass + " .sub-menu").html();
                                $("." + superCatClass + " " + ".sub-menu").html(currHTML + '<li class="' + superSubCatClass + '"><a href="#" class="superSubAccor" onclick="event.preventDefault()"><b>' +
                                    superSubCat + '</b></a><ul class="sub-sub-menu"></ul></li>');
                                realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu")
                            }
                        } else {
                            if (category["desc"].indexOf("@your-resources") > -1) realHTML.appendTo(".tabYourResources .sub-menu");
                            if (category["desc"].indexOf("@getting-started") > -1) realHTML.appendTo(".tabGettingStarted .sub-menu");
                            if (category["desc"].indexOf("@campaign-management") > -1) realHTML.appendTo(".tabCampaignManagement .sub-menu");
                            if (category["desc"].indexOf("@data") > -1) realHTML.appendTo(".tabData .sub-menu");
                            if (category["desc"].indexOf("@creative") > -1) realHTML.appendTo(".tabCreative .sub-menu");
                            if (category["desc"].indexOf("@publishers") > -1) realHTML.appendTo(".tabPublishers .sub-menu");
                            if (category["desc"].indexOf("@certified") > -1) realHTML.appendTo(".tabCertified .sub-menu")
                        }
                } else if (exHTML.indexOf(">@") >= 0)
                    if (exHTML.split(">@")[1].split(" ")[0].indexOf("--") >= 0) {
                        var superCat = exHTML.split(">@")[1].split(" ")[0].split("--")[0].replace(/-/g, " ");
                        var superCatClass = "tab" + toTitleCase(superCat).replace(/ /g,
                            "");
                        var superSubCat = exHTML.split(">@")[1].split(" ")[0].split("--")[1].replace(/-/g, " ");
                        var superSubCatClass = "tab" + toTitleCase(superSubCat).replace(/[- )(]/g, "");
                        if ($("." + superCatClass + " ." + superSubCatClass).length) realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu");
                        else {
                            var currHTML = $("." + superCatClass + " .sub-menu").html();
                            $("." + superCatClass + " " + ".sub-menu").html(currHTML + '<li class="' + superSubCatClass + '"><a href="#" class="superSubAccor" onclick="event.preventDefault()"><b>' + superSubCat +
                                '</b></a><ul class="sub-sub-menu"></ul></li>');
                            realHTML.appendTo("." + superSubCatClass + " .sub-sub-menu")
                        }
                    } else {
                        if (exHTML.indexOf("@your-resources") > -1) realHTML.appendTo(".tabYourResources .sub-menu");
                        if (exHTML.indexOf("@getting-started") > -1) realHTML.appendTo(".tabGettingStarted .sub-menu");
                        if (exHTML.indexOf("@campaign-management") > -1) realHTML.appendTo(".tabCampaignManagement .sub-menu");
                        if (exHTML.indexOf("@data") > -1) realHTML.appendTo(".tabData .sub-menu");
                        if (exHTML.indexOf("@creative") > -1) realHTML.appendTo(".tabCreative .sub-menu");
                        if (exHTML.indexOf("@publishers") > -1) realHTML.appendTo(".tabPublishers .sub-menu");
                        if (exHTML.indexOf("@certified") > -1) realHTML.appendTo(".tabCertified .sub-menu")
                    }
            });
            if (apiURL !== null) {
                apiURL += "&per_page=100";
                getCategories()
            } else if ($(".hero-unit").length > 0) $(".switchTag").change()
        })
    };
    getCategories()
}*/