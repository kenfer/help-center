/**
 * This script contains functions to handle support UFFA related functionalities.
 *
 * Author: Sizmek Support Team - John Kim (john.kim@sizmek.com)
 */

$(document).ready(function() {
    //
    // HC contribution
    //

    var treesettings = (HelpCenter.user.email + '-TreeSettings');
    var navSectionAPI = "/api/v2/help_center/sections.json?per_page=100&sort_by=created_at&sort_order=asc";
    var firstParentRun,
        navcatid,
        fullcatid,
        navsectionid,
        getnavSectionName,
        getnavSectionId,
        loadedCategoryID,
        sectionApiURL,
        currSectionId,
        treelist;

    var NavCatArrayready = 0;
    var NavArtArrayready = 0;
    var onpageLoad = 1;
    var navsecArray = [];

    var storage = window['localStorage'];
    var currentUser = HelpCenter.user.role;
    var isSectionPage = window.location.href.indexOf("/sections/") > -1;

    //loads data for article opened
    function loadArticleData() {

        //setup scrolling table of contents
        if ($(".article-body").length) {
            if ($(".article-header").text().toLowerCase().indexOf("glossary") > -1 || ($("#switchTag").val() == "support_kb")) {
                $(".quickNavMenu").tocify({
                    context: ".article-body",
                    selectors: "h2,h3"
                });
            } else {
                $(".quickNavMenu").tocify({
                    context: ".article-body",
                    selectors: "h2"
                });
            }
            $(".quickNavMenu").append('<ul id="backToTop" class="tocify-header nav nav-list"><li class="topLink"><a href="javascript:void(0);" onclick="scrollUp();" style="padding-top: 17px;">↑ &nbsp; Back to Top</a></li></ul>');
        }
        $("main").show();

        //script to make table header row stick during scroll
        function fixedHeaderReset() {

            //added for new zendesk top toolbar hovering over fixed header
            if ($("zd-hc-navbar").css("margin-top") < 0) $("div.stickyHeader").css("top", "0px");
            else $("div.stickyHeader").css("top", "45px");

            var tables = $('table.stickyHeader');
            tables.each(function(i) {
                var table = tables[i];
                var tableClone = $(table).clone(true).empty().removeClass('stickyHeader');
                var theadClone = $(table).find('thead').clone(true);
                var stickyHeader = $('<div></div>').addClass('stickyHeader hide').attr('aria-hidden', 'true');
                stickyHeader.append(tableClone).find('table').append(theadClone);
                $(table).after(stickyHeader);
                var tableHeight = $(table).height();
                var tableWidth = $(table).width() + Number($(table).css('padding-left').replace(/px/ig, "")) + Number($(table).css('padding-right').replace(/px/ig, "")) + Number($(table).css('border-left-width').replace(/px/ig, "")) + Number($(table).css('border-right-width').replace(/px/ig, ""));
                var headerCells = $(table).find('thead th');
                var headerCellHeight = $(headerCells[0]).height();
                var no_fixed_support = false;
                if (stickyHeader.css('position') == "absolute") {
                    no_fixed_support = true;
                }
                var stickyHeaderCells = stickyHeader.find('th');
                stickyHeader.css('width', tableWidth);
                var cellWidths = [];
                for (var i = 0, l = headerCells.length; i < l; i++) {
                    cellWidths[i] = $(headerCells[i]).outerWidth();
                }
                for (var i = 0, l = headerCells.length; i < l; i++) {
                    $(stickyHeaderCells[i]).css('width', cellWidths[i]);
                }
                var cutoffTop = $(table).offset().top;
                var cutoffBottom = tableHeight + cutoffTop - headerCellHeight;
                $(window).scroll(function() {
                    var currentPosition = $(window).scrollTop();
                    if (currentPosition > cutoffTop && currentPosition < cutoffBottom) {
                        stickyHeader.removeClass('hide');
                        if (no_fixed_support) {
                            stickyHeader.css('top', currentPosition + 'px');
                        }
                    } else {
                        stickyHeader.addClass('hide');
                    }
                });
            });
        }

        //setTimeout(fixedHeaderReset(), 2000);
        setInterval(function() {
            fixedHeaderReset();
        }, 500);

        /*
            $("zd-autocomplete-option").each(function() {
                cleanThisInnerHTML(this);
            });
        */

        //search enhancement suggestion from Tamir
        $("form[role='search']").submit(function(ev) {
            ev.preventDefault();
            var originQuery = $("#query").val();

            //search specific platform articles
            $("#query").attr('style', 'color:#FFFFFF !important');
            if ($("#query").val().length > 1) {
                if ($("#switchTag").val() == "mdx_2_0") $("#query").val("@mdx2 " + $("#query").val());
                if ($("#switchTag").val() == "mdx_nxt") $("#query").val("@mdxnxt " + $("#query").val());
                if ($("#switchTag").val() == "support_kb") $("#query").val("@topic @article @issue " + $("#query").val());
            }

            this.submit();

            setTimeout(function() {
                $("#query").attr('style', 'color:#000000 !important');
                $('#query').val(originQuery);
            }, 1);
        });

        if ($('#query').length > 0) $("#query").val($("#query").val().trim().replace(/\@[\w-()]+\s/ig, ""));

        //highlight last left node per Deb's request
        try {
            $(".steps > ul").children("li").each(function() {
                var splitPath = $(this).html().split("&gt;");
                splitPath[splitPath.length - 1] = "<span style='color:#faf000'>" + splitPath[splitPath.length - 1] + "</span>";
                $(this).html(splitPath.join("&gt;"));
            })
        } catch (e) {}
        try {
            $(".steps-StrikeAd > ul").children("li").each(function() {
                var splitPathStrikeAd = $(this).html().split("&gt;");
                splitPathStrikeAd[splitPathStrikeAd.length - 1] = "<span style='color:#FAF000'>" + splitPathStrikeAd[splitPathStrikeAd.length - 1] + "</span>";
                $(this).html(splitPathStrikeAd.join("&gt;"));
            })
        } catch (e) {}

    }
    loadArticleData();

    function removePageElems(appViewer) {
        if (appViewer) {
            $('.article-body').hide().parentsUntil('body').andSelf().siblings().hide();
            $(".main-column").css("margin", "0px");
            $(".article-body").css("padding", "0px");
            $(".article-wrapper").css("margin", "0px");
            $(".article-wrapper").css("padding-left", "10px");
            $("#sideNavigation").hide();
            $("#sidefoot").hide();
            $("main").css("width", "100%");
        } else {
            $('.article-body').show().parentsUntil('body').andSelf().siblings().hide();
        }

        $('h2').css('padding', '0px');
        $('h2').css('margin-top', '0px');
        $('h2').css('border-bottom', 'none');
        $(".article-sidebar").remove();
        $('.wrapper').css('min-height', 'initial');
        $('main').css('min-height', 'initial');
        $("html").css('height', 'auto');
        $("html").css("display", "block");
    }


    if ((window.location.href.indexOf("/articles/") > -1) || isSectionPage) {

        var ticketID, fromAppPlatform, fromAppCategory, fromAppSection, fromAppParent, fromAppArticle, fromAppTags, checkAccess, firstAppLoad = false;

        //app to iframe comm
        var appView = window.ZAFClient.init(function(context) {
            if (appView) {

                $("#suggestEdit .loaderBG").addClass("inAppLoader");
                $(".ticketSelector").hide();

                $('#suggestEdit').css({
                    boxShadow: 'none'
                })

                appView.postMessage('iframeLoaded');

                appView.on('updateTicketList', function(data) {

                    var recentTicketList;

                    if (storage.getItem("recentTicketList_" + window.helpCenterVer) === null) {
                        recentTicketList = [];
                        recentTicketList.push({
                            Id: data.ticketID,
                            Title: data.ticketSubject
                        });
                    } else {
                        recentTicketList = JSON.parse(storage.getItem("recentTicketList_" + window.helpCenterVer));

                        //add ticket to the top of dropdown
                        Array.prototype.move = function(old_index, new_index) {
                            if (new_index >= this.length) {
                                var k = new_index - this.length;
                                while ((k--) + 1) {
                                    this.push(undefined);
                                }
                            }
                            this.splice(new_index, 0, this.splice(old_index, 1)[0]);
                        };

                        recentTicketList.map(function(findTicket, i) {
                            if (findTicket.Id == data.ticketID) {
                                recentTicketList.move(i, 0);
                            } else {
                                if (i == (recentTicketList.length - 1) && recentTicketList[0].Id !== data.ticketID) {
                                    recentTicketList.unshift({
                                        Id: data.ticketID,
                                        Title: data.ticketSubject
                                    });
                                }
                            }
                        });
                    }
                    recentTicketList = recentTicketList.slice(0, 30); //keep up to 30 recent tickets

                    localStorage.setItem("recentTicketList_" + window.helpCenterVer, JSON.stringify(recentTicketList));
                })

                appView.on('addReviewUI', function(reviewVer) {
                    if (reviewVer.reviewType == "review_a_new_article") newArticle = true;
                    else newArticle = false;

                    if (newArticle || (reviewVer.highestVer == reviewVer.currVer)) {
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn").fadeIn();
                    } else {
                        $("#backBtn, #restoreBtn").fadeIn();
                    }

                    $("#backBtn").click(function() {
                        appView.postMessage('backBtn');
                    });

                    $("#rejectBtn").click(function() {
                        $("#suggestEditLabel").text("Reject All Changes?");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").hide();
                        $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").show();
                    });

                    $("#updateBtn").click(function() {
                        if (checkChanged()) {
                            if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) {
                                appView.postMessage('errorMsg', {
                                    msg: "<strong>Missing values!</strong><br/>Please select the article category and section."
                                });
                            } else {
                                //submit changes    
                                $.getJSON("/api/v2/users/me/session.json", function(data) {

                                    currUserID = data.session.user_id;

                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                    $("#updateBtn").text("PLEASE WAIT...");

                                    $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                        checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                        var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                        var nextVer = parseInt(reviewVer.highestVer) + 1;
                                        var newTitle;

                                        if (!newArticle) newTitle = "Article ID " + currArticleId + " - Revision ver." + reviewVer.majorVer + "." + nextVer;
                                        else newTitle = "New Article : " + $("#articleTitle").val() + " - Revision ver." + reviewVer.majorVer + "." + nextVer;

                                        var addArticleJSON = {
                                            "article": {
                                                "title": newTitle,
                                                "comments_disabled": true,
                                                "locale": "en-us",
                                                "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(","),
                                                "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                            }
                                        };
                                        $.ajax(createArticleAPI, {
                                            type: 'POST',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(addArticleJSON),
                                            success: function(data) {
                                                //updated version article created - now update ticket
                                                var commentStr;
                                                var ticketTags;

                                                commentStr = "Following values has been revised:\n";

                                                if (originalArticleTitle !== $("#articleTitle").val())
                                                    commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                if (originalPlatform !== $("#platformSelect option:selected").val())
                                                    commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                if (originalCategoryName !== $("#categorySelect option:selected").attr('name'))
                                                    commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr('name') + "\n";
                                                if (originalSectionName !== $("#sectionSelect option:selected").attr('name'))
                                                    commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr('name') + "\n";
                                                if (originalParent !== $("#parentSelect option:selected").attr('name') && $("#platformSelect>option:selected").index() == 3)
                                                    commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr('name') + "\n";
                                                if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ','))
                                                    commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ',') + "\n";

                                                if (CKEDITOR.instances.ckEditor.checkDirty())
                                                    commentStr += "\n\nArticle Content: Changed";
                                                else commentStr += "\n\nArticle Content: Same as version " + reviewVer.majorVer + "." + reviewVer.currVer;

                                                commentStr += "\n\nRevision Version: " + reviewVer.majorVer + "." + nextVer + " \nState: Updated \nReference No. " + data.article.id;



                                                ticketTags = reviewVer.ticketTags;

                                                var versionJSON = {
                                                    "ticket": {
                                                        "comment": {
                                                            "body": commentStr,
                                                            "author_id": currUserID
                                                        },
                                                        "tags": ticketTags.split(','),
                                                        "custom_fields": [{
                                                            "id": 24296553,
                                                            "value": $("#articleTitle").val()
                                                        }, {
                                                            "id": 24296523,
                                                            "value": $("#platformSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24340796,
                                                            "value": $("#categorySelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24296543,
                                                            "value": $("#sectionSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24303693,
                                                            "value": $("#parentSelect option:selected").attr('name')
                                                        }, {
                                                            "id": 24340816,
                                                            "value": $("#searchKeywords").val().replace(/[\s,]+/g, ',')
                                                        }],
                                                        "ticket_id": reviewVer.ticketID,
                                                        "security_token": checkAccess,
                                                        "action": "update"
                                                    }
                                                };

                                                var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;

                                                //version updates


                                                submitCheck = false;
                                                $("#suggestEdit .loaderBG").fadeIn();
                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                $("#suggestEdit .submitStatus").text("Submitting updated version...");


                                                $.ajax(tickAPI, {
                                                    method: 'POST',
                                                    data: JSON.stringify(versionJSON)
                                                }).done(function(resData, textStatus, xhr) {
                                                    //success

                                                    submitCheck = true;
                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                    $("#suggestEdit .submitStatus").text("Version updated successfully.");
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                        var showIP = data.ip;
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                        $("#suggestEdit .backSubmit").click(function() {
                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                            CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                            $("#updateBtn").text("UPDATE VERSION");

                                                        });
                                                    });
                                                }).complete(function() {
                                                    //handle complete
                                                    if (submitCheck) {
                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                        appView.postMessage('updateVersionDone');
                                                    }
                                                });

                                            },
                                            error: function() {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Sorry!</strong><br/>There was a problem submitting your version changes. Please try again later."
                                                });
                                            }
                                        });
                                    });
                                });
                            }
                        } else {
                            appView.postMessage('errorMsg', {
                                msg: "<strong>No changes found!</strong><br/>There are no changes to save as a new version."
                            });
                        }

                    });
                    $("#restoreBtn").click(function() {
                        CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                        $('#suggestEdit').find('input, textarea, select').css('background-color', 'initial');
                        $("#restoreBtn").hide();
                        $("#previewBtn, #publishBtn").show();
                    });
                    $("#approveBtn").click(function() {
                        CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).acceptAll();
                        $('#suggestEdit').find('input, textarea, select').css('background-color', 'initial');
                        $("#updateBtn, #rejectBtn, #approveBtn").hide();
                        $("#previewBtn, #publishBtn").show();
                    });
                    $("#previewBtn").click(function() {
                        var platformFilter, titleUpdated = $("#articleTitle").val();
                        switch ($("#platformSelect option:selected").val()) {
                            case "mdx2":
                                platformFilter = "mdx_2_0";
                                break;
                            case "mdxnxt":
                                platformFilter = "mdx_nxt";
                                break;
                            case "supportkb":
                                platformFilter = "support_kb";
                                break;
                            default:
                                platformFilter = "mdx_2_0";
                        }

                        for (var indx = 0; indx < contentTypes.length; ++indx) {
                            var reg = new RegExp(contentTypes[indx][0] + ' ', 'ig');
                            titleUpdated = titleUpdated.replace(reg, "<span class='" + contentTypes[indx][1] + "'>" + contentTypes[indx][2] + "</span>");
                        }
                        var newHTML = '';
                        var videoSpan = '<span class="video-title">VIDEO</span>';
                        if (titleUpdated.split(videoSpan).length > 1) {
                            for (var indy = 0; indy < titleUpdated.split(videoSpan).length; ++indy) {
                                newHTML += titleUpdated.split(videoSpan)[indy];
                            }
                            titleUpdated = newHTML + " " + videoSpan;
                        }
                        if (titleUpdated.match('/|@getting-started|@ad-delivery|@data|@creative|@publishers|@certified|@your-resources|/ig'))
                            titleUpdated = titleUpdated.trim().replace(/\@[\w-()]+\s/ig, "");

                        storage.setItem(HelpCenter.user.email + '-previewPlatform' + currArticleId, platformFilter);
                        storage.setItem(HelpCenter.user.email + '-previewTitle' + currArticleId, titleUpdated);
                        storage.setItem(HelpCenter.user.email + '-previewPage' + currArticleId, CKEDITOR.instances.ckEditor.getData());

                        var params = 'width=' + screen.width;
                        params += ', height=' + screen.height;
                        params += ', top=0, left=0'
                        params += ', fullscreen=yes';

                        var previewWin = window.open("https://support.sizmek.com/hc/en-us/articles/208223316?currArticleId=" + currArticleId, 'Preview Window', params);
                        if (window.focus) {
                            previewWin.focus();
                        }
                    });
                    $("#publishBtn").click(function() {
                        $("#suggestEditLabel").text("Publish Approved Article?");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, #previewBtn, #publishBtn, .modal-body").hide();
                        $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").show();
                    });
                    $("#cancelRejectBtn").click(function() {
                        $("#suggestEditLabel").text("Review Suggested Changes");
                        $("#backBtn, #approveBtn, #updateBtn, #rejectBtn, .modal-body").show();
                        $("#rejectReasonWrap, #cancelRejectBtn, #confirmRejectBtn").hide();
                    });
                    $("#cancelPublishBtn").click(function() {
                        $("#suggestEditLabel").text("Review Suggested Changes");
                        $("#backBtn, #previewBtn, #publishBtn, .modal-body").show();
                        $("#publishWrap, #cancelPublishBtn, #confirmPublishBtn").hide();
                        $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                        CKEDITOR.instances.ckEditor.setReadOnly(false);
                    });
                    $("#confirmRejectBtn").click(function() {
                        if ($("#reasonText").val() != "") {
                            appView.postMessage('addComment', {
                                thisComment: $("#reasonText").val()
                            });
                        } else {
                            appView.postMessage('errorMsg', {
                                msg: "<strong>Comment missing!</strong><br/>Please explain why the changes are being rejected for the contributor."
                            });
                        }
                    });
                    $("#confirmPublishBtn").click(function() {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                $("#confirmPublishBtn").text("PUBLISHING...");

                                var ar_pos;
                                if ($("#platformSelect option:selected").val() == "supportkb") ar_pos = parseInt($("#parentSelect option:selected").val()) + 1;
                                else ar_pos = 0;

                                //if section ID = message board NXT, subscribe GlobalNotifications user (ID: 1627768706) and publish as Sizmek Support user (ID: 357520165) for section 201265859

                                function publishArticle() {
                                    if (!newArticle) {
                                        var updateArticleAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
                                        var updateArticleJSON;

                                        if ($("#sectionSelect option:selected").val() == "201265859") { //201265859
                                            updateArticleJSON = {
                                                "article": {
                                                    "section_id": $("#sectionSelect option:selected").val(),
                                                    "author_id": "357520165",
                                                    "position": ar_pos,
                                                    "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",")
                                                }
                                            };
                                        } else {
                                            updateArticleJSON = {
                                                "article": {
                                                    "section_id": $("#sectionSelect option:selected").val(),
                                                    "position": ar_pos,
                                                    "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",")
                                                }
                                            };
                                        }

                                        $.ajax(updateArticleAPI, {
                                            type: 'PUT',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(updateArticleJSON),
                                            success: function(data) {
                                                var updateTranslationAPI = "/api/v2/help_center/articles/" + currArticleId + "/translations/en-us.json";
                                                var updateTranslationJSON = {
                                                    "translation": {
                                                        "title": $("#articleTitle").val(),
                                                        "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                    }
                                                };
                                                $.ajax(updateTranslationAPI, {
                                                    type: 'PUT',
                                                    dataType: 'json',
                                                    contentType: 'application/json',
                                                    processData: false,
                                                    data: JSON.stringify(updateTranslationJSON),
                                                    success: function(data) {
                                                        appView.postMessage('articleUpdated', {
                                                            thisComment: $("#publishComment").val()
                                                        });
                                                    },
                                                    error: function(err) {
                                                        appView.postMessage('errorMsg', {
                                                            msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                        });
                                                    }
                                                });
                                            },
                                            error: function(err) {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                });
                                            }
                                        });


                                    } else {
                                        //publish newly submitted and reviewed article
                                        var newArticleAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/articles.json";

                                        var ar_title = $("#articleTitle").val();
                                        var ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                        var ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                        var newArticleJSON;

                                        if ($("#sectionSelect option:selected").val() == "201265859") { //201265859
                                            newArticleJSON = {
                                                "article": {
                                                    "title": ar_title,
                                                    "author_id": "357520165",
                                                    "comments_disabled": true,
                                                    "locale": "en-us",
                                                    "label_names": ar_label_names,
                                                    "position": ar_pos,
                                                    "body": ar_body
                                                }
                                            };
                                        } else {
                                            newArticleJSON = {
                                                "article": {
                                                    "title": ar_title,
                                                    "comments_disabled": true,
                                                    "locale": "en-us",
                                                    "label_names": ar_label_names,
                                                    "position": ar_pos,
                                                    "body": ar_body
                                                }
                                            };
                                        }

                                        $.ajax(newArticleAPI, {
                                            type: 'POST',
                                            dataType: 'json',
                                            contentType: 'application/json',
                                            processData: false,
                                            data: JSON.stringify(newArticleJSON),
                                            success: function(data) {
                                                var updateCustomFields = {
                                                    "ticket": {
                                                        "custom_fields": [{
                                                            "id": 24296573,
                                                            "value": data.article.id
                                                        }, {
                                                            "id": 24340826,
                                                            "value": data.article.html_url
                                                        }],
                                                        "ticket_id": reviewVer.ticketID,
                                                        "security_token": checkAccess,
                                                        "action": "customfields"
                                                    }
                                                };

                                                var updateLatestTicket = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;

                                                //publish changes


                                                submitCheck = false;
                                                $("#suggestEdit .loaderBG").fadeIn();
                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                $("#suggestEdit .submitStatus").text("Publishing updated article...");


                                                $.ajax(updateLatestTicket, {
                                                    method: 'POST',
                                                    data: JSON.stringify(updateCustomFields)
                                                }).done(function(resData, textStatus, xhr) {
                                                    //success

                                                    submitCheck = true;
                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                    $("#suggestEdit .submitStatus").text("Article published successfully.");
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                        var showIP = data.ip;
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                        $("#suggestEdit .backSubmit").click(function() {
                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                            CKEDITOR.instances.ckEditor.setReadOnly(false);
                                                            $("#confirmPublishBtn").text("CONFIRM PUBLISH");
                                                        });
                                                    });

                                                }).complete(function() {
                                                    //handle complete

                                                    if (submitCheck) {
                                                        $("#suggestEdit .loaderBG").fadeOut();
                                                        appView.postMessage('articleAdded', {
                                                            thisComment: $("#publishComment").val(),
                                                            thisURL: data.article.html_url

                                                        });
                                                    }
                                                });


                                            },
                                            error: function(err) {
                                                appView.postMessage('errorMsg', {
                                                    msg: "<strong>Error!</strong><br/>Could not publish article. Please check permissions."
                                                });
                                            }
                                        });
                                    }
                                }

                                if ($("#sectionSelect option:selected").val() == "201265859") {
                                    var subscriptionAPI = "/api/v2/help_center/sections/" + $("#sectionSelect option:selected").val() + "/subscriptions.json";

                                    var sectionSubJSON = {
                                        "subscription": {
                                            "user_id": "1627768706",
                                            "source_locale": "en-us",
                                            "include_comments": true,
                                            "content_id": "201265859"
                                        }
                                    };

                                    $.ajax(subscriptionAPI, {
                                        type: 'POST',
                                        dataType: 'json',
                                        contentType: 'application/json',
                                        processData: false,
                                        data: JSON.stringify(sectionSubJSON),
                                        success: function(data) {
                                            publishArticle();
                                        },
                                        error: function(err) {
                                            appView.postMessage('errorMsg', {
                                                msg: "<strong>Error!</strong><br/>Could not subscribe GlobalNotifications user to the Message Board section."
                                            });
                                        }
                                    });
                                } else {
                                    publishArticle();
                                }
                            });
                        });
                    });
                });

                appView.on('connectionEstablished', function(data) {

                    ticketID = data.ticketID;
                    currArticleId = data.articleID;

                    if (data.reviewType == "review_a_new_article") newArticle = true;
                    else newArticle = false;

                    removePageElems(appView);
                    appView.postMessage('showIframe');

                    $('#suggestEdit').modal('show');
                    $('.modal-backdrop').removeClass("modal-backdrop");
                    $("#suggestEdit").css("position", "initial");
                    $("#suggestEdit").css("margin-left", "0px");
                    $("#suggestEdit").css("width", "1025px");
                    $("#suggestEdit").css("height", "580px");
                    $("#categorySelect").css("width", "305px");
                    $("#sectionSelect").css("width", "351px");
                    $("#articleTitle").css("width", "504px");
                    $("#searchKeywords").css("width", "351px");
                    $("#parentSelect").css("width", "729px");
                    $("#otherDetails").find("li")[0].style.width = "549px";
                    $("#submitSuggestionBtn").hide();
                    $("#cancelSuggestionBtn").hide();

                    if (newArticle) $("#suggestEditLabel").text("Review New Article Submission");
                    else $("#suggestEditLabel").text("Review Suggested Changes");

                    fromAppPlatform = data.platformName;
                    fromAppCategory = data.categoryName;
                    fromAppSection = data.sectionName;
                    fromAppParent = data.parentName;
                    fromAppArticle = data.articleName;
                    fromAppTags = data.tagsName;
                    firstAppLoad = true;

                    if (data.platformChanged) $("#platformSelect").css("background-color", "#E5FFCD");
                    if (data.categoryChanged) $("#categorySelect").css("background-color", "#E5FFCD");
                    if (data.sectionChanged) $("#sectionSelect").css("background-color", "#E5FFCD");
                    if (data.parentChanged) $("#parentSelect").css("background-color", "#E5FFCD");
                    if (data.articleChanged) $("#articleTitle").css("background-color", "#E5FFCD");
                    if (data.tagsChanged) $("#searchKeywords").css("background-color", "#E5FFCD");

                    var editorSize = setInterval(function() {
                        $(".cke_contents").css("height", "230px");
                        $(".cke_resizer").hide();
                        if ($(".cke_contents").height() >= 229 && $(".cke_contents").height() < 232) {
                            clearInterval(editorSize);

                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px");
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px");
                            }
                            appView.postMessage('reviewEditorReady');
                        }
                    }, 100);

                    $(".close").hide();
                });
            }
        });

        var catArray = [];
        var secArray = [];
        var artArray = [];

        var currArticleId,
            articleURL,
            currUserID,
            customAPI,
            redirectAPI;

        if (window.location.href.indexOf("/articles/") > -1) {
            currArticleId = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];
            articleURL = window.location.href.split("--")[0];
            redirectAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";
            customAPI = "/api/v2/help_center/articles/" + currArticleId + ".json";

            //check article access policy
            var getArticleAPI = "https://support.sizmek.com/api/v2/help_center/en-us/articles/" + currArticleId + ".json";
            $.get(getArticleAPI).done(function(adata) {
                var getSectionAPI = "https://support.sizmek.com/api/v2/help_center/sections/" + adata.article.section_id + "/access_policy.json";
                $.get(getSectionAPI).done(function(sdata) {
                    $("#viewableby").text(sdata.access_policy.viewable_by.replace("staff", "agents").replace("signed_in_users", "logged in users").replace("managers", "admins"));
                    $("#editableby").text(sdata.access_policy.manageable_by.replace("staff", "agents").replace("signed_in_users", "logged in users").replace("managers", "admins"));
                    if (currentUser !== "end_user" && currentUser !== "anonymous") $(".access-info").show();
                    else $(".access-info").hide();
                });
            });

        } else if (isSectionPage) {
            currArticleId = window.location.href.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
            articleURL = window.location.href.split("--")[0];
            redirectAPI = "/api/v2/help_center/sections/201249236.json";
            customAPI = "/api/v2/help_center/articles/search.json?section=" + currArticleId;
        }

        if ((window.location.href.indexOf("/articles/") > -1) && currArticleId == "209729503" && window.location.href.indexOf("type=Files") > -1) {
            //image upload article
            removePageElems();

        } else if ((HelpCenter.user.email !== null) && ((window.location.href.indexOf("/articles/") > -1) || isSectionPage))
            if (currentUser == "manager" || currentUser == "agent" || HelpCenter.user.email.toLowerCase() == "maxremix@gmail.com") {

                //fix bootstrap + editor input conflict
                $.fn.modal.Constructor.prototype.enforceFocus = function() {
                    var $modalElement = this.$element;
                    $(document).on('focusin.modal', function(e) {
                        var $parent = $(e.target.parentNode);
                        if ($modalElement[0] !== e.target && !$modalElement.has(e.target).length && !$parent.hasClass('cke_dialog_ui_input_select') && !$parent.hasClass('cke_dialog_ui_input_text')) {
                            $modalElement.focus();
                        }
                    })
                };

                catArray = [];
                secArray = [];

                var originalHTML,
                    originalArticleID,
                    originalArticleTitle,
                    originalTags,
                    originalType,
                    originalParent,
                    originalPosition,
                    originalSectionID,
                    originalSectionName,
                    originalCategoryID,
                    originalCategoryName,
                    originalPlatform,
                    newArticle,
                    tempTitle,
                    tempTags,
                    tempHTML;

                //modal HTML
                $('<div id="useArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG" style="display: none;"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="suggestEditLabel" class="modal-title">Use this article to resolve your ticket</h1></div><div class="modal-body"><ul id="articleLocation"><li>Ticket <select id="ticketSelect"><option value="-" name="-">Select your ticket</option></select></li></ul><input type="checkbox" id="suggestArticle"><span class="suggestArticleLabel">Also suggest this article to the ticket owner as the solution</span></div><div class="modal-footer"><span class="errorMessage"></span><button id="useTicketButton" class="btn btn-primary" name="CONTINUE" type="button">UPDATE TICKET</button><button id="cancelUseBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="requestArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="flagArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG flagLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="flagArticleLabel" class="modal-title">Thank you for helping us improve our Help Center!</h1></div><div class="modal-body"><p>How should the article be flagged?</p><select id="flagReason"><option value="-">Please select a reason</option><option value="article_flagged_reason_inaccurate_information">Inaccurate Information</option><option value="article_flagged_reason_insufficient_information">Insufficient Information</option><option value="article_flagged_reason_outdated_information">Outdated Information</option><option value="article_flagged_reason_broken_link">Broken Link</option><option value="article_flagged_reason_broken_image_or_video">Broken Image or Video</option><option value="article_flagged_reason_missing_attachment">Missing Attachment</option><option value="article_flagged_reason_other">Other</option></select><p>Please share some more details about your report:</p><p><textarea id="detailedReason" rows="4" cols="50"></textarea></p><div class="ticketSelector">Also update following ticket for UFFA <select class="ticketSelectorSM"><option value="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmFlagBtn" class="btn btn-primary" name="CONTINUE" type="button">FLAG ARTICLE</button><button id="cancelFlagBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div><div id="suggestEdit" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article</h1></div><div id="rejectReasonWrap"><p>Additional comments for rejecting changes:</p><textarea id="reasonText"></textarea></div><div id="publishWrap"><p>Additional comments:</p><textarea id="publishComment"></textarea></div><div class="modal-body"><ul id="articleLocation"><li>Platform  <select id="platformSelect"><option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option><option value="mdx2" name="MDX 2.0">MDX 2.0</option><option value="mdxnxt" name="MDX-NXT">MDX-NXT</option><option value="supportkb" name="SUPPORT KB">SUPPORT KB</option><option value="strikead" name="STRIKE AD">STRIKE AD</option></select></li><li>Category <select id="categorySelect"><option value="-">Select a category</option></select></li><li>Section <select id="sectionSelect"><option value="-">Select a section</option></select></li></ul><hr /><ul id="articleDetails" class="kbonly"><li>Type <select id="typeSelect" disabled><option value="-">None</option><option value="@topic">Topic</option><option value="@article">Article</option><option value="@sub">Subpage</option><option value="@issue">Issue</option><option value="@reference">Reference</option><option value="@howto">How to</option></select></li><li class="parentDrop">Parent <select id="parentSelect"><option value="None">Not available for selected article type</option></select></li></ul><hr class="kbonly" /><ul id="otherDetails"><li> Title <input type="text" id="articleTitle"></li><li>Tags <input type="text" id="searchKeywords"></li></ul><hr /><textarea id="ckEditor"></textarea><div class="ticketSelector">Also update following ticket for UFFA <select id="ticketSelector"><option value="-" name="-">Select a ticket if you wish to update</option></select></div></div><div class="modal-footer"><span class="errorMessage"></span><button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION</button><button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button><button id="backBtn" class="btn btn-default" type="button">BACK</button><button id="publishBtn" class="btn btn-primary" type="button">PUBLISH</button><button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN</button><button id="approveBtn" class="btn btn-success" type="button">PREVIEW</button><button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION</button><button id="rejectBtn" class="btn btn-danger" type="button">REJECT</button><button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION</button><button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button><button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT</button><button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH</button><button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL</button></div></div></div></div>').insertAfter('#main-wrap');

                if (window.location.href.indexOf("/articles/") > -1) {
                    $(".main-column").prepend('<a class="use-article" role="button" data-toggle="modal" data-target="#useArticle" data-backdrop="static" data-keyboard="false">USE</a>');
                    $(".main-column").prepend('<a class="suggest-edit" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">FIX</a>');
                    $(".main-column").prepend('<a class="flag-article" role="button" data-toggle="modal" data-target="#flagArticle" data-backdrop="static" data-keyboard="false">FLAG</a>');
                    $(".main-column").prepend('<a class="add-article" role="button" data-toggle="modal" data-target="#suggestEdit" data-backdrop="static" data-keyboard="false">ADD</a>');
                    $(".main-column").prepend('<a class="request-article" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">REQUEST</a>');
                } else if (isSectionPage) {
                    $('<div id="suggestEdit" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="suggestEditLabel" class="modal-title">Suggest changes to this article</h1></div><div id="rejectReasonWrap"><p>Additional comments for rejecting changes:</p><textarea id="reasonText"></textarea></div><div id="publishWrap"><p>Additional comments:</p><textarea id="publishComment"></textarea></div><div class="modal-body"><ul id="articleLocation"><li>Platform  <select id="platformSelect"><option value="unspecified" name="NO SPECIFIC">NO SPECIFIC</option><option value="mdx2" name="MDX 2.0">MDX 2.0</option><option value="mdxnxt" name="MDX-NXT">MDX-NXT</option><option value="supportkb" name="SUPPORT KB">SUPPORT KB</option><option value="strikead" name="STRIKE AD">STRIKE AD</option></select></li><li>Category <select id="categorySelect"><option value="-">Select a category</option></select></li><li>Section <select id="sectionSelect"><option value="-">Select a section</option></select></li></ul><hr /><ul id="articleDetails" class="kbonly"><li>Type <select id="typeSelect" disabled><option value="-">None</option><option value="@topic">Topic</option><option value="@article">Article</option><option value="@sub">Subpage</option><option value="@issue">Issue</option><option value="@reference">Reference</option><option value="@howto">How to</option></select></li><li class="parentDrop">Parent <select id="parentSelect"><option value="None">Not available for selected article type</option></select></li></ul><hr class="kbonly" /><ul id="otherDetails"><li> Title <input type="text" id="articleTitle"></li><li>Tags <input type="text" id="searchKeywords"></li></ul><hr /><textarea id="ckEditor"></textarea></div><div class="modal-footer"><span class="errorMessage"></span><button id="submitSuggestionBtn" class="btn btn-primary" name="CONTINUE" type="button">SUBMIT SUGGESTION</button><button id="cancelSuggestionBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button><button id="backBtn" class="btn btn-default" type="button">BACK</button><button id="publishBtn" class="btn btn-primary" type="button">PUBLISH</button><button id="previewBtn" class="btn btn-info" type="button">PREVIEW IN FULLSCREEN</button><button id="approveBtn" class="btn btn-success" type="button">PREVIEW</button><button id="updateBtn" class="btn btn-warning" type="button">UPDATE VERSION</button><button id="rejectBtn" class="btn btn-danger" type="button">REJECT</button><button id="restoreBtn" class="btn btn-info" type="button">RESTORE THIS VERSION</button><button id="cancelRejectBtn" class="btn btn-default" type="button">CANCEL</button><button id="confirmRejectBtn" class="btn btn-primary" type="button">CONFIRM REJECT</button><button id="confirmPublishBtn" class="btn btn-primary" type="button">CONFIRM PUBLISH</button><button id="cancelPublishBtn" class="btn btn-default" type="button">CANCEL</button></div></div></div></div>').insertAfter('.sub-nav');
                }

                $(".use-article").click(function() {
                    var recentTicketList = JSON.parse(storage.getItem("recentTicketList_" + window.helpCenterVer));

                    if (storage.getItem("recentTicketList_" + window.helpCenterVer) !== null) {
                        $("#ticketSelect").find('option').remove();
                        var options = $("#ticketSelect");
                        options.append($("<option />").val("-").text("Select your ticket"));
                        $.each(recentTicketList, function() {
                            if (this.Id !== undefined) options.append($("<option />").val(this.Id).text(this.Id + " | " + this.Title));
                        });
                    }
                });

                $('#suggestArticle').change(function() {
                    if ($(this).is(":checked")) {
                        var returnVal = confirm("This will update the ticket with a public comment suggesting this article as a solution but the status will not change. You will need to ensure all required ticket fields are entered and set the ticket to Pending or Solved.\n\nDo you wish to continue?");
                        $(this).attr("checked", returnVal);
                    }
                });

                $(".flag-article, .request-article").click(function() {
                    var recentTicketList = JSON.parse(storage.getItem("recentTicketList_" + window.helpCenterVer));

                    if (storage.getItem("recentTicketList_" + window.helpCenterVer) !== null) {
                        $(".ticketSelectorSM").find('option').remove();
                        var options = $(".ticketSelectorSM");
                        options.append($("<option />").val("-").text("Select a ticket if you wish to update"));
                        $.each(recentTicketList, function() {
                            if (this.Id !== undefined) options.append($("<option />").val(this.Id).text(this.Id + " | " + this.Title));
                        });
                    }
                });

                //reset ckEditor
                function resetCKeditor() {
                    CKEDITOR.instances.ckEditor.plugins.lite.findPlugin(CKEDITOR.instances.ckEditor).rejectAll();
                    CKEDITOR.instances.ckEditor.destroy(true);
                    if ($("#ckEditor").length) CKEDITOR.replace('ckEditor', {
                        filebrowserBrowseUrl: '/hc/en-us/articles/209729503?ver=23&type=Files&articleId=' + currArticleId, //currArticleId = new article temp
                        filebrowserWindowWidth: '100%',
                        filebrowserWindowHeight: '100%',
                        customConfig: 'https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js',
                        on: {
                            instanceReady: function(evt) {
                                //expand clickable content
                                $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block");
                            }
                        }
                    });
                }

                $(".add-article").on('click', function() {
                    var recentTicketList = JSON.parse(storage.getItem("recentTicketList_" + window.helpCenterVer));

                    if (storage.getItem("recentTicketList_" + window.helpCenterVer) !== null) {
                        $("#ticketSelector").find('option').remove();
                        var options = $("#ticketSelector");
                        options.append($("<option />").val("-").text("Select a ticket if you wish to update"));
                        $.each(recentTicketList, function() {
                            if (this.Id !== undefined) options.append($("<option />").val(this.Id).text(this.Id + " | " + this.Title));
                        });
                    }

                    $('#suggestEdit').find('h1').text('Submit an Article');

                    //set original to be none for new article submit
                    originalArticleTitle = "";
                    $("#articleTitle").val("");
                    originalTags = "";
                    $("#searchKeywords").val("");
                    originalHTML = "";
                    $("#submitSuggestionBtn").text("Submit Article");
                    $("#ckEditor").val("");
                    resetCKeditor();
                    newArticle = true;
                });

                $('.suggest-edit').on('click', function() {
                    var recentTicketList = JSON.parse(storage.getItem("recentTicketList_" + window.helpCenterVer));

                    if (storage.getItem("recentTicketList_" + window.helpCenterVer) !== null) {
                        $("#ticketSelector").find('option').remove();
                        var options = $("#ticketSelector");
                        options.append($("<option />").val("-").text("Select a ticket if you wish to update"));
                        $.each(recentTicketList, function() {
                            if (this.Id !== undefined) options.append($("<option />").val(this.Id).text(this.Id + " | " + this.Title));
                        });
                    }

                    $('#suggestEdit').find('h1').text('Suggest changes to this article');
                    originalHTML = [];
                    originalArticleTitle = tempTitle;
                    originalTags = tempTags;
                    originalHTML = tempHTML;

                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);
                    $("#ckEditor").val(originalHTML);
                    $("#submitSuggestionBtn").text("Submit Suggestion");

                    resetCKeditor();
                    newArticle = false;
                });

                $(".modal").on("shown", function() {
                    $("html")[0].className = "stop-scrolling";
                })

                $(".modal").on("hidden", function() {
                    $("html")[0].className = "";
                })

                function resetCategoryDropdown(catArray, secArray, currCategoryId, currSectionId, currPlatform) {

                    $.each(catArray, function(i, category) {
                        if (currPlatform == "mdx2" && category["name"].indexOf("@mdx2") > -1 ||
                            currPlatform == "mdxnxt" && category["name"].indexOf("@mdxnxt") > -1 ||
                            currPlatform == "supportkb" && category["name"].indexOf("@supportkb") > -1 ||
                            currPlatform == "strikead" && category["name"].indexOf("@strikead") > -1 ||
                            currPlatform == "unspecified" && (
                                category["name"].indexOf("@mdx2") == -1 &&
                                category["name"].indexOf("@mdxnxt") == -1 &&
                                category["name"].indexOf("@supportkb") == -1 &&
                                category["name"].indexOf("@strikead") == -1
                            )) {
                            $("#categorySelect").append('<option name="' + category["name"] + '" value="' + category["id"] + '">' + cleanTextOnly(category["name"]) + '</option>');
                        }
                    });

                    if (appView && firstAppLoad) {
                        originalCategoryID = currCategoryId = $("#categorySelect [name='" + fromAppCategory + "']").val();
                    }

                    if (currCategoryId > 0) {
                        $("#categorySelect").val(currCategoryId);
                        resetSectionDropdown(secArray, currSectionId, currCategoryId);
                    }
                }

                function resetSectionDropdown(secArray, currSectionId, currCategoryId) {
                    $.each(secArray, function(i, section) {
                        if (section["category"] == currCategoryId) {
                            $("#sectionSelect").append('<option name="' + section["name"] + '" value="' + section["id"] + '">' + cleanTextOnly(section["name"]) + '</option>');

                            //added sectionlist for breadcrumbs dropdown
                            $("#bread-drop").prepend('<a id="section-' + section["id"] + '" href="https://support.sizmek.com/hc/en-us/sections/' + section["id"] + '">' + cleanTextOnly(section["name"]) + '</a>');
                        }
                    });

                    //track which section the user is in breadcrumbs
                    var checkSectionId = $('#section-' + currSectionId);
                    $("#bread-drop").find(checkSectionId).css({
                        'background-color': '#ebf8fe',
                        'border-left': '3px solid #0072c6'
                    });

                    if (appView && firstAppLoad) {
                        originalSectionID = currSectionId = $("#sectionSelect [name='" + fromAppSection + "']").val();
                        firstAppLoad = false;
                    }

                    $("#sectionSelect").val(currSectionId).change();
                }

                $("#platformSelect").on("change", function() {
                    $("#categorySelect").find("option:gt(0)").remove();
                    $("#sectionSelect").find("option:gt(0)").remove();
                    $("#parentSelect").find("option:gt(0)").remove();

                    if ($("#platformSelect>option:selected").index() == 3) {
                        $(".kbonly").show();
                        $(".cke_contents").css("height", "180px");
                    } else {
                        $(".kbonly").hide();
                        $(".cke_contents").css("height", "230px");
                    }

                    resetCategoryDropdown(catArray, secArray, 0, 0, $("#platformSelect").val());
                });

                $("#categorySelect").on("change", function() {
                    $("#sectionSelect").find("option:gt(0)").remove();
                    resetSectionDropdown(secArray, 0, $("#categorySelect").val());
                });

                var firstParentRun = true;
                if (appView) firstParentRun = false;

                $("#sectionSelect").on("change", function() {
                    $('#parentSelect').empty();

                    if ($("#sectionSelect").val() !== "-") {
                        $("#parentSelect").append('<option value="None" disabled>Loading...</option>');

                        artArray = [];
                        var doneArticles = 0;

                        var articlesBySection = "/api/v2/help_center/" + HelpCenter.user.locale + "/sections/" + $("#sectionSelect").val() + "/articles.json?per_page=100";

                        function populateArticles() {
                            if (storage.getItem(HelpCenter.user.email + '-section' + $("#sectionSelect").val() + 'Articles' + window.helpCenterVer + window.currentLang) === null) {
                                $.get(articlesBySection).done(function(data) {
                                    articlesBySection = data.next_page;
                                    var newArray = $.map(data.articles, function(article, i) {
                                        return {
                                            "id": article.id,
                                            "name": article.name,
                                            "position": article.position
                                        };
                                    });
                                    artArray = $.merge(newArray, artArray);
                                    if (articlesBySection !== null) {
                                        articlesBySection += "&per_page=100";
                                        populateArticles();
                                    } else {
                                        storage.setItem(HelpCenter.user.email + '-' + $("#sectionSelect").val() + 'Articles' + window.helpCenterVer + window.currentLang, JSON.stringify(artArray));
                                        doneArticles = 1;

                                    }
                                });
                            } else {
                                artArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-section' + $("#sectionSelect").val() + 'Articles' + window.helpCenterVer + window.currentLang));
                                doneArticles = 1;

                            }
                        }

                        if (onpageLoad == 1) {
                            populateArticles();
                        }

                        var articleRdy = setInterval(function() {
                            if (doneArticles) {
                                clearInterval(articleRdy);

                                var newPosition = -1;
                                $('#parentSelect').empty();

                                $.each(artArray, function(i, article) {
                                    if (article["name"].toLowerCase().indexOf("@issue ") == -1 && article["name"].toLowerCase().indexOf("@sub ") == -1) {
                                        $("#parentSelect").append('<option name="' + article["name"] + '" value="' + article["position"] + '">' + cleanTextOnly(article["name"]) + '</option>');
                                        if (originalPosition !== 0) {
                                            if (newPosition == -1 && article["position"] <= originalPosition) newPosition = article["position"];
                                            if (article["position"] >= newPosition && article["position"] <= originalPosition) {
                                                newPosition = article["position"];
                                                if (firstParentRun) originalParent = article["name"];
                                            }
                                        }
                                    }
                                });

                                if (originalPosition == 0) {
                                    $("#parentSelect").prepend('<option value="None" name="None">Please select a parent article</option>');
                                    originalParent = "None";
                                }

                                if (firstParentRun) $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + originalParent + "']").index());

                                if (appView) {
                                    $("#parentSelect").prop("selectedIndex", $("#parentSelect [name='" + fromAppParent + "']").index());
                                    originalParent = $("#parentSelect option:selected").attr('name');
                                }

                                firstParentRun = false;

                                $(".loaderBG").fadeOut(2000);
                                $('#suggestEdit,#requestArticle,#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                if (appView) CKEDITOR.instances.ckEditor.setReadOnly(false);
                            }
                        }, 100);
                    } else $("#parentSelect").append('<option value="None" disabled>Please select a section first</option>');
                });

                var keyTimer, firstTypeRun = true;

                $("#articleTitle").on("change keyup paste", function() {
                    keyTimer && clearTimeout(keyTimer);
                    keyTimer = setTimeout(function() {
                        $.each(kbTags, function(k, v) {
                            if ($("#articleTitle").val().toLowerCase().indexOf(v + " ") > -1) {
                                $("#typeSelect").val(v);
                            }
                        })
                        if (firstTypeRun) {
                            originalType = $("#typeSelect").val();
                            firstTypeRun = false;
                        }
                    }, 100);
                })

                $.getJSON(customAPI, function(data) {
                    originalHTML = [];

                    if (window.location.href.indexOf("/articles/") > -1) {
                        $.each(data, function(key, val) {
                            $.each(val, function(articleKey, articleVal) {
                                if (articleKey == "body") originalHTML = tempHTML = articleVal;
                                if (articleKey == "title") originalArticleTitle = tempTitle = articleVal;
                                if (articleKey == "label_names") originalTags = tempTags = articleVal.toString().replace(/[\s,]+/g, ',');
                                if (articleKey == "section_id") originalSectionID = articleVal;
                                if (articleKey == "position") originalPosition = articleVal;
                            });

                        });

                        (function() {
                            if ($('#sideNavigation').length) {

                                $('.sub-group-list li').css({
                                    'background-color': '#f5f5f5',
                                    'border-right': 'none'
                                });
                                $('.sub-group-list li > a').css({
                                    'color': 'grey'
                                });
                                if ($('.sub-group-list li[id=' + currArticleId + ']').length) {
                                    $(this).parent('ul.group-list').css({
                                        'display': 'block',
                                        'overflow': 'hidden'
                                    });
                                    $(this).find('ul.sub-group-list').css({
                                        'display': 'block',
                                        'overflow': 'hidden'
                                    });
                                    $('.sub-group-list li[id=' + currArticleId + ']').find('a').css({
                                        'color': '#0072c6 !important'
                                    });
                                    $('#nav-list .sub-group-list .maintopic > li > a').css({
                                        'margin-left': '21px'
                                    });
                                    $('#nav-list .sub-group-list .maintopic > li[id=' + currArticleId + ']').css({
                                        'background-color': '#ebf8fe',
                                        'border-left': '3px solid #0072c6'
                                    });
                                    $('#nav-list .sub-group-list .maintopic > li[id=' + currArticleId + '] > a').css({
                                        'margin-left': '18px'
                                    });
                                    $('#nav-list .sub-group-list > li').css({
                                        'padding-left': '50px'
                                    });
                                    $('#nav-list .sub-group-list .icon > li[id=' + currArticleId + ']').css({
                                        'background-color': '#ebf8fe',
                                        'border-left': '3px solid #0072c6'
                                    });
                                    $('#nav-list .sub-group-list > li[id=' + currArticleId + ']').css({
                                        'background-color': '#ebf8fe',
                                        'border-left': '3px solid #0072c6',
                                        'text-indent': '-20px',
                                        'padding-left': '47px'
                                    });
                                    dataloaded = 1;
                                } else {

                                    if (NavCatArrayready) {
                                        $.each(navsecArray, function(i, section) {

                                            if (section["id"] == originalSectionID) {

                                                getNavCatId = section["category"];
                                                selectCatId = $('#' + getNavCatId);

                                                addSectionToList();
                                                $('#nav-list').find(selectCatId).find('.group-list').css({
                                                    'display': 'block',
                                                    'overflow': 'hidden'
                                                });
                                                getnavSecId = originalSectionID;
                                                selectSecId = $('#' + getnavSecId).find('.sub-group-list');

                                                instantiateTree();
                                                (function() {
                                                    if ($('#nav-list li[id=' + currArticleId + ']').length > 0) {
                                                        if ($('.sub-group-list .icon li[id=' + currArticleId + ']').length) {
                                                            //do nothing
                                                        } else {
                                                            $('#nav-list li[id=' + currArticleId + ']').css({
                                                                'display': 'block',
                                                                'overflow': 'hidden'
                                                            });
                                                        }
                                                        $('#nav-list li[id=' + currArticleId + ']').find('a').css({
                                                            'color': '#0072c6 !important'
                                                        });
                                                        $('#nav-list .sub-group-list .maintopic > li > a').css({
                                                            'margin-left': '21px'
                                                        });
                                                        $('#nav-list .sub-group-list .maintopic > li[id=' + currArticleId + ']').css({
                                                            'background-color': '#ebf8fe',
                                                            'border-left': '3px solid #0072c6'
                                                        });
                                                        $('#nav-list .sub-group-list .maintopic > li[id=' + currArticleId + '] > a').css({
                                                            'margin-left': '18px'
                                                        });
                                                        $('#nav-list .sub-group-list .icon > li[id=' + currArticleId + ']').css({
                                                            'background-color': '#ebf8fe',
                                                            'border-left': '3px solid #0072c6',
                                                            'padding-left': '17px'
                                                        });
                                                        $('#nav-list .sub-group-list > li').css({
                                                            'padding-left': '50px'
                                                        });
                                                        $('#nav-list .sub-group-list > li[id=' + currArticleId + ']').css({
                                                            'background-color': '#ebf8fe',
                                                            'border-left': '3px solid #0072c6',
                                                            'text-indent': '-20px',
                                                            'padding-left': '47px'
                                                        });
                                                        $('#nav-list #' + getNavCatId).find("i").eq(0).attr('class', 'fa fa-caret-down');
                                                        $('#nav-list #' + originalSectionID).find("i").eq(0).attr('class', 'fa fa-caret-down');
                                                        $('li[id=' + currArticleId + ']').parent('ul.sub-group-list').css({
                                                            'display': 'block',
                                                            'overflow': 'hidden'
                                                        });
                                                        $('li[id=' + currArticleId + ']').parent('ul.sub-group-list').parent('.group-list').css({
                                                            'display': 'block',
                                                            'overflow': 'hidden'
                                                        });
                                                        $('li[id=' + currArticleId + ']').parent('.icon').parent('ul.sub-group-list').css({
                                                            'display': 'block',
                                                            'overflow': 'hidden'
                                                        });
                                                        $('li[id=' + currArticleId + ']').parent('.maintopic').parent('ul.sub-group-list').css({
                                                            'display': 'block',
                                                            'overflow': 'hidden'
                                                        });
                                                        dataloaded = 1;
                                                    } else {
                                                        setTimeout(arguments.callee, 200)
                                                    }
                                                })();
                                                /* } */
                                            }
                                        });
                                    } else {
                                        sectionListStorage();
                                    }

                                }
                            } else {
                                setTimeout(arguments.callee, 200)
                            }
                        })();
                    } else if (isSectionPage) {
                        var sample = (data.results[0]);
                        originalHTML = tempHTML = (sample.body);
                        originalArticleTitle = tempTitle = (sample.title);
                        originalTags = tempTags = (sample.label_names).toString().replace(/[\s,]+/g, ',');
                        originalSectionID = (sample.section_id);
                        originalPosition = 0;
                        (function() {
                            if ($('#sideNavigation').length) {
                                $('.group-list li').css({
                                    'background-color': '#f5f5f5',
                                    'border-right': 'none'
                                });
                                $('.group-list li > a').css({
                                    'color': 'grey'
                                });
                                if ($('.group-list li[id=' + originalSectionID + ']').length) {
                                    $(this).parent('ul.group-list').css({
                                        'display': 'block',
                                        'overflow': 'hidden'
                                    });
                                    $(this).find('ul.sub-group-list').css({
                                        'display': 'block',
                                        'overflow': 'hidden'
                                    });
                                    $('.group-list li[id=' + originalSectionID + ']').find('a').css({
                                        'color': '#0072c6 !important'
                                    });
                                    $('.group-list li[id=' + originalSectionID + ']').css({
                                        'background-color': '#ebf8fe',
                                        'border-right': '3px solid #0072c6'
                                    });
                                } else {
                                    if (NavCatArrayready) {
                                        $.each(navsecArray, function(i, section) {

                                            if (section["id"] == originalSectionID) {

                                                getNavCatId = section["category"];
                                                selectCatId = $('#' + getNavCatId);

                                                addSectionToList();
                                                $('#nav-list').find(selectCatId).find('.group-list').css({
                                                    'display': 'block',
                                                    'overflow': 'hidden'
                                                });
                                                getnavSecId = originalSectionID;
                                                selectSecId = $('#' + getnavSecId).find('.sub-group-list');
                                                $('#nav-list li[id=' + originalSectionID + ']').addClass('back-color');
                                            }
                                        });
                                    } else {
                                        sectionListStorage();
                                    }

                                }
                            } else {
                                setTimeout(arguments.callee, 200)
                            }
                        })();
                    }

                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);
                    $("#ckEditor").val(originalHTML);

                    if ($("#ckEditor").length) CKEDITOR.replace('ckEditor', {
                        filebrowserBrowseUrl: '/hc/en-us/articles/209729503?ver=23&type=Files&articleId=' + currArticleId,
                        filebrowserWindowWidth: '100%',
                        filebrowserWindowHeight: '100%',
                        customConfig: 'https://services.serving-sys.com/HostingServices/custdev/ckeditor/config.js',
                        on: {
                            instanceReady: function(evt) {
                                //expand clickable content
                                $(".cke_wysiwyg_frame").contents().find(".expandingblock").css("display", "block");
                            }
                        }
                    });

                    //populate category and sections
                    var doneCategories = 0;
                    var doneSections = 0;
                    var categoryAPI = "/api/v2/help_center/" + HelpCenter.user.locale + "/categories.json?per_page=100";

                    $(".submitStatus").html("");
                    $('#suggestEdit,#requestArticle,#flagArticle').find('input, textarea, button, select').attr('disabled', 'disabled');

                    function populateCategories() {
                        if (storage.getItem(HelpCenter.user.email + '-allCategories' + window.helpCenterVer + window.currentLang) === null) {
                            $.get(categoryAPI).done(function(data) {
                                categoryAPI = data.next_page;
                                var newArray = $.map(data.categories, function(category, i) {
                                    return {
                                        "id": category.id,
                                        "name": category.name
                                    };
                                });
                                catArray = $.merge(newArray, catArray);
                                if (categoryAPI !== null) {
                                    categoryAPI += "&per_page=100";
                                    populateCategories();
                                } else {
                                    storage.setItem(HelpCenter.user.email + '-allCategories' + window.helpCenterVer + window.currentLang, JSON.stringify(catArray));
                                    doneCategories = 1;
                                }
                            });
                        } else {
                            catArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allCategories' + window.helpCenterVer + window.currentLang));
                            doneCategories = 1;
                        }
                    }
                    populateCategories();

                    var sectionAPI = "/api/v2/help_center/" + HelpCenter.user.locale + "/sections.json?per_page=100";

                    function populateSections() {
                        if (storage.getItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang) === null) {
                            $.get(sectionAPI).done(function(data) {
                                sectionAPI = data.next_page;
                                var newArray = $.map(data.sections, function(section, i) {
                                    return {
                                        "id": section.id,
                                        "name": section.name,
                                        "category": section.category_id
                                    };
                                });
                                secArray = $.merge(newArray, secArray);

                                if (sectionAPI !== null) {
                                    sectionAPI += "&per_page=100";
                                    populateSections();
                                } else {
                                    storage.setItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang, JSON.stringify(secArray));
                                    doneSections = 1;
                                }
                            });
                        } else {
                            secArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang));
                            doneSections = 1;
                        }
                    }
                    populateSections();

                    var populateRdy = setInterval(function() {
                        if (doneSections && doneCategories) {
                            clearInterval(populateRdy);

                            if (!appView) {
                                var sectionMatch = $.grep(secArray, function(e) {
                                    return e.id == originalSectionID;
                                });
                                originalSectionName = sectionMatch[0].name;
                                originalCategoryID = sectionMatch[0].category;
                                var categoryMatch = $.grep(catArray, function(e) {
                                    return e.id == originalCategoryID;
                                });

                                originalCategoryName = categoryMatch[0].name;

                                if (originalArticleTitle.indexOf("@mdx2") > -1 || originalSectionName.indexOf("@mdx2") > -1 || originalCategoryName.indexOf("@mdx2") > -1) {
                                    originalPlatform = "mdx2";
                                    $("#platformSelect").val("mdx2");
                                } else if (originalArticleTitle.indexOf("@supportkb") > -1 || originalSectionName.indexOf("@supportkb") > -1 || originalCategoryName.indexOf("@supportkb") > -1) {
                                    originalPlatform = "supportkb";
                                    $("#platformSelect").val("supportkb");
                                } else if (originalArticleTitle.indexOf("@mdxnxt") > -1 || originalSectionName.indexOf("@mdxnxt") > -1 || originalCategoryName.indexOf("@mdxnxt") > -1) {
                                    originalPlatform = "mdxnxt";
                                    $("#platformSelect").val("mdxnxt");
                                } else if (originalArticleTitle.indexOf("@strikead") > -1 || originalSectionName.indexOf("@strikead") > -1 || originalCategoryName.indexOf("@strikead") > -1) {
                                    originalPlatform = "strikead";
                                    $("#platformSelect").val("strikead");
                                } else {
                                    originalPlatform = "unspecified";
                                    $("#platformSelect").val("unspecified");
                                }

                            } else {
                                originalPlatform = $("#platformSelect [name='" + fromAppPlatform + "']").val();

                                originalCategoryName = fromAppCategory;
                                originalSectionName = fromAppSection;
                                originalParent = fromAppParent;
                                originalArticleTitle = fromAppArticle;
                                originalTags = (fromAppTags !== null) ? fromAppTags : "";

                                $("#articleTitle").val(fromAppArticle).change();
                                $("#searchKeywords").val(fromAppTags);
                                $("#platformSelect").val(originalPlatform);
                            }

                            if ($("#platformSelect>option:selected").index() == 3) {
                                $(".kbonly").show();
                                $(".cke_contents").css("height", "180px");
                            } else {
                                $(".kbonly").hide();
                                $(".cke_contents").css("height", "230px");
                            }

                            resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);
                        }
                    }, 100);
                });

                CKEDITOR.on('instanceReady', function(evt) {
                    var oldMaxHandler = $(".cke_button__maximize")[0].onclick;
                    $(".cke_button__maximize")[0].onclick = function() {
                        oldMaxHandler();
                        if (CKEDITOR.instances.ckEditor.getCommand("maximize").state == 1) {
                            $("html").css("display", "block");
                            $("main").css("display", "block");
                            $("#navbar-container").hide();
                            if (appView) appView.postMessage('resizeFrame');
                        } else {
                            if (!appView) $("#navbar-container").show();
                        }
                    }
                    CKEDITOR.on('dialogDefinition', function(ev) {
                        var dialogName = ev.data.name;
                        var dialogDefinition = ev.data.definition;

                        if (dialogName == 'image') {
                            dialogDefinition.removeContents('Link');
                            dialogDefinition.removeContents('advanced');
                        }
                    });
                });

                function showError(msg) {
                    $(".errorMessage").text(msg);
                    $(".errorMessage").fadeIn();
                    setTimeout(function() {
                        $(".errorMessage").fadeOut(500);
                    }, 4000);
                }

                $("#useTicketButton").click(function(e) {
                    var ticketSelectVal = $("#ticketSelect").find(":selected").val();
                    if (ticketSelectVal == "-") {
                        showError("Please select a ticket to update");
                    } else {
                        var uffaTag = "uffa_use,new_uffa_use,usekb_" + currArticleId;
                        var uffaUseId = ticketSelectVal;

                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $('#useArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#useTicketButton").text("PLEASE WAIT...");

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                var ticketJSON = {
                                    "ticket": {
                                        "ticket_id": uffaUseId,
                                        "tags": uffaTag.split(','),
                                        "author_id": currUserID,
                                        "article_url": articleURL,
                                        "custom_fields": [{
                                            "id": 22079425,
                                            "value": "uffa_use"
                                        }, {
                                            "id": 22031439,
                                            "value": articleURL
                                        }],
                                        "suggest_article": $('#suggestArticle').is(":checked"),
                                        "security_token": checkAccess,
                                        "action": "use"
                                    }
                                };

                                submitCheck = false;

                                $("#useArticle.loaderBG").css("width", $("#useArticle .modal-content").width() - 10);
                                $("#useArticle .loaderBG").css("height", $("#useArticle .modal-content").height() - 70);

                                $("#useArticle .submitStatus").css("margin-left", "100px");
                                $("#useArticle .submitStatus").css("margin-top", "28px");
                                $("#useArticle .loaderAnimation").css("position", "absolute");
                                $("#useArticle .loaderAnimation").css("top", "-70px");
                                $("#useArticle .loaderAnimation").css("left", "50px");
                                $("#useArticle .loaderBG").fadeIn();
                                $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                $("#useArticle .submitStatus").html("Updating the ticket...");

                                $.ajax(tickAPI, {
                                    method: 'POST',
                                    data: JSON.stringify(ticketJSON)
                                }).done(function(res, textStatus, xhr) {
                                    //success
                                    submitCheck = true;
                                    $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                    $("#useArticle .submitStatus").html("Thank you! Your report has been received.");
                                }).fail(function(xhr, textStatus, errorThrown) {
                                    //connection failed
                                    $("#useArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                        var showIP = data.ip;
                                        $(".submitStatus").css("margin-left", "200px");
                                        $("#useArticle .submitStatus").html("<span style='color:red'>Connection to server could not be established. &nbsp; <button class='btn btn-default backSubmit' type='button'>BACK</button>");
                                        $("#useArticle .backSubmit").click(function() {
                                            $("#useArticle .loaderBG").fadeOut();
                                            $('#useArticle').find('input, textarea, button, select').attr('disabled', false);
                                            $("#useTicketButton").text("UPDATE TICKET");
                                        });
                                    });
                                }).complete(function() {
                                    //handle complete
                                    if (submitCheck) {
                                        setTimeout(function() {
                                            $("#useArticle .loaderBG").fadeOut();
                                            $('#useArticle').find('input, textarea, button, select').attr('disabled', false);
                                            $("#useTicketButton").text("UPDATE TICKET");
                                            $('#useArticle').modal('hide');
                                        }, 4000);
                                    }
                                });
                            });
                        });
                    }
                });

                $("#confirmFlagBtn").click(function(e) {
                    var reasonText = $("#flagReason option:selected").text();
                    var reasonTag = $("#flagReason").val();
                    var descriptionText = $("#detailedReason").val();
                    var ticketTags;
                    var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                    if (reasonTag == "-") {
                        showError("Please select a reason from the list");
                    } else if (descriptionText == "") {
                        showError("Please provide some details about this report");
                    } else {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $('#flagArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#confirmFlagBtn").text("PLEASE WAIT...");

                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_flag_kb,review_a_flagged_article";
                            else ticketTags = "contribute_flag_doc,review_a_flagged_article";

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": articleData.article.title,
                                            "comment": descriptionText + "\n\nFlagged Article: [" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nFlagged for: " + $("#flagReason option:selected").text(),
                                            "requester_id": currUserID,
                                            //"assignee_id": 351709585, 
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(','),
                                            "ticket_form_id": 16155,
                                            "custom_fields": [{
                                                "id": 22155349,
                                                "value": "review_a_flagged_article"
                                            }, {
                                                "id": 24296573,
                                                "value": currArticleId
                                            }, {
                                                "id": 24340826,
                                                "value": articleURL
                                            }, {
                                                "id": 24296583,
                                                "value": reasonTag
                                            }, {
                                                "id": 24340776,
                                                "value": $("#platformSelect option[value='" + originalPlatform + "']").text()
                                            }, {
                                                "id": 24296523,
                                                "value": $("#platformSelect option:selected").attr('name')
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr('name')
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "flag"
                                        }
                                    };

                                    //flag article
                                    submitCheck = false;
                                    $("#flagArticle .loaderBG").css("width", $("#flagArticle .modal-content").width() - 10);
                                    $("#flagArticle .loaderBG").css("height", $("#flagArticle .modal-content").height() - 70);

                                    $("#flagArticle .loaderBG").fadeIn();
                                    $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#flagArticle .submitStatus").html("<br><br>Submitting your contribution...");

                                    $.ajax(tickAPI, {
                                        method: 'POST',
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res, textStatus, xhr) {
                                        //success

                                        submitCheck = true;
                                        $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#flagArticle .submitStatus").html("<br><br>Thank you! Your report has been received.");
                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        //connection failed

                                        $("#flagArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#flagArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#flagArticle .backSubmit").click(function() {
                                                $("#flagArticle .loaderBG").fadeOut();
                                                $('#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmFlagBtn").text("FLAG ARTICLE");
                                            });
                                        });
                                    }).complete(function() {
                                        //handle complete

                                        if (submitCheck) {
                                            var ticketSelectVal = $("#flagArticle .ticketSelectorSM").find(":selected").val();
                                            if (ticketSelectVal !== "-") {
                                                //if ticket selected, update with uffa add
                                                var uffaTag = "new_uffa_flag,flagkb_" + currArticleId;
                                                var uffaFlagId = ticketSelectVal;
                                                var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                                var ticketJSON = {
                                                    "ticket": {
                                                        "ticket_id": uffaFlagId,
                                                        "tags": uffaTag.split(','),
                                                        "author_id": currUserID,
                                                        "article_url": articleURL,
                                                        "custom_fields": [{
                                                            "id": 22079425,
                                                            "value": "uffa_flag"
                                                        }, {
                                                            "id": 22031439,
                                                            "value": articleURL
                                                        }],
                                                        "suggest_article": false,
                                                        "security_token": checkAccess,
                                                        "action": "use"
                                                    }
                                                };

                                                $.ajax(tickAPI, {
                                                    method: 'POST',
                                                    data: JSON.stringify(ticketJSON)
                                                }).done(function(res, textStatus, xhr) {
                                                    //success
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                }).complete(function() {
                                                    //close modal
                                                    setTimeout(function() {
                                                        $("#flagArticle .loaderBG").fadeOut();
                                                        $('#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                                        $("#confirmFlagBtn").text("FLAG ARTICLE");
                                                        $("#detailedReason").val("");
                                                        $("#flagReason").val($("#flagReason option:first").val());
                                                        $('#flagArticle').modal('hide');
                                                    }, 4000);
                                                });
                                            } else {
                                                //close modal
                                                setTimeout(function() {
                                                    $("#flagArticle .loaderBG").fadeOut();
                                                    $('#flagArticle').find('input, textarea, button, select').attr('disabled', false);
                                                    $("#confirmFlagBtn").text("FLAG ARTICLE");
                                                    $("#detailedReason").val("");
                                                    $("#flagReason").val($("#flagReason option:first").val());
                                                    $('#flagArticle').modal('hide');
                                                }, 4000);
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    }
                });

                //request button process
                $("#confirmRequestBtn").click(function(e) {
                    var descriptionText = $("#requestArticleDetail").val();
                    var ticketTags;
                    var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                    if (descriptionText == "") {
                        showError("What would you like to see in the new article?");
                    } else {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {

                            currUserID = data.session.user_id;

                            $('#requestArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#confirmRequestBtn").text("PLEASE WAIT...");

                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
                            else ticketTags = "contribute_request_doc,review_a_requested_article";

                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/articles/" + currArticleId + ".json", function(articleData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": "New article request has been received",
                                            "comment": "New article has been requested after viewing the following article:\n\n[" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nRequest detail:\n\n" + descriptionText,
                                            "requester_id": currUserID,
                                            //"assignee_id": 351709585, 
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(','),
                                            "ticket_form_id": 16155,
                                            "custom_fields": [{
                                                "id": 22155349,
                                                "value": "review_a_requested_article"
                                            }, {
                                                "id": 24296573,
                                                "value": currArticleId
                                            }, {
                                                "id": 24340826,
                                                "value": articleURL
                                            }, {
                                                "id": 24340776,
                                                "value": $("#platformSelect option[value='" + originalPlatform + "']").text()
                                            }, {
                                                "id": 24296523,
                                                "value": $("#platformSelect option:selected").attr('name')
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr('name')
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "request"
                                        }
                                    };

                                    //request article
                                    submitCheck = false;
                                    $("#requestArticle .loaderBG").css("width", $("#requestArticle .modal-content").width() - 10);
                                    $("#requestArticle .loaderBG").css("height", $("#requestArticle .modal-content").height() - 70);

                                    $("#requestArticle .loaderBG").fadeIn();
                                    $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#requestArticle .submitStatus").html("<br><br>Submitting your article request...");

                                    $.ajax(tickAPI, {
                                        method: 'POST',
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res, textStatus, xhr) {
                                        //success
                                        submitCheck = true;
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#requestArticle .submitStatus").html("<br><br>Thank you! Your request has been received.");
                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        //connection failed
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#requestArticle .backSubmit").click(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                            });
                                        });
                                    }).complete(function() {
                                        //handle complete
                                        if (submitCheck) {
                                            var ticketSelectVal = $("#requestArticle .ticketSelectorSM").find(":selected").val();
                                            if (ticketSelectVal !== "-") {
                                                //if ticket selected, update with uffa add
                                                var uffaTag = "new_uffa_request,new_uffa_add,requestkb_pending";
                                                var uffaRequestId = ticketSelectVal;
                                                var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                                var ticketJSON = {
                                                    "ticket": {
                                                        "ticket_id": uffaRequestId,
                                                        "tags": uffaTag.split(','),
                                                        "author_id": currUserID,
                                                        "article_url": articleURL,
                                                        "custom_fields": [{
                                                            "id": 22079425,
                                                            "value": "uffa_add"
                                                        }, {
                                                            "id": 22031439,
                                                            "value": "New article requested"
                                                        }],
                                                        "suggest_article": false,
                                                        "security_token": checkAccess,
                                                        "action": "use"
                                                    }
                                                };

                                                $.ajax(tickAPI, {
                                                    method: 'POST',
                                                    data: JSON.stringify(ticketJSON)
                                                }).done(function(res, textStatus, xhr) {
                                                    //success
                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                    //connection failed
                                                }).complete(function() {
                                                    //close modal
                                                    setTimeout(function() {
                                                        $("#requestArticle .loaderBG").fadeOut();
                                                        $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                        $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                                        $("#requestArticleDetail").val("");
                                                        $('#requestArticle').modal('hide');
                                                    }, 4000);
                                                });
                                            } else {
                                                //close modal
                                                setTimeout(function() {
                                                    $("#requestArticle .loaderBG").fadeOut();
                                                    $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                    $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                                    $("#requestArticleDetail").val("");
                                                    $('#requestArticle').modal('hide');
                                                }, 4000);
                                            }
                                        }
                                    });
                                });
                            });
                        });
                    }
                });

                function checkChanged() {
                    return (CKEDITOR.instances.ckEditor.checkDirty() ||
                        $("#platformSelect option:selected").val() != originalPlatform ||
                        $("#categorySelect option:selected").val() != originalCategoryID ||
                        $("#sectionSelect option:selected").val() != originalSectionID ||
                        ($("#parentSelect option:selected").attr('name') != originalParent && typeof $("#parentSelect option:selected").attr('name') !== "undefined") ||
                        $("#articleTitle").val() != originalArticleTitle ||
                        $("#searchKeywords").val() != originalTags ||
                        ($("#typeSelect").val() != originalType && $("#platformSelect>option:selected").index() == 3));
                }

                function resetSuggestionModal() {
                    $("#platformSelect").val(originalPlatform);
                    $("#categorySelect").find("option:gt(0)").remove();
                    $("#sectionSelect").find("option:gt(0)").remove();
                    $("#typeSelect").val(originalType);

                    $("#parentSelect").empty();
                    $("#parentSelect").append('<option value="None">None</option>');
                    /*
                    $('#parentSelect option').filter(function() {
                        return ($(this).attr('name') == $("#parentSelect option:selected").attr('name'));
                    }).prop('selected', true);
                    */

                    if ($("#platformSelect>option:selected").index() == 3) {
                        $(".kbonly").show();
                        $(".cke_contents").css("height", "180px");
                    } else {
                        $(".kbonly").hide();
                        $(".cke_contents").css("height", "230px");
                    }

                    firstParentRun = keyTimer = firstTypeRun = true;

                    $("#articleTitle").val(originalArticleTitle).change();
                    $("#searchKeywords").val(originalTags);

                    resetCategoryDropdown(catArray, secArray, originalCategoryID, originalSectionID, originalPlatform);

                    resetCKeditor();
                }

                $("#submitSuggestionBtn").click(function() {
                    if (checkChanged()) {
                        if ($("#categorySelect>option:selected").index() == 0 || $("#sectionSelect>option:selected").index() == 0) {
                            showError("Please select the article category and section");
                        } else {
                            //submit changes    
                            $.getJSON("/api/v2/users/me/session.json", function(data) {

                                currUserID = data.session.user_id;

                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', 'disabled');
                                $("#submitSuggestionBtn").text("PLEASE WAIT...");

                                highestVerArray = [];

                                var getHighestVerAPI;

                                if (!newArticle) getHighestVerAPI = '/api/v2/help_center/articles/search.json?query=Article' + encodeURIComponent(' ' + currArticleId) + '&section=201949563&per_page=100';
                                else getHighestVerAPI = '/api/v2/help_center/articles/search.json?query="New Article : ' + encodeURIComponent($("#articleTitle").val()) + '"&section=201949563&per_page=100';

                                function handleErrorSubmit() {
                                    alert("Sorry, there was a problem submitting your suggestions. Please try again later.");
                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                    $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                    resetSuggestionModal();
                                    $('#suggestEdit').modal('hide');
                                }

                                function checkVersions() {
                                    $.get(getHighestVerAPI).done(function(data) {
                                        getHighestVerAPI = data.next_page;

                                        var highestMajorVer = 1;
                                        var results = $.map(data.results, function(result, i) {
                                            return {
                                                "title": result.title
                                            };
                                        });

                                        $.each(results, function(i, result) {
                                            var thisVer = parseInt(result["title"].split("Revision ver.")[1].split(".")[0]);
                                            if (thisVer >= highestMajorVer) highestMajorVer = thisVer + 1;
                                        });

                                        if (getHighestVerAPI !== null) {
                                            getHighestVerAPI += "&per_page=100";
                                            checkVersions();
                                        } else {
                                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);

                                                $.getJSON(redirectAPI, function(articleData) {
                                                    var createArticleAPI = "/api/v2/help_center/sections/201949563/articles.json";
                                                    var updateTicketID;

                                                    if (window.location.href.indexOf("/articles/") > -1) {
                                                        var ar_title = "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".0";
                                                        var ar_label_names = originalTags.split(",");
                                                        var ar_body = articleData.article.body;
                                                    } else if (isSectionPage) {
                                                        ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                        ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                                        ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                                    }

                                                    if (newArticle) {
                                                        ar_title = "New Article : " + $("#articleTitle").val() + " - Revision ver." + highestMajorVer + ".0";
                                                        ar_label_names = $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(",");
                                                        ar_body = decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"));
                                                    }

                                                    var addOriginalArticleJSON = {
                                                        "article": {
                                                            "title": ar_title,
                                                            "comments_disabled": true,
                                                            "locale": "en-us",
                                                            "label_names": ar_label_names,
                                                            "body": ar_body
                                                        }
                                                    };
                                                    $.ajax(createArticleAPI, {
                                                        type: 'POST',
                                                        dataType: 'json',
                                                        contentType: 'application/json',
                                                        processData: false,
                                                        data: JSON.stringify(addOriginalArticleJSON),
                                                        success: function(original) {
                                                            if (!newArticle) {
                                                                var addArticleJSON = {
                                                                    "article": {
                                                                        "title": "Article ID " + currArticleId + " - Revision ver." + highestMajorVer + ".1",
                                                                        "comments_disabled": true,
                                                                        "locale": "en-us",
                                                                        "label_names": $("#searchKeywords").val().replace(/[\s,]+/g, ',').split(","),
                                                                        "body": decodeURIComponent(CKEDITOR.instances.ckEditor.getData().replace(/%([^\d].)/g, "%25$1"))
                                                                    }
                                                                };

                                                                $.ajax(createArticleAPI, {
                                                                    type: 'POST',
                                                                    dataType: 'json',
                                                                    contentType: 'application/json',
                                                                    processData: false,
                                                                    data: JSON.stringify(addArticleJSON),
                                                                    success: function(edited) {
                                                                        processTicket(articleData, original, edited);
                                                                    },
                                                                    error: function() {
                                                                        handleErrorSubmit()
                                                                    }
                                                                });
                                                            } else {
                                                                var edited = original;
                                                                originalArticleTitle = $("#articleTitle").val();
                                                                originalTags = $("#searchKeywords").val();
                                                                processTicket(articleData, original, edited);
                                                            }
                                                        },
                                                        error: function() {
                                                            handleErrorSubmit();
                                                        }
                                                    });

                                                    function processTicket(articleData, original, edited) {

                                                        var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                                        var ticketTags;

                                                        var submitTitle, submitDesc, contributionType;
                                                        var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                                                        if (newArticle) {
                                                            currArticleId = "";
                                                            articleURL = "";
                                                            getPlatformName = $("#platformSelect option:selected").attr('name');
                                                            originalCategoryName = $("#categorySelect option:selected").attr('name');
                                                            originalSectionName = $("#sectionSelect option:selected").attr('name');
                                                            originalParent = $("#parentSelect option:selected").attr('name');
                                                            submitTitle = "New Article Received: " + $("#articleTitle").val();
                                                            submitDesc = "A new article has been received for the following location. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: New Draft \nReference No. " + original.article.id + "\n\n<pending-review>";
                                                            contributionType = "review_a_new_article";
                                                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_add_kb,review_a_new_article";
                                                            else ticketTags = "contribute_add_doc,review_a_new_article";
                                                        } else {
                                                            submitTitle = "Article Edited: " + cleanTextOnly(articleData.article.title);
                                                            submitDesc = "New suggestions has been received to update following article. " + "\n\nPlatform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + " \nCategory: " + cleanTextOnly(originalCategoryName) + " \nSection: " + cleanTextOnly(originalSectionName) + " \n\nOriginal Article: [" + cleanTextOnly(originalArticleTitle) + "](" + articleURL + ") \n\nRevision Version: " + highestMajorVer + ".0" + " \nState: Original \nReference No. " + original.article.id;
                                                            contributionType = "review_an_existing_article_edit";
                                                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_fix_kb,review_an_existing_article_edit";
                                                            else ticketTags = "contribute_fix_doc,review_an_existing_article_edit";
                                                        }

                                                        var ticketOriginalJSON = {
                                                            "ticket": {
                                                                "subject": submitTitle,
                                                                "comment": submitDesc,
                                                                "requester_id": currUserID,
                                                                "group_id": 21387715,
                                                                "tags": ticketTags.split(','),
                                                                "ticket_form_id": 16155,
                                                                "custom_fields": [{
                                                                    "id": 22155349,
                                                                    "value": contributionType
                                                                }, {
                                                                    "id": 24296573,
                                                                    "value": currArticleId
                                                                }, {
                                                                    "id": 24340826,
                                                                    "value": articleURL
                                                                }, {
                                                                    "id": 24340806,
                                                                    "value": originalArticleTitle
                                                                }, {
                                                                    "id": 24296553,
                                                                    "value": $("#articleTitle").val()
                                                                }, {
                                                                    "id": 24340776,
                                                                    "value": getPlatformName
                                                                }, {
                                                                    "id": 24296523,
                                                                    "value": $("#platformSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24340786,
                                                                    "value": originalCategoryName
                                                                }, {
                                                                    "id": 24340796,
                                                                    "value": $("#categorySelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24296533,
                                                                    "value": originalSectionName
                                                                }, {
                                                                    "id": 24296543,
                                                                    "value": $("#sectionSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24303683,
                                                                    "value": originalParent
                                                                }, {
                                                                    "id": 24303693,
                                                                    "value": $("#parentSelect option:selected").attr('name')
                                                                }, {
                                                                    "id": 24296563,
                                                                    "value": originalTags
                                                                }, {
                                                                    "id": 24340816,
                                                                    "value": $("#searchKeywords").val().replace(/[\s,]+/g, ',')
                                                                }],
                                                                "security_token": checkAccess,
                                                                "action": "add"
                                                            }
                                                        };

                                                        //request article
                                                        submitCheck = false;
                                                        $("#suggestEdit .loaderBG").css("width", $("#suggestEdit .modal-content").width() - 10);
                                                        $("#suggestEdit .loaderBG").css("height", $("#suggestEdit .modal-content").height() - 70);

                                                        $("#suggestEdit .loaderBG").fadeIn();
                                                        $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                        $("#suggestEdit .submitStatus").text("Connecting to server, please wait...");

                                                        $.ajax(tickAPI, {
                                                            method: 'POST',
                                                            data: JSON.stringify(ticketOriginalJSON)
                                                        }).done(function(getRes, textStatus, xhr) {
                                                            //success
                                                            submitCheck = true;
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                            $("#suggestEdit .submitStatus").text("Connection established.");
                                                            updateTicketID = $.parseJSON(getRes).ticket.id;
                                                        }).fail(function(xhr, textStatus, errorThrown) {
                                                            //connection failed
                                                            $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                            $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                var showIP = data.ip;
                                                                $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                $("#suggestEdit .backSubmit").click(function() {
                                                                    $("#suggestEdit .loaderBG").fadeOut();
                                                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                    $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                                                });
                                                            });
                                                        }).complete(function() {
                                                            //handle complete
                                                            if (!newArticle && submitCheck) {
                                                                var commentStr;

                                                                commentStr = "Following values has been revised:\n";

                                                                if (originalArticleTitle !== $("#articleTitle").val())
                                                                    commentStr += "\nPrevious Title: " + originalArticleTitle + "\nUpdated Title: " + $("#articleTitle").val() + "\n";
                                                                if (originalPlatform !== $("#platformSelect option:selected").val())
                                                                    commentStr += "\nPrevious Platform: " + $("#platformSelect option[value='" + originalPlatform + "']").text() + "\nUpdated Platform: " + $("#platformSelect option:selected").text() + "\n";
                                                                if (originalCategoryName !== $("#categorySelect option:selected").attr('name'))
                                                                    commentStr += "\nPrevious Category: " + originalCategoryName + "\nUpdated Category: " + $("#categorySelect option:selected").attr('name') + "\n";
                                                                if (originalSectionName !== $("#sectionSelect option:selected").attr('name'))
                                                                    commentStr += "\nPrevious Section: " + originalSectionName + "\nUpdated Section: " + $("#sectionSelect option:selected").attr('name') + "\n";
                                                                if (originalParent !== $("#parentSelect option:selected").attr('name') && $("#platformSelect>option:selected").index() == 3)
                                                                    commentStr += "\nPrevious Parent: " + originalParent + "\nUpdated Parent: " + $("#parentSelect option:selected").attr('name') + "\n";
                                                                if (originalTags !== $("#searchKeywords").val().replace(/[\s,]+/g, ','))
                                                                    commentStr += "\nPrevious Tags: " + originalTags + "\nUpdated Tags: " + $("#searchKeywords").val().replace(/[\s,]+/g, ',') + "\n";

                                                                if (CKEDITOR.instances.ckEditor.checkDirty())
                                                                    commentStr += "\n\nArticle Content: Changed";
                                                                else commentStr += "\n\nArticle Content: Same as version " + highestMajorVer + ".0";

                                                                commentStr += "\n\nRevision Version: " + highestMajorVer + ".1" + " \nState: Updated \nReference No. " + edited.article.id + "\n\n<pending-review>";

                                                                var versionJSON = {
                                                                    "ticket": {
                                                                        "comment": {
                                                                            "body": commentStr,
                                                                            "author_id": currUserID
                                                                        },
                                                                        "tags": ticketTags.split(','),
                                                                        "ticket_id": updateTicketID,
                                                                        "security_token": checkAccess,
                                                                        "action": "update"
                                                                    }
                                                                };

                                                                var updateLatestTicket = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;

                                                                submitCheck = false;

                                                                $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                                                $("#suggestEdit .submitStatus").text("Submitting your suggestions...");

                                                                $.ajax(updateLatestTicket, {
                                                                    method: 'POST',
                                                                    data: JSON.stringify(versionJSON)
                                                                }).done(function(res, textStatus, xhr) {
                                                                    //success
                                                                    submitCheck = true;
                                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                                                    $("#suggestEdit .submitStatus").text("Thank you! Your suggestions has been received.");
                                                                }).fail(function(xhr, textStatus, errorThrown) {
                                                                    //connection failed
                                                                    $("#suggestEdit .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                                                    $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                                                        var showIP = data.ip;
                                                                        $("#suggestEdit .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                                                        $("#suggestEdit .backSubmit").click(function() {
                                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                            $("#submitSuggestionBtn").text("SUBMIT SUGGESTION");
                                                                        });
                                                                    });
                                                                }).complete(function() {
                                                                    //handle complete
                                                                    if (submitCheck) {
                                                                        var ticketSelectVal = $("#ticketSelector").find(":selected").val();
                                                                        if (ticketSelectVal !== "-") {
                                                                            //if ticket selected, update with uffa fix
                                                                            var uffaTag = "new_uffa_fix,fixkb_" + currArticleId;
                                                                            var uffaFixId = ticketSelectVal;
                                                                            var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                                                            var ticketJSON = {
                                                                                "ticket": {
                                                                                    "ticket_id": uffaFixId,
                                                                                    "tags": uffaTag.split(','),
                                                                                    "author_id": currUserID,
                                                                                    "article_url": articleURL,
                                                                                    "custom_fields": [{
                                                                                        "id": 22079425,
                                                                                        "value": "uffa_fix"
                                                                                    }, {
                                                                                        "id": 22031439,
                                                                                        "value": articleURL
                                                                                    }],
                                                                                    "suggest_article": false,
                                                                                    "security_token": checkAccess,
                                                                                    "action": "use"
                                                                                }
                                                                            };

                                                                            $.ajax(tickAPI, {
                                                                                method: 'POST',
                                                                                data: JSON.stringify(ticketJSON)
                                                                            }).done(function(res, textStatus, xhr) {
                                                                                //success
                                                                            }).fail(function(xhr, textStatus, errorThrown) {
                                                                                //connection failed
                                                                            }).complete(function() {
                                                                                //close modal
                                                                                setTimeout(function() {
                                                                                    $("#suggestEdit .loaderBG").fadeOut();
                                                                                    $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                                    resetSuggestionModal();
                                                                                    $('#suggestEdit').modal('hide');
                                                                                }, 4000);
                                                                            });
                                                                        } else {
                                                                            //close modal
                                                                            setTimeout(function() {
                                                                                $("#suggestEdit .loaderBG").fadeOut();
                                                                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                                resetSuggestionModal();
                                                                                $('#suggestEdit').modal('hide');
                                                                            }, 4000);
                                                                        }
                                                                    }
                                                                });
                                                            } else {
                                                                //handle complete
                                                                if (submitCheck) {
                                                                    $("#suggestEdit .submitStatus").text("Thank you! Your article will be published after a review.");

                                                                    var ticketSelectVal = $("#ticketSelector").find(":selected").val();
                                                                    if (ticketSelectVal !== "-") {
                                                                        //if ticket selected, update with uffa add
                                                                        var uffaTag = "new_uffa_add,addkb_pending";
                                                                        var uffaAddId = ticketSelectVal;
                                                                        var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                                                        var ticketJSON = {
                                                                            "ticket": {
                                                                                "ticket_id": uffaAddId,
                                                                                "tags": uffaTag.split(','),
                                                                                "author_id": currUserID,
                                                                                "article_url": articleURL,
                                                                                "custom_fields": [{
                                                                                    "id": 22079425,
                                                                                    "value": "uffa_add"
                                                                                }, {
                                                                                    "id": 22031439,
                                                                                    "value": "Pending new article"
                                                                                }],
                                                                                "suggest_article": false,
                                                                                "security_token": checkAccess,
                                                                                "action": "use"
                                                                            }
                                                                        };

                                                                        $.ajax(tickAPI, {
                                                                            method: 'POST',
                                                                            data: JSON.stringify(ticketJSON)
                                                                        }).done(function(res, textStatus, xhr) {
                                                                            //success
                                                                        }).fail(function(xhr, textStatus, errorThrown) {
                                                                            //connection failed
                                                                        }).complete(function() {
                                                                            //close modal
                                                                            setTimeout(function() {
                                                                                $("#suggestEdit .loaderBG").fadeOut();
                                                                                $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                                resetSuggestionModal();
                                                                                $('#suggestEdit').modal('hide');
                                                                            }, 4000);
                                                                        });
                                                                    } else {
                                                                        //close modal
                                                                        setTimeout(function() {
                                                                            $("#suggestEdit .loaderBG").fadeOut();
                                                                            $('#suggestEdit').find('input, textarea, button, select').attr('disabled', false);
                                                                            resetSuggestionModal();
                                                                            $('#suggestEdit').modal('hide');
                                                                        }, 4000);
                                                                    }
                                                                }
                                                            }
                                                        });
                                                    }
                                                });
                                            });
                                        }
                                    });
                                }
                                checkVersions();
                            });
                        }
                    } else {
                        showError("There are no changes to submit");
                    }
                });

                $("#flagArticle").on("hide.bs.modal", function(e) {
                    if ($("#flagReason").prop('selectedIndex') != 0 || $("#detailedReason").val() != "") {
                        if (confirm('All changes will be lost. Are you sure you want to cancel?')) {
                            $("#flagReason").val($("#flagReason option:first").val());
                            $("#detailedReason").val("");
                            return true;
                        } else {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                });

                $("#suggestEdit").on("hide.bs.modal", function(e) {
                    if (checkChanged()) {
                        if (confirm('All unsaved changes will be lost. Are you sure you want to cancel?')) {
                            resetSuggestionModal();
                            return true;
                        } else {
                            e.preventDefault();
                            e.stopImmediatePropagation();
                            return false;
                        }
                    }
                });
            }
    }


    //Request New Article On Section Pages
    try {
        if (isSectionPage) {


            if ($('.subscriptionContainer').length > 0 && $('span .section-subscribe').length > 0) {

                //error message
                function showError(msg) {
                    $(".errorMessage").text(msg);
                    $(".errorMessage").fadeIn();
                    setTimeout(function() {
                        $(".errorMessage").fadeOut(500);
                    }, 4000);
                }

                //Modal for article request on sections
                $('<div id="requestArticle" class="internal_only modal fade" tabindex="-1"><div class="modal-dialog"><div class="modal-content"><div class="loaderBG requestLoader"><img class="loaderAnimation" src="/hc/theme_assets/539845/200023575/szmk-loader.gif"><h3 class="submitStatus"></h3></div><div class="modal-header"><button class="close" name="x" type="button" data-dismiss="modal">x</button><h1 id="requestArticleLabel" class="modal-title">Request a New Article</h1></div><div class="modal-body"><p>What would you like to see in the new article?</p><p><textarea id="requestArticleDetail" rows="4" cols="50"></textarea></p></div><div class="modal-footer"><span class="errorMessage"></span><button id="confirmRequestBtn" class="btn btn-primary" name="CONTINUE" type="button">REQUEST ARTICLE</button><button id="cancelRequestBtn" class="btn btn-default" name="CANCEL" type="button" data-dismiss="modal">CANCEL</button></div></div></div></div>').insertAfter('.subscriptionContainer');
                $("span .section-subscribe").prepend('<button class="request-article" role="button" data-toggle="modal" data-target="#requestArticle" data-backdrop="static" data-keyboard="false">Request Article</button>');

                //fix button positioning
                $('.request-article').css('margin-top', '1px');

                var currSectionId = window.location.href.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
                var sectionURL = window.location.href.split("--")[0];
                //section page request button process
                $("#confirmRequestBtn").click(function(e) {

                    var descriptionText = $("#requestArticleDetail").val();
                    var ticketTags;
                    var getPlatformName = $("#platformSelect option[value='" + originalPlatform + "']").text();

                    if (descriptionText == "") {
                        showError("What would you like to see in the new article?");
                    } else {
                        $.getJSON("/api/v2/users/me/session.json", function(data) {
                            currUserID = data.session.user_id;
                            $('#requestArticle').find('input, textarea, button, select').attr('disabled', 'disabled');
                            $("#confirmRequestBtn").text("PLEASE WAIT...");
                            if (getPlatformName == "SUPPORT KB") ticketTags = "contribute_request_kb,review_a_requested_article";
                            else ticketTags = "contribute_request_doc,review_a_requested_article";
                            $.getJSON("/api/v2/help_center/sections/201249236.json", function(data) {
                                checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                                $.getJSON("/api/v2/help_center/sections/" + currSectionId + ".json", function(sectionData) {
                                    var tickAPI = "https://zendesk.sizmek.com/ProxyAPI.php?" + window.helpCenterVer;
                                    var ticketJSON = {
                                        "ticket": {
                                            "subject": "New article request has been received",
                                            "comment": "New article has been requested after viewing the following section:\n\n[" + cleanTextOnly(sectionData.section.name) + "](" + sectionURL + ")\n\nRequest detail:\n\n" + descriptionText,
                                            "requester_id": currUserID,
                                            //"assignee_id": 351709585, 
                                            "group_id": 21387715,
                                            "tags": ticketTags.split(','),
                                            "ticket_form_id": 16155,
                                            "custom_fields": [{
                                                "id": 22155349,
                                                "value": "review_a_requested_article"
                                            }, {
                                                "id": 24296573,
                                                "value": currSectionId
                                            }, {
                                                "id": 24340826,
                                                "value": sectionURL
                                            }, {
                                                "id": 24340776,
                                                "value": $("#platformSelect option[value='" + originalPlatform + "']").text()
                                            }, {
                                                "id": 24296523,
                                                "value": $("#platformSelect option:selected").attr('name')
                                            }, {
                                                "id": 24296533,
                                                "value": originalSectionName
                                            }, {
                                                "id": 24296543,
                                                "value": $("#sectionSelect option:selected").attr('name')
                                            }, {
                                                "id": 22209215,
                                                "value": "pending_champions_review"
                                            }],
                                            "security_token": checkAccess,
                                            "action": "request"
                                        }
                                    };

                                    //request article


                                    submitCheck = false;
                                    $("#requestArticle .loaderBG").fadeIn();
                                    $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/szmk-loader.gif");
                                    $("#requestArticle .submitStatus").html("<br><br>Submitting your article request...");


                                    $.ajax(tickAPI, {
                                        method: 'POST',
                                        data: JSON.stringify(ticketJSON)
                                    }).done(function(res, textStatus, xhr) {
                                        //success

                                        submitCheck = true;
                                        $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-success.png");
                                        $("#requestArticle .submitStatus").html("<br><br>Thank you! Your request has been received.");

                                    }).fail(function(xhr, textStatus, errorThrown) {
                                        //connection failed

                                        $.getJSON("https://jsonip.com/?callback=?", function(data) {
                                            var showIP = data.ip;
                                            $("#requestArticle .loaderAnimation").attr("src", "/hc/theme_assets/539845/200023575/submit-fail.png");
                                            $("#requestArticle .submitStatus").html("<div style='margin-top:-50px'><span style='color:red'>Connection to server could not be established.<br>Please check that you are on Sizmek network.<br>Your IP : " + showIP + "</span><br><br><button class='btn btn-default backSubmit' type='button'>GO BACK</button></div>");
                                            $("#requestArticle .backSubmit").click(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                            });
                                        });
                                    }).complete(function() {
                                        //handle complete

                                        if (submitCheck) {
                                            setTimeout(function() {
                                                $("#requestArticle .loaderBG").fadeOut();
                                                $('#requestArticle').find('input, textarea, button, select').attr('disabled', false);
                                                $("#confirmRequestBtn").text("REQUEST ARTICLE");
                                                $("#requestArticleDetail").val("");
                                                $('#requestArticle').modal('hide');
                                            }, 4000);

                                        }
                                    });
                                });
                            });
                        });
                    }
                });
            }
        }
    } catch (e) {}


    //add tree of articles and issues for section pages
    if (isSectionPage) {

        //hides the old article list if platform is supportkb and create new container for our new tree of articles
        $("ul.article-list").after(" <ul id='show-data' class='article-list'></ul>");
        $("ul#show-data").before("<ul style='display:none;' id='sectionloader'><br><br><br><br> <img id='sectionloader' style='padding-left:100px;' src='http://p4.zdassets.com/hc/theme_assets/539845/200023575/loading.GIF'/></ul>");
        $("body.support_kb").find("ul.article-list:first").hide();

        var currSectionId = window.location.href.split("sections/")[1].split("#")[0].split("-")[0].split("?")[0];
        var sectionApiURL = "/api/v2/help_center/en-us/sections/" + currSectionId + "/articles.json?sort_by=position&sort_order=asc";

        var showData = $('#show-data');
        var treelist = $("body.support_kb").find('#treelist');

        var treesectionArray = [];

        loadsectiontree();

        /* Per page in the API has a limit of articles.
        This gathers and merges all articles in the 
        current section per page to an object.  */
        function loadsectiontree() {
            $('#sectionloader').css('display', 'block');
            if (sessionStorage.getItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang) === null) {
                $.get(sectionApiURL).done(function(data) {
                    sectionApiURL = data.next_page;
                    checkpage = data["page"];
                    var newArray = $.map(data.articles, function(result, i) {
                        return {
                            "id": result.id,
                            "name": result.name,
                            "url": result.html_url,
                            "updated_at": result.updated_at,
                            "position": result.position,
                            "draft": result.draft,
                            "body": result.body,
                            "label_names": result.label_names,
                            "title": result.title,
                            "vote_sum": result.vote_sum,
                            "vote_count": result.vote_count
                        };
                    });
                    treesectionArray = $.merge(treesectionArray, newArray);
                    if (sectionApiURL !== null) {
                        loadsectiontree();
                    } else {
                        sessionStorage.setItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang, JSON.stringify(treesectionArray));
                        viewsectiontree();
                        cleanWrap(treelist);
                        iconize();
                        expand();
                    }
                });
            } else {
                treesectionArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang));
                viewsectiontree();
                cleanWrap(treelist);
                iconize();
                expand();
            }
        }

        /* Adds the list of articles being acquired by loadsectiontree function to the page */
        function viewsectiontree() {
            $.each(treesectionArray, function(i, data) {
                checkdraft = data["draft"];
                if (!checkdraft) {
                    if (treesectionArray.length) {
                        /* var content = "<a href='" + data["url"] + "'>" + data["name"] + "</a>";
                        var list = $('<li class="treeline" id="treelist"/>').html(content);
                        */
                        var hold = document.createElement("a");
                        hold.href = data["url"];
                        var temp = document.createTextNode(data["name"]);
                        hold.appendChild(temp);
                        var list = document.createElement("li");
                        list.className = "treeline";
                        list.appendChild(hold);
                        showData.css('display', 'none').append(list);
                    }
                }
            });
        }

        /* Adds toggle icons to newly created tree.
        Only adds icons to articles which has issues. */
        function iconize() {
            var lists = $("#show-data > li");
            $(lists).has("span:contains('ARTICLE')").prepend('<i style="font-size:15px;color:rgba(80, 80, 80, 0.97);padding-right:5px;cursor:pointer;margin-left:-18px;" class="fa fa-plus" ></i>').wrap('<div class="icon"></div>');
            $(lists).has("span:contains('TOPIC')").wrap('<div class="maintopic"></div>');
            if ($("div.icon + div.icon").length) {
                $("div.icon + div.icon").prev().find('i').css('display', 'none');
            }
            if ($("div.icon + div.maintopic").length) {
                $("div.icon + div.maintopic").prev().find('i').css('display', 'none');
            }

            if ($('#show-data div.icon:last-child + div').length > -1) {
                $('#show-data div.icon:last-child').find('i').css('display', 'none');
            }

            $("#show-data li").find("i").click(function() {
                if ($(this).hasClass('fa-minus')) {
                    $(this).attr('class', 'fa fa-plus');
                    var next = $(this).parent("li.treeline").closest("div.icon").nextUntil("div");
                    next.slideUp();
                } else {
                    $(this).attr('class', 'fa fa-minus');
                    var next = $(this).parent("li.treeline").closest("div.icon").nextUntil("div");
                    next.slideDown();
                }
            });
        }


        /* Expand All and Collapse All Buttons being added */
        $("#show-data").prepend('<p class="bodytext" style="display:none;">[<a id="anchor-expand" class="jump2">  Expand All </a> | <a class="jump" id="anchor-collapse"> Collapse All </a>]</li>');
        $("#anchor-expand").click(function() {
            $('div.icon li.treeline').find("i").attr('class', 'fa fa-minus');
            $("body.support_kb").find('ul#show-data li.treeline').prev("div.icon").nextUntil("div").slideDown("slow", "swing", function() {});
        });
        $("#anchor-collapse").click(function() {
            $('div.icon li.treeline').find("i").attr('class', 'fa fa-plus');
            $("body.support_kb").find('ul#show-data li.treeline').prev("div.icon").nextUntil("div").slideUp(1000, function() {});
        });


    }

    function expand() {
        $('#sectionloader').css('display', 'block');
        if (($("body.support_kb").find("ul#show-data").length) && ($('#sectionloader').length)) {
            $("body.support_kb").find(".article-list:first").css("display", "none");
            $("body.support_kb").find("ul#show-data").css({
                "display": "none",
                "padding-top": "0"
            });
            $("body.support_kb").find('#sectionloader').css('display', 'block');
        }

        if ($("body.support_kb").find('ul#show-data li.treeline').prev("div.icon").nextUntil("div").length) {
            $("body.support_kb").find('ul#show-data li.treeline').prev("div.icon").nextUntil("div").slideUp(1000, function() {
                $("ul#show-data").find("i").attr('class', 'fa fa-plus');
                $("li:contains('ISSUE') + div.maintopic").prev().find('i').css('display', 'none');
                $("body.support_kb").find('ul#sectionloader').css('display', 'none');
                $("body.support_kb").find("ul#show-data").css('display', 'block');
                $("body.support_kb").find("p.bodytext").css("display", "block");
            });
        } else {
            $("body.support_kb").find('#sectionloader').css('display', 'none');
            $("body.support_kb").find("ul#show-data").css('display', 'block');
        }
    }

    //add breadcrumbs-dropdown
    function breadcrumbsDropdown() {
        if (isSectionPage) {

        } else {
            $("ol.breadcrumbs").find('li:eq(2)').append('<div id="bread-dropdown" class="dropdown"></div>');
            $("ol.breadcrumbs").find('li:eq(2)').find('a.breadcrumbsShow').attr("href", "#");
            $("#bread-dropdown").prepend('<i class="fa fa-caret-down dropbtn" ></i>');
            $(".dropbtn").prepend('<div id="bread-drop" class="dropdown-content"></div>');
        }

        //make the text clickable not only the arrow  
        $(".sub-nav a:eq(2)").addClass("breadcrumbsHidden");

        $(document).click(function() {
            if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {

                $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                $("ol.breadcrumbs li:eq(2)").find('#bread-drop').hide();
            }
        });

        $(".sub-nav a:eq(2)").click(function() {
            if ($(this).hasClass("breadcrumbsHidden")) {
                $(this).removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                $("ol.breadcrumbs li:eq(2)").find('#bread-drop').show();
            } else if ($(this).hasClass("breadcrumbsShow")) {
                $(this).removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                $("ol.breadcrumbs li:eq(2)").find('#bread-drop').hide();
            }

            event.stopPropagation();
        });

        $(".sub-nav").find("i").click(function() {
            if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsHidden")) {
                $(".sub-nav a:eq(2)").removeClass("breadcrumbsHidden").addClass("breadcrumbsShow");
                $("ol.breadcrumbs li:eq(2)").find('#bread-drop').show();
            } else if ($(".sub-nav a:eq(2)").hasClass("breadcrumbsShow")) {
                $(".sub-nav a:eq(2)").removeClass("breadcrumbsShow").addClass("breadcrumbsHidden");
                $("ol.breadcrumbs li:eq(2)").find('#bread-drop').hide();
            }

            event.stopPropagation();
        });

        $("ol.breadcrumbs li:eq(2)").click(function() {
            $("ol.breadcrumbs li:eq(2)").find('#bread-drop').toggleClass("show");
        });

        //close the dropdown if the user clicks outside of it
        window.onclick = function(event) {
            if (!event.target.matches('.dropbtn')) {

                var dropdowns = document.getElementsByClassName("dropdown-content");
                var i;
                for (i = 0; i < dropdowns.length; i++) {
                    var openDropdown = dropdowns[i];
                    if (openDropdown.classList.contains('show')) {
                        openDropdown.classList.remove('show');
                    }
                }
            }
        }
    }
    breadcrumbsDropdown();

    //set the width of the side navigation to 250px and the left margin of the page content to 250px and add a black background color to body
    function openNav() {
        $('#nav-list li').removeClass('treelisthidden');
        storage.setItem(treesettings, '1');
        $('#sideNavigation').css('display', 'block');

        $('#sideNavigation').css('width', '300px');
        $('body.support_kb').find('.cover').css('display', 'none');
        $('body.support_kb').find('#sidefoot').css({
            'width': '300px',
            'margin-left': ''
        });
        $('#sidefoot').css('display', 'block');
        $('.footer-inner').css('padding-left', '300px');
        $('body').find('main').css('width', 'calc(100% - 100px)');
        $('body.support_kb').find('#sideNavigation').css('margin-left', '0');
        $('body').find('main').css('width', 'calc(100% - 350px)');

        (function() {
            try {
                $('#sideNavigation').resizable("enable");
            } catch (err) {
                setTimeout(arguments.callee, 200)
            }
        })();

        $('#side-toggle').attr('class', 'fa fa-angle-double-left');

    }

    var treesettings = (HelpCenter.user.email + '-TreeSettings');
    //set the width of the side navigation to 0 and the left margin of the page content to 0, and the background color of body to white
    function closeNav() {
        $('#sidefoot').css('display', 'block');
        $('.footer-inner').css('padding-left', '20px');
        $('#nav-list li').addClass('treelisthidden');
        storage.removeItem(treesettings);
        $('#sideNavigation').css('display', 'none');
        $('#sideNavigation').css('width', '300px');
        $('body.support_kb').find('#sidefoot').css('margin-left', '-250px');
        $('body.support_kb').find('.cover').css('display', 'block');
        //$('body.support_kb').find('#sideNavigation').css('margin-left','0');
        $('body.support_kb').find('#sideNavigation').css('margin-left', '-250px');
        $('body').find('main').css('width', 'calc(100% - 100px)');
        $('#side-toggle').attr('class', 'fa fa-angle-double-right');
        $("#sidefoot").css("width", "50px");

        (function() {
            try {
                $('#sideNavigation').resizable("disable");
            } catch (err) {
                setTimeout(arguments.callee, 200)
            }
        })();
    }

    //SITEMAP

    //add containers and widgets
    $('head').prepend('<link rel="stylesheet" href="//code.jquery.com/ui/1.12.1/themes/base/jquery-ui.css"><script src="https://code.jquery.com/ui/1.12.1/jquery-ui.js"></script>');
    $("main").before('<div id="sideNavigation" style="display:none"><div id="sidenav"><ul id="nav-list" data-role="listview"><li class="category" id="200834346"><a class="categoryDrop">MDX</a><ul class="group-list"> </ul></li><li class="category" id="200845443"><a class="categoryDrop">Ad Serving</a><ul class="group-list"> </ul></li><li class="category" id="200845433"><a class="categoryDrop">Creative</a><ul class="group-list"> </ul></li><li class="category" id="200834336"><a class="categoryDrop">Data</a><ul class="group-list"></ul></li><li class="category" id="200845423"><a class="categoryDrop">Integrations</a><ul class="group-list"></ul></li><li class="category" id="200834326"><a class="categoryDrop">API</a><ul class="group-list"> </ul></li></ul></div></div>');
    $('#sideNavigation').after('<div id="sidefoot" style="display:none"><i id="side-toggle" class="fa fa-angle-double-left"></i></div>');
    $("#sidenav").find("li").prepend("<i id='icon-category' class='fa fa-caret-right'> </i>");

    // resizing of sidenavigation
    function uiresize() {
        var w = $("body").width() - $("#sideNavigation").width();
        $("main").css('width', w - 52 + 'px');
    }

    (function() {
        try {

            $("#sideNavigation").resizable({

                resize: function(event, ui) {
                    uiresize();
                    var w = $('#sideNavigation').width();
                    $("#sidefoot").css('width', w + 2 + 'px');
                },
                ///alsoResize: "#sidefoot",
                handles: "e"

            });
        } catch (err) {
            setTimeout(arguments.callee, 200)
        }
    })();

    $('#sidefoot').click(function() {
        if ($(this).find('#side-toggle').hasClass('fa-angle-double-left')) {

            closeNav();
        } else {

            openNav();
        }
    });

    var nav = $("#sideNavigation");
    var header = $(".header");
    var header2 = $(".header").height();
    var footer = $(".footer").height();
    var pos = nav.position();
    var maxScroll = $(document).height() - window.innerHeight;
    var footerh = window.innerHeight - footer;
    var headerh = window.innerHeight - header2;
    var mid_header = headerh / 2;
    var mid_footer = footerh / 2;
    var mid_full = window.innerHeight / 2;

    //the handle scrolls when the user scrolls the sideNavigation
    $("#sideNavigation").scroll(function() {
        $(".ui-resizable-e").css("top", $("#sideNavigation").scrollTop() + "px");
    });

    $(window).scroll(function() {
        var windowpos = $(window).scrollTop();

        if ($("#navbar-container").height() > 1) {
            $("#sideNavigation").css("transition", "top .3s ease-in-out");
            $("#navbar-container").css("transition", "top 0.3s ease-in-out");
            if (windowpos >= header.outerHeight()) {
                nav.css("position", "fixed");
                nav.css({
                    'top': '45px',
                    'height': "100%"
                });
                $(".cover").css({
                    'top': '0',
                    'height': "100%"
                });
            } else {
                nav.css("position", "absolute");
                nav.css({
                    'top': '',
                    'height': headerh + 'px'
                });
                $(".cover").css({
                    'top': '',
                    'height': headerh + 'px'
                });
                $("#sidefoot").removeClass("sticky");
            }

        } else {
            if (windowpos >= header.outerHeight()) {
                $("#sideNavigation").css("transition", "top 0.3s ease-in-out");
                $("#navbar-container").css("transition", "top 0.5s ease-in-out");
                $("#sideNavigation").css("transition-delay", "0s");
                nav.css("position", "fixed");
                nav.css({
                    'top': '0',
                    'height': "100%"
                });
                $(".cover").css({
                    'top': '0',
                    'height': "100%"
                });
            } else {
                $("#sideNavigation").css("transition", "top 0.3s ease-in-out");
                $("#navbar-container").css("transition", "top 0.5s ease-in-out");
                $("#sideNavigation").css("transition-delay", "0s");
                nav.css("position", "absolute");
                nav.css({
                    'top': '',
                    'height': headerh + 'px'
                });
                $(".cover").css({
                    'top': '',
                    'height': headerh + 'px'
                });
                $("#sidefoot").removeClass("sticky");
            }
        }
    });

    //opening of sub-list for sidenav
    $('#nav-list').on('click', 'i', function() {
        if ($(this).hasClass('fa-caret-down')) {
            $(this).attr('class', 'fa fa-caret-right');
            if ($(this).parent('li.treelist').length) {
                var next = $(this).parent("li").closest("div.icon").nextUntil("div");
                next.slideUp();
            } else {
                $(this).next("a").nextUntil("li").slideUp();
            }

        } else {
            $(this).attr('class', 'fa fa-caret-down');
            if ($(this).parent('li.treelist').length) {
                var next = $(this).parent("li").closest("div.icon").nextUntil("div");
                next.slideDown();
            } else {
                $(this).next("a").nextUntil("li").slideDown();
            }

        }
    });
    $('#nav-list').on('click', 'a.categoryDrop', function() {
        if ($(this).parent().find("i").eq(0).hasClass('fa-caret-down')) {
            $(this).parent().find("i").eq(0).attr("class", "fa fa-caret-right");
            if ($(this).parent("li.treelist").length) {
                var slide = $(this).nextUntil("div");
                slide.slideUp();
            } else {
                $(this).nextUntil("li").slideUp();
            }
        } else {
            $(this).parent().find("i").eq(0).attr("class", "fa fa-caret-down");
            if ($(this).parent('li.treelist').length) {
                var slide = $(this).nextUntil("div");
                slide.slideDown();
            } else {
                $(this).nextUntil("li").slideDown();
            }
        }
    });

    $('#nav-list').on('click', 'a.sectionDrop', function() {
        if ($(this).parent().find("i").eq(0).hasClass('fa-caret-down')) {
            $(this).parent().find("i").eq(0).attr("class", "fa fa-caret-right");
            if ($(this).parent("li.treelist").length) {
                var slide = $(this).nextUntil("div");
                slide.slideUp();
            } else {
                $(this).nextUntil("li").slideUp();
            }
        } else {
            $(this).parent().find("i").eq(0).attr("class", "fa fa-caret-down");
            if ($(this).parent('li.treelist').length) {
                var slide = $(this).nextUntil("div");
                slide.slideDown();
            } else {
                $(this).nextUntil("li").slideDown();
            }
        }
    });

    //ensures to get list of sections
    function sectionListStorage() {
        if (storage.getItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang) === null) {
            $.get(navSectionAPI).done(function(data) {
                navSectionAPI = data.next_page;
                var navnewArray = $.map(data.sections, function(section, i) {
                    return {
                        "id": section.id,
                        "name": section.name,
                        "category": section.category_id
                    };
                });
                navsecArray = $.merge(navnewArray, navsecArray);
                if (navSectionAPI !== null) {
                    navSectionAPI += "&per_page=100";
                    sectionListStorage();

                } else {
                    storage.setItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang, JSON.stringify(navsecArray));
                    NavCatArrayready = 1;
                }
            });
        } else {
            navsecArray = JSON.parse(storage.getItem(HelpCenter.user.email + '-allSections' + window.helpCenterVer + window.currentLang));
            NavCatArrayready = 1;
        }
    }
    sectionListStorage();
    var secloadstatus = 0;
    //add selected section to list
    function addSectionToList() {
        $('#nav-list').find(selectCatId).find('.group-list').empty();
        $.each(navsecArray, function(i, section) {

            if (section["category"] == getNavCatId) {

                $('#nav-list').find(selectCatId).find('.group-list').append('<li class="section" id="' + section["id"] + '"><i id="icon-section" class="fa fa-caret-right"> </i> <a class="sectionDrop">' + cleanTextOnly(section["name"]) + '</a><ul class="sub-group-list" style="overflow: hidden; display:none;"></ul></li>');
            }
        });
        secloadstatus = 0;
    }

    //category level drop section list
    $('#nav-list').on('click', 'i#icon-category', function() {
        if (secloadstatus == 0) {
            if ($(this).nextAll('ul').eq(0).find('li').length == 0) {
                secloadstatus = 1;
                if ($(this).parent('li').hasClass('category')) {
                    getNavCatId = $(this).parent('li.category').attr('id');
                    selectCatId = $('#' + getNavCatId);
                    addSectionToList();
                }
            } else {
                secloadstatus = 0;
            }
        }
    });

    $('#nav-list').on('click', 'a.categoryDrop', function() {
        if (secloadstatus == 0) {

            if ($(this).nextAll('ul').eq(0).find('li').length == 0) {
                secloadstatus = 1;
                if ($(this).parent('li').hasClass('category')) {
                    getNavCatId = $(this).parent('li.category').attr('id');
                    selectCatId = $('#' + getNavCatId);
                    addSectionToList();
                }
            } else {
                secloadstatus = 0;
            }
        }
    });

    var artloadstatus = 0;
    //section level drop article list
    $('#nav-list').on('click', 'i#icon-section', function() {

        if ($(this).nextAll('ul').eq(0).find('li').length == 0) {
            if ($(this).parent('li').hasClass('section')) {
                getnavSecId = $(this).parent('li.section').attr('id');
                selectSecId = $('#' + getnavSecId).find('.sub-group-list');
                if ($('#nav-list').find(selectSecId).length) {
                    if (artloadstatus == 0) {
                        artloadstatus = 1;
                        instantiateTree();
                    }
                    $('#nav-list').find(selectSecId).attr('id', getnavSecId);
                }
            }
        }
    });
    $('#nav-list').on('click', 'a.sectionDrop', function() {

        if ($(this).nextAll('ul').eq(0).find('li').length == 0) {
            if ($(this).parent('li').hasClass('section')) {
                getnavSecId = $(this).parent('li.section').attr('id');
                selectSecId = $('#' + getnavSecId).find('.sub-group-list');
                if ($('#nav-list').find(selectSecId).length) {

                    if (artloadstatus == 0) {
                        artloadstatus = 1;
                        instantiateTree();
                    }
                    $('#nav-list').find(selectSecId).attr('id', getnavSecId);
                }
            }
        }
    });

    var dataloaded = 1;

    //view selected article without refreshing the page
    $('#nav-list').on('click', '.treelist > a', function() {
        event.preventDefault();

        if (dataloaded) {
            dataloaded = 0;
            $('.sub-group-list li').css({
                'background-color': '#f5f5f5',
                'border-right': 'none'
            });
            $('.sub-group-list li > a').css({
                'color': 'grey'
            });
            $('li').removeClass('back-color');
            getnavArticleId = $(this).attr('id');
            getnavArticleUrl = $(this).attr('href');

            if (getnavSectionId = $('#' + getnavArticleId).parent('ul.sub-group-list').parent('li.section').length) {
                getnavSectionId = $('#' + getnavArticleId).parent('ul.sub-group-list').parent('li.section').attr('id');
            } else if (getnavSectionId = $('#' + getnavArticleId).parent('div').parent('ul.sub-group-list').parent('li.section').length) {
                getnavSectionId = $('#' + getnavArticleId).parent('div').parent('ul.sub-group-list').parent('li.section').attr('id');
            }
            $('#nav-list li').find('a').css({
                'color': 'grey !important'
            });
            $('#nav-list li').css({
                'background-color': '#f5f5f5',
                'border-right': 'none'
            });
            $('#nav-list li').css({
                'background-color': '#f5f5f5',
                'border-left': 'none'
            });
            $('#nav-list li[id=' + getnavArticleId + ']').find('a').css({
                'color': '#0072c6 !important'
            });
            //$('#nav-list li[id='+getnavArticleId+']').css({'background-color':'#ebf8fe','border-right':'3px solid #0072c6'});
            //jhon
            $('#nav-list .sub-group-list .maintopic > li > a').css({
                'margin-left': '21px'
            });
            $('#nav-list .sub-group-list .maintopic > li[id=' + getnavArticleId + ']').css({
                'background-color': '#ebf8fe',
                'border-left': '3px solid #0072c6'
            });
            $('#nav-list .sub-group-list .maintopic > li[id=' + getnavArticleId + '] > a').css({
                'margin-left': '18px'
            });


            $('#nav-list .sub-group-list').find('.icon li').css({
                'padding-left': '20px'
            });
            $('#nav-list .sub-group-list .icon > li[id=' + getnavArticleId + ']').css({
                'background-color': '#ebf8fe',
                'border-left': '3px solid #0072c6',
                'padding-left': '17px'
            });

            $('#nav-list .sub-group-list > li').css({
                'padding-left': '50px'
            });
            $('#nav-list .sub-group-list > li[id=' + getnavArticleId + ']').css({
                'background-color': '#ebf8fe',
                'border-left': '3px solid #0072c6',
                'text-indent': '-20px',
                'padding-left': '47px'
            });

            selectnavSectionName = $('#' + getnavSectionId + ' i')[0];
            selectnavCatID = $('#' + getnavSectionId).parent('ul.group-list').parent('li.category').attr('id');
            selectnavCatName = $('#' + getnavSectionId).parent('ul.group-list').parent('li.category').find('i')[0];
            //var textNode = selectnavSectionName.nextSibling;
            var textNode = $('#' + getnavSectionId + ' a')[0];
            getnavSectionName = textNode.textContent;
            var textNode2 = selectnavCatName.nextSibling;
            getnavCategoryName = textNode2.textContent;

            $(".article-header").css('display', 'none');
            $("head").find('title').css('display', 'none');
            $("article").css('display', 'none');

            ajaxreplaceContent();
        }
    });

    //get values on pop state of history api
    window.onpopstate = function(event) {
        var state = JSON.stringify(event.state);
        if (state === null) {} else {
            var state2 = JSON.parse(state);
        }
    };

    //loads article no refrsh
    function ajaxreplaceContent() {

        if (window.location.href.indexOf("/articles/") > -1) {
            stateObj = {
                article: getnavArticleId,
                section: getnavSectionId,
                url: getnavArticleUrl
            };
            history.replaceState(stateObj, null, getnavArticleUrl);
            $('.article-header .mdxnxt-title').remove();
            $(".breadcrumbs li").eq(1).find('a:first').text(getnavCategoryName);
            $(".breadcrumbs li").eq(1).find('a:first').attr("href", 'https://support.sizmek.com/hc/en-us/categories/' + selectnavCatID);
            $(".breadcrumbs li").eq(1).attr("title", getnavCategoryName);
            $(".breadcrumbs li").eq(2).find('a:first').text(getnavSectionName);
            $(".breadcrumbs li").eq(2).attr("title", getnavSectionName);
            $('#parentSelect').empty();
            $('#sectionSelect').empty();
            $('#categorySelect').empty();
            $('#bread-drop').empty();
            $('.article-attachments > .attachments').empty();
            $('#requestArticle').remove();
            $('#flagArticle').remove();
            $('#suggestEdit').remove();
            $('#suggestEdit').remove();
            //$('.submitAnArticle').remove();
            $('.add-article').remove();
            $('.request-article').remove();
            $('.use-article').remove();
            $('.flag-article').remove();
            $('.suggest-edit').remove();
            attachments();
            $(".article-header").find('h1').empty();
            $('.article-comments').css('display', 'none');
            $('.article-footer').css('display', 'none');
            $('.article-vote').css('display', 'none');
            //$('.article-attachments').css('display','none');
            var EditArticleLink = 'https://sizmek.zendesk.com/knowledge/articles/' + getnavArticleId + '/en-us?brand_id=12005&return_to=%2Fhc%2Fen-us%2Farticles%2F' + getnavArticleId;
            $("a.zd-hc-button:contains('Edit article')").attr("href", EditArticleLink);
            loadArticleData();

            navsectionArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + '-Tree-' + getnavSectionId + window.helpCenterVer + window.currentLang));
            $.each(navsectionArray, function(i, data) {

                var matchedArticleId = data["id"];
                var matchedArticleTitle = data["title"];
                var matchedArticleName2 = cleanTextOnly(data["name"]);
                var matchedArticleName = data["name"];
                var matchedArticle = data["name"];
                var matchedArticleUrl = data["url"];
                var matchedArticleBody = data["body"];
                var matchedPosition = data["position"];
                var matchedTags = data["label_names"];
                var matchedVoteCount = data["vote_count"];
                var matchedVoteSum = data["vote_sum"];
                var matchedArticleDate = data["updated_at"];

                if (matchedArticleId == getnavArticleId) {
                    if (navsectionArray.length) {
                        var dateUpdated = new Date(matchedArticleDate);
                        var newdateUpdated = moment(dateUpdated).format("MMMM DD, YYYY HH:mm");

                        $(".article-info").find('time').text(newdateUpdated);
                        $(".article-header").find('h1').html(matchedArticleName);
                        $(".article-header").find('h1').prepend('<span class="visibility-internal" data-title="Only visible to agents and managers"><span class="visibility-internal-icon"></span></span>');
                        $('.article-header').find('h1').each(function() {
                            cleanThis($(this));
                        });
                        $("head").find('title').text(matchedArticleName2);
                        $(".article-body").html(matchedArticleBody);
                        maxScroll = $(document).height() - window.innerHeight;
                        $(".article-header").fadeIn();
                        $("head").find('title').fadeIn();
                        $("article").fadeIn();

                        //Make own container of TOC
                        $(".in-this-articles").after("<section class = 'tocContainer'> <h3 class ='tocHead'> Table of Contents </h3> </section>");
                        $(".tocHead").css("margin-top", "0");
                        $(".tocHead").css("margin-bottom", "0");

                        if ($(".article-body").find("h2").length > 0) {
                            $(".tocContainer").show();
                            $(".tocHead").show();
                        } else {
                            $(".tocContainer").hide();
                            $(".tocHead").hide();
                        }

                        var duplicateChk = {};

                        $('.tocContainer').each(function() {
                            if (duplicateChk.hasOwnProperty(this.id)) {
                                $(this).remove();
                            } else {
                                duplicateChk[this.id] = 'true';
                            }
                        });

                        if ($(".tocContainer").hasClass("tocify")) {} else {
                            if ($(".article-body").length) {
                                if ($(".article-header").text().toLowerCase().indexOf("glossary") > -1 || ($("#switchTag").val() == "support_kb")) {
                                    $(".tocContainer").tocify({
                                        context: ".article-body",
                                        selectors: "h2,h3"
                                    });
                                } else {
                                    $(".tocContainer").tocify({
                                        context: ".article-body",
                                        selectors: "h2"
                                    });
                                }
                            }
                        }

                        $(".in-this-articles").hide();
                        //End of making     

                        $(".article-subscribe").attr("href", matchedArticleUrl + '/subscription');
                        $(".comment-form").attr("action", matchedArticleUrl + '/comments');
                        stateObj = {
                            article: matchedArticleId,
                            section: getnavSectionId
                        };
                        history.replaceState(stateObj, null, matchedArticleUrl);
                    }
                }
            });
        } else {
            window.location.href = 'https://support.sizmek.com/hc/en-us/articles/' + getnavArticleId;

        }
    }
    var attachmentsArray;

    function attachments() {

        attachmentsArray = [];
        attachmentsAPI = "/api/v2/help_center/en-us/articles/" + getnavArticleId + "/attachments/block.json";

        function loadAttachments() {
            if (sessionStorage.getItem(HelpCenter.user.email + '-Attachments-' + getnavArticleId + window.helpCenterVer + window.currentLang) === null) {
                $.get(attachmentsAPI).done(function(data) {
                    var newArray = $.map(data.article_attachments, function(result, i) {
                        return {
                            "display_file_name": result.display_file_name,
                            "file_name": result.file_name,
                            "content_url": result.content_url,
                            "size": result.size
                        };
                    });
                    attachmentsArray = $.merge(attachmentsArray, newArray);
                    sessionStorage.setItem(HelpCenter.user.email + '-Attachments-' + getnavArticleId + window.helpCenterVer + window.currentLang, JSON.stringify(attachmentsArray));
                    placeAttachments();
                });
            } else {
                attachmentsArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + '-Attachments-' + getnavArticleId + window.helpCenterVer + window.currentLang));
                placeAttachments();
            }
        }
        loadAttachments();
    }

    function placeAttachments() {
        $.each(attachmentsArray, function(i, data) {
            if (attachmentsArray.length) {
                var hold = document.createElement("href");
                var hold = document.createElement("target");
                var hold = document.createElement("a");

                var size = document.createElement("span");
                var value = (data["size"]);

                /* function formatBytes(bytes) {
                    if(bytes < 1024) return Math.round(bytes/100)*100 + " Bytes";
                    else if(bytes < 1048576) return Math.round((bytes / 1024).toFixed(0)/100)*100 + " KB";
                    else if(bytes < 1073741824) return Math.round((bytes / 1048576).toFixed(0)/100)*100 + " MB";
                    else return(bytes / 1073741824).toFixed(0) + " GB";
                }; */

                function formatBytes(bytes) {
                    if (bytes < 1024) return (bytes) + " Bytes";
                    else if (bytes < 1048576) return ((bytes / 1024).toFixed(0)) + " KB";
                    else if (bytes < 1073741824) return ((bytes / 1048576).toFixed(0)) + " MB";
                    else return (bytes / 1073741824).toFixed(0) + " GB";
                };

                var temp = document.createTextNode(data["file_name"]);
                var tempsize = document.createTextNode(' (' + formatBytes(value) + ')');


                hold.target = '_blank';
                hold.href = data['content_url'];

                hold.appendChild(temp);
                size.appendChild(tempsize);

                var list = document.createElement("li");
                list.className = "treelist";
                list.appendChild(hold);
                list.appendChild(size);
                $('.article-attachments > .attachments').prepend(list);

            }
        });
    }


    //views and loads tree of articles and issues for side nagivation of the selected section
    function instantiateTree() {
        var navsectionArray = [];

        currSectionId = getnavSecId;
        treelist = $('.treelist');

        navsectionApiURL = "/api/v2/help_center/en-us/sections/" + currSectionId + "/articles.json?sort_by=position&sort_order=asc";
        loadnavsectiontree();

        function loadnavsectiontree() {

            if (sessionStorage.getItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang) === null) {
                $.get(navsectionApiURL).done(function(data) {
                    navsectionApiURL = data.next_page;
                    checkpage = data["page"];
                    var newArray = $.map(data.articles, function(result, i) {
                        return {
                            "id": result.id,
                            "name": result.name,
                            "url": result.html_url,
                            "updated_at": result.updated_at,
                            "position": result.position,
                            "draft": result.draft,
                            "body": result.body
                        };
                    });
                    navsectionArray = $.merge(navsectionArray, newArray);
                    if (navsectionApiURL !== null) {
                        loadnavsectiontree();
                    } else {
                        sessionStorage.setItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang, JSON.stringify(navsectionArray));
                        addtosidenav();
                        cleanWrap(treelist);
                        addicon();

                        NavArtArrayready = 1;
                        artloadstatus = 0;

                    }
                });
            } else {
                navsectionArray = JSON.parse(sessionStorage.getItem(HelpCenter.user.email + '-Tree-' + currSectionId + window.helpCenterVer + window.currentLang));
                addtosidenav();
                cleanWrap(treelist);
                addicon();

                NavArtArrayready = 1;
                artloadstatus = 0;

            }
        }

        /*function navslideUp(){
                 $("#nav-list").find('ul.sub-group-list li').prev("div.icon").nextUntil("div").slideUp(300, function() {
                $(selectSecId).find("i").attr('class', 'fa fa-caret-right');
                $("#nav-list li:contains('ISSUE') + div.maintopic").prev().find('i').css('display', 'none');
                $(selectSecId).css('display', 'block');
                }); 
        }*/


        /* Adds the list of articles being acquired by loadsectiontree function to the page */
        function addtosidenav() {
            $.each(navsectionArray, function(i, data) {
                checkdraft = data["draft"];
                if (!checkdraft) {
                    if (navsectionArray.length) {
                        var hold = document.createElement("href");
                        var hold = document.createElement("id");
                        var hold = document.createElement("a");

                        var temp = document.createTextNode(data["name"]);
                        hold.className = "nav-line";
                        hold.id = data['id'];
                        hold.href = data['url'];
                        hold.appendChild(temp);
                        var list = document.createElement("id");
                        var list = document.createElement("li");
                        list.className = "treelist";
                        list.id = data['id'];
                        list.appendChild(hold);
                        selectSecId.append(list);
                    }
                }
            });
        }

        /* Adds toggle icons to newly created tree.
        Only adds icons to articles which has issues.
        Fixes some icons */
        function addicon() {
            var lists = $("ul.sub-group-list > li");

            $(lists).has("span:contains('ARTICLE')").prepend('<i style="font-size:15px;color:rgba(80, 80, 80, 0.97);padding-right:5px;cursor:pointer;height:14px;width:13px;" class="fa fa-plus" ></i>').wrap('<div class="icon"></div>');
            $(lists).has("span:contains('TOPIC')").wrap('<div class="maintopic"></div>');
            $(lists).find(".article-title").text('A');
            $(lists).find(".topic-title").text('T');
            $(lists).find(".issue-title").text('I');

            $(lists).find("i").addClass("fa fa-caret-down");

            if ($("div.icon + div.icon").length) {
                //$("div.icon + div.icon").prev().find('i').css('display', 'none');
                $("div.icon + div.icon").prev().find('i').remove();

            }
            if ($("div.icon + div.maintopic").length) {
                //$("div.icon + div.maintopic").prev().find('i').css('display', 'none');
                $("div.icon + div.maintopic").prev().find('i').remove();

            }

            if ($('ul.sub-group-list div.icon:last-child + div').length > -1) {
                //$('ul.sub-group-list div.icon:last-child').find('i').css('display', 'none');
                $('ul.sub-group-list div.icon:last-child').find('i').remove();

            }

            $("div.icon li > a").removeClass();
            if ($("li.treelist + div.icon").length) {
                $("li.treelist + div.icon").prev().find('a').removeClass();
            }
            if ($(".sub-group-list li.treelist:last").length) {
                $(".sub-group-list li.treelist:last").find('a').removeClass();
            }


            $("ul.sub-group-list > li").find("i").click(function() {
                if ($(this).hasClass('fa-caret-down')) {
                    $(this).attr('class', 'fa fa-caret-right');
                    var next = $(this).parent("li").closest("div.icon").nextUntil("div");
                    next.slideUp();
                } else {
                    $(this).attr('class', 'fa fa-caret-down');
                    var next = $(this).parent("li").closest("div.icon").nextUntil("div");
                    next.slideDown();
                }
            });

            if ($("#nav-list").find('ul.sub-group-list li').prev("div.icon").nextUntil("div").length) {
                $(selectSecId).find('li').prev("div.icon").nextUntil("div").css('display', 'none');
                $("#nav-list li:contains('ISSUE') + div.maintopic").prev().find('i').css('display', 'none');
                $(selectSecId).css('display', 'block');
                $(selectSecId).find("i").attr('class', 'fa fa-caret-right');
            }

        }
    }

    var currCatId;

    if (window.location.href.indexOf("/categories") > -1) {
        currCatId = window.location.href.split("categories/")[1].split("#")[0].split("-")[0].split("?")[0];
        (function() {
            if ($('#sideNavigation').length) {

                getNavCatId = currCatId;
                selectCatId = $('#' + currCatId);
                $('.category').css({
                    'background-color': '#f5f5f5',
                    'border-right': 'none'
                });
                if ($('.category[id=' + currCatId + ']').length) {
                    $('.category[id=' + currCatId + ']').addClass('back-color');
                    /* $('.category[id='+currCatId+']').css({'color':'#0072c6 !important'});
                    $('.category[id='+currCatId+']').css({'background-color':'#ebf8fe','border-right':'3px solid #0072c6'}); */
                    (function() {
                        if ($('.category[id=' + currCatId + ']').find('ul.group-list > li').length) {
                            $('.category[id=' + currCatId + ']').find("i").eq(0).attr('class', 'fa fa-caret-down');
                            $(this).find('ul.group-list').css({
                                'display': 'block',
                                'overflow': 'hidden'
                            });
                            $('.category[id=' + currCatId + ']').css({
                                'color': '#0072c6 !important'
                            });
                            //$('.category[id='+currCatId+']').css({'background-color':'#ebf8fe','border-right':'3px solid #0072c6'});

                        } else {
                            addSectionToList();
                            setTimeout(arguments.callee, 200)
                        }
                    })();
                } else {}
            } else {
                setTimeout(arguments.callee, 200)
            }
        })();
    }

    //related ticket table handling
    function populateTickets() {
        var relatedTickets;
        var html = '';
        var ArtId = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0];

        //get related tickets and parse
        $.getJSON("/api/v2/search.json?query=type:ticket+tags:usekb_" + ArtId, function(data) {
            relatedTickets = data.results;
            $.each(relatedTickets, function(index, value) {
                var updatedate = new Date(value.updated_at);
                html += "<tr>";
                html += "<td>" + value.id + "</td>";
                html += "<td>" + value.subject + "</td>";
                html += "<td>" + updatedate.toLocaleDateString() + "</td>";
                html += "<td>" + value.group_id.toString().replace('21321019', 'Tier1').replace('21321029', 'Tier2').replace('21387695', 'Tier3').replace('21575859', 'Tier4') + "</td>";
                html += "<td>" + value.status + "</td>";
                html += "</tr>";
            });
            $('#relatedTicketsTable').find('tbody').append(html);
        }).done(function() {
            $('.status-new').text("NEW");
            $('.status-open').text("OPEN");
            $('.status-hold').text("ON-HOLD");
            $('.status-pending').text("PENDING");
            $('.status-closed').text("CLOSED");
            $('.status-solved').text("SOLVED");
            styleTicketTable();
        });
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
                    return "<a href=\"https://sizmek.zendesk.com/agent/tickets/" + row[column.id] + "\" target=\"_blank\">" + row[column.id] + "</a>";
                },
                "status": function(column, row) {
                    return "<span class=\"status-icon status-" + row[column.id] + "\">" + row[column.id] + "</span>";
                }
            }
        });
    }

    //show or replace case example table if internal user and article page
    if (currentUser !== "end_user" && currentUser !== "anonymous" && window.location.href.indexOf("/articles/") > -1 && window.location.href.indexOf("209729503") == -1) {
        if ($("h2:contains('Case Examples')").length == 0) {
            $(".article-body").append('<h2 id="caseExamples">Case Examples</h2><table></table>')
        }
        if ($("h2:contains('Case Examples')").next("p").length > 0) $("h2:contains('Case Examples')").next("p").remove();
        if ($("h2:contains('Case Examples')").next("br").length > 0) $("h2:contains('Case Examples')").next("br").remove();
        $("h2:contains('Case Examples')").next("table").replaceWith('<table id="relatedTicketsTable"><thead><tr><th data-column-id="id" data-header-css-class="id-column" data-formatter="id" data-type="numeric" data-identifier="true">ID</th><th data-column-id="subject" data-header-css-class="subject-column">SUBJECT</th><th data-column-id="updated" data-header-css-class="updated-column">UPDATED</th><th data-column-id="tier" data-header-css-class="tier-column">TIER</th><th data-column-id="status" data-header-css-class="status-column" data-formatter="status">STATUS</th></tr></thead><tbody></tbody></table>');
        $("#relatedTicketsTable").removeClass("bordered");
        populateTickets();
    }
    //when sidebar is closed
    $("<div class ='cover'></div>").insertAfter('#sideNavigation');
});