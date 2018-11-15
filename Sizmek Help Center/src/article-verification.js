// ARTICLE VERIFICATION
// AUTHOR: Yves Denzel libunao
// ver 1.11
$(document).ready(function() {
    var currentUser = HelpCenter.user.role;
    var storage = window["localStorage"];
    var sessionStorage = window["sessionStorage"];
    var articleURL = window.location.href.split("--")[0];

    if (window.location.href.indexOf("/articles/") > -1 && currentUser != "end_user" && currentUser != "anonymous") {
        var monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        var locale = HelpCenter.user.locale,
            globalsupport_user_id = 357520165,
            currArticleID = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0],
            currCategoryID,
            currSectionID,
            isInternalEnable = true;

        var avHTML = '<div id="article-verification"><div class="av-trusted" id="av-header" v-toggle="av-closed"><i class="fa fa-check"></i><span class="av-status">TRUSTED</span><div class="v-toggle"><span class="fa fa-angle-down"></span></div></div><div class="av-body"><div class="av-body-item"><div class="av-title"><i class="fa fa-user"></i><span>LAST VERIFIED BY</span></div><strong class="av-detail" id="av-last-verifier">YOU</strong></div><div class="av-body-item"><div class="av-title"><i class="fa fa-calendar-check-o"></i><span>LAST VERIFIED ON</span></div><strong class="av-detail" id="av-last-vdate">February 12, 2018</strong></div><div class="av-body-item"><div class="av-title"><i class="fa fa-calendar"></i><span>VERIFICATION INTERVAL</span></div><div class="av-interval-error"><span>PLEASE SELECT AN INTERVAL</span></div><select class="select-picker" id="av-interval-select" name=""><option value="0">NO INTERVAL CHOSEN</option><option value="1">Every month</option><option value="2">Every 2 months</option><option value="3">Every 3 months</option><option value="4">Every 4 months</option><option value="6">Every 6 months</option><option value="12">Every 12 months</option></select></div><div class="av-body-item av-related-tickets"><div class="av-title"><i class="fa fa-ticket"></i><span>TICKETS</span><span class="av-verify-error" style="display:none">RESOLVE TICKETS FIRST</span></div><strong class="av-detail noTickets">NO TICKETS</strong><table><thead><tr><th>TICKET ID</th><th>DATE</th></tr></thead><tbody id="av-open-related-tickets"></tbody></table></div><div class="verify-article"><div class="av-alert"><span>Please resolve tickets.</span></div><button type="button" id="av-verify-article" name="button"><span>VERIFY ARTICLE</span></button></div></div></div> ';

        $("#sideNavigation").prepend(avHTML);
        $("#article-verification").hide();
        $("#filterContent").css("border-top", "1px solid #183e6c");

        // THIS HANDLES THE TOGGLING OF THE AV
        $("#article-verification #av-header").click(function() {
            if ($(this).attr("v-toggle") == "av-closed") {
                $(this).attr("v-toggle", "av-open");
                $(this).find(".v-toggle .fa").removeClass("fa-angle-down").addClass("fa-angle-up");
                $(".av-body").slideDown("fast");
            } else {
                $(this).attr("v-toggle", "av-closed");
                $(this).find(".v-toggle .fa").addClass("fa-angle-down").removeClass("fa-angle-up");
                $(".av-body").slideUp("fast");
            }
        })

        var ticket_article = window.location.href.split("/");

        avRelatedTickets();
        // GLOBAL VARIABLES -- FLAGS
        var article_status = 0;
        var hasAVLabel = 0;
        var xDaysLeft = 0;

        function listTickets() {
            // THIS WILL LIST THE TICKETS RELATED TO THE Article
            // CURRENTLY USED TO REFRESH AND UPDATE THE TICKET TABLE
            var severity = 0;
            $("#av-verify-article").prop("disabled", true);
            $.get("/api/v2/search.json?query=custom_field_24296573:" + currArticleID).done(function(tickets) {
                $("#av-verify-article").prop("disabled", false);

                //console.log("LISTING TICKETS");
                if (tickets.count > 0) {
                    var openOrNew = 0;
                    $(".av-related-tickets table tbody").empty();
                    for (var x = 0; x < tickets.count; x++) {
                        if (tickets.results[x].status == "open" || tickets.results[x].status == "new") {
                            openOrNew++;
                            $(".av-related-tickets .noTickets").hide();
                            var id = tickets.results[x].id,
                                subject = tickets.results[x].subject,
                                status = tickets.results[x].status,
                                requester_id = tickets.results[x].requester_id,
                                updated_at = new Date(tickets.results[x].updated_at);
                            var stat_icon = '<span class="ticket_status_label ticket-status ticket-status-' + status + '" title="' + status + '">' + (status.charAt(0).toLowerCase()) + '</span>';
                            var ticket_tr = '<tr class="related-tickets-item"><td><a href="/agent/tickets/' + id + '" target="_blank">' + stat_icon + '&nbsp;#' + id + '</a></td><td>' + updated_at.toDateString() + '</td></tr>';
                            $("#av-open-related-tickets").append(ticket_tr);

                            var tickTags = tickets.results[x].tags;

                            if (tickTags.indexOf("article_flagged_reason_outdated_information") > -1) {
                                getSeverity2(6);
                            }
                            if (tickTags.indexOf("review_a_flagged_article") > -1) {
                                getSeverity2(5);
                            }
                        }
                    }
                    if (openOrNew > 0) {
                        getSeverity2(2);
                        $(".av-related-tickets table").show();
                    } else {
                        getSeverity2(1);
                        $(".av-verify-error").hide();
                        $(".av-related-tickets .noTickets").show();
                        $(".av-related-tickets table").hide();
                    }
                } else {
                    getSeverity2(1);
                    $(".av-related-tickets table").hide();
                    $(".av-related-tickets noTickets").show();
                    $(".av-verify-error").hide();
                }
                //console.log("severity: " + severity);

                applyArticleStatus(severity);


                function getSeverity2(status) {
                    if (severity == 0 || status > severity || status == severity) {
                        severity = status;
                    }
                }
            });
        }

        function convToReadableDate(datestr) {
            var avDate = new Date(datestr);
            var dateToday = new Date();
            var yester = new Date();
            yester.setHours(15);
            yester.setDate(yester.getDate() - 1);
            var month = monthNames[avDate.getMonth()];
            var year = avDate.getFullYear();
            var day = avDate.getDate();

            if (avDate.setHours(0, 0, 0, 0) == dateToday.setHours(0, 0, 0, 0)) {
                $("#av-last-vdate").text("TODAY");
            } else if (avDate.setHours(0, 0, 0, 0) == yester.setHours(0, 0, 0, 0)) {
                $("#av-last-vdate").text("YESTERDAY");
            } else {
                $("#av-last-vdate").text(month + " " + day + ", " + year);
            }
        }

        function deleteAllAVLabels(delArr, jsonobj) {
            // DELETE ALL LABELS RELATING TO THE VERIFICATION (!av::)
            var x = 0;
            //console.log("DEL ARR LENGTH:" + delArr.length);

            function next() {
                var delID = delArr[x];
                //console.log("DEL ID: " + delID);
                $.ajax({
                    url: '/api/v2/help_center/articles/' + currArticleID + '/labels/' + delArr[x] + '.json',
                    method: 'DELETE',
                    error: function() {
                        //console.log("FAILED TO DELETE LABELS");
                    },
                    success: function() {
                        //console.log("DEL ID: " + delID + " DELETED");
                        ++x;
                        if (x >= delArr.length) {
                            //console.log("CREATE AV LABEL NOW");
                            createAVLabel(jsonobj);
                        } else {
                            next();
                        }

                    }
                });
            }
            next();
        }

        function createAVLabel(jsonobj) {
            // THIS WILL CREATE A VERIFICATION LABEL
            //console.log("createavlabel");
            //console.log(jsonobj);

            var jsonstring = '{"label":{"name":"!av::details::' + jsonobj.date + '::' + jsonobj.interval + '::' + jsonobj.verifier + '"}}';
            var labelsend = JSON.parse(jsonstring);
            $.ajax({
                url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
                method: 'POST',
                data: labelsend,
                success: function() {
                    createNextVerificationDate(jsonobj);
                },
                error: function() {
                    errorHandler();
                }
            })
        }

        function verifyDate(datestr, interval) {
            // THIS CHECKS IF THE LAST VERIFIED DATE IS TRUSTED
            var av_interval = parseInt(interval);
            var today = new Date();
            var lastVerifiedDate = new Date(datestr);
            var deadline = new Date(datestr);
            deadline.setMonth(deadline.getMonth() + av_interval);

            var intervalDays = getDaysDiff(lastVerifiedDate, deadline);
            var daysLeftToDeadline = getDaysDiff(today, deadline);

            /*
            console.log("LAST VERIFIED DATE " + lastVerifiedDate);
            console.log("DEADLINE " + deadline);
            console.log("INTERVAL DAYS: " + intervalDays);
            console.log("DAYS LEFT: " + daysLeftToDeadline);
            */
            xDaysLeft = daysLeftToDeadline;
            //console.log("X DAYS LEFT:" + xDaysLeft);
            if (daysLeftToDeadline > 0) {
                // there's still time before deadline
                if (daysLeftToDeadline >= Math.round(intervalDays * .1)) {
                    //console.log("TRUSTED STATUS");
                    getSeverity(1);
                    $("#av-header .av-status").text("TRUSTED");
                } else {
                    getSeverity(4);
                    //console.log("WITHIN 10% WARNING");
                    $("#av-header").find(".av-status").text("WARNING 10%");
                }
            } else {
                //console.log("DEADLINE HAS PASSED");
                getSeverity(6);
                $("#av-header .av-status").text("EXCEEDED");
                $(".av-verify").show();
                checkOutdatedTicket();
            }

            function getDaysDiff(date1, date2) { // get the num of days from date 1 to date 2
                var oneDay = 24 * 60 * 60 * 1000; // hours*minutes*seconds*milliseconds
                var diffDays = Math.round((date2 - date1) / (oneDay));
                return diffDays;
            }
        }

        function cleanTextOnly(txt) {
            txt = txt.trim().replace(/@[\w-\(|\)]+\s/ig, "");
            return txt;
        }

        function updateKSelected(selected) {
            // THIS WILL UPDATE THE K-SELECT ON CHANGE
            $(".k-selected").prev(".k-select").find(">ul").empty();
            $(".k-selected option").each(function() {
                var option = $(this).text();
                var value = $(this).val();
                if (selected == value) {
                    $(this).parent().prev(".k-select").find("span").first().html(option);
                    $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + "<span>" + value + "</span></li>")
                } else $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
            })
        }

        function getSeverity(status) {
            // THIS WILL GET THE HIGHEST SEVERITY , STATUS OF THE ARTICLE WILL BE BASED ON THIS
            if (article_status == 0 || status > article_status || status == article_status) {
                article_status = status;
            }
        }

        function avRelatedTickets() {
            var ticket_article = window.location.href.split("/");
            var avDetails;
            ticket_article = ticket_article[ticket_article.length - 1].split("-", 1).toString();
            $.get("/api/v2/search.json?query=custom_field_24296573:" + ticket_article).done(function(tickets) {
                $.get("/api/v2/help_center/articles/" + currArticleID + "/labels.json").done(function(tags) {

                    //console.log("TICKET COUNT: " + tickets.count);
                    var unsolvedTickCnt = 0;
                    var flaggedTickets = 0;
                    var outDatedTickets = 0;

                    // LOOPS THROUGH TICKETS RESULT , AND ADDS THEM TO THE TABLE
                    for (var x = 0; x < tickets.count; x++) {
                        if (tickets.results[x].status == "open" || tickets.results[x].status == "new") {
                            $(".av-related-tickets .noTickets").hide();
                            unsolvedTickCnt++;
                            var id = tickets.results[x].id,
                                subject = tickets.results[x].subject,
                                status = tickets.results[x].status,
                                requester_id = tickets.results[x].requester_id,
                                updated_at = new Date(tickets.results[x].updated_at);
                            var stat_icon = '<span class="ticket_status_label ticket-status ticket-status-' + status + '" title="' + status + '">' + (status.charAt(0).toLowerCase()) + '</span>';
                            var ticket_tr = '<tr class="related-tickets-item"><td><a href="/agent/tickets/' + id + '" target="_blank">' + stat_icon + '&nbsp;#' + id + '</a></td><td>' + updated_at.toDateString() + '</td></tr>';
                            $("#av-open-related-tickets").append(ticket_tr);
                            if (tickets.results[x].tags.indexOf("review_a_flagged_article") > -1) {
                                flaggedTickets++;
                            }
                            if (tickets.results[x].tags.indexOf("article_flagged_reason_outdated_information") > -1) {
                                outDatedTickets++;
                            }
                        }
                    }
                    //console.log("UNSOLVED TICKETS:" + unsolvedTickCnt);
                    //console.log("FLAGGED TICKETS:" + flaggedTickets);
                    // CHECK FOR ANY UNSOLVED TICKET
                    if (unsolvedTickCnt > 0) {
                        getSeverity(2);
                        $(".av-related-tickets").find("table").show();
                    } else {
                        $(".av-related-tickets").find("table").hide();
                        getSeverity(1);
                    }
                    // CHECK FOR FLAG TICKETS
                    if (flaggedTickets > 0) {
                        //console.log("TICKET IS FLAGGED");
                        getSeverity(5);
                    }
                    if (outDatedTickets > 0) {
                        //console.log("TICKET IS OUTDATED");
                        getSeverity(6);
                    }
                    // CHECK FOR VERIFICATION LABEL
                    for (var x = 0, found = 0; x < tags.labels.length && found == 0; x++) {
                        if (tags.labels[x].name.indexOf("!av::details::") == 0) {
                            found = 1;
                            avDetails = tags.labels[x].name.split("::");
                            //console.log(avDetails);
                        }
                    }
                    if (found == 1) {
                        //console.log("FOUND AV_LABEL");
                        $("#av-last-verifier").text(avDetails[4]);
                        $("#av-interval-select").val(parseInt(avDetails[3]));
                        updateKSelected($("#av-interval-select").val());
                        verifyDate(avDetails[2], avDetails[3]);
                        convToReadableDate(avDetails[2]);
                        hasAVLabel = 1; // ARTICLE HAS VERIFICATION LABEL
                    } else {
                        //console.log("NO AV_LABEL");
                        $("#av-last-verifier").text("NONE");
                        $("#av-last-vdate").text("NONE");
                        getSeverity(3);
                        hasAVLabel = 0; // ARTICLE HAS NO VERIFICATION LABEL
                    }
                    //console.log("article status " + article_status);

                    applyArticleStatus(article_status); // APPLY CHANGES BASED ON SEVERITY
                    restrictAccess(hasAVLabel); // restrict access to certain users
                });
            });
        }
        $("#av-verify-article").on("click", function() {
            if ($("#av-interval-select").val() != 0 || $("#av-interval-select").val() != "0") {
                // if interval is not "NO INTERVAL CHOSEN"
                $(".av-interval-error").hide();
                $(this).find("span").text("LOADING...");
                $(this).prop("disabled", true);
                // $(this).find("span").hide();
                $(this).find("i").show();
                $.get("/api/v2/search.json?query=custom_field_24296573:" + currArticleID).done(function(tickets) {
                    var flagTickCnt = 0;
                    for (var i = 0; i < tickets.count; i++) { // check for any unsolved flag tickets
                        if (tickets.results[i].status == "new" || tickets.results[i].status == "open") {
                            if (tickets.results[i].tags.indexOf("review_a_flagged_article") > -1) {
                                flagTickCnt++;
                            }
                        }
                    }
                    //console.log("FLAG TICK CNT: " + flagTickCnt);
                    if (flagTickCnt == 0) {
                        // no flag tickets , can verify the article
                        var v_date = new Date().toISOString();
                        var v_verifier = HelpCenter.user.name;
                        var v_interval = $("#av-interval-select").val();
                        var jsonobj = {
                            date: v_date,
                            interval: v_interval,
                            verifier: v_verifier
                        };

                        $.get("/api/v2/help_center/articles/" + currArticleID + "/labels.json").done(function(tags) {
                            if (tags.labels.length > 0) {
                                var del = [];
                                for (var x = 0; x < tags.labels.length; x++) {
                                    if (tags.labels[x].name.indexOf("!av::") == 0) {
                                        var tagID = tags.labels[x].id;
                                        del.push(tagID);
                                    }
                                }
                                if (del.length > 0) {
                                    deleteAllAVLabels(del, jsonobj);
                                } else {
                                    createAVLabel(jsonobj);
                                }
                                $(".av-related-tickets").find(".av-verify-error").hide();
                            } else {
                                createAVLabel(jsonobj);
                                $(".av-related-tickets").find(".av-verify-error").hide();
                            }
                        });
                    } else {
                        // article still has flag tickets
                        $(".av-related-tickets").find(".av-verify-error").fadeOut("fast");
                        $(".av-related-tickets").find(".av-verify-error").fadeIn("slow");
                        $("#av-verify-article").prop("disabled", false);
                        $("#av-verify-article").find("span").show();
                        $("#av-verify-article").find("i").hide();
                        $("#av-verify-article").find("span").text("VERIFY ARTICLE");
                        listTickets();
                    }
                });
            } else {
                // show error
                $(".av-interval-error").fadeOut();
                $(".av-interval-error").fadeIn();
            }
        });

        function applyArticleStatus(severity) {
            // THIS WILL APPLY A (THEME) TO THE AV BASED ON THE SEVERITY
            // NO TICKET = 1 , AV LABEL DATE IS TRUSTED = 1 , HAS TICKETS = 2 , NO AV LABEL = 3 , WITHING 10% OF VERIFICATION DATE = 4 , ARTICLE HAS FLAGG TICKETS = 5 , AV LABEL IS OUT OF DATE = 6
            //console.log("SEVERITY: " + severity);
            switch (severity) {
                case 1:
                    //console.log("TRUSTED");
                    $("#av-header").removeClass().addClass("av-success");
                    $("#av-header").find("i").removeClass().addClass("fa fa-check");
                    $("#av-header").find(".av-status").text("TRUSTED");
                    $("#sideNavigation ").css("border-top", "3px solid #00e8c6");
                    $(".nav-border").css("border-top", "3px solid #00e8c6");
                    break;
                case 2:
                    //console.log("HAS TICKETS");
                    $("#av-header").find(".av-status").text("PENDING APPROVAL");
                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                    $("#av-header").removeClass().addClass("av-warning");
                    $("#sideNavigation ").css("border-top", "3px solid #e0b21e");
                    $(".nav-border").css("border-top", "3px solid #e0b21e");
                    break;
                case 3:
                    //console.log("NO AV_LABEL");
                    // $(".av-related-tickets table").show();
                    $("#av-header").find(".av-status").text("PENDING VERIFICATION");
                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                    $("#av-header").removeClass().addClass("av-default");
                    $("#sideNavigation ").css("border-top", "3px solid #b4b4b4");
                    $(".nav-border").css("border-top", "3px solid #b4b4b4");
                    break;
                case 4:
                    //console.log("10% DEADLINE");
                    $("#av-header").find(".av-status").text(xDaysLeft + " DAYS UNTIL VERIFICATION");
                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                    $("#av-header").removeClass().addClass("av-warning");
                    $("#sideNavigation ").css("border-top", "3px solid #e0b21e");
                    $(".nav-border").css("border-top", "3px solid #e0b21e");
                    break;
                case 5:
                    //console.log("FLAGGED");
                    $("#av-header").find(".av-status").text("FLAGGED");
                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                    $("#av-header").removeClass().addClass("av-danger");
                    $("#sideNavigation ").css("border-top", "3px solid #df2828");
                    $(".nav-border").css("border-top", "3px solid #df2828");
                    break;
                case 6:
                    //console.log("OUT OF DATE");
                    $(".av-related-tickets table").show();
                    $("#av-header").find(".av-status").text("OUT OF DATE");
                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                    $("#av-header").removeClass().addClass("av-danger");
                    $("#sideNavigation ").css("border-top", "3px solid #df2828");
                    $(".nav-border").css("border-top", "3px solid #df2828");
                    break;
                default:
                    //console.log("ERROR");
                    break;
            }
        }

        function createNextVerificationDate(jsonobj) {
            // THIS WILL CREATE YEAR, MONTH, DATE TAGS BASED ON THE NEXT VERIFCATION
            var vInterval = parseInt(jsonobj.interval);
            var vDate = new Date(jsonobj.date);
            vDate.setMonth(vDate.getMonth() + vInterval);
            var vYear = vDate.getFullYear();
            var vMonth = getISOMonth(vDate.getMonth() + 1);
            var vDay = getISODay(vDate.getDate());

            var yearLabel = {
                "label": {
                    "name": "!av::YYYY::" + vYear
                }
            };
            var monthLabel = {
                "label": {
                    "name": "!av::MM::" + vMonth
                }
            };
            var dayLabel = {
                "label": {
                    "name": "!av::DD::" + vDay
                }
            };

            $.ajax({
                url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
                method: 'POST',
                data: yearLabel,
                error: function() {
                    errorHandler();
                },
                success: function() {
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
                        method: 'POST',
                        data: monthLabel,
                        error: function() {
                            errorHandler();
                        },
                        success: function() {
                            $.ajax({
                                url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
                                method: 'POST',
                                data: dayLabel,
                                error: function() {
                                    errorHandler();
                                },
                                success: function() {
                                    //console.log("NV CREATED");
                                    $("#sideNavigation ").css("border-top", "3px solid #00e8c6");
                                    $(".nav-border").css("border-top", "3px solid #00e8c6");
                                    $("#av-header").removeClass().addClass("av-success");
                                    $("#av-header").find(".av-status").text("TRUSTED");
                                    $("#av-header").find("i").removeClass().addClass("fa fa-check");
                                    $("#av-last-verifier").text(jsonobj.verifier);
                                    $("#av-interval-select").val(jsonobj.interval);
                                    updateKSelected(jsonobj.interval);
                                    convToReadableDate(jsonobj.date);
                                    $("#av-verify-article").prop("disabled", false);
                                    $("#av-verify-article").find("span").text("VERIFY ARTICLE")
                                    $("#av-verify-article").find("i").hide();
                                    $("#av-verify-article").removeClass("av-danger");
                                    listTickets();
                                }
                            });
                        }
                    });
                }
            });
            // GET THE MONTH (mm) format
            function getISOMonth(vMonth) {
                var mon = vMonth;
                if (vMonth < 10) mon = "0" + vMonth;
                return mon;
            }

            // GET THA DAY (dd) format
            function getISODay(vDay) {
                var day = vDay;
                if (vDay < 10) day = "0" + vDay;
                return day;
            }

        }

        function errorHandler() {
            // THIS WILL ENABLE A USER TO RETRY IF VERFICATION FAILS
            $("#av-verify-article").prop("disabled", false);
            $("#av-verify-article").find("span").text("FAILED - RETRY?");
            $("#av-verify-article").addClass("av-danger");
        }

        function restrictAccess(hasLabel) {
            // haslabel  ->  SERVES AS A FLAG IF THE ARTICLE DOES/DOES NOT HAVE VERIFICATION LABEL
            // THIS WILL ALLOW ADMINS AND USERS WITH VIEW SUPPORT CONTENT TO ACCESS THE AV
            /*if(HelpCenter.user.tags.indexOf("admin") > -1){
                //USER IS AN ADMIN
                $("#article-verification").show();
            }else if(HelpCenter.user.tags.indexOf("view_support_content") > -1){
                // USER CAN VIEW SUPPORT CONTENT
                if(hasLabel == 0){
                    // ARTICLE VERFICATION WILL NOT BE SHOWN IF ARTICLE DOES NOT HAVE VERIFICATION LABEL
                    $("#article-verification").show();
                }else{
                    // ARTICLE HAS VERIFICATION LABEL, SHOWN
                    $("#article-verification").hide();
                    $("#sideNavigation ").css("border-top","3px solid #00e8c6");
                    $(".nav-border").css("border-top","3px solid #00e8c6");
                }
            }else{
                $("#article-verification").hide();
                $("#sideNavigation ").css("border-top","3px solid #00e8c6");
                $(".nav-border").css("border-top","3px solid #00e8c6");
            }  */


            // only allows users with admin tags to access av
            //if (HelpCenter.user.tags.indexOf("admin") > -1) {
            if (HelpCenter.user.tags.indexOf("view_support_content") > -1) {
                $("#article-verification").show();
            } else {
                //console.log("AV HIDDEN - NOT AN ADMIN");
                $("#article-verification").hide();
                // $("#article-verification").remove();
                if ($("switchTag").val() != "support_kb") $(".sub-nav , #sideNavigation ").css("border-top", "3px solid #00e8c6");
                else $(".main , #sideNavigation ").css("border-top", "3px solid #00e8c6");
            }
            //}

            function checkOutdatedTicket() {
                //checks for any ticket with tag of flagged as outdate ticket
                $.get("/api/v2/search.json?query=custom_field_24296573:" + currArticleID).done(function(tickets) {
                    var hasOutdatedTicket = 0;
                    for (var x = 0; x < tickets.count; x++) {
                        if ((tickets.results[x].status != "solved") && (tickets.results[x].tags.indexOf("article_flagged_reason_outdated_information") > -1)) {
                            hasOutdatedTicket = 1;
                        }
                    }
                    if (hasOutdatedTicket == 1) {
                        // article already has an "outdated ticekt"
                        // COULD UPDATE , POST A COMMENT ON THE TICKET ITSELF
                        //console.log("TICKET IS NOT SOLVED AND/OR IS OUTDATED");
                    } else {
                        // create ticket
                        createTicket();
                        //console.log("NO OUTDATED TICKET");
                    }
                });
            }

            function createTicket() {
                //console.log("CREATE TICKET");
                var submitCheck = false;
                var reasonText = "Outdated Information.";
                var reasonTag = "article_flagged_reason_outdated_information";
                var descriptionText = "ARTICLE VERIFICATION - ARTICLE IS OUT OF DATE";
                var ticketTags;
                var currPlatform = $("#switchTag").val();
                if (currPlatform == "SUPPORT_KB") {
                    ticketTags = "contribute_flag_kb,review_a_flagged_article";
                } else {
                    ticketTags = "contribute_flag_doc,review_a_flagged_article";
                }

                $.getJSON("/api/v2/users/me/session.json").done(function(data) {
                    var currUserID = data.session.user_id;
                    $.getJSON("/api/v2/help_center/sections/201249236.json").done(function(data) {
                        var checkAccess = data.section.description.substr(1, data.section.description.length - 2);
                        $.getJSON("/api/v2/help_center/articles/" + currArticleID + ".json").done(function(articleData) {
                            var articleSectionID = articleData.article.section_id;
                            $.getJSON("/api/v2/help_center/sections/" + articleSectionID + ".json").done(function(sectData) {
                                var sectionName = sectData.section.name;
                                var tickAPI = phpURL + helpCenterVer;
                                var ticketJSON = {
                                    "ticket": {
                                        "subject": articleData.article.title,
                                        "comment": descriptionText + "\n\nFlagged Article: [" + cleanTextOnly(articleData.article.title) + "](" + articleURL + ")\n\nFlagged for: " + reasonText,
                                        "requester_id": currUserID,
                                        "group_id": 21387715,
                                        "tags": ticketTags.split(","),
                                        "ticket_form_id": 16155,
                                        "custom_fields": [{
                                            "id": 22155349,
                                            "value": "review_a_flagged_article"
                                        }, {
                                            "id": 24296573,
                                            "value": currArticleID
                                        }, {
                                            "id": 24340826,
                                            "value": articleURL
                                        }, {
                                            "id": 24296583,
                                            "value": reasonTag
                                        }, {
                                            "id": 24340776,
                                            "value": $("#switchTag").find(":selected").text()
                                        }, {
                                            "id": 24296523,
                                            "value": $("#switchTag").find(":selected").text()
                                        }, {
                                            "id": 24296533,
                                            "value": sectionName
                                        }, {
                                            "id": 24296543,
                                            "value": sectionName
                                        }, {
                                            "id": 22209215,
                                            "value": "pending_champions_review"
                                        }],
                                        "security_token": checkAccess,
                                        "action": "flag"
                                    }
                                };
                                //console.log("TICKET JSON CREATED");
                                $.ajax(tickAPI, {
                                    method: "POST",
                                    data: JSON.stringify(ticketJSON)
                                }).done(function(res, textStatus, xhr) {
                                    // UPDATES THE STATUS OF THE AV SINCE THE ARTICLE NOW HAS A TICKET
                                    submitCheck = true;
                                    //console.log(res);
                                    //console.log("TICKET SUBMITTED");
                                    res = JSON.parse(res);

                                    var tickID = res.ticket.id;
                                    var tickDate = res.ticket.updated_at;
                                    var tickStatus = res.ticket.status;

                                    tickDate = new Date(tickDate);
                                    var stat_icon = '<span class="ticket_status_label ticket-status ticket-status-' + tickStatus + '" title="' + status + '">' + (tickStatus.charAt(0).toUpperCase()) + '</span>';
                                    var ticket_tr = '<tr class="related-tickets-item"><td><a href="/agent/tickets/' + tickID + '" target="_blank">' + stat_icon + '&nbsp;#' + tickID + '</a></td><td>' + tickDate.toDateString() + '</td></tr>';

                                    $(".av-related-tickets").find("table").show();
                                    $("#av-open-related-tickets").prepend(ticket_tr);

                                    $("#av-header").find(".av-status").text("OUT OF DATE");
                                    $("#av-header").find("i").removeClass().addClass("fa fa-warning");
                                    $("#av-header").removeClass().addClass("av-danger");
                                    $("#sideNavigation ").css("border-top", "3px solid #df2828");
                                    $(".nav-border").css("border-top", "3px solid #df2828");

                                }).fail(function(xhr, textStatus, errorThrown) {
                                    //console.log("TICKET SUBMISSION FAILED");
                                })
                            })
                        })
                    })
                })
            }

            // Start of the incident page design
            // Incident page design with all the button functionalities which is same as the incident page found in the message board
            var sas_internal = 201265859,
                globalnotif_user_id = 357520165;

            $('.article-header').append('<span class="currArticle hide">' + currArticleID + '</span>');

            $.get('/api/v2/help_center/articles/' + currArticleID + '.json', function(data) {

                // This loop to check if article is incident or not
                // The article which are not incident or maintenance should not have the message board article design 
                for (var x = 0; x < data.article.label_names.length; x++) {
                    if (data.article.label_names[x].indexOf("Type:Maintenance") > -1 || data.article.label_names[x].indexOf("Type:Incident") > -1) {
                        viewIncidents();
                        // Temporarily removing the article-voter and comment form classes as it is not being used as of the moment may add some adjustments for the future
                        $('footer.article-footer').remove();
                        $('form.comment-form').remove();
                        $('.article-comments').remove();
                        break;
                    }
                }
            });

            $('body').on("click", "#delete-incident-btn", function(event) {
                if (confirm("Delete this incident?")) {
                    var incident = $(this).find("span.hide").text();
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '.json',
                        type: 'DELETE'
                    });
                    setTimeout(function() {
                        window.location.href = "https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board";
                    }, 500)
                }
            });

            $('body').on("click", "#update-incident-status", function(event) {
                $(this).attr("disabled", "disabled");
                var modal = $('.modal-body');
                var incidentID = $(this).find("span.hide").text();
                var internalID = $('.internal').find('span#incident-id').text();
                $(this).attr("disabled", "disabled");
                if ($("#update-incident-modal .global-notifications").is(":visible")) {
                    if ($("#update-incident-modal .global-notifications input.subscribe-global-notif").is(":checked")) {
                        $.ajax({
                            url: '/api/v2/help_center/sections/' + sas_internal + '/subscriptions.json',
                            type: 'POST',
                            data: {
                                "subscription": {
                                    "source_locale": "en-us",
                                    "include_comments": true,
                                    "user_id": globalnotif_user_id
                                }
                            }
                        })
                    }
                };
                if (isInternalEnable) {
                    updateIncident(internalID, true, $('.internal').find('#internal-title').text());
                }
                if (incidentID !== internalID) {
                    updateIncident(incidentID, false, $(this).find('#incident-title').text());
                }
                modal.find('.components-affected-update input[type="checkbox"]:checked').each(function() {
                    updateIncident($(this).val(), false, $(this).parent().find('#incident-title').text());
                });

                function updateIncident(incident, isInternal, incidentTitle) {
                    var severity = $('#update-incident-modal:visible .incident-severity select').val();
                    var in_status = $('.status-choices input[name=status-choices]:checked').val();
                    var mes_body = $('#update-incident-body-external').val();
                    var notif = $('input[type="checkbox"]#send-comment-notif').is(":checked");
                    var title = incidentTitle;
                    if (isInternal) {
                        mes_body = $('#update-incident-body-internal').val();
                    }
                    var up_title = title.substr(title.indexOf("] ") + 1);
                    if ($('#send-time').is(":visible") && $('#send-time').is(":checked")) {
                        var maintenance_start = $('#update-incident-modal .maintenance-start input[type="date"]').val() + " " + $('#update-incident-modal .maintenance-start select').val();
                        var maintenance_end = $('#update-incident-modal .maintenance-end input[type="date"]').val() + " " + $('#update-incident-modal .maintenance-end select').val();
                        var body = in_status + " - <strong>Maintenance Start: " + maintenance_start + "</strong><br><strong>Maintenance End: " + maintenance_end + "</strong><br><br>" + mes_body;
                    } else {
                        var body = in_status + " - " + mes_body;
                    }
                    if (in_status == undefined) {
                        alert("Please select status.");
                        $(this).removeAttr("disabled");
                        return false
                    }
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '/translations/en-us.json',
                        type: 'PUT',
                        data: {
                            "translation": {
                                "title": "[" + in_status + "] " + up_title
                            }
                        }
                    });

                    setTimeout(function() {
                        $.get('/api/v2/help_center/articles/' + incident + '/labels.json', function(labels) {
                            for (var q = 0; q < labels.labels.length; q++) {
                                if (labels.labels[q].name.indexOf("Severity:") > -1) {
                                    $.ajax({
                                        url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[q].id + '.json',
                                        type: 'DELETE'
                                    });
                                    setTimeout(function() {
                                        $.ajax({
                                            url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                                            type: 'POST',
                                            data: {
                                                "label": {
                                                    "name": "Severity:" + severity
                                                }
                                            }
                                        })
                                    }, 1000);
                                }
                            }
                        });
                    }, 500);


                    setTimeout(function() {
                        $.get('/api/v2/help_center/articles/' + incident + '/labels.json', function(labels) {
                            for (var q = 0; q < labels.labels.length; q++) {
                                if (labels.labels[q].name.indexOf("Status:") > -1) {
                                    $.ajax({
                                        url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[q].id + '.json',
                                        type: 'DELETE'
                                    });
                                    setTimeout(function() {
                                        $.ajax({
                                            url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                                            type: 'POST',
                                            data: {
                                                "label": {
                                                    "name": "Status:" + in_status
                                                }
                                            }
                                        })
                                    }, 1000);
                                }
                            }
                        });
                    }, 500);

                    setTimeout(function() {
                        $.ajax({
                            url: '/api/v2/help_center/articles/' + incident + '/comments.json',
                            type: 'POST',
                            data: {
                                "comment": {
                                    "body": body,
                                    "author_id": globalsupport_user_id,
                                    "locale": "en-us"
                                },
                                "notify_subscribers": notif
                            },
                            success: function() {
                                $("#update-incident-modal").remove();
                                location.reload();
                                $(this).removeAttr("disabled");
                                if ($('.messageBoard .incident-view-page').is(':visible')) {
                                    return false;
                                } else {
                                    $('html').css('overflow', 'auto');
                                }
                            }
                        });
                    }, 2000);
                }
            });

            $('body').on("click", ".close-modal", function(event) {
                $(this).closest(".modal").remove();
                if ($('html').css('overflow') === 'hidden') {
                    $('html').css('overflow', 'scroll');
                } else {
                    return false;
                }
            });

            $('body').on("click", "#update-maintenance-btn", function(event) {
                var incident = $(this).find("span.hide").text();
                platform = $(this).find("span#platform_id").text(),
                    start_date = $('.incident-view-page .incident-list-item:last-child .incident-item-cont span strong:first-child').text(),
                    end_date = $('.incident-view-page .incident-list-item:last-child .incident-item-cont span strong:nth-child(3)').text(),
                    start_date = start_date.replace("Maintenance Start: ", "").split(" ", 2),
                    end_date = end_date.replace("Maintenance End: ", "").split(" ", 2);

                $('html').css('overflow', 'hidden');
                $('body').append('<div class="modal" id="update-incident-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>Update Maintenance Status </h1></div> <div class="modal-body"> <div class="modal-body-detail"> <label>Maintenance Status </label> <div class="status-choices"> <input type="radio" id="mc1" name="status-choices" value="New"> <label class="radio-label" for="mc1">New </label> <input type="radio" id="mc2" name="status-choices" value="Updated"> <label class="radio-label" for="mc2">Updated </label> <input type="radio" id="mc3" name="status-choices" value="Completed"> <label class="radio-label" for="mc3">Completed </label> </div> </div> <div class="modal-body-detail"> <label>Message </label> <br> <textarea id="update-incident-body" placeholder="Message"> </textarea> </div> <div> <input type="checkbox" id="send-time"> <label for="send-time" style="font-weight: 400;font-size: 15px;">Update time. </label> </div> <div class="maintenance-start"> <label>Maintenance Start Time </label> <div class="maintenance-time"> <input disabled type="date" value="' + start_date[0] + '"> <select disabled class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="maintenance-end"> <label>Maintenance End Time </label> <div class="maintenance-time"> <input disabled value="' + end_date[0] + '" type="date"> <select disabled class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="modal-body-detail"> <label>Notifications </label> <br> <input type="checkbox" checked id="send-comment-notif"> <label for="send-comment-notif" style="font-weight: 400">Send alert to subscribers about this update. </label></div></div><div class="modal-footer"><button class="btn btn-primary" id="update-incident-status">UPDATE STATUS <span class="hide">' + incident + ' </span> </button></div></div></div>'),
                    $('#update-incident-modal').fadeIn("fast");
                populateTime();
                $('textarea#update-incident-body').ckeditor();
                $('#update-incident-modal .maintenance-start .time-select').val(start_date[1]);
                $('#update-incident-modal .maintenance-end .time-select').val(end_date[1]);
                setTimeout(function() {
                    $('#update-incident-modal').find('textarea').val("")
                }, 500);

                $('textarea#update-incident-body').ckeditor();

                CKEDITOR.instances["update-incident-body"].on("instanceReady", function(evt) {
                    setTimeout(function() {
                        CKEDITOR.instances["update-incident-body"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body"]).toggleTracking(false, false);
                        $('#update-incident-modal').find('textarea').val("");
                        $('#update-incident-modal').fadeIn("fast");
                    }, 300);
                })

                if ($('span#platform_id').text() === '201265859') {
                    $('<div class="modal-body-detail global-notifications"><label>Global Notifications</label><br><input type="checkbox" checked class="subscribe-global-notif"><span class="checkbox-label">Subscribe globalnotifications@sizmek.com.</span></div>').insertAfter('#update-incident-modal .maintenance-end');
                }

                $('body').on("click", "#update-incident-modal .close-modal", function(event) {
                    $(this).closest(".modal").remove();
                    if ($('html').css('overflow') === 'hidden') {
                        $('html').css('overflow', 'scroll');
                    } else {
                        return false;
                    }
                });
            });

            $('body').on("change", "#send-time", function() {
                if ($(this).is(":checked")) {
                    $('#update-incident-modal .maintenance-start input, #update-incident-modal .maintenance-start select').removeAttr("disabled");
                    $('#update-incident-modal .maintenance-end input, #update-incident-modal .maintenance-end select').removeAttr("disabled");
                } else {
                    $('#update-incident-modal .maintenance-start input, #update-incident-modal .maintenance-start select').attr("disabled", "disabled");
                    $('#update-incident-modal .maintenance-end input, #update-incident-modal .maintenance-end select').attr("disabled", "disabled");
                }
            });

            $('body').on("click", "#update-incident-btn", function(event) {
                var incidentID = $(this).find("span.hide").text();
                var platform = $(this).find("span#platform_id").text();
                var htmlElement = "";
                var relatedIncidentCheckbox = "";
                var internalIncidentID = 0;
                var title = "";
                var internalTitle = "";
                if ($(".incident-container").css('display') == 'block') {
                    incidentID = $(this).closest("div").children("span").text();
                    platform = $('.incident-nav-item-active').find('span').text();
                    title = $(this).parent().parent().find('h5').text();
                }

                function getIncident(incidentID) {
                    return $.get('/api/v2/help_center/articles/' + incidentID + '.json');
                }
                var incidentData = getIncident(incidentID);
                incidentData.done(function(incident) {
                    if (incident.article.section_id === 201265859) {
                        internalIncidentID = incident.article.id;
                        internalTitle = incident.article.title;
                    }
                    title = incident.article.title;
                    label = incident.article.label_names;
                    for (var x = 0; x < label.length; x++) {
                        if (label[x].includes("RelatedIncidents:")) {
                            var relatedIncidentsTag = label[x].replace("RelatedIncidents: ", "");
                            var related_incidents = relatedIncidentsTag.split(" ");
                            var length = related_incidents.length;
                        }
                    }
                    try {
                        htmlElement += '<div id="related-incidents-container" class="incident-container-update-btn"><p id="related-incidents-label" class="incident-container-update-label">Related Incidents:</p>';
                        relatedIncidentCheckbox += '<label>Related Incidents Affected</label><div class="component-container">';
                        for (var index = 0; index < length; index++) {
                            (function(x) {
                                setTimeout(function() {
                                    var incidentID = parseInt(related_incidents[x]);
                                    var article = getIncident(incidentID);
                                    article.done(function(data) {
                                        if (data.article.section_id === 360000037612) {
                                            section = "MDX 2.0";
                                        }
                                        if (data.article.section_id === 202580163) {
                                            section = "Sizmek Advertising Suite";
                                        }
                                        if (data.article.section_id === 360000037572) {
                                            section = "DSP";
                                        }
                                        if (data.article.section_id === 360000041291) {
                                            section = "DMP";
                                        }
                                        if (data.article.section_id === 201265859) {
                                            section = "Internal";
                                        }
                                        htmlElement += '<div class="incident-item-action" id="related-incident"><a class="incident-item-view" href="/hc/en-us/articles/' + incidentID + '">' + section + '</a><span>' + incidentID + '</span></div>';
                                        if (section !== "Internal") {
                                            relatedIncidentCheckbox += '<div class="component"> <input class="affected-component" type="checkbox" value="' + incidentID + '" checked><span>' + section + '</span><span id="incident-title" style="display:none;">' + data.article.title + '</span></div>';
                                        } else if (section === "Internal") {
                                            internalIncidentID = incidentID;
                                            internalTitle = data.article.title;
                                        }

                                        if (x + 1 === length) {
                                            openModal();
                                        }
                                    });
                                }, 100);
                            })(index);
                        }
                    } catch (e) {
                        //console.log("No related incidents." + e.toString());
                    } finally {
                        setTimeout(function() {
                            if (htmlElement === '<div id="related-incidents-container" class="incident-container-update-btn"><p id="related-incidents-label" class="incident-container-update-label">Related Incidents:</p>') {
                                htmlElement = "";
                                relatedIncidentCheckbox = "";
                                openModal();
                            }
                        }, 500);
                    }

                    function openModal() {
                        $('body').append('<div class="modal" id="update-incident-modal"><div class="modal-content"><div class="modal-header"><button class="close close-modal">X</button><h1>Update Incident Status</h1></div> <div class="modal-body"> <div class="modal-body-detail"><label>Incident Status</label> <div class="status-choices"> <input type="radio" id="sc1" name="status-choices" value="Investigating"> <label class="radio-label" for="sc1">Investigating</label> <input type="radio" id="sc2" name="status-choices" value="Identified"><label class="radio-label" for="sc2">Identified </label> <input type="radio" id="sc3" name="status-choices" value="Monitoring"> <label class="radio-label" for="sc3">Monitoring</label> <input type="radio" id="sc4" name="status-choices" value="Resolved"> <label class="radio-label" for="sc4">Resolved </label> </div> </div><div class="modal-body-detail incident-severity"><label>Incident Severity</label><br><select><option value="1">Operational</option><option value="3">Degraded Performance</option><option value="4">Minor Outage</option><option value="5">Major Outage</option></select></div><div id="update-internal-message" class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#fffdf6;"> <label style="margin-bottom: 10px;font-size:18px;">Internal Message </label><label class="gswitch" id="switch-internal"><input type="checkbox" id="internal-message-switch"><span class="gslider round"></span></label><div class="modalOptions" style="clear: both; display: block;margin-bottom:30px">Send alert to subscribers<label class="gswitch"><input type="checkbox" id="send-comment-notif"><span class="gslider round green"></span></label></div><textarea id="update-incident-body-internal" class="message-internal" placeholder="Message"></textarea> </div><div class="components-affected-update"></div><div id="no-internal-incident"class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#F5FDFE;display:none;"> <label style="margin-bottom: 10px;font-size:18px;">No Related Internal Incident</label></div><div id="update-external-message" class="message-external" class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#F5FDFE; margin-top:20px;"> <label style="margin-bottom: 10px;font-size:18px;">External Message </label><div class="modalOptions" style="clear: both; display: block;margin-bottom:30px;">Send alert to subscribers<label class="gswitch"><input type="checkbox" id="send-comment-notif"><span class="gslider round green"></span></label></div><textarea id="update-incident-body-external" placeholder="Message"></textarea> </div></div><div class="modal-footer"><button class="btn btn-primary" id="update-incident-status">UPDATE STATUS<span class="hide">' + incidentID + '</span><span id="incident-title" style="display:none;">' + title + '</span></button></div></div></div>');
                        $("#update-internal-message .gswitch input, #update-external-message .gswitch input").prop('checked', true);
                        $('html').css('overflow', 'hidden');
                        $('#update-incident-modal').fadeIn("fast");
                        $('textarea#update-incident-body-internal').ckeditor();
                        $('textarea#update-incident-body-external').ckeditor();
                        if ($('#update-internal-message .gswitch input, #update-external-message .gswitch input').prop('checked')) {
                            $('#send-comment-notif').prop('checked', true);
                        } else {
                            $('#send-comment-notif').prop('checked', false);
                        }
                        setTimeout(function() {
                            relatedIncidentCheckbox += '<div class="internal" style="display: none;"><span id="incident-id">' + internalIncidentID + '</span><span id="internal-title" style="display:none">' + internalTitle + '</span></div>';
                            htmlElement += "</div>";
                            relatedIncidentCheckbox += "</div>";
                            $('#update-incident-modal').find('textarea').val("");
                            $(".modal-content .modal-footer").prepend(htmlElement);
                            $('.components-affected-update').prepend(relatedIncidentCheckbox);
                        }, 100);

                        $('textarea#update-incident-body-internal').ckeditor();
                        CKEDITOR.instances["update-incident-body-internal"].on("instanceReady", function(evt) {
                            setTimeout(function() {
                                CKEDITOR.instances["update-incident-body-internal"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body-internal"]).toggleTracking(false, false);
                                $('#update-incident-message-modal').fadeIn("fast");
                            }, 100);
                        })

                        $('textarea#update-incident-body-external').ckeditor();
                        CKEDITOR.instances["update-incident-body-external"].on("instanceReady", function(evt) {
                            setTimeout(function() {
                                CKEDITOR.instances["update-incident-body-external"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body-external"]).toggleTracking(false, false);
                                $('#update-incident-message-modal').fadeIn("fast");
                            }, 100);
                        })


                        if (internalIncidentID === 0) {
                            $('#update-internal-message').css('display', 'none');
                            $('#no-internal-incident').css({
                                'display': 'block',
                                'background-color': '#fffdf6'
                            });
                        }
                        if (internalIncidentID !== 0 && relatedIncidentCheckbox === "") {
                            $('#update-external-message').css('display', 'none');
                            $('#no-internal-incident').css('display', 'block').find('label').text('No Related External Incident');
                        }
                        if (platform == sas_internal) {
                            $('<div><label style="margin-bottom: 10px;font-size:18px;">Global Notifications </label><div class="modal-body-detail global-notifications" style="clear: both; display: block;margin-bottom:30px">Subscribe globalnotifications@sizmek.com.<label class="gswitch"><input type="checkbox" class="subscribe-global-notif"><span class="gslider round green"></span></label></div></div>').insertAfter('.modalOptions');
                            $('.modal-body-detail.global-notifications .gswitch input').prop('checked', true);
                            $('#updateMessage').css('background-color', '#FFFDF6');

                            if ($('.modal-body-detail.global-notifications .gswitch input').prop('checked')) {
                                $('.subscribe-global-notif').prop('checked', true);
                            } else {
                                $('.subscribe-global-notif').prop('checked', false);
                            }
                        }
                        $('#internal-message-switch').on("click", function() {
                            if ($(this).is(':checked')) {
                                $("#send-comment-notif, #subscribe-global-notif").prop('checked', true);
                                $("#update-internal-message > div").fadeIn();
                            } else {
                                $("#send-comment-notif, #subscribe-global-notif").prop('checked', false);
                                $("#update-internal-message > div").fadeOut();
                                isInternalEnable = false;
                            }
                        });
                    }
                });
            });

            $('body').on("click", "#update-incident-modal .close-modal", function(event) {
                $(this).closest(".modal").remove();
                if ($('html').css('overflow') === 'hidden') {
                    $('html').css('overflow', 'scroll');
                } else {
                    return false;
                }
            });

            //Edit button for the update incident article
            $('body').on("click", ".edit_body a", function(event) {
                var start_date = $(this).closest('.incident-list-item').find('.incident-item-cont span strong:first-child').text();
                var end_date = $(this).closest('.incident-list-item').find('.incident-item-cont span strong:nth-child(3)').text();

                if (start_date != "" && end_date != "") {
                    var body = $(this).closest(".incident-list-item").find(".incident-item-cont span.hide").html().replace(start_date, "").replace(end_date, "");
                    var body = body.substr(body.indexOf("<br><br>") + 8);
                    var start_date = start_date.replace("Maintenance Start: ", "").split(" ", 2);
                    var end_date = end_date.replace("Maintenance End: ", "").split(" ", 2);
                    var time = '<div class="maintenance-start"> <label>Maintenance Start Time </label> <div class="maintenance-time"> <input type="date" value="' + start_date[0] + '"> <select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="maintenance-end"> <label>Maintenance End Time </label> <div class="maintenance-time"> <input value="' + end_date[0] + '" type="date"> <select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div>';
                } else {
                    var body = $(this).closest(".incident-list-item").children(".article-body").children("span.hide").html();
                    var time = '';
                }

                $('body').append('<div class="modal" id="update-incident-message-modal"><div class="modal-content"><div class="modal-header"><button class="close close-modal">X</button><h1>Edit Message</h1></div> <div class="modal-body">' + time + '<div class="modal-body-detail"> <label>Message </label> <br> <textarea id="update-incident-body" placeholder="Message">' + body + '</textarea> </div></div><div class="modal-footer"><button class="btn btn-primary" id="update-body-message">UPDATE MESSAGE</button></div></div></div>');

                $('textarea#update-incident-body').ckeditor();
                CKEDITOR.instances["update-incident-body"].on("instanceReady", function(evt) {
                    setTimeout(function() {
                        CKEDITOR.instances["update-incident-body"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body"]).toggleTracking(false, false);
                        $('#update-incident-message-modal').fadeIn("fast");
                    }, 300);
                })

                $('html').css('overflow', 'hidden');
                $('#update-incident-message-modal').fadeIn("fast");
                populateTime();
                $('textarea#update-incident-body').ckeditor();
                $('#update-incident-message-modal .maintenance-start .time-select').val(start_date[1]);
                $('#update-incident-message-modal .maintenance-end .time-select').val(end_date[1]);
            });

            $('body').on("click", "#update-incident-message-modal #update-body-message", function(event) {
                $(this).attr("disabled", "disabled");
                var incident_id = $('.article-header .hide').text();
                if ($('#update-incident-message-modal .maintenance-start').is(":visible")) {
                    var maintenance_start = $('#update-incident-message-modal .maintenance-start input[type="date"]').val() + " " + $('#update-incident-message-modal .maintenance-start select').val();
                    var maintenance_end = $('#update-incident-message-modal .maintenance-end input[type="date"]').val() + " " + $('#update-incident-message-modal .maintenance-end select').val();
                    var mes_body = $("#update-incident-message-modal #update-incident-body").val();
                    var body = "<strong>Maintenance Start: " + maintenance_start + "</strong><br><strong>Maintenance End: " + maintenance_end + "</strong><br><br>" + mes_body;
                } else {
                    var body = $("#update-incident-message-modal #update-incident-body").val();
                }
                $.ajax({
                    url: '/api/v2/help_center/articles/' + incident_id + '/translations/en-us.json',
                    type: 'PUT',
                    data: {
                        "translation": {
                            "body": body
                        }
                    },
                    success: function() {
                        $("#update-incident-message-modal").remove();
                        location.reload();
                    }
                });
            });

            // Edits the comments except the first one  
            $('body').on("click", ".edit_update a", function() {
                var start_date = $(this).closest('.incident-list-item').find('.incident-item-cont > span strong:first').text();
                var end_date = $(this).closest('.incident-list-item').find('.incident-item-cont > span strong:nth-child(3)').text();
                var update_id = $(this).children("span.hide").text();
                var status = $(this).closest(".incident-list-item").children(".incident-item-body").text();

                if (start_date != "" && end_date != "") {
                    var body = $(this).closest(".incident-list-item").find(".incident-item-cont span.hide").html().replace(start_date, "").replace(end_date, "");
                    var body = body.substr(body.indexOf("<br><br>") + 8);
                    var start_date = start_date.replace("Maintenance Start: ", "").split(" ", 2);
                    var end_date = end_date.replace("Maintenance End: ", "").split(" ", 2);
                    var time = '<div class="maintenance-start"> <label>Maintenance Start Time </label> <div class="maintenance-time"> <input type="date" value="' + start_date[0] + '"> <select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="maintenance-end"> <label>Maintenance End Time </label> <div class="maintenance-time"> <input value="' + end_date[0] + '" type="date"><select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div>';
                } else {
                    var body = $(this).closest(".incident-list-item").children(".incident-item-cont").children("span.span-body").html();
                    var time = '';
                }

                $('body').append('<div class="modal" id="update-incident-message-modal"><div class="modal-content"><div class="modal-header"><button class="close close-modal">X</button><h1>Edit Message</h1></div> <div class="modal-body">' + time + '<div class="modal-body-detail"> <label>Message </label> <br> <textarea id="update-incident-body" placeholder="Message">' + body + '</textarea> </div></div><div class="modal-footer"><button class="btn btn-primary" id="update-update-message">UPDATE MESSAGE<span class="hide span-update_id">' + update_id + '</span><span class="hide span-update_status">' + status + '</span></button></div></div></div>');

                $('textarea#update-incident-body').ckeditor();
                CKEDITOR.instances["update-incident-body"].on("instanceReady", function(evt) {
                    setTimeout(function() {
                        CKEDITOR.instances["update-incident-body"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body"]).toggleTracking(false, false);
                        $('#update-incident-message-modal').fadeIn("fast");
                    }, 300);
                })
                populateTime();
                $('html').css('overflow', 'hidden');
                $('#update-incident-message-modal .maintenance-start .time-select').val(start_date[1]);
                $('#update-incident-message-modal .maintenance-end .time-select').val(end_date[1]);
            });

            $('body').on("click", "#update-incident-message-modal #update-update-message", function() {
                $(this).attr("disabled", "disabled");
                var update_id = $(this).children("span.span-update_id").text();
                var update_status = $(this).children("span.span-update_status").text();
                var incident_id = $(".incident-nav-header").children("span.hide").text();
                if ($('#update-incident-message-modal .maintenance-start').is(":visible")) {
                    var maintenance_start = $('#update-incident-message-modal .maintenance-start input[type="date"]').val() + " " + $('#update-incident-message-modal .maintenance-start select').val();
                    var maintenance_end = $('#update-incident-message-modal .maintenance-end input[type="date"]').val() + " " + $('#update-incident-message-modal .maintenance-end select').val();
                    var mes_body = $("#update-incident-message-modal #update-incident-body").val();
                    var body = "<strong>Maintenance Start: " + maintenance_start + "</strong><br><strong>Maintenance End: " + maintenance_end + "</strong><br><br>" + mes_body;
                } else {
                    var body = $("#update-incident-message-modal #update-incident-body").val();
                }
                $.ajax({
                    url: '/api/v2/help_center/articles/' + currArticleID + '/comments/' + update_id + '.json',
                    type: 'PUT',
                    data: {
                        "comment": {
                            "body": update_status + " - " + body
                        }
                    },
                    success: function() {
                        $("#update-incident-message-modal").remove();
                        location.reload();
                    }
                });
            });

            $('body').on("click", ".delComment a", function() {
                var delConfirm = confirm("Delete comment?");
                var commentID = $(this).children('span.hide').text();
                if (delConfirm == true) {
                    $.ajax({
                        url: "/api/v2/help_center/articles/" + currArticleID + "/comments/" + commentID + ".json",
                        type: 'DELETE',
                        success: function() {
                            location.reload();
                        }
                    });
                }
            });

            function populateTime() {
                $("select.time-select").each(function() {
                    if ($(this).text() == "") {
                        for (x = 1; x <= 24; x++) {
                            var time = x;
                            if (x < 10) {
                                time = "0" + x;
                            }
                            var option = "<option>" + time + ":00</option>";
                            $(this).append(option);
                        }
                    }
                });
            } // end of populateTime function

            function viewIncidents() {
                console.log("viewIncidents");
                $.get("/api/v2/help_center/articles/" + currArticleID + ".json", function(data) {
                    console.log(data);
                    var platformID = data.article.section_id,
                        getDate = data.article.created_at,
                        bodyArticle = data.article.body,
                        creationDate = new Date(getDate),
                        status_colors = ["#7EDE96", "#3498DB", "#FFD24D", "#DC7633", "#E74C3C"];

                    for (var q = 0; q < data.article.label_names.length; q++) {
                        if (data.article.label_names[q].indexOf("Severity:") > -1) {
                            var articleSeverity = data.article.label_names[q].replace('Severity:', '');
                        }
                        if (data.article.label_names[q].indexOf("Status:") > -1) {
                            var articleStatus = data.article.label_names[q].replace('Status:', '');
                        }
                        if (data.article.label_names[q].indexOf("Type:") > -1) {
                            var articleType = data.article.label_names[q].replace('Type:', ''),
                                btnType;
                        }
                    }

                    if (articleType == 'Incident') {
                        $('.article-header h1').css('color', status_colors[articleSeverity - 1]);
                        $('.article-header h1').attr('id', 'incident-title-' + articleSeverity);
                        btnType = "update-incident-btn";
                    } else {
                        $('.article-header h1').css('color', 'rgb(52, 152, 219)');
                        btnType = "update-maintenance-btn";
                    }

                    $('.incident-wrapper').append($('.main-column'));
                    $('<div class="incident-list-cont show"></div>').insertAfter(".article-info");
                    $('.incident-list-cont').append("<div class='incident-list'></div>");
                    $('.incident-list').append("<div class='incident-list-item'></div>");
                    $('.incident-list-item').append("<div class='incident-item-body'><h5>" + articleStatus + "</h5></div><div class='edit_update'><a>Edit</a></div>");
                    $($('.article-body.markdown')).insertBefore('.edit_update');
                    $('.article-body.markdown').append('<br><small class="small">' + creationDate.toDateString() + ' ' + creationDate.toLocaleTimeString() + '</small><span class="hide span-body">' + bodyArticle + '</span>');
                    $('.incident-list-cont.show').append('<a id="delete-incident-btn" class="incident-subscribe-button incident-delete-button">DELETE<span class="hide">' + currArticleID + '</span></a><a id="' + btnType + '" class="incident-subscribe-button incident-update-button">UPDATE<span class="hide">' + currArticleID + '</span><span style="display:none" id="platform_id">' + platformID + '</span></a><a id="back-incident-list" class="plain-button" href="https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board"><br><span style="font-family:arial">←</span> Incidents</a></div></div>');

                    if ($('.incident-list').html('<div class="incident-list-item"><div class="incident-item-body"><h5>Investigating</h5></div><div class="article-body markdown">' + bodyArticle + '<br><small class="small">Posted on ' + creationDate.toDateString() + " " + creationDate.toLocaleTimeString() + '</small><span class="hide">' + bodyArticle + '<span></div><div class="edit_body"><a>Edit</a></div></div>')) {
                        $.get('/api/v2/help_center/articles/' + currArticleID + '/comments.json', function(data) {
                            for (var x = data.comments.length - 1; x >= 0; x--) {
                                var updateId = data.comments[x].id,
                                    date = data.comments[x].updated_at,
                                    dateCreated = new Date(date),
                                    body = data.comments[x].body,
                                    commentStatus = body.split(getDelim(body), 1);
                                    var body = body.substr(body.indexOf(getDelimBody(body)) + 1);
                                $('.incident-list').prepend('<div class="incident-list-item"><div class="incident-item-body"><h5>' + commentStatus + '</h5></div><div class="incident-item-cont">' + body + '<br><small class="small">Posted on ' + dateCreated.toDateString() + " " + dateCreated.toLocaleTimeString() + '</small><span class="hide span-body">' + body + '</span></div><div class="edit_update"><a>Edit<span class="hide">' + updateId + '</span></a></div><div class="delComment"><a>Delete<span class="hide">' + updateId + '</span></a></div></div>');
                            }
                        });
                    }
                });
            } // End of view incident function
            function getDelim(text){
                var indexColon = text.indexOf(":");
                var indexHyphen = text.indexOf("-");
                if(indexColon > -1){
                    if(indexHyphen > -1) {
                        if(indexColon < indexHyphen)
                            return ":";
                        else
                            return " -";
                    }else
                        return ":";
                }else
                    return " -";
            }
            function getDelimBody(text){
                var indexColon = text.indexOf(":");
                var indexHyphen = text.indexOf("-");
                if(indexColon > -1){
                    if(indexHyphen > -1) {
                        if(indexColon < indexHyphen)
                            return ":<br><br>";
                        else
                            return "- ";
                    }else
                        return ":<br><br>";
                }else
                    return "- ";
            }
            /*
            // New table of contents adjustment
            $("body").on("click", ".tocify-item", function() {
                var grab = $(this).attr("data-unique");
                var getH = $('div[name="' + grab + '"]').next();
                var distance = $('div[name="' + grab + '"]+' + getH[0].localName + '').offset().top;
                setTimeout(function() {
                    var setSize = $('#navbar-container').css('height');
                    if (setSize === '1px') {
                        window.scrollTo(0, distance - 60);
                    } else {
                        window.scrollTo(0, distance - 110);
                    }
                }, 500);
            });
            */
        }
    }
});