// Author: Sizmek Global Support Intern - Kyrl Limitares & Yves Denzel
// Ver 1.12
$(document).ready(function() {
    var currentUser = HelpCenter.user.role;
    var localStorage = window.localStorage;
    var platforms = JSON.parse(localStorage.getItem("platforms"));
    var platform_url = window.location.href.split("/");
    var platform_id = platform_url[platform_url.length - 1].split("-", 1).toString();
    var currentLocation = window.location.href;
    if (currentLocation.indexOf("/articles") > -1) {
        currentLocation = currentLocation.replace("https://support.sizmek.com/hc/en-us/articles/", "");
        view_incident2(parseInt(currentLocation));
    }
    //START
    //This function is use to show the related incidents in article page.
    function view_incident2(incident_id) {
        var htmlElementView2 = "",
            relatedIncidentArray = [];
        $.get('/api/v2/help_center/articles/' + incident_id + '.json', function(incident) {
            var label = incident.article.label_names;
            for (var x = 0; x < label.length; x++) {
                if (label[x].includes("Type:")) {
                    var type = label[x].replace("Type:", "");
                } else if (label[x].includes("Status:")) {
                    var in_status = label[x].replace("Status:", "");
                } else if (label[x].includes("Severity:")) {
                    var in_severity = label[x].replace("Severity:", "");
                } else if (label[x].includes("RelatedIncidents:")) {
                    var relatedIncidentsTag = label[x].replace(/RelatedIncidents:/g, "");
                    var related_incidents = relatedIncidentsTag.split(" ");
                }
            }
            if (related_incidents !== undefined && related_incidents.length > 0 && related_incidents[0] !== "") {
                htmlElementView2 += '<div id="related-incidents-container" class="related-article-view"><label id="related-incidents-label">Related Incidents:</label>';
                for (var index = 0; index < related_incidents.length; index++) {
                    (function(x) {
                        $.get('/api/v2/help_center/articles/' + related_incidents[x] + '.json').done(function(data) {
                            relatedIncidentArray.push(data.article);
                            if (x + 1 === related_incidents.length) {
                                (function() {
                                    if (related_incidents.length === relatedIncidentArray.length) {
                                        instantiateStringifiedDOM2();
                                    } else {
                                        setTimeout(arguments.callee, 100);
                                    }
                                })()
                            }
                        });
                    })(index);
                }

                function instantiateStringifiedDOM2() {
                    relatedIncidentArray.forEach(function(data) {
                        if (data.section_id === 360000037612) {
                            section = "MDX 2.0";
                        } else if (data.section_id === 202580163) {
                            section = "Sizmek Advertising Suite";
                        } else if (data.section_id === 360000037572) {
                            section = "DSP";
                        } else if (data.section_id === 360000041291) {
                            section = "DMP";
                        } else if (data.section_id === 201265859) {
                            section = "Internal";
                        }
                        htmlElementView2 += '<div class="incident-item-action" id="related-incident"><a class="incident-item-view" href="/hc/en-us/articles/' + related_incidents[x] + '">' + section + '</a><span>' + related_incidents[x] + '</span></div>';
                    })
                    if (jQuery.inArray("view_support_content", HelpCenter.user.tags) > -1 && type != undefined) { //user_apac
                        htmlElementView2 += '</div>';
                        $(".main-column .incident-list-cont").append(htmlElementView2);
                    }
                }
            }
        });
    }
    //END
    if (window.location.href.indexOf("categories/201680143") > -1 || jQuery.inArray(platform_id, platforms) !== -1) {
        $('.section-tree').html("");
        var message_board_loc = 201680143,
            template_loc = 201822986,
            sas = 202580163,
            sas_internal = 201265859,
            globalnotif_user_id = 1627768706,
            globalsupport_user_id = 357520165,
            status_colors = ["#7EDE96", "#3498DB", "#FFD24D", "#DC7633", "#E74C3C"],
            platform_status = ["Operational", "Under Maintenance", "Degraded Performance", "Partial Outage", "Major Outage"],
            status_translations = ["All Systems Operational", "Service Under Maintenance", "Partially Degraded Service", "Minor Service Outage", "Major Service Outage"],
            refresh = false,
            open_platforms = [],
            platform_urls = [],
            incidentIDs = [],
            section = '',
            currentIncidents = [],
            arrayChecker = 0,
            currentIternalIncidentID = 0,
            currentIternalIncidentTitle = '',
            allIncidents = [
                [360000037612,[]],
                [202580163,[]],
                [360000037572,[]],
                [360000041291,[]],
                [201265859,[]]
            ];
        if (localStorage.getItem("category")) {
            console.log("Welcome Back")
        } else {
            localStorage.setItem("category", message_board_loc);
            console.log("Welcome To Message Board")
        }
        /////////////Status //////////////////////////////////////////
        if (window.location.href.indexOf("categories/" + message_board_loc) > -1) {
            $('.sub-nav').after('<img class="component-loader" src="/hc/theme_assets/539845/200023575/spingrey.gif" style="margin-top:85px"/><div class="main-components-container" style="width:1000px"></div>')
        }
        history.pushState(null, null, '/hc/en-us/categories/201680143');
        window.addEventListener('popstate', function(event) {
            if (window.location.href.indexOf('201680143') > 0) {
                window.location.assign("https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board");
            }
        });

        function getIncidentLabel(incidentStatus) {
            return incidentStatus === "RESOLVED" ? '<span class="label label-success" id="category-page-label">' + incidentStatus + '</span>' : (incidentStatus === "COMPLETED") ? '<span class="label label-success" id="category-page-label">' + incidentStatus + '</span>' : incidentStatus === 'INVESTIGATING' ? '<span class="label label-warning" id="category-page-label">' + incidentStatus + '</span>' : incidentStatus === 'IDENTIFIED' ? '<span class="label label-inverse" id="category-page-label">' + incidentStatus + '</span>' : incidentStatus === 'MONITORING' ? '<span class="label label-info" id="category-page-label">' + incidentStatus + '</span>' : incidentStatus === 'NEW' ? '<span class="label" id="category-page-label">' + incidentStatus + '</span>' : '';
        }
        $.get('/api/v2/help_center/' + HelpCenter.user.locale + '/categories/' + message_board_loc + '/sections.json', function(platforms) {
            for (var i = platforms.count - 1; i >= 0; i--) {
                var description = platforms.sections[i].description;
                if (description.indexOf('@component') > -1 || description.indexOf('@show_content') > -1) {
                    var platform = platforms.sections[i].id.toString(),
                        platform_url = platforms.sections[i].html_url,
                        platform_name = description.split("@", 1).toString(),
                        user_segment = platforms.sections[i].user_segment_id,
                        status = description.charAt(description.length - 1),
                        agent_and_manager = "";
                    platform_urls[platform] = platform_url;
                    open_platforms.push(platform);
                    if (user_segment == 526203) {
                        agent_and_manager = '<span class="visibility-internal" data-title="Only visible to agents and managers" style="margin-top: 3px"> <span class="visibility-internal-icon"></span> </span>'
                    }
                    if (description.indexOf('@show_content') > -1) {
                        $('.section-tree').prepend('<section class="section" id="' + platform_name.replace(/\s/g, "_") + '" style="float:unset;max-width:none;width:1000px"><h3 style="margin: 10px 0px;">' + agent_and_manager + '<span class="releaseTag">' + description + '</span><a href="' + platform_url + '" style="font-size:25px !important;font-weight: 300">' + platform_name + '</a></h3><ul class="article-list article-list-' + platform + '" style="min-height: 50px;"></ul></section>');
                        get_incidents(platform),
                            $('.incident-nav-cont').prepend('<div class="incident-nav-item">' + platform_name + '<span>' + platform + '</span></div>'),
                            $('.incident-container').append('<div class="incident-list-cont" id="incident-' + platform + '"><div class="incident-list"></div></div>'),
                            $('.subs-nav-cont').prepend('<div class="subs-nav-item">' + platform_name + '<span>' + platform + '</span></div>'),
                            $('.subs-container').append('<div class="subs-list-cont" id="subs-' + platform + '"> <div class="subs-list-desc">Loading subscribers...</div><div class="subs-list-header"><input type="checkbox"> <div>Email Subscribers</div> <div>Date Added</div> <div>Actions</div></div><div class="subs-lists"></div> </div>');
                        var component = '<div class="component"> <input class="affected-component" type="checkbox" value=' + platform + '><span>' + platform_name + '</span> </div>';
                        if (description.indexOf('@internal_only') === -1) $(".component-container").prepend(component);
                    }
                    if (description.indexOf('@component') > -1 && window.location.href.indexOf("categories/" + message_board_loc) > -1) {
                        $('.main-components-container').prepend('<div class="component" id="component-' + platform + '"style="display:flex;align-items:center;">' + agent_and_manager + '<span class="releaseTag">' + description + '</span><a href="#' + platform_name.replace(/\s/g, "_") + '" style="font-size:17px !important;flex:1;color:#0d2a4d">' + platform_name + '</a><span style="color:' + status_colors[status - 1] + ';float:right;font-size:17px">' + platform_status[status - 1] + '</span><a class="article-subscribe" style="margin-top:0" role="button">Follow</a><span class="hide">' + platform + '</span></div>')
                    }
                }
                if (i == 0) {
                    localStorage.setItem("platforms", JSON.stringify(open_platforms));
                    subscription();
                }
            }

            function get_incidents(platform) {
                $.get('/api/v2/help_center/' + HelpCenter.user.locale + '/sections/' + platform + '/articles.json', function(incidents) {
                    var count, shown;
                    count = shown = 0;
                    for (var n = 0, len = incidents.articles.length; n < len && shown < 5; n++) {
                        var incident_title = incidents.articles[n].title;
                        if ((incident_title.indexOf("[Template]") == -1 && jQuery.inArray("Hidden", incidents.articles[n].label_names) == -1 && jQuery.inArray("Archived", incidents.articles[n].label_names) == -1) || (incident_title.indexOf("[Template]") == -1 && jQuery.inArray("Hidden", incidents.articles[n].label_names) == -1 && (currentUser != "anonymous" && currentUser != "end_user"))) {
                            if (jQuery.inArray("Archived", incidents.articles[n].label_names) > -1) {
                                var archive = '<span style="display:inherit" class="archived-incident"><b>ARCHIVED</b></span>'
                            } else {
                                var archive = ""
                            }
                            var incident_id = incidents.articles[n].id;
                            var incident_date = new Date(incidents.articles[n].created_at);
                            if (incident_title[0] === "[") {
                                var incident_title = incident_title.slice(incident_title.indexOf(']') + 1, incident_title.length);
                            }
                            var getIncidentStatus = "";
                            $.each(incidents.articles[n].label_names, function() {
                                if (this.indexOf("Status") > -1) {
                                    getIncidentStatus = this.replace("Status:", "").toUpperCase();
                                }
                            });
                            if (archive == "") {
                                shown++;
                                $('.section > .article-list-' + platform).append('<li style="display: list-item;padding: 10px 0"><a href="' + incident_id + '">' + archive + getIncidentLabel(getIncidentStatus) + incident_title + '<br><small>Posted on ' + incident_date.toDateString() + " " + incident_date.toLocaleTimeString() + '</small><span style="display: none">' + platform + '</span></a></li>')
                                if (shown == 5 && incidents.count > 5) {
                                    $('.section > .article-list-' + platform).append('<div style="margin-top:10px"><a href="' + platform_urls[platform] + '">View all incidents <span style="font-family:arial">→</span></a></div>')
                                }
                            }
                            count++;
                        }
                    }
                    if (count == 0) {
                        $('.section > .article-list-' + platform).append('<div style="margin-top:10px;font-size: 15px;">No incidents reported.</div>')
                    }
                    $('.section > .article-list').css("height", "auto");
                    $('.main-components-container').css("margin-top", "40px");
                })
            }
        });
        if (window.location.href.indexOf("/sections/") > -1) {
            var title = $('.section-description').text(),
                new_title = title.split("@", 1),
                status = title.charAt(title.length - 1),
                follow = $(".section-subscribe .dropdown-toggle").text();
            if ($('.page-header h1 span').html()) {
                var lock = $('.page-header h1 span').html();
            } else {
                var lock = ""
            }
            $('.page-header h1').html(lock + new_title);
            if (follow.toLowerCase() == "following") {
                $(".section-subscribe .dropdown-toggle").html("Unfollow").css('background-color', '#246fdc').css('color', '#fff').css('border', '1px solid #246fdc')
            } else {
                $(".section-subscribe .dropdown-toggle").html("+ Follow").css('color', '#5c5c5c').css('border', 'solid 1px #979797')
            }
            $(".section-subscribe").append('<a class="create-maintenance-modal-btn add-article" rule="button" style="margin-top:1px">ADD MAINTENANCE</a><a class="create-incident-modal-btn add-article" rule="button" style="margin-top:1px">ADD INCIDENT</a>').removeClass("section-subscribe");
            $('.article-list > li > a').each(function() {
                $(this).find("span").each(function() {
                    if ($(this).hasClass("Hidden-title") || $(this).hasClass("Type:Template-title") || ($(this).hasClass("Archived-title") && (currentUser == "anonymous" || currentUser == "end_user"))) {
                        $(this).parent().parent().remove()
                    } else if ($(this).hasClass("Archived-title") && (currentUser != "anonymous" && currentUser != "end_user")) {
                        $(this).parent().prepend('<span style="display:inherit" class="archived-incident"><b>ARCHIVED</b></span>').css("margin-left", "0 !important")
                    }
                })
            });
        }
        $('.sub-nav .search').css('display', 'none');
        $('.see-all-articles').each(function() {
            $(this).html('Past Incidents <span style="font-family:arial">→</span>');
        });
        $('main').not(".messageBoard").append('<div class="incident-view-page"></div>');
        if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) { //user_apac
            // APPENDS
            var createIncidentModal = '<div class="modal" id="create-incident-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>Create an Incident</h1><div class="select-template"><select class="select-picker select-template-dropdown" name="Select Template"> <option class="template" value="none">Use Template</option> </select> </div></div><div class="modal-body"> <div class="modal-body-detail components-affected"> <label>Components Affected</label> <div class="component-container"> </div></div><h1 style="font-size: 20px;font-weight: 400;">Messaging</h1><br><div class="modal-body-detail incident-name"> <label>Title</label> <br><input type="text" id="incident-name" name="" placeholder="Incident Title"><span class="info"></span> </div><div class="modal-body-detail incident-severity"><label>Severity</label><br><select><option value="1">Operational</option><option value="3">Degraded Performance</option><option value="4">Minor Outage</option><option value="5">Major Outage</option></select></div><div class="modal-body-detail incident-status"> <label>Status</label> <div class="status-choices"> <input type="radio" name="iInvestigating" value="Investigating"><span class="radio-label">Investigating</span> <input type="radio" name="iIdentified" value="Identified"><span class="radio-label">Identified</span> <input type="radio" name="iMonitoring" value="Monitoring"><span class="radio-label">Monitoring</span> <input type="radio" name="iResolved" value="Resolved"><span class="radio-label">Resolved</span> </div></div><div class="modal-body-detail incident-message"> <div style="padding: 20px;border: 1px solid #ababab;border-radius: 5px;background-color: #fffdf6;" id="iInternal"><label class="gswitch"><input type="checkbox" id="iInternalMessage"><span class="gslider round"></span></label><label style="margin-bottom: 30px;font-size:18px">Internal Message</label> <div style="clear: both; display: block;margin-bottom:30px">Send e-mail to subscribers<label class="gswitch"><input type="checkbox" id="iEmailSubscribers"><span class="gslider round green"></span></label></div> <textarea placeholder="Message" id="iMessage"></textarea> </div><br><div style="padding: 20px;border: 1px solid #ababab;border-radius: 5px;background-color: #F5FDFE;" id="iExternal"><label class="gswitch"><input type="checkbox" id="iExternalMessage"><span class="gslider round"></span></label><label style="margin-bottom: 30px;font-size:18px">External Message <span style="font-size: 0.7em;vertical-align: middle;font-weight: 400;">| <span class="copyText" style="color:#2E64F8;">Copy from Internal Message</span></span></label> <div style="clear: both; display: none" id="showHome">Show in SAS homepage<label class="gswitch"><input type="checkbox" id="iExShowHomepage"><span class="gslider round green"></span></label></div> <div  style="clear: both; display: block; margin-bottom:30px">Send e-mail to subscribers<label class="gswitch"><input type="checkbox" id="iExEmailSubscribers"><span class="gslider round green"></span></label></div> <textarea placeholder="Message" id="iExMessage"></textarea> </div></div></div><div class="modal-footer"><button class="btn btn-primary" id="create-incident-btn">CREATE INCIDENT</button></div></div></div>';
            var newScheduledMaintenaceModal = '<div class="modal" id="new-scheduled-maintenance-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>New Scheduled Maintenance</h1><div class="select-template"><select class="select-picker select-template-dropdown" name="Select Template"><option value="none">Use Template</option></select></div></div><div class="modal-body"> <div class="modal-body-detail components-affected"> <label>Components Affected</label> <div class="component-container"> </div></div> <h1 style="font-size: 20px;font-weight: 400;">Messaging</h1><br><div class="modal-body-detail maintenance-name"> <label>Title</label><input id="maintenance-name" name="" placeholder="Maintenance Title" type="text" required> </div><div class="modal-body-detail maintenance-details"> <div style="padding: 20px;border: 1px solid #ababab;border-radius: 5px;background-color: #fffdf6;" id="mInternal"><label class="gswitch"><input type="checkbox" id="mInternalMessage"><span class="gslider round"></span></label><label style="margin-bottom: 30px;font-size:18px">Internal Message</label> <div style="clear: both; display: block;margin-bottom:30px">Send e-mail to subscribers<label class="gswitch"><input type="checkbox" id="mEmailSubscribers"><span class="gslider round green"></span></label></div> <textarea placeholder="Message" id="mMessage"></textarea> </div><br><div style="padding: 20px;border: 1px solid #ababab;border-radius: 5px;background-color: #F5FDFE;" id="mExternal"><label class="gswitch"><input type="checkbox" id="mExternalMessage"><span class="gslider round"></span></label><label style="margin-bottom: 30px;font-size:18px">External Message <span style="font-size: 0.7em;vertical-align: middle;font-weight: 400;">| <span class="copyText" style="color:#2E64F8;">Copy from Internal Message</span></span></label> <div style="clear: both; display: none" id="showHome">Show in SAS homepage<label class="gswitch"><input type="checkbox" id="mExShowHomepage"><span class="gslider round green"></span></label></div> <div  style="clear: both; display: block; margin-bottom:30px">Send e-mail to subscribers<label class="gswitch"><input type="checkbox" id="mExEmailSubscribers"><span class="gslider round green"></span></label></div> <textarea placeholder="Message" id="mExMessage"></textarea> </div> </div><div class="maintenance-start"> <label>Maintenance Start Time</label> <div class="maintenance-time"> <input name="" type="date" required> <select class="time-select"></select> </div><span class="info">All times must be specified in EST - Eastern Standard Time(US & Canada)</span> </div><div class="maintenance-end"> <label>Maintenance End Time</label> <div class="maintenance-time"> <input name="" type="date" required> <select class="time-select"></select> </div><span class="info">All times must be specified in EST - Eastern Standard Time(US & Canada)</span> </div></div><div class="modal-footer"><button class="btn btn-primary" id="create-new-scheduled-maintenance">CREATE MAINTENANCE</button></div></div></div>';
            $('body').append('<div class="message-board-container"><header class="header"><div class="header-inner clearfix"><div id="goto-status" class="close-MB-admin"><i class="fa fa-times"></i></div><div class="logo"><h2>Message Board Admin</h2></div><nav class="user-nav"><a role="button" id="goto-incidents">Incidents</a><a role="button" id="goto-subscribers">Subscribers</a><a role="button" id="goto-platforms">Platforms</a></nav></div></header></nav><main class="messageBoard"></main>').append('<button id="goto-messageBoard-admin"><svg class="message-board-admin-icon" viewBox="2 2 22 22"><path fill="currentColor" d="M13 16.627a3.625 3.625 0 0 1-3.63-3.622A3.633 3.633 0 0 1 13 9.373a3.633 3.633 0 0 1 3.63 3.632A3.625 3.625 0 0 1 13 16.627m8.295-4.902h-.006a2.116 2.116 0 0 1-1.955-1.307l-.031-.075a2.117 2.117 0 0 1 .459-2.306.693.693 0 0 0 0-.998l-.809-.809a.71.71 0 0 0-.997 0 2.106 2.106 0 0 1-2.295.457l-.08-.033a2.109 2.109 0 0 1-1.302-1.948.705.705 0 0 0-.705-.706h-1.148a.705.705 0 0 0-.705.706c0 .855-.514 1.628-1.306 1.95-.021.009-.043.017-.063.027a2.106 2.106 0 0 1-2.308-.453.72.72 0 0 0-1.006 0l-.81.81a.708.708 0 0 0 0 .997l.007.006a2.11 2.11 0 0 1 .454 2.305c-.01.022-.018.045-.028.066a2.103 2.103 0 0 1-1.95 1.311h-.006a.706.706 0 0 0-.705.706v1.138c0 .39.316.706.705.706h.002a2.1 2.1 0 0 1 1.949 1.306l.029.069a2.11 2.11 0 0 1-.452 2.31l-.004.003a.708.708 0 0 0 0 .998l.809.809a.72.72 0 0 0 1.006 0l.005-.005a2.106 2.106 0 0 1 2.307-.452l.059.024a2.104 2.104 0 0 1 1.306 1.95v.007c0 .395.32.706.705.706h1.148c.385 0 .705-.31.705-.706v-.007c0-.855.514-1.627 1.306-1.95l.059-.024a2.106 2.106 0 0 1 2.307.452l.005.005a.71.71 0 0 0 .997 0l.809-.81a.693.693 0 0 0 0-.997l-.004-.003a2.11 2.11 0 0 1-.452-2.31l.029-.069a2.102 2.102 0 0 1 1.948-1.306h.012a.706.706 0 0 0 .705-.706v-1.138a.706.706 0 0 0-.705-.706"></path></svg>Message Board Admin</button>');
            $('main.messageBoard').append('<div class="incident-container"> <div class="incident-navigation"> <div class="incident-nav-header"> <div class="incident-header-title">Incidents</div><a class="create-incident-modal-btn incident-subscribe-button incident-save-button">+ NEW INCIDENT</a><a class="create-maintenance-modal-btn incident-subscribe-button incident-save-button">+ NEW MAINTENANCE</a><a id="new-incident-template" class="incident-subscribe-button incident-save-button">+ INCIDENT TEMPLATE</a><a id="new-maintenance-template" class="incident-subscribe-button incident-save-button">+ Maintenance TEMPLATE</a><input class="incident-nav-search" type="search" placeholder="Search"> </div> <div class="incident-nav-cont"> <div class="incident-nav-item incident-nav-empty">&nbsp; </div> </div>  </div></div>' + '<div class="platform-container"> <div class="incident-navigation"><div class="incident-nav-header"> <div class="incident-header-title">Platforms </div> </div> <div class="incident-nav-board"> <a id="create-platform-btn" class="incident-subscribe-button incident-save-button">+ NEW PLATFORM </a></div><div class="incident-list-item" style="border-bottom:2px solid #E0E0E0;width:100%;margin-top: -40px;"><div class="incident-item-body"><h5></h5></div> <div class="incident-item-action" style="flex:3"><h5 style="width:220px"></h5><h5 style="width:220px"></h5><h5 style="flex:1;text-align:center">Show Status</h5><h5 style="flex:1;text-align:center">Show Section</h5><h5 style="flex:1;"></h5></div></div></div> <div class="platform-list-cont"></div></div>' + '<div class="subs-container"> <div class="subs-navigation"> <div class="subs-nav-header"> <div class="subs-header-title">Subscribers </div> <input class="subs-nav-search" type="search" placeholder="Search"> </div> <div class="subs-nav-cont"> <div class="subs-nav-item subs-nav-empty">&nbsp; </div> </div> <div class="subs-nav-board"> <input type="email" placeholder="User email" spellcheck="false" id="subs-add-email"> <a id="subs-item-add" class="incident-subscribe-button incident-save-button">Add Subscriber </a></div> </div></div>' + '<div class="incident-view-page"></div>');
            $('body').append(newScheduledMaintenaceModal);
            $('body').append(createIncidentModal);
            $('body').append('<div class="modal" id="new-incident-template-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>Incident Template</h1><div class="select-template"><select class="select-picker update-template-dropdown" name="Select Template"><option class="template" value="none">Update Template</option> </select> </div></div> <div class="modal-body"> <div class="modal-body-detail template-name"><label>Template Name</label><br><input type="text" placeholder="Template Name"><span class="info">This is used internally so you can identify which template you are using.</span></div><div class="modal-body-detail incident-title"> <label>Incident Title </label> <br> <input type="text" placeholder="Incident Title"><span class="info">The title given to the incident or scheduled maintenance. This is only applied when creating an incident or scheduled maintenance.</span></div><div class="modal-body-detail incident-status"> <label>Incident Status</label><br><select> <option value="Investigating">Investigating</option> <option value="Identified">Identified</option> <option value="Monitoring">Monitoring</option> <option value="Resolved">Resolved</option> </select><span class="info">The status will be applied to the incident or scheduled maintenance.</span></div><div class="modal-body-detail incident-severity"><label>Incident Severity</label><br><select><option value="1">Operational</option><option value="3">Degraded Performance</option><option value="4">Minor Outage</option><option value="5">Major Outage</option></select><span class="info">The severity will be applied to the incident or scheduled maintenance.</span></div><div class="modal-body-detail incident-message"> <label>Message Body </label> <br> <textarea placeholder="Message" style="margin-top: 0px; margin-bottom: 0px; height: 80px;"> </textarea> </div> <div class="modal-body-detail components-affected"> <label>Alert Users Subscribed To: </label> <div class="component-container"></div> </div></div><div class="modal-footer"><button class="btn btn-primary delete-template-btn">DELETE TEMPLATE</button><button class="btn btn-primary" id="update-incident-template-btn">UPDATE TEMPLATE</button><button class="btn btn-primary" id="create-incident-template-btn">CREATE INCIDENT TEMPLATE</button></div> </div></div>');
            $('body').append('<div class="modal" id="new-maintenance-template-modal"> <div class="modal-content"> <div class="modal-header"> <button class="close close-modal">X </button> <h1>Maintenance Template</h1><div class="select-template"><select class="select-picker update-template-dropdown" name="Select Template"> <option class="template" value="none">Update Template</option> </select> </div></div> <div class="modal-body"> <div class="modal-body-detail template-name"> <label>Template Name </label> <br> <input type="text" placeholder="Template Name"> <span class="info">This is used internally so you can identify which template you are using. </span> </div> <div class="modal-body-detail maintenance-title"> <label>Maintenance Title </label> <br> <input type="text" placeholder="Maintenance Title"> <span class="info">The title given to the incident or scheduled maintenance. This is only applied when creating an incident or scheduled maintenance. </span> </div> <div class="modal-body-detail maintenance-message"> <label>Message Body </label> <br> <textarea placeholder="Message" style="margin-top: 0px; margin-bottom: 0px; height: 80px;"> </textarea> </div> <div class="modal-body-detail components-affected"> <label>Alert Users Subscribed To: </label> <div class="component-container"> </div> </div> </div> <div class="modal-footer"><button class="btn btn-primary delete-template-btn">DELETE TEMPLATE</button><button class="btn btn-primary" id="update-maintenance-template-btn">UPDATE TEMPLATE</button><button class="btn btn-primary" id="create-maintenance-template-btn">CREATE MAINTENANCE TEMPLATE </button> </div> </div></div>');
            $('textarea').ckeditor();
            //End of APPENDS
            $('.create-maintenance-modal-btn').click(function() {
                cleanModal();
                $('html').css('overflow', 'hidden');
                $('#new-scheduled-maintenance-modal').fadeIn("fast");
                setTimeout(function() {
                    CKEDITOR.instances["mMessage"].plugins.lite.findPlugin(CKEDITOR.instances["mMessage"]).toggleTracking(false, false);
                    CKEDITOR.instances["mExMessage"].plugins.lite.findPlugin(CKEDITOR.instances["mExMessage"]).toggleTracking(false, false);
                }, 300);
                $(".gswitch input").prop('checked', true);
                $("#mExShowHomepage").prop("checked", false);
                $("#mInternal > div").fadeIn();
                $("#mExternal > div").fadeIn();
                $("#mExternal > #showHome").hide();
            })
            $('.create-incident-modal-btn').click(function() {
                cleanModal();
                $('html').css('overflow', 'hidden');
                $('#create-incident-modal').fadeIn("fast");
                setTimeout(function() {
                    CKEDITOR.instances["iMessage"].plugins.lite.findPlugin(CKEDITOR.instances["iMessage"]).toggleTracking(false, false);
                    CKEDITOR.instances["iExMessage"].plugins.lite.findPlugin(CKEDITOR.instances["iExMessage"]).toggleTracking(false, false);
                }, 300);
                $(".gswitch input").prop('checked', true);
                $("#iExShowHomepage").prop("checked", false);
                $("#iInternal > div").fadeIn();
                $("#iExternal > div").fadeIn();
                $("#showHome").hide();
            })
            $('#iInternalMessage').click(function() {
                if ($("#iInternal .gswitch input").prop('checked')) {
                    $("#iSubscribeGN, #iEmailSubscribers").prop('checked', true);
                    $("#iInternal > div").fadeIn();
                } else {
                    $("#iSubscribeGN, #iEmailSubscribers").prop('checked', false);
                    $("#iInternal > div").fadeOut();
                }
                checkBtnStatus();
            })
            $('#iExternalMessage').click(function() {
                if ($("#iExternal .gswitch input").prop('checked')) {
                    $("#iExSubscribeGN, #iExEmailSubscribers").prop('checked', true);
                    $("#iExternal > div").fadeIn();
                } else {
                    $("#iExSubscribeGN, #iExEmailSubscribers").prop('checked', false);
                    $("#iExternal > div").fadeOut();
                }
                checkBtnStatus();
            })
            $('#mInternalMessage').click(function() {
                if ($("#mInternal .gswitch input").prop('checked')) {
                    $("#mSubscribeGN, #mEmailSubscribers").prop('checked', true);
                    $("#mInternal > div").fadeIn();
                } else {
                    $("#mSubscribeGN, #mEmailSubscribers").prop('checked', false);
                    $("#mInternal > div").fadeOut();
                }
                checkBtnStatus();
            })
            $('#mExternalMessage').click(function() {
                if ($("#mExternal .gswitch input").prop('checked')) {
                    $("#mExSubscribeGN, #mExEmailSubscribers").prop('checked', true);
                    $("#mExternal > div").fadeIn();
                } else {
                    $("#mExSubscribeGN, #mExEmailSubscribers").prop('checked', false);
                    $("#mExternal > div").fadeOut();
                }
                checkBtnStatus();
            })

            function checkBtnStatus() {
                if (!$("#mInternal .gswitch input").prop('checked') && !$("#mExternal .gswitch input").prop('checked')) $("#create-new-scheduled-maintenance").prop("disabled", true);
                else $("#create-new-scheduled-maintenance").prop("disabled", false);
                if (!$("#iInternal .gswitch input").prop('checked') && !$("#iExternal .gswitch input").prop('checked')) $("#create-incident-btn").prop("disabled", true);
                else $("#create-incident-btn").prop("disabled", false);
            }
            $('.incident-status input[type="radio"]').change(function() {
                $('.incident-status input[type="radio"]').each(function() {
                    $(this).prop('checked', false);
                })
                $(this).prop('checked', true);
            })
            $('.close-modal').click(function() {
                $(this).closest(".modal").fadeOut("fast");
                $('.modal-footer #related-incidents-container').remove();
                if ($('.incident-container').is(':visible')) {
                    return false;
                } else {
                    $('html').css('overflow', 'auto');
                }
            })
            //================================================= DYNAMIC COMPONENTS ============
            var templates = [];

            function populateTemplate() {
                $.get("/api/v2/help_center/en-us/articles.json?label_names=Type:Template", function(results) {
                    $(".select-template-dropdown").each(function() {
                            $(this).find("option:not(:first)").remove()
                        }),
                        $(".update-template-dropdown").each(function() {
                            $(this).find("option:not(:first)").remove()
                        }),
                        $(".select-template-dropdown,.update-template-dropdown").addClass("select-picker"),
                        templates = [];
                    for (x = 0; x < results.count; x++) {
                        var template_name = results.articles[x].title;
                        var template_for = results.articles[x].label_names[1];
                        if (template_name.includes("[Template]") == true) {
                            var template_name = template_name.replace("[Template]", "");
                        }
                        var template_id = results.articles[x].id
                        if (template_for == "For:Incident") {
                            var template_entry = "<option value='" + template_id + "'>" + template_name + "</option>"
                            $("#create-incident-modal .select-template-dropdown, #new-incident-template-modal .update-template-dropdown").append(template_entry);
                        } else {
                            var template_entry = "<option value='" + template_id + "'>" + template_name + "</option>"
                            $("#new-scheduled-maintenance-modal .select-template-dropdown, #new-maintenance-template-modal .update-template-dropdown").append(template_entry);
                        }
                        var incident = results.articles[x].body;
                        var res = incident.split("::::");
                        var affected = res[4].split(",");
                        template = [];
                        template.template_name = template_name;
                        template.incident_name = res[0];
                        template.incident_status = res[1];
                        template.incident_severity = res[2];
                        template.incident_message = res[3];
                        template.incident_componentsAffected = [];
                        for (y = 0; y < affected.length; y++) {
                            if (affected[y] != "") {
                                template.incident_componentsAffected.push(affected[y]);
                            }
                        }
                        template.id = template_id;
                        templates[template_id] = template;
                    }
                    KSelect()
                })
            };
            populateTemplate();
            $(".select-template-dropdown").change(function() {
                if ($(this).val() != 'none') {
                    var id = $(this).val();
                    $(".incident-message textarea, .maintenance-details textarea").val(templates[id].incident_message),
                        $("#incident-name, #maintenance-name").val(templates[id].incident_name);
                    for (x = 0; x < templates[id].incident_componentsAffected.length; x++) {
                        $(this).parent().parent().parent().find("input[value='" + templates[id].incident_componentsAffected[x] + "']").click();
                    }
                    $(".incident-severity select").val(templates[id].incident_severity);
                    var radio_name = "i" + templates[id].incident_status;
                    $("input[name='" + radio_name + "']").prop('checked', true);
                } else {
                    cleanModal();
                    $(".gswitch input").prop('checked', true);
                    $("#iExShowHomepage").prop("checked", false);
                }
            })
            $(".update-template-dropdown").change(function() {
                if ($(this).val() != 'none') {
                    $('.delete-template-btn,#update-incident-template-btn,#update-maintenance-template-btn').show(),
                        $('#create-maintenance-template-btn,#create-incident-template-btn').hide();
                    var id = $(this).val();
                    $(".template-name input[type='text']").val(templates[id].template_name),
                        $(".incident-message textarea, .maintenance-message textarea").val(templates[id].incident_message),
                        $(".incident-title input[type='text'], .maintenance-title input[type='text']").val(templates[id].incident_name),
                        $("#new-incident-template-modal .incident-status select").val(templates[id].incident_status);
                    $(".incident-severity select").val(templates[id].incident_severity);
                    for (x = 0; x < templates[id].incident_componentsAffected.length; x++) {
                        $("input[value='" + templates[id].incident_componentsAffected[x] + "']").prop('checked', true);
                    }
                    var radio_name = "i" + templates[id].incident_status;
                    $("input[name='" + radio_name + "']").prop('checked', true);
                } else {
                    cleanModal();
                }
            })
            populateTime();
            restrictDate();

            function restrictDate() {
                var dt = new Date();
                var month = dt.getMonth() + 1;
                var day = dt.getDate();
                var year = dt.getFullYear();
                if (month < 10) {
                    month = '0' + month.toString();
                }
                if (day < 10) {
                    day = '0' + day.toString();
                }
                var minDate = year + "-" + month + "-" + day;
                $("input[type='date']").attr("min", minDate);
                $("input[type='date']").val(minDate);
            }

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
            }

            function cleanModal() {
                $(".modal").find("input[type='checkbox']").attr('checked', false).trigger("change");
                $(".modal").find("input[type='radio']").attr('checked', false);
                $(".modal").find("input[type='text']").val("");
                $(".modal").find("textarea").val("");
                $('.delete-template-btn,#update-incident-template-btn,#update-maintenance-template-btn').hide(),
                    $('#create-maintenance-template-btn,#create-incident-template-btn').show();
            }
            $('body').on("change", "#create-incident-modal .component input[value='" + sas_internal + "'],#new-scheduled-maintenance-modal .component input[value='" + sas_internal + "']", function() {
                if ($(this).is(":checked")) {
                    $("#create-incident-modal .components-affected, #new-scheduled-maintenance-modal .components-affected").after('<div class="modal-body-detail global-notifications"><label>Global Notifications</label><br><input type="checkbox" checked class="subscribe-global-notif"><span class="checkbox-label">Subscribe globalnotifications@sizmek.com.</span></div>')
                } else {
                    $(".global-notifications").remove();
                }
            })
            $('body').on("change", "#create-incident-modal .component input[value='" + sas + "'], #new-scheduled-maintenance-modal .component input[value='" + sas + "']", function() {
                if ($(this).closest('.modal').attr("id") == "create-incident-modal") {
                    var type = "Incident"
                } else {
                    var type = "Maintenance"
                }
                if ($(this).is(":checked")) {
                    if (type == "Incident") {
                        $("#showHome").show();
                        $("#iExShowHomepage").prop("checked", true);
                    } else {
                        $("#showHome").show();
                        $("#mExShowHomepage").prop("checked", true);
                    }
                } else {
                    if (type == "Incident") {
                        $("#showHome").hide();
                        $("#iExShowHomepage").prop("checked", false);
                    } else {
                        $("#showHome").hide();
                        $("#mExShowHomepage").prop("checked", false);
                    }
                }
            })
            $(".copyText").click(function() {
                $("#iExMessage").val($("#iMessage").val());
                $("#mExMessage").val($("#mMessage").val());
            })
            //================================================= CREATE INCIDENT ===============
            $('#create-incident-btn').click(function() {
                $(this).attr("disabled", true);
                var thismodal = $(this).closest('.modal');
                var params = [];
                var compoCount = thismodal.find('.components-affected input[type="checkbox"]:checked').length;
                params['incidentName'] = thismodal.find('#incident-name').val();
                params['incidentStatus'] = thismodal.find('.incident-status input[type="radio"]:checked').val();
                params['incidentSeverity'] = thismodal.find('.incident-severity select').val();
                params['globalnotif'] = true;
                if (params.incidentName == "" || params.incidentStatus == undefined || thismodal.find('.components-affected input[type="checkbox"]:checked').val() == undefined) {
                    $(this).removeAttr('disabled');
                    alert("Please fill up all the fields.");
                } else {
                    if (($("#iInternal .gswitch input").prop('checked') && $("#iInternal textarea").val() == "") || ($("#iExternal .gswitch input").prop('checked') && $("#iExternal textarea").val() == "")) {
                        $(this).removeAttr('disabled');
                        alert("Internal or External message is enabled but empty.\nPlease disable it or add the message.");
                    } else {
                        if ($("#iInternal .gswitch input").prop('checked')) {
                            var intIncidentName = '';
                            thismodal.find('.components-affected input[type="checkbox"]:checked').siblings("span").each(function() {
                                intIncidentName = intIncidentName + "[" + $(this).text().trim() + "]";
                            })
                            intIncidentName = intIncidentName + ' ' + thismodal.find('#incident-name').val();
                            setTimeout(function() {
                                //submit internal message to Internal section
                                params['incidentName'] = intIncidentName;
                                params['message'] = $("#iInternal textarea").val();
                                params['notifications'] = $("#iEmailSubscribers").prop('checked');
                                createIncident(sas_internal, params, true);
                            }, 1500 * compoCount);
                        }
                        if ($("#iExternal .gswitch input").prop('checked')) {
                            //submit external message to selected component section
                            params.message = $("#iExternal textarea").val();
                            params.notifications = $("#iExEmailSubscribers").prop('checked');
                            params.sas_visibility = $("#iExShowHomepage").prop("checked");
                            var itr = 0;
                            thismodal.find('.components-affected input[type="checkbox"]:checked').each(function() {
                                itr++,
                                createIncident($(this).val(), params,
                                    (itr === compoCount && !$("#iInternal .gswitch input").prop('checked')));
                            })
                        }
                    }
                }
            })

            function createIncident(sect_id, params, final) {
                if (params.globalnotif != "undefined" && params.globalnotif == true) {
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + sect_id + '/subscriptions.json',
                        type: 'POST',
                        data: {
                            "subscription": {
                                "source_locale": "en-us",
                                "include_comments": true,
                                "user_id": globalnotif_user_id
                            }
                        }
                    })
                };
                var obj = {},
                    article = {},
                    label_names = {};
                if (params.sas_visibility != "undefined" && params.sas_visibility == false && sect_id == sas) {
                    var labels = ["Type:Incident", "Status:" + params.incidentStatus, "Name:" + params.incidentName, "Severity:" + params.incidentSeverity, "Hidden"];
                } else if (params.sas_visibility != "undefined" && params.sas_visibility == true && sect_id == sas) {
                    var labels = ["Type:Incident", "Status:" + params.incidentStatus, "Name:" + params.incidentName, "Severity:" + params.incidentSeverity, "ShowInHomepage"];
                } else {
                    var labels = ["Type:Incident", "Status:" + params.incidentStatus, "Name:" + params.incidentName, "Severity:" + params.incidentSeverity];
                }
                var title = "[" + params.incidentStatus + "] " + params.incidentName;
                article.title = title;
                article.body = params.message;
                article.author_id = globalsupport_user_id;
                obj.article = article;
                obj.article.label_names = labels;
                obj.notify_subscribers = params.notifications;

                function postData() {
                    return $.ajax({
                        url: "/api/v2/help_center/sections/" + sect_id + "/articles.json",
                        method: "POST",
                        data: JSON.stringify(obj),
                        contentType: "application/json"
                    });
                }
                postData().done(function(data) {
                    $('#incident-' + sect_id + ' .incident-list').html("");
                    incidentIDs.push(data.article.id);
                    var promisesToPost = [];
                    if (final) {
                        for (var i = 0; i < incidentIDs.length; i++) {
                            (function(y) {
                                var relatedIncidents = incidentIDs.filter(function(id) {
                                    return id != incidentIDs[y];
                                });
                                if(relatedIncidents.length){
                                    var promiseToPost = $.ajax({
                                        url: '/api/v2/help_center/articles/' + incidentIDs[y] + '/labels.json',
                                        type: 'POST',
                                        data: {
                                            "label": {
                                                "name": "RelatedIncidents: " + relatedIncidents.join(", ")
                                            }
                                        }
                                    })
                                    promisesToPost.push(promiseToPost);
                                }
                            })(i)
                        }
                         $.when.apply(null, promisesToPost).done(function() {
                            $('.btn').removeAttr("disabled");
                            $("#create-incident-modal").fadeOut("fast");
                            get_incident_list(sect_id);
                        })
                    }
                })
                refresh = true;
            }
            //==========================================================CREATE NEW SCHEDULED MAINTENANCE==================
            $("#create-new-scheduled-maintenance").click(function() {
                $(this).attr('disabled', true);
                var thismodal = $(this).closest(".modal");
                var params = [];
                var compoCount = thismodal.find('.components-affected input[type="checkbox"]:checked').length;
                params['maintenanceName'] = thismodal.find("#maintenance-name").val();
                params['startTime'] = [];
                params.startTime.date = thismodal.find(".maintenance-start input[type='date']").val();
                params.startTime.time = thismodal.find(".maintenance-start .time-select").val();
                params['endTime'] = [];
                params.endTime.date = thismodal.find(".maintenance-end input[type='date']").val();
                params.endTime.time = thismodal.find(".maintenance-end .time-select").val();
                params['globalnotif'] = true;
                if (params.maintenanceName == "" || thismodal.find('.components-affected input[type="checkbox"]:checked').val() == undefined) {
                    $(this).removeAttr('disabled');
                    alert("Please fill up all the fields.");
                } else {
                    if (($("#mInternal .gswitch input").prop('checked') && $("#mInternal textarea").val() == "") || ($("#mExternal .gswitch input").prop('checked') && $("#mExternal textarea").val() == "")) {
                        $(this).removeAttr('disabled');
                        alert("Internal or External message is enabled but empty.\nPlease disable it or add the message.");
                    } else {
                        if ($("#mInternal .gswitch input").prop('checked')) {
                            var intMaintName = '';
                            thismodal.find('.components-affected input[type="checkbox"]:checked').siblings("span").each(function() {
                                intMaintName = intMaintName + "[" + $(this).text().trim() + "]";
                            })
                            intMaintName = intMaintName + ' ' + thismodal.find("#maintenance-name").val();
                            setTimeout(function() {
                                //submit internal message to Internal section
                                params['maintenanceName'] = intMaintName;
                                params.maintenanceDetails = $("#mInternal textarea").val();
                                params['notifications'] = $("#mEmailSubscribers").prop('checked');
                                addNewScheduledMaintenance(sas_internal, params, true);
                            }, 1500 * compoCount);
                        }
                        if ($("#mExternal .gswitch input").prop('checked')) {
                            //submit external message to selected component section
                            params.maintenanceDetails = $("#mExternal textarea").val();
                            params['notifications'] = $("#mExEmailSubscribers").prop('checked');
                            params['sas_visibility'] = $("#mExShowHomepage").prop("checked");
                            var itr = 0;
                            thismodal.find('.components-affected input[type="checkbox"]:checked').each(function() {
                                itr++,
                                addNewScheduledMaintenance($(this).val(), params,
                                    (itr === compoCount && !$("#mInternal .gswitch input").prop('checked')));
                            })
                        }
                    }
                }
            })

            function addNewScheduledMaintenance(sect_id, params, final) {
                console.log("creating maintenance in ", sect_id, params, final);
                if (params.globalnotif != "undefined" && params.globalnotif == true && sect_id == sas_internal) {
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + sect_id + '/subscriptions.json',
                        type: 'POST',
                        data: {
                            "subscription": {
                                "source_locale": "en-us",
                                "include_comments": true,
                                "user_id": globalnotif_user_id
                            }
                        }
                    })
                };
                var obj = new Object();
                var article = new Object();
                if (params.sas_visibility != "undefined" && params.sas_visibility == false && sect_id == sas) {
                    var labels = ["Type:Maintenance", "Status:" + "New", "Name:" + params.maintenanceName, "Hidden"];
                } else if (params.sas_visibility != "undefined" && params.sas_visibility == true && sect_id == sas) {
                    var labels = ["Type:Maintenance", "Status:" + "New", "Name:" + params.maintenanceName, "ShowInHomepage"];
                } else {
                    var labels = ["Type:Maintenance", "Status:" + "New", "Name:" + params.maintenanceName];
                }
                var maintenanceStart = "Maintenance Start: " + params.startTime.date + " " + params.startTime.time + " ";
                var maintenanceEnd = "Maintenance End: " + params.endTime.date + " " + params.endTime.time + " ";
                article.title = params.maintenanceName + " " + " " + params.startTime.date;
                article.body = "<strong>" + maintenanceStart + "</strong><br><strong>" + maintenanceEnd + "</strong><br><br>" + params.maintenanceDetails;
                article.author_id = globalsupport_user_id;
                obj.article = article;
                obj.notify_subscribers = params.notifications;
                obj.article.label_names = labels;
                var obj_string = JSON.stringify(obj);
                setTimeout(function() {
                    $.ajax({
                        url: "/api/v2/help_center/sections/" + sect_id + "/articles.json",
                        method: "POST",
                        data: obj_string,
                        contentType: "application/json",
                        error: function(e) {
                            console.log("error");
                        },
                        success: function(e) {
                            if (final) {
                                $('.btn').removeAttr("disabled");
                                $("#new-scheduled-maintenance-modal").fadeOut("fast");
                                $('#incident-' + sect_id + ' .incident-list').html("");
                                get_incident_list(sect_id);
                            }
                        }
                    });
                }, 500);
                refresh = true;
            }
            // Delete template
            $('.delete-template-btn').on("click", function() {
                if (confirm("Delete this template?")) {
                    var template = $(this).parent().parent().find("select.update-template-dropdown").val();
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + template + '.json',
                        type: 'DELETE',
                        success: function() {
                            setTimeout(function() {
                                populateTemplate()
                            }, 2000)
                        }
                    });
                    $('.close-modal').click();
                }
            })
            $('.incident-nav-cont').on("click", ".incident-nav-item:not(:last-child)", function(event) {
                var section = $(this).children("span").text();
                get_incident_list(section);
                $('.incident-list-cont').hide();
                $('#incident-' + section).show();
                $('.incident-nav-item').removeClass("incident-nav-item-active");
                $(this).addClass("incident-nav-item-active");
            });
            $('#goto-incidents').on("click", function() {
                $('main.messageBoard').children("div").not(".container-divider").hide();
                $('.incident-container').show();
                $('.incident-nav-item').first().click();
                $('.message-board-container nav.user-nav a').removeClass('active');
                $(this).addClass('active');
            });
            $('#goto-platforms').on("click", function() {
                if ($('.platform-list-cont').text() == "") {
                    var category = localStorage.getItem("category");
                    get_platforms(category);
                }
                $('main.messageBoard').children("div").not(".container-divider").hide();
                $('.platform-container').show();
                $('.message-board-container nav.user-nav a').removeClass('active');
                $(this).addClass('active');
            });
            $('#goto-subscribers').on("click", function() {
                $('main.messageBoard').children("div").not(".container-divider").hide();
                $('.subs-container').show();
                $('.message-board-container nav.user-nav a').removeClass('active');
                $(this).addClass('active');
            });
            $('#goto-status, .message-board-container .logo').on("click", function(event) {
                event.preventDefault();
                hideMessageBoardContainer();
            });
            $(document).keydown(function(e) {
                if (e.keyCode == 27) {
                    hideMessageBoardContainer();
                }
            });

            function hideMessageBoardContainer() {
                $('#back-incident-list').click();
                $('.message-board-container').css('left', '100%');
                $('html').css('overflow', 'auto');
                $('.messageBoard > div').fadeOut("slow");
                $('.modal-backdrop').remove();
                $('.wrapper').css('filter', 'none');
                $('.incident-nav-item').removeClass('incident-nav-item-active');
                if (refresh) {
                    location.reload();
                }
            }
            $('#goto-messageBoard-admin').on("click", function() {
                $('#back-incident-list').click();
                $('.message-board-container').css('left', '20%');
                $('html').css('overflow', 'hidden');
                $('#goto-incidents').click();
                $('body').append('<div class="modal-backdrop fade in" style="background:rgba(0,0,0,0.4);z-index:1"></div>');
                $('.wrapper').css('filter', 'blur(2px)')
            });
            $('#hide_incidents').on("click", function() {
                $('.incident-container').hide();
                $('.container').show();
            });
            $('#create-platform-btn').on("click", function(event) {
                $('body').append('<div class="modal" id="create-platform-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>Create New Platform </h1></div> <div class="modal-body"><div class="modal-body-detail platform-name"><label>Platform Name</label><br><input type="text" placeholder="Platform Name"> <span class="info"> </span> </div> <div class="modal-body-detail platform-display-name"><label>Display Name</label><br><input type="text" placeholder="Display Name"><span class="info"></span></div><div class="modal-body-detail platform-user-segment"><label>User Segment</label><br><select><option value="">Visible to everyone</option><option value="526223">Signed-in users</option><option value="526203">Agents and managers</option></select><span class="info">User segments are groups of users who can view content in your Status Page.</span></div></div><div class="modal-footer"><button class="btn btn-primary" id="create-new-platform">CREATE PLATFORM </button></div></div></div>'),
                    $('#create-platform-modal').fadeIn("fast")
            });
            $('.incident-container').on("click", ".incident-item-delete, #incident-item-delete", function(event) {
                if (confirm("Delete this incident?")) {
                    var incident = $(this).parent().find(".hide").text();
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '.json',
                        type: 'DELETE'
                    });
                    $(this).closest(".incident-list-item").remove();
                    refresh = true;
                }
            });
            $('.incident-container').on("click", ".incident-item-archive", function(event) {
                var incident = $(this).closest("div").find("span.hide").text();
                if ($(this).text() == "Archive") {
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                        type: 'POST',
                        data: {
                            "label": {
                                "name": "Archived"
                            }
                        }
                    })
                    $(this).html("Unarchive").removeClass("activate").addClass("activated")
                } else {
                    $.get('/api/v2/help_center/articles/' + incident + '/labels.json', function(labels) {
                        for (var q = 0; q < labels.labels.length; q++) {
                            if (labels.labels[q].name == "Archived") {
                                $.ajax({
                                    url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[q].id + '.json',
                                    type: 'DELETE'
                                })
                            }
                        }
                    });
                    $(this).html("Archive").removeClass("activated").addClass("activate")
                }
                refresh = true;
            });
            $('.incident-container').on("click", ".incident-item-hide", function(event) {
                var incident = $(this).closest("div").find("span.hide").text();
                if ($(this).text() == "Hide") {
                    $.get('/api/v2/help_center/articles/' + incident + '/labels.json', function(labels) {
                        for (var q = 0; q < labels.labels.length; q++) {
                            if (labels.labels[q].name == "ShowInHomepage") {
                                $.ajax({
                                    url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[q].id + '.json',
                                    type: 'DELETE'
                                })
                            }
                        }
                    });
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                        type: 'POST',
                        data: {
                            "label": {
                                "name": "Hidden"
                            }
                        }
                    })
                    $(this).html("Show").removeClass("activated").addClass("activate")
                } else {
                    $.get('/api/v2/help_center/articles/' + incident + '/labels.json', function(labels) {
                        for (var q = 0; q < labels.labels.length; q++) {
                            if (labels.labels[q].name == "Hidden") {
                                $.ajax({
                                    url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[q].id + '.json',
                                    type: 'DELETE'
                                })
                            }
                        }
                    });
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                        type: 'POST',
                        data: {
                            "label": {
                                "name": "ShowInHomepage"
                            }
                        }
                    })
                    $(this).html("Hide").removeClass("activate").addClass("activated")
                }
                refresh = true;
            });
            $('.incident-view-page').on("click", "#delete-incident-btn", function(event) {
                if (confirm("Delete this incident?")) {
                    var incident = $(this).find("span.hide").text();
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + incident + '.json',
                        type: 'DELETE'
                    });
                    if ($('.messageBoard .incident-view-page').is(":visible")) {
                        $('.incident-view-page').html("").hide();
                        $('.incident-container').show();
                        var section = $('.incident-nav-item-active').children("span").text();
                        setTimeout(function() {
                            $('#incident-' + section + ' .incident-list').html("");
                            get_incident_list(section);
                        }, 1000);
                        refresh = true;
                    } else {
                        setTimeout(function() {
                            location.reload()
                        }, 500)
                    }
                }
            });
            $('.incident-container, .incident-view-page').on("click", ".incident-item-view", function(event) {
                $(this).css('cursor', 'progress');
                $(this).attr('disabled', 'disabled');
                var incident_id = $(this).parent().find(".hide").text();
                view_incident(incident_id);
            });
            $('.incident-view-page').on("click", "#update-incident-btn", function(event) {
                if ($('.incident-nav-item.incident-nav-item-active span').text() === '201265859') {
                    $('#updateMessage').css('background-color', '#FFFDF6');
                } else if ($('a.active span').text() === '201265859') {
                    $('#updateMessage').css('background-color', '#FFFDF6');
                }
            });
            $('.incident-view-page, .incident-container').on("click", "#update-incident-btn", function(event) {
                $(this).attr('disabled', 'disabled');
                var incidentID = $(this).children('.hide').text(),
                    platform = $(this).children('#platform_id').text(),
                    htmlElementIncident = "",
                    relatedIncidentCheckbox = "",
                    relatedIncidentList = [];
                currentIternalIncidentID = incidentID;

                $.get('https://support.sizmek.com/api/v2/help_center/en-us/articles/' + incidentID).done(function(data) {
                    var currentIncident = data.article,
                        label = data.article.label_names,
                        labelLength = label.length,
                        title = data.article.title;
                    for (var x = 0; x < labelLength; x++) {
                        if (label[x].includes("RelatedIncidents:")) {
                            var relatedIncidentsTag = label[x].replace(/RelatedIncidents:/g, "");
                            var related_incidents = relatedIncidentsTag.split(" ");
                        }
                    }
                    if(related_incidents){
                         related_incidents = related_incidents.filter(function(data){
                            return data !== "";
                        })
                        htmlElementIncident += '<div id="related-incidents-container"><label id="related-incidents-label">Related Incidents:</label>';
                        relatedIncidentCheckbox += '<div id="relatedIncidentAffected"><label>Related Incidents Affected</label><div class="component-container">';
                        for (var index = 0; index < related_incidents.length; index++) {
                        (function(x) {
                            $.get('/api/v2/help_center/articles/' + related_incidents[x] + '.json').done(function(data) {
                                relatedIncidentList.push(data.article);
                                if (x + 1 === related_incidents.length) {
                                    (function() {
                                        if (relatedIncidentList.length === related_incidents.length) {
                                            instantiateDOM();
                                        } else {
                                            setTimeout(arguments.callee, 100);
                                        }
                                    })()
                                }
                            });
                        })(index);
                    }
                    }else{
                        openModal(title);
                    }
                    function instantiateDOM() {
                        relatedIncidentList.forEach(function(data) {
                            var j = data.section_id;
                            section = j === 360000037612 ? "MDX 2.0" : j === 202580163 ? "Sizmek Advertising Suite" : j === 360000037572 ? "DSP" : j === 360000041291 ? "DMP" : j === 201265859 ? "Internal" : "";
                            htmlElementIncident += '<div class="incident-item-action" id="related-incident"><a class="incident-item-view" href="/hc/en-us/articles/' + data.id + '" id="related-incident-span">' + section + '</a><span>' + data.id + '</span></div>';
                            section != "Internal" ? relatedIncidentCheckbox += '<div class="component"><input class="affected-component-' + j + '" type="checkbox" value="' + data.id + '" checked><span>' + section + '</span><span id="incident-title" style="display:none;">' + data.title + '</span></div>' : currentIternalIncidentID = data.id, currentIternalIncidentTitle = data.title;
                            if(relatedIncidentList.length === 1 && section == "Internal"){
                                relatedIncidentCheckbox = "";
                            }
                        });
                        if(relatedIncidentList.length > 1){
                            relatedIncidentCheckbox += '</div>';
                        }
                        htmlElementIncident += "</div>";
                        openModal(title);
                    }
                });
                function openModal(title) {
                    $('body').append('<div class="modal" id="update-incident-modal"><div class="modal-content"><div class="modal-header"><button class="close close-modal">X</button><h1>Update Incident Status</h1></div> <div class="modal-body"> <div class="modal-body-detail"><label>Incident Status</label> <div class="status-choices"> <input type="radio" id="sc1" name="status-choices" value="Investigating"> <label class="radio-label" for="sc1">Investigating</label> <input type="radio" id="sc2" name="status-choices" value="Identified"><label class="radio-label" for="sc2">Identified </label> <input type="radio" id="sc3" name="status-choices" value="Monitoring"> <label class="radio-label" for="sc3">Monitoring</label> <input type="radio" id="sc4" name="status-choices" value="Resolved"> <label class="radio-label" for="sc4">Resolved </label> </div> </div><div class="modal-body-detail incident-severity"><label>Incident Severity</label><br><select><option value="1">Operational</option><option value="3">Degraded Performance</option><option value="4">Minor Outage</option><option value="5">Major Outage</option></select></div><div id="update-internal-message" class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#fffdf6;"> <label style="margin-bottom: 10px;font-size:18px;">Internal Message </label><label class="gswitch" id="switch-internal"><input type="checkbox" id="internal-message-switch"><span class="gslider round"></span></label><div class="modalOptions" style="clear: both; display: block;margin-bottom:30px">Send alert to subscribers<label class="gswitch"><input type="checkbox" id="send-comment-notif"><span class="gslider round green"></span></label></div><textarea id="update-incident-body-internal" class="message-internal" placeholder="Message"></textarea> </div><div class="components-affected-update"></div><div id="no-internal-incident"class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#F5FDFE;display:none;"> <label style="margin-bottom: 10px;font-size:18px;">No Related Internal Incident</label></div><div id="update-external-message" class="message-external" class="modal-body-detail" style="padding: 20px;border: 1px solid #ababab;border-radius: 5px; background-color:#F5FDFE; margin-top:20px;"> <label style="margin-bottom: 10px;font-size:18px;">External Message </label><label class="gswitch" id="switch-external" style="margin-top:-25px !important;"><input type="checkbox" id="external-message-switch"><span class="gslider round"></span></label><div class="modalOptions" style="clear: both; display: block;margin-bottom:30px;">Send alert to subscribers<label class="gswitch"><input type="checkbox" id="send-comment-notif"><span class="gslider round green"></span></label></div><textarea id="update-incident-body-external" placeholder="Message"></textarea> </div></div><div class="modal-footer"><button class="btn btn-primary" id="update-incident-status">UPDATE STATUS<span class="hide">' + incidentID + '</span><span id="incident-title" style="display:none;">' + title + '</span></button></div></div></div>');
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
                    $('#update-incident-modal').find('textarea').val("");
                    if ($(".incident-container").css('display') == 'block') {
                        if (!($("#related-incident").is(':visible'))) {
                            $(".modal-content .modal-footer").prepend(htmlElementIncident);
                        }
                    } else {
                        $(".modal-content .modal-footer").prepend(htmlElementIncident);
                    }
                    if (!($("#relatedIncidentAffected").is(':visible'))) {
                        $('.components-affected-update').prepend(relatedIncidentCheckbox);
                    }
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
                    if (platform == sas_internal) {
                        if (!($('#globalNoficationLabel').is(':visible'))) {
                            $('<div id="globalNoficationLabel" ><label style="margin-bottom: 10px;font-size:18px;">Global Notifications </label><div class="modal-body-detail global-notifications" style="clear: both; display: block;margin-bottom:30px">Subscribe globalnotifications@sizmek.com.<label class="gswitch"><input type="checkbox" class="subscribe-global-notif"><span class="gslider round green"></span></label></div></div>').insertAfter('.modalOptions');
                        }
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
                            $("#update-internal-message #send-comment-notif,#update-internal-message  .subscribe-global-notif").prop('checked', true);
                            $("#update-internal-message > div").fadeIn();
                        } else {
                            $("#update-internal-message #send-comment-notif,#update-internal-message  .subscribe-global-notif").prop('checked', false);
                            $("#update-internal-message > div").fadeOut();
                        }
                    });
                    $('#external-message-switch').click(function() {
                        if ($(this).is(':checked')) {
                            $("#update-external-message #send-comment-notif,#update-external-message .subscribe-global-notif").prop('checked', true);
                            $("#update-external-message > div").fadeIn();
                        } else {
                            $("#update-external-message #send-comment-notif,#update-external-message .subscribe-global-notif").prop('checked', false);
                            $("#update-external-message > div").fadeOut();
                        }
                    })
                }
            });
            $('.incident-view-page').on("click", "#update-incident-btn", function(event) {
                if ($('.incident-nav-item.incident-nav-item-active span').text() === '201265859') {
                    $('#updateMessage').css('background-color', '#FFFDF6');
                } else if ($('a.active span').text() === '201265859') {
                    $('#updateMessage').css('background-color', '#FFFDF6');
                }
            });
            $('.incident-view-page, .incident-container').on("click", "#update-maintenance-btn", function(event) {
                var incident = $(this).children(".hide").text(),
                    platform = $(this).children("#platform_id").text(),
                    start_date = $('.incident-view-page .incident-list-item:last-child .incident-item-cont > span strong:first').text(),
                    end_date = $('.incident-view-page .incident-list-item:last-child .incident-item-cont > span strong:nth-child(3)').text(),
                    start_date = start_date.replace("Maintenance Start: ", "").split(" ", 2),
                    end_date = end_date.replace("Maintenance End: ", "").split(" ", 2);
                $('html').css('overflow', 'hidden');
                $('body').append('<div class="modal" id="update-incident-modal"> <div class="modal-content"> <div class="modal-header"><button class="close close-modal">X</button><h1>Update Maintenance Status </h1></div> <div class="modal-body"> <div class="modal-body-detail"> <label>Maintenance Status </label> <div class="status-choices"> <input type="radio" id="mc1" name="status-choices" value="New"> <label class="radio-label" for="mc1">New </label> <input type="radio" id="mc2" name="status-choices" value="Updated"> <label class="radio-label" for="mc2">Updated </label> <input type="radio" id="mc3" name="status-choices" value="Completed"> <label class="radio-label" for="mc3">Completed </label> </div> </div> <div class="modal-body-detail"> <label>Message </label> <br> <textarea id="update-incident-body" placeholder="Message"> </textarea> </div> <div> <input type="checkbox" id="send-time"> <label for="send-time" style="font-weight: 400;font-size: 15px;">Update time. </label> </div> <div class="maintenance-start"> <label>Maintenance Start Time </label> <div class="maintenance-time"> <input disabled type="date" value="' + start_date[0] + '"> <select disabled class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="maintenance-end"> <label>Maintenance End Time </label> <div class="maintenance-time"> <input disabled value="' + end_date[0] + '" type="date"> <select disabled class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="modal-body-detail"> <label>Notifications </label> <br> <input type="checkbox" checked id="send-comment-notif"> <label for="send-comment-notif" style="font-weight: 400">Send alert to subscribers about this update. </label></div></div><div class="modal-footer"><button class="btn btn-primary" id="update-maintenance-status">UPDATE STATUS <span class="hide">' + incident + ' </span> </button></div></div></div>'),
                    populateTime();
                $('textarea#update-incident-body').ckeditor();
                CKEDITOR.instances["update-incident-body"].on("instanceReady", function(evt) {
                    setTimeout(function() {
                        CKEDITOR.instances["update-incident-body"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body"]).toggleTracking(false, false);
                        $('#update-incident-modal').find('textarea').val("");
                        $('#update-incident-modal').fadeIn("fast");
                    }, 300);
                })
                $('#update-incident-modal .maintenance-start .time-select').val(start_date[1]);
                $('#update-incident-modal .maintenance-end .time-select').val(end_date[1]);
                if (platform == sas_internal) {
                    $('#update-incident-modal .maintenance-end').after('<div class="modal-body-detail global-notifications"><label>Global Notifications</label><br><input type="checkbox" checked class="subscribe-global-notif" id="subsribe-global-notifications"><span class="checkbox-label">Subscribe globalnotifications@sizmek.com.</span></div>')
                }
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
            $('body').on("click", "#create-new-platform", function(event) {
                $(this).attr("disabled", "disabled");
                var category = localStorage.getItem("category");
                var name = $('.platform-name input').val();
                var display = $('.platform-display-name input').val();
                var segment = $('.platform-user-segment select').val();
                if (segment == "") {
                    segment = null;
                }
                if (name == "" || display == "") {
                    alert("Please fill up all the fields.");
                    $(this).removeAttr("disabled");
                    return false
                }
                $.ajax({
                    url: '/api/v2/help_center/categories/' + category + '/sections.json',
                    type: 'POST',
                    data: {
                        "section": {
                            "locale": "en-us",
                            "name": name,
                            "description": display + " @component @status:1",
                            "user_segment_id": segment
                        }
                    },
                    success: function() {
                        $("#create-platform-modal").remove();
                        get_platforms(category);
                        $(this).removeAttr("disabled");
                    }
                });
            });

            function getIncidentTitle(incidentID) {
                return $.get('/api/v2/help_center/articles/' + incidentID + '/translations.json');
            }
            $('body').on('click', '#update-maintenance-status', function() {
                $(this).attr('disabled', 'disabled');
                var maintenanceID = $(this).children('.hide').text();
                var body = $('#update-incident-body').val();
                var notifySubscribers = $('#send-comment-notif').is(':checked');
                var newStatus = $('.status-choices input[name=status-choices]:checked').val();
                $.get('/api/v2/help_center/articles/' + maintenanceID + '/labels.json').done(function(labels) {
                    for (var ndx = 0; ndx < labels.labels.length; ndx++) {
                        if (labels.labels[ndx].name.indexOf('Status') > -1) {
                            $.ajax({
                                url: '/api/v2/help_center/articles/' + maintenanceID + '/labels/' + labels.labels[ndx].id + '.json',
                                type: 'DELETE'
                            });
                            break;
                        }
                    }
                    $.ajax({
                        url: '/api/v2/help_center/articles/' + maintenanceID + '/labels.json',
                        type: 'POST',
                        data: {
                            "label": {
                                "name": "Status:" + newStatus
                            }
                        }
                    });
                });
                $.ajax({
                    url: '/api/v2/help_center/articles/' + maintenanceID + '/comments.json',
                    type: 'POST',
                    data: {
                        "comment": {
                            "body": newStatus + " - " + body,
                            "author_id": globalsupport_user_id,
                            "locale": "en-us"
                        },
                        "notify_subscribers": notifySubscribers
                    }
                }).done(function() {
                    $('#update-incident-modal').fadeOut(500);
                    view_incident(maintenanceID);
                })
                if ($("#subsribe-global-notifications").is(":checked")) {
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + maintenanceID + '/subscriptions.json',
                        type: 'POST',
                        data: {
                            "subscription": {
                                "source_locale": "en-us",
                                "include_comments": true,
                                "user_id": globalnotif_user_id
                            }
                        }
                    });
                }
            })
            $('body').on("click", "#update-incident-status", function(event) {
                    $(this).attr("disabled", "disabled");
                    num_Incidents = 0;
                    incidentsUpdated = 0;
                    num_Incidents += $('.modal-body').find('.components-affected-update input[type="checkbox"]:checked').length;
                    var modal = $('.modal-body');
                    var incidentID = $(this).find("span.hide").text();
                    if ($("#internal-message-switch").is(':checked')) {
                        updateIncident(currentIternalIncidentID, currentIternalIncidentTitle, true);
                        num_Incidents++;
                    }
                    if($('#external-message-switch').is(':checked')){
                        modal.find('.components-affected-update input[type="checkbox"]:checked').each(function() {
                            updateIncident($(this).val(), $(this).parent().find('#incident-title').text(), false);
                        });
                    }
                    incidentID != currentIternalIncidentID && (updateIncident(incidentID, $(this).find('#incident-title').text(), false), num_Incidents++);
                function updateIncident(incident, incidentTitle, isInternal) {
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
                        var body = in_status + ":<br><br>" + mes_body;
                    }
                    if (in_status == undefined) {
                        alert("Please select status.");
                        $(this).removeAttr("disabled");
                        return false
                    }
                    if ($("#update-incident-modal .global-notifications input.subscribe-global-notif").is(":checked")){
                        $.ajax({
                            url: '/api/v2/help_center/sections/' + incident + '/subscriptions.json',
                            type: 'POST',
                            data: {
                                "subscription": {
                                    "source_locale": "en-us",
                                    "include_comments": true,
                                    "user_id": globalnotif_user_id
                                }
                            }
                        });
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
                    $.get('/api/v2/help_center/articles/' + incident + '/labels.json').done(function(labels) {
                        for (var q = 0; q < labels.labels.length; q++) {
                            (function(x) {
                                if (labels.labels[x].name.indexOf("Severity:") > -1) {
                                    var deleteSeverity = $.ajax({
                                        url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[x].id + '.json',
                                        type: 'DELETE'
                                    });
                                    deleteSeverity.then(function() {
                                        $.ajax({
                                            url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                                            type: 'POST',
                                            data: {
                                                "label": {
                                                    "name": "Severity:" + severity
                                                }
                                            }
                                        });
                                    }, function() {
                                        console.log("Error while Deleting Severity.");
                                    });
                                }
                                if (labels.labels[x].name.indexOf("Status:") > -1) {
                                    var deleteStatus = $.ajax({
                                        url: '/api/v2/help_center/articles/' + incident + '/labels/' + labels.labels[x].id + '.json',
                                        type: 'DELETE'
                                    });
                                    deleteStatus.then(function() {
                                        $.ajax({
                                            url: '/api/v2/help_center/articles/' + incident + '/labels.json',
                                            type: 'POST',
                                            data: {
                                                "label": {
                                                    "name": "Status:" + in_status
                                                }
                                            }
                                        });
                                    }, function() {
                                        console.log("Error while Deleting Status.");
                                    });
                                }
                                if (x + 1 === labels.labels.length) {
                                    var postComment = $.ajax({
                                        url: '/api/v2/help_center/articles/' + incident + '/comments.json',
                                        type: 'POST',
                                        data: {
                                            "comment": {
                                                "body": body,
                                                "author_id": globalsupport_user_id,
                                                "locale": "en-us"
                                            },
                                            "notify_subscribers": notif
                                        }
                                    });
                                    postComment.done(function() {
                                        incidentsUpdated++;
                                        if (incidentsUpdated === num_Incidents) {
                                            view_incident(incidentID);
                                            $("#update-incident-modal").remove();
                                        }
                                        $(this).removeAttr("disabled");
                                        if ($('.messageBoard .incident-view-page').is(':visible')) {
                                            return false;
                                        } else {
                                            $('html').css('overflow', 'auto');
                                        }
                                    });
                                }
                            })(q);
                        }
                    });
                }
            });
            $('#create-incident-template-btn').on("click", function(event) {
                $(this).attr("disabled", "disabled");
                var template_name = $('#new-incident-template-modal .template-name input').val();
                var in_status = $('#new-incident-template-modal .incident-status select').val();
                var in_severity = $('#new-incident-template-modal .incident-severity select').val();
                var in_title = $('#new-incident-template-modal .incident-title input').val();
                var in_message = $('#new-incident-template-modal .incident-message textarea').val();
                var affected = "";
                $('#new-incident-template-modal input.affected-component:checkbox:checked').each(function() {
                    affected = $(this).val() + ',' + affected;
                });
                if (template_name == "" || in_title == "") {
                    alert("Please fill up all the fields.");
                    $(this).removeAttr("disabled");
                    return false
                }
                if (affected == "") {
                    alert("Please select atleast one components.");
                    $(this).removeAttr("disabled");
                    return false
                }
                var body = in_title + "::::" + in_status + "::::" + in_severity + "::::" + in_message + "::::" + affected;
                $.ajax({
                    url: '/api/v2/help_center/sections/' + template_loc + '/articles.json',
                    type: 'POST',
                    data: {
                        "article": {
                            "title": "[Template]" + template_name,
                            "body": body,
                            "locale": "en-us",
                            "label_names": ["Type:Template", "For:Incident"],
                            "comments_disabled": true
                        },
                        "notify_subscribers": false
                    },
                    success: function() {
                        alert("Incident template saved.");
                        $(".modal").fadeOut("fast");
                        $('#create-incident-template-btn').removeAttr("disabled");
                        setTimeout(function() {
                            populateTemplate()
                        }, 2000)
                    }
                });
            });
            $('#update-incident-template-btn').on("click", function(event) {
                $(this).attr("disabled", "disabled");
                var template_id = $(this).parent().parent().find("select.update-template-dropdown").val();
                var template_name = $('#new-incident-template-modal .template-name input').val();
                var in_status = $('#new-incident-template-modal .incident-status select').val();
                var in_severity = $('#new-incident-template-modal .incident-severity select').val();
                var in_title = $('#new-incident-template-modal .incident-title input').val();
                var in_message = $('#new-incident-template-modal .incident-message textarea').val();
                var affected = "";
                $('#new-incident-template-modal input.affected-component:checkbox:checked').each(function() {
                    affected = $(this).val() + ',' + affected;
                });
                if (template_name == "" || in_title == "") {
                    alert("Please fill up all the fields.");
                    $(this).removeAttr("disabled");
                    return false
                }
                if (affected == "") {
                    alert("Please select atleast one components.");
                    $(this).removeAttr("disabled");
                    return false
                }
                var body = in_title + "::::" + in_status + "::::" + in_severity + "::::" + in_message + "::::" + affected;
                $.ajax({
                    url: '/api/v2/help_center/articles/' + template_id + '/translations/en-us.json',
                    type: 'PUT',
                    data: {
                        "translation": {
                            "title": "[Template]" + template_name,
                            "body": body
                        }
                    },
                    success: function() {
                        $(".modal").fadeOut("fast");
                        $('#update-incident-template-btn').removeAttr("disabled");
                        setTimeout(function() {
                            populateTemplate()
                        }, 2000)
                    }
                });
            });
            $('#create-maintenance-template-btn').on("click", function(event) {
                $(this).attr("disabled", "disabled");
                var template_name = $('#new-maintenance-template-modal .template-name input').val();
                var main_title = $('#new-maintenance-template-modal .maintenance-title input').val();
                var main_message = $('#new-maintenance-template-modal .maintenance-message textarea').val();
                var affected = "";
                $('#new-maintenance-template-modal input.affected-component:checkbox:checked').each(function() {
                    affected = $(this).val() + ',' + affected;
                });
                if (template_name == "" || main_title == "") {
                    alert("Please fill up all the fields.");
                    $(this).removeAttr("disabled");
                    return false
                }
                if (affected == "") {
                    alert("Please select atleast one components.");
                    $(this).removeAttr("disabled");
                    return false
                }
                var body = main_title + ":::: :::: ::::" + main_message + "::::" + affected;
                $.ajax({
                    url: '/api/v2/help_center/sections/' + template_loc + '/articles.json',
                    type: 'POST',
                    data: {
                        "article": {
                            "title": "[Template]" + template_name,
                            "body": body,
                            "locale": "en-us",
                            "label_names": ["Type:Template", "For:Maintenance"],
                            "comments_disabled": true
                        },
                        "notify_subscribers": false
                    },
                    success: function() {
                        alert("Maintenance template saved."),
                            $(".modal").fadeOut("fast"),
                            $('#create-maintenance-template-btn').removeAttr("disabled"),
                            setTimeout(function() {
                                populateTemplate()
                            }, 2000);
                    }
                });
            });
            $('#update-maintenance-template-btn').on("click", function(event) {
                $(this).attr("disabled", "disabled");
                var template_id = $(this).parent().parent().find("select.update-template-dropdown").val();
                var template_name = $('#new-maintenance-template-modal .template-name input').val();
                var main_title = $('#new-maintenance-template-modal .maintenance-title input').val();
                var main_message = $('#new-maintenance-template-modal .maintenance-message textarea').val();
                var affected = "";
                $('#new-maintenance-template-modal input.affected-component:checkbox:checked').each(function() {
                    affected = $(this).val() + ',' + affected;
                });
                if (template_name == "" || main_title == "") {
                    alert("Please fill up all the fields.");
                    $(this).removeAttr("disabled");
                    return false
                }
                if (affected == "") {
                    alert("Please select atleast one components.");
                    $(this).removeAttr("disabled");
                    return false
                }
                var body = main_title + ":::: :::: ::::" + main_message + "::::" + affected;
                $.ajax({
                    url: '/api/v2/help_center/articles/' + template_id + '/translations/en-us.json',
                    type: 'PUT',
                    data: {
                        "translation": {
                            "title": "[Template]" + template_name,
                            "body": body
                        }
                    },
                    success: function() {
                        $(".modal").fadeOut("fast"),
                            $('#update-maintenance-template-btn').removeAttr("disabled"),
                            setTimeout(function() {
                                populateTemplate()
                            }, 2000);
                    }
                });
            });
            $('.platform-list-cont').on("click", ".platform-item-open", function() {
                var name = $(this).closest(".incident-list-item").find(".incident-item-body h5").text();
                if (confirm($(this).text() + " " + name + " platform?")) {
                    var platform_id = $(this).closest("div").children("span").text();
                    var platform_status = $(this).closest("div").find("select").first().val();
                    var desc = $(this).closest(".incident-list-item").find(".incident-item-body span").text();
                    if ($(this).closest(".incident-list-item").find('.platform-open-content').text() == "Hide Content") {
                        var content = "@show_content ";
                    } else {
                        var content = "";
                    }
                    if ($(this).text() == "Enable") {
                        var description = name + desc + content + "@component @status:" + platform_status;
                        var status = "Disable",
                            op_class = "activated";
                    } else {
                        var description = name + desc + content + "@status:" + platform_status;
                        var status = "Enable",
                            op_class = "activate";
                    }
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + platform_id + '.json',
                        type: 'PUT',
                        data: {
                            "section": {
                                "description": description
                            }
                        }
                    });
                    $(this).html(status).prop('title', status + ' Platform').removeAttr("class").addClass("platform-item-open").addClass(op_class);
                    refresh = true;
                }
            });
            $('.platform-list-cont').on("click", ".platform-open-content", function() {
                var name = $(this).closest(".incident-list-item").find(".incident-item-body h5").text();
                if (confirm($(this).text() + " of " + name + "?")) {
                    var platform_id = $(this).closest("div").children("span").text(),
                        platform_status = $(this).closest("div").find("select").first().val(),
                        desc = $(this).closest(".incident-list-item").find(".incident-item-body span").text();
                    if ($(this).closest(".incident-list-item").find('.platform-item-open').text() == "Disable") {
                        var status = "@component ";
                    } else {
                        var status = "";
                    }
                    if ($(this).text() == "Show Content") {
                        var description = name + desc + status + "@show_content @status:" + platform_status;
                        var content = "Hide Content",
                            op_class = "activated";
                    } else {
                        var description = name + desc + status + "@status:" + platform_status;
                        var content = "Show Content",
                            op_class = "activate";
                    }
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + platform_id + '.json',
                        type: 'PUT',
                        data: {
                            "section": {
                                "description": description
                            }
                        }
                    });
                    $(this).html(content).prop('title', content).removeAttr("class").addClass("platform-open-content").addClass(op_class);
                    refresh = true;
                }
            });
            $('.platform-list-cont').on("click", ".platform-item-delete", function() {
                var name = $(this).closest(".incident-list-item").find(".incident-item-body h5").text();
                if (confirm("Delete " + name + " platform?")) {
                    $(this).css('cursor', 'progress');
                    var platform_id = $(this).closest("div").children("span").text();
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + platform_id + '.json',
                        type: 'DELETE'
                    });
                    $(this).closest(".incident-list-item").remove();
                    refresh = true;
                }
            });
            $('.platform-list-cont').on("change", "select.plat-segment", function() {
                var platform_id = $(this).closest("div").children("span").text();
                var user_segment = $(this).val();
                $.ajax({
                    url: '/api/v2/help_center/sections/' + platform_id + '.json',
                    type: 'PUT',
                    data: {
                        "section": {
                            "user_segment_id": user_segment
                        }
                    }
                });
                refresh = true;
            });
            $('.platform-list-cont').on("change", "select.plat-status", function() {
                var name = $(this).closest(".incident-list-item").find(".incident-item-body h5").text();
                var desc = $(this).closest(".incident-list-item").find(".incident-item-body span").text();
                var platform_id = $(this).closest("div").children("span").text();
                var platform_status = $(this).val();
                if ($(this).closest(".incident-list-item").find('.platform-open-content').text() == "Hide Content") {
                    var content = "@show_content ";
                } else {
                    var content = "";
                }
                if ($(this).closest(".incident-list-item").find('.platform-item-open').text() == "Disable") {
                    var status = "@component ";
                } else {
                    var status = "";
                }
                var description = name + desc + status + content + "@status:" + platform_status;
                $.ajax({
                    url: '/api/v2/help_center/sections/' + platform_id + '.json',
                    type: 'PUT',
                    data: {
                        "section": {
                            "description": description
                        }
                    }
                });
                $(this).css('background', 'linear-gradient(to right, #fff 88%,' + status_colors[platform_status - 1]);
                refresh = true;
            });
            $('.incident-view-page').on("click", ".edit_body a", function() {
                var start_date = $(this).closest('.incident-list-item').find('.incident-item-cont > span strong:first').text();
                var end_date = $(this).closest('.incident-list-item').find('.incident-item-cont > span strong:nth-child(3)').text();
                if (start_date != "" && end_date != "") {
                    var body = $(this).closest(".incident-list-item").find(".incident-item-cont span.hide").html().replace(start_date, "").replace(end_date, "");
                    var body = body.substr(body.indexOf("<br><br>") + 8);
                    var start_date = start_date.replace("Maintenance Start: ", "").split(" ", 2);
                    var end_date = end_date.replace("Maintenance End: ", "").split(" ", 2);
                    var time = '<div class="maintenance-start"> <label>Maintenance Start Time </label> <div class="maintenance-time"> <input type="date" value="' + start_date[0] + '"> <select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div> <div class="maintenance-end"> <label>Maintenance End Time </label> <div class="maintenance-time"> <input value="' + end_date[0] + '" type="date"> <select class="time-select"></select> </div> <span class="info">All times must be specified in EST - Eastern Standard Time(US &amp; Canada) </span> </div>';
                } else {
                    var body = $(this).closest(".incident-list-item").children(".incident-item-cont").children("span.hide").html();
                    var time = '';
                }
                $('body').append('<div class="modal" id="update-incident-message-modal"><div class="modal-content"><div class="modal-header"><button class="close close-modal">X</button><h1>Edit Message</h1></div> <div class="modal-body">' + time + '<div class="modal-body-detail"> <label>Message </label> <br> <textarea id="update-incident-body" placeholder="Message">' + body + '</textarea> </div></div><div class="modal-footer"><button class="btn btn-primary" id="update-body-message">UPDATE MESSAGE</button></div></div></div>');
                $('textarea#update-incident-body').ckeditor();
                CKEDITOR.instances["update-incident-body"].on("instanceReady", function(evt) {
                    setTimeout(function() {
                        CKEDITOR.instances["update-incident-body"].plugins.lite.findPlugin(CKEDITOR.instances["update-incident-body"]).toggleTracking(false, false);
                        $('#update-incident-message-modal').fadeIn("fast");
                    }, 300);
                });
                populateTime();
                $('html').css('overflow', 'hidden');
                $('#update-incident-message-modal .maintenance-start .time-select').val(start_date[1]);
                $('#update-incident-message-modal .maintenance-end .time-select').val(end_date[1]);
            });
            $('.incident-view-page').on("click", ".edit_update a", function() {
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
            $('body').on("click", "#update-incident-message-modal #update-body-message", function() {
                $(this).attr("disabled", "disabled");
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
                    url: '/api/v2/help_center/articles/' + incident_id + '/translations/en-us.json',
                    type: 'PUT',
                    data: {
                        "translation": {
                            "body": body
                        }
                    },
                    success: function() {
                        $("#update-incident-message-modal").remove();
                        view_incident(incident_id);
                    }
                });
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
                    url: '/api/v2/help_center/articles/' + incident_id + '/comments/' + update_id + '.json',
                    type: 'PUT',
                    data: {
                        "comment": {
                            "body": update_status + " - " + body
                        }
                    },
                    success: function() {
                        $("#update-incident-message-modal").remove();
                        view_incident(incident_id);
                    }
                });
            });
            $('body').on("click", ".delComment a", function() {
                var delConfirm = confirm("Delete comment?");
                var commentID = $(this).children('span.hide').text();
                var incident_id = $(".incident-nav-header").children("span.hide").text();
                if (delConfirm == true) {
                    $.ajax({
                        url: "/api/v2/help_center/articles/" + incident_id + "/comments/" + commentID + ".json",
                        type: 'DELETE',
                        success: function() {
                            location.reload();
                        }
                    });
                }
            });
            $('body').on("click", "#update-incident-modal .close-modal, #create-platform-modal .close-modal, #update-incident-message-modal .close-modal, #add-subscriber-report .close-modal", function(event) {
                $('.modal-footer #related-incidents-container').remove();
                $(this).closest(".modal").remove();
                if ($('.messageBoard .incident-view-page').is(':visible') || $('.messageBoard .platform-container').is(':visible') || $('.messageBoard .subs-container').is(':visible')) {
                    return false;
                } else {
                    $('html').css('overflow', 'auto');
                }
            });
            $('.close-modal').click(function() {
                $('.modal-footer #related-incidents-container').remove();
                $(this).closest(".modal").fadeOut("fast");
            });
            $('#new-incident-template').on("click", function() {
                cleanModal();
                $('#new-incident-template-modal').fadeIn("fast");
            });
            $('#new-maintenance-template').on("click", function() {
                cleanModal();
                $('#new-maintenance-template-modal').fadeIn("fast");
            });
            $('.incident-nav-search').on("keydown", function() {
                var search = $('.incident-nav-search').val();
                $('.incident-lists-item:visible').hide();
                $('.incident-lists-item div:contains("' + search + '")').show();
            });

            function get_incident_list(section) {
                $('#incident-' + section + ' .incident-list').html("");
                    $.get('/api/v2/help_center/sections/' + section + '/articles.json', function(incident) {
                        currentIncidents = $.merge(currentIncidents, incident.articles);
                        arrayChecker++;
                        var total_incident = incident.articles.length;
                        var getIncidentListStatus = "";
                        for (var x = 0; x < total_incident; x++) {
                            var label = incident.articles[x].label_names,
                                type = "",
                                archive = "Archive",
                                op_class = "activate",
                                hidden = "",
                                op_class2 = "";
                            for (var i = 0; i < label.length; i++) {
                                if (label[i].includes("Type:")) {
                                    type = label[i].replace("Type:", "")
                                }
                                if (label[i] == "Archived") {
                                    archive = "Unarchive";
                                    op_class = "activated";
                                }
                                if (label[i] == "Hidden") {
                                    hidden = "Show";
                                    op_class2 = "activate";
                                } else if (label[i] == "ShowInHomepage") {
                                    hidden = "Hide";
                                    op_class2 = "activated";
                                }
                                if (label[i].includes("Status:")) {
                                    getIncidentListStatus = label[i].replace("Status:", "").toUpperCase();
                                }
                            }
                            if (type != "Template" && type != "") {
                                var incident_id = incident.articles[x].id;
                                var title = incident.articles[x].title;
                                var url = incident.articles[x].html_url;
                                var date = incident.articles[x].created_at;
                                var date_created = new Date(date);
                                if (title[0] === "[") {
                                    title = title.slice(title.indexOf(']') + 1, title.length);
                                }
                                if (hidden != "") {
                                    var hidden = '</a><a class="incident-item-hide ' + op_class2 + '">' + hidden + '</a>';
                                }
                                if (section == sas) {
                                    $('#incident-' + section + ' .incident-list').append('<div class="incident-list-item"><div class="incident-item-body"><h5>' + getIncidentLabel(getIncidentListStatus) + title + '</h5><small>Posted on ' + date_created.toDateString() + " " + date_created.toLocaleTimeString() + '</small></div><div class="incident-item-action"><a class="incident-item-view">View ' + type + '</a>' + hidden + '<a class="incident-item-delete" id="incident-subscribe-button">Delete</a><a class="incident-subscribe-button" id="update-' + type.toLowerCase() + '-btn">Update<span class="hide">' + incident_id + '</span><span id="platform_id style="display:none;">' + section + '</span></a></div></div>');
                                } else {
                                    $('#incident-' + section + ' .incident-list').append('<div class="incident-list-item"><div class="incident-item-body"><h5>' + getIncidentLabel(getIncidentListStatus) + title + '</h5><small>Posted on ' + date_created.toDateString() + " " + date_created.toLocaleTimeString() + '</small></div><div class="incident-item-action"><a class="incident-item-view">View ' + type + '</a>' + hidden + '<a class="incident-item-archive ' + op_class + '">' + archive + '</a><a class="incident-subscribe-button" id="incident-item-delete">Delete</a><a class="incident-subscribe-button" id="update-' + type.toLowerCase() + '-btn">Update<span class="hide">' + incident_id + '</span><span id="platform_id" style="display:none;">' + section + '</span></a></div></div>');
                                }
                            }
                        }
                        paginateCurrentIncidents(section);
                    });
            }
            var paginate = {
                startPos: function(pageNumber, perPage) {
                    // determine what array position to start from
                    // based on current page and # per page
                    return pageNumber * perPage;
                },
        
                getPage: function(items, startPos, perPage) {
                    // declare an empty array to hold our page items
                    var page = [];
        
                    // only get items after the starting position
                    items = items.slice(startPos, items.length);
        
                    // loop remaining items until max per page
                    for (var i=0; i < perPage; i++) {
                        page.push(items[i]); }
        
                    return page;
                },
        
                totalPages: function(items, perPage) {
                    // determine total number of pages
                    return Math.ceil(items.length / perPage);
                },
        
                createBtns: function(totalPages, currentPage) {
                    // create buttons to manipulate current page
                    var pagination = $('<div class="pagination" />');
        
                    // add a "first" button
                    pagination.append('<span class="pagination-button">&laquo;</span>');
        
                    // add pages inbetween
                    for (var i=1; i <= totalPages; i++) {
                        // truncate list when too large
                        if (totalPages > 5 && currentPage !== i) {
                            // if on first two pages
                            if (currentPage === 1 || currentPage === 2) {
                                // show first 5 pages
                                if (i > 5) continue;
                            // if on last two pages
                            } else if (currentPage === totalPages || currentPage === totalPages - 1) {
                                // show last 5 pages
                                if (i < totalPages - 4) continue;
                            // otherwise show 5 pages w/ current in middle
                            } else {
                                if (i < currentPage - 2 || i > currentPage + 2) {
                                    continue; }
                            }
                        }
        
                        // markup for page button
                        var pageBtn = $('<span class="pagination-button page-num" />');
        
                        // add active class for current page
                        if (i == currentPage) {
                            pageBtn.addClass('active'); }
        
                        // set text to the page number
                        pageBtn.text(i);
        
                        // add button to the container
                        pagination.append(pageBtn);
                    }
        
                    // add a "last" button
                    pagination.append($('<span class="pagination-button">&raquo;</span>'));
        
                    return pagination;
                },
        
                createPage: function(items, currentPage, perPage) {
                    // remove pagination from the page
                    $('.pagination').remove();
        
                    // set context for the items
                    var container = items.parent(),
                        // detach items from the page and cast as array
                        items = items.detach().toArray(),
                        // get start position and select items for page
                        startPos = this.startPos(currentPage - 1, perPage),
                        page = this.getPage(items, startPos, perPage);
        
                    // loop items and readd to page
                    $.each(page, function(){
                        // prevent empty items that return as Window
                        if (this.window === undefined) {
                            container.append($(this)); }
                    });
        
                    // prep pagination buttons and add to page
                    var totalPages = this.totalPages(items, perPage),
                        pageButtons = this.createBtns(totalPages, currentPage);
        
                    container.after(pageButtons);
                }
            };
        
            // stuff it all into a jQuery method!
            $.fn.paginate = function(perPage) {
                var items = $(this);
        
                // default perPage to 5
                if (isNaN(perPage) || perPage === undefined) {
                    perPage = 5; }
        
                // don't fire if fewer items than perPage
                if (items.length <= perPage) {
                    return true; }
        
                // ensure items stay in the same DOM position
                if (items.length !== items.parent()[0].children.length) {
                    items.wrapAll('<div class="pagination-items" />');
                }
        
                // paginate the items starting at page 1
                paginate.createPage(items, 1, perPage);
        
                // handle click events on the buttons
                $(document).on('click', '.pagination-button', function(e) {
                    // get current page from active button
                    var currentPage = parseInt($('.pagination-button.active').text(), 10),
                        newPage = currentPage,
                        totalPages = paginate.totalPages(items, perPage),
                        target = $(e.target);
        
                    // get numbered page
                    newPage = parseInt(target.text(), 10);
                    if (target.text() == '«') newPage = 1;
                    if (target.text() == '»') newPage = totalPages;
        
                    // ensure newPage is in available range
                    if (newPage > 0 && newPage <= totalPages) {
                        paginate.createPage(items, newPage, perPage);
                        $(window).scrollTop();
                    }
                    $('.message-board-container').scrollTop(0);
                });
            };

            function paginateCurrentIncidents(section){
                var currentSection = $('#incident-'+section);
                var itemList = currentSection.find('.incident-list-item');
                itemList.paginate(20);
            }
            function get_platforms(category) {
                $('.platform-list-cont').html('');
                $.get('/api/v2/help_center/categories/' + category + '/sections.json', function(platforms) {
                    var a = 1;
                    for (var x = 0; x < platforms.count; x++) {
                        var platform_status = name = temp = "";
                        var description = platforms.sections[x].description;
                        var desc = description.split("@");
                        for (var i = 0; i < desc.length; i++) {
                            if (desc[i].indexOf("status") > -1) {
                                platform_status = desc[i].replace(/\s/g, "").replace("status:", "");
                            } else if (desc[i].indexOf("mdxnxt") > -1 || desc[i].indexOf("mdx2") > -1 || desc[i].indexOf("supportkb") > -1 || desc[i].indexOf("strikead") > -1) {
                                temp = temp + "@" + desc[i];
                            } else if (desc[i].indexOf("component") == -1 && desc[i].indexOf("show_content") == -1) {
                                name = desc[i];
                            }
                        }
                        if (description.indexOf("@component") > -1) {
                            var status = "Disable";
                            var op_class1 = "activated"
                        } else {
                            var status = "Enable";
                            var op_class1 = "activate"
                        }
                        if (description.indexOf("@show_content") > -1) {
                            var content = "Hide Content";
                            var op_class2 = "activated"
                        } else {
                            var content = "Show Content";
                            var op_class2 = "activate"
                        }
                        var id = platforms.sections[x].id;
                        var user_segment = platforms.sections[x].user_segment_id;
                        if ($('.platform-list-cont').append('<div class="incident-list-item"> <div class="incident-item-body"><h5>' + name + '</h5><span class="hide">' + temp + '</span></div> <div class="incident-item-action"><select class="select-picker plat-status" title="Platform Status"><option value="1">Operational</option><option value="2">Under Maintenance</option><option value="3">Degraded Performance</option><option value="4">Partial Outage</option><option value="5">Major Outage</option></select><select class="select-picker plat-segment" title="User Segment"><option value="">Visible to everyone </option><option value="526223">Signed-in users </option><option value="526203">Agents and managers </option></select><a title="' + status + ' Platform" class="platform-item-open ' + op_class1 + '">' + status + '</a><a title="' + content + '" class="platform-open-content ' + op_class2 + '">' + content + '</a><a title="Delete Platform" class="platform-item-delete">Delete</a><span>' + id + '</span> </div></div>')) {
                            $('.platform-list-cont .incident-list-item:nth-child(' + (a) + ') select.plat-segment').val(user_segment);
                            $('.platform-list-cont .incident-list-item:nth-child(' + (a) + ') select.plat-status').val(platform_status);
                        }
                        a++;
                    }
                    KSelect_status();
                    KSelect();
                });
            }
            ///////////////////////////
            $('.subs-nav-cont').on("click", ".subs-nav-item:not(:last-child)", function(event) {
                var section = $(this).children("span").text();
                get_subscriber_list(section);
                $('.subs-nav-item').removeClass("subs-nav-item-active");
                $(this).addClass("subs-nav-item-active");
            });
            $('#goto-subscribers').on("click", function() {
                $('main.messageBoard').children("div").not(".container-divider").hide();
                $('.subs-container').show();
                $('.subs-nav-item').first().click();
            });
            $('#hide_subscribers').on("click", function() {
                $('.subs-container').hide();
                $('.container').show();
            });
            $('.subs-container').on("click", ".subs-item-delete", function(event) {
                if (confirm("Remove this subscription?")) {
                    var section = $('.subs-nav-item-active span').text();
                    var id = $(this).closest("div").find("span").text();
                    $.ajax({
                        url: '/api/v2/help_center/sections/' + section + '/subscriptions/' + id + '.json',
                        type: 'DELETE'
                    });
                    remove_checked_subs(section, id);
                    $(this).closest(".subs-lists-item").remove();
                }
            });
            $('.subs-container').on("click", ".checked-email-subscribers", function(event) {
                if (confirm("Remove checked subscriptions?")) {
                    var section = $('.subs-nav-item-active span').text();
                    remove_checked_subs(section, -1);
                }
            });
            $('.subs-container').on("change", ".subs-list-header input:checkbox", function(event) {
                if (this.checked) {
                    $('.subs-lists-item:visible input:checkbox').click();
                } else {
                    $('.subs-lists-item:visible input:checkbox').removeAttr("checked").trigger("change");
                }
            });
            $('.subs-container').on("change", ".subs-lists .subs-lists-item:visible input:checkbox", function(event) {
                var section = $('.subs-nav-item-active span').text();
                if ($('#subs-' + section + ' .subs-lists-item input:checked').length > 0) {
                    if ($('.checked-email-subscribers').is(':visible')) {
                        return false
                    } else {
                        $('#subs-' + section).prepend('<a class="checked-email-subscribers incident-subscribe-button incident-save-button" style="position: absolute;padding: 5px 8px;margin-top:-30px">Remove selected</a>');
                    }
                } else {
                    $('#subs-' + section + ' .checked-email-subscribers').remove();
                }
            })
            $('#subs-item-add').on("click", function() {
                var user_emails = $('#subs-add-email').val().replace(/\s/g, ""),
                    email = user_emails.split(","),
                    x = 0;

                function start() {
                    if (x < email.length) {
                        if (validate_email(email[x])) {
                            check_user_email(email[x])
                        } else {
                            invalid_subscription(email[x]);
                            x++;
                            start()
                        }
                    } else {
                        $('#subs-add-email').val("");
                    }
                }
                start()

                function check_user_email(email) {
                    $.get('/api/v2/users/search.json?query=' + email, function(user) {
                        if (user.users.length > 0) {
                            var user_id = user.users[0].id;
                            add_subscriber(user_id);
                            $('input[type="email"]#subs-add-email').css('width', '220px');
                        } else {
                            invalid_subscription(email)
                        }
                        x++;
                        start()
                    });
                }
            });

            function invalid_subscription(email) {
                if (email != "") {
                    if ($('#add-subscriber-report').length == 0) {
                        $('.message-board-container').append('<div class="modal" id="add-subscriber-report"><div class="modal-content" style="max-width:500px"><div class="modal-header"><button class="close close-modal">X</button><h1 style="font-size:17px">Invalid User Email</h1></div><div class="modal-body"><div class="modal-body-detail">' + email + '</div></div><div class="modal-footer"></div></div></div>'),
                            $('#add-subscriber-report').fadeIn("fast")
                    } else {
                        $('#add-subscriber-report .modal-body-detail').append(", " + email),
                            $('#add-subscriber-report .modal-header h1').html("Invalid User Emails")
                    }
                }
            }

            function validate_email(email) {
                var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{2,3}\.[0-9]{1,3}\.[0-9]{2,3}\.[0-9]{2,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,3}))$/;
                return re.test(email);
            }
            $('input[type="email"]#subs-add-email').on("keyup", function(event) {
                var user_emails = $(this).val().replace(/\s/g, "");
                if (event.keyCode != 8) {
                    var email = user_emails.split(",");
                    var length = email.length;
                    if (validate_email(email[length - 1])) {
                        $(this).val(user_emails.replace(/\,/g, ", ") + ",");
                    }
                    if (length > 1) {
                        $(this).css('width', '60%');
                    }
                }
                if (user_emails == "") {
                    $(this).css('width', '220px');
                }
            });
            $('.subs-nav-search').on("keydown", function() {
                var search = $('.subs-nav-search').val();
                $('.subs-lists-item:visible').hide();
                $('.subs-lists-item div:contains("' + search + '")').show();
            });

            function get_subscriber_list(section) {
                $('.subs-list-cont').hide();
                $('#subs-' + section).show();
                if ($('#subs-' + section + ' .subs-lists').html() == "") {
                    $.get('/api/v2/help_center/en-us/sections/' + section + '/subscriptions.json', function(subscriber) {
                        var total_subs = subscriber.subscriptions.length;
                        var month = new Date().getMonth();
                        var this_month = 0;
                        for (var x = 0; x < total_subs; x++) {
                            var user_id = subscriber.subscriptions[x].user_id;
                            var id = subscriber.subscriptions[x].id;
                            var date = subscriber.subscriptions[x].created_at;
                            var date_created = new Date(date);
                            get_subscriber(user_id, id, date_created, section);
                            if (month == date_created.getMonth()) {
                                this_month++;
                            }
                        }
                        $('#subs-' + section + ' .subs-list-desc').html("Total " + total_subs + " email subscribers, " + this_month + " added this month.")
                    });
                }
            }

            function get_subscriber(user_id, id, date_created, section) {
                $.get('/api/v2/users/show_many.json?ids=' + user_id, function(email) {
                    var email = email.users[0].email;
                    $('#subs-' + section + ' .subs-lists').append('<div class="subs-lists-item"><input type="checkbox" value="' + id + '"><div>' + email + '</div><div>' + date_created.toDateString() + " " + date_created.toLocaleTimeString() + '</div><div><a class="subs-item-delete">Remove</a><span>' + id + '</span></div></div>');
                });
            }

            function get_total_subs(section) {
                $.get('/api/v2/help_center/en-us/sections/' + section + '/subscriptions.json', function(subscriber) {
                    var total_subs = subscriber.subscriptions.length;
                    var month = new Date().getMonth();
                    var this_month = 0;
                    for (var x = 0; x < total_subs; x++) {
                        var date = subscriber.subscriptions[x].created_at;
                        var date_created = new Date(date);
                        if (month == date_created.getMonth()) {
                            this_month++;
                        }
                    }
                    $('#subs-' + section + ' .subs-list-desc').html("Total " + total_subs + " email subscribers, " + this_month + " added this month.")
                });
            }

            function remove_checked_subs(section, removed) {
                $('.subs-lists-item:visible input:checkbox:checked').each(function() {
                    var id = $(this).closest("div").find("span").text();
                    if (id != removed) {
                        $.ajax({
                            url: '/api/v2/help_center/sections/' + section + '/subscriptions/' + id + '.json',
                            type: 'DELETE'
                        });
                        $(this).closest(".subs-lists-item").remove();
                    }
                });
                setTimeout(function() {
                    get_total_subs(section);
                    $('#subs-' + section + ' .checked-email-subscribers').remove();
                }, 1000);
            }

            function add_subscriber(user_id) {
                var section = $('.subs-nav-item-active span').text();
                $.ajax({
                    url: '/api/v2/help_center/sections/' + section + '/subscriptions.json',
                    type: 'POST',
                    data: {
                        "subscription": {
                            "source_locale": "en-us",
                            "include_comments": true,
                            "user_id": user_id
                        }
                    },
                    success: function(subscriber) {
                        get_total_subs(section);
                        var user_id = subscriber.subscription.user_id;
                        var id = subscriber.subscription.id;
                        var date = subscriber.subscription.created_at;
                        var date_created = new Date(date);
                        get_subscriber(user_id, id, date_created, section);
                    }
                });
            }
            // end of view_support_content tag access
        } else {
            $('.create-incident-modal-btn,.create-maintenance-modal-btn').remove()
        }
        $('.article-list > li > a').on("contextmenu", function(e) {
            return false;
        });
        $("body").on("click", ".article-list > li > a", function(event) {
            event.preventDefault();
            $(this).css('cursor', 'progress');
            var href = $(this).attr("href").split("/");
            var incident_id = href[href.length - 1].split("-", 1);
            view_incident(incident_id);
        });
        $('body').on("click", ".treeline a", function(event) {
            event.preventDefault();
            $(this).css('cursor', 'progress');
            var href = $(this).attr("href").split("/");
            var incident_id = href[href.length - 1].split("-", 1);
            view_incident(incident_id);
        });
        $('.incident-view-page').on("click", "#back-incident-list", function() {
            if ($(".messageBoard .incident-view-page").is(":visible")) {
                $('.incident-view-page').hide().html("");
                $('.incident-container').show();
            } else {
                $('.incident-view-page').hide().html("");
                if ($('#switchTag').val() == 'support_kb' && window.location.href.indexOf("/categories/" + message_board_loc) == -1) {
                    $('.section-tree, .article-list#show-data, .main-components-container').show();
                } else {
                    $('.section-tree, .article-list:not(#show-data), .main-components-container, .pagination ul').show();
                }
            }
            $(window).scrollTop(0);
        });

        function view_incident(incident_id) {
            var in_status="";
            if ($('.incident-container').is(':visible') || $('.messageBoard .incident-view-page').is(":visible")) {
                var view_page = '.messageBoard ';
                var containerClass = "related-incident-view";
            } else {
                var view_page = 'main:not(.messageBoard) ';
                var containerClass = "related-articles-view";
            }
            $.get('/api/v2/help_center/en-us/articles/' + incident_id).done(function(data) {
                var currentIncident = data.article;
                var label = data.article.label_names,
                    labelLength = label.length;
                for (var x = 0; x < labelLength; x++) {
                    if (label[x].includes("Type:")) {
                        var type = label[x].replace("Type:", "");
                    } else if (label[x].includes("Status:")) {
                        in_status = label[x].replace("Status:", "");
                    } else if (label[x].includes("Severity:")) {
                        var in_severity = label[x].replace("Severity:", "");
                    } else if (label[x].includes("RelatedIncidents:")) {
                        var relatedIncidentsTag = label[x].replace(/RelatedIncidents:/g, "");
                        var related_incidents = relatedIncidentsTag.split(" ");
                    }
                }

                var incident_check_status = in_status;
                var platform = currentIncident.section_id;
                var title = currentIncident.title;
                var date = currentIncident.created_at;
                var date_created = new Date(date);
                var body = currentIncident.body;
                var relatedIncidentSet = [];
                if(related_incidents !== undefined){
                     related_incidents = related_incidents.filter(function(data){
                        return data != "";
                    })
                    if(related_incidents.length){
                        var htmlElementView = '<div id="related-incidents-container" class="' + containerClass + '"><label id="related-incidents-label">Related Incidents:</label>';
                        for (var index = 0; index < related_incidents.length; index++) {
                            (function(x) {
                                $.get('/api/v2/help_center/articles/' + related_incidents[x] + '.json').done(function(data) {
                                    relatedIncidentSet.push(data.article);
                                    if (x + 1 === related_incidents.length) {
                                        (function() {
                                            if (related_incidents.length === relatedIncidentSet.length) {
                                                instantiateStringifiedDOM();
                                            } else {
                                                setTimeout(arguments.callee, 100);
                                            }
                                        })()
                                    }
                                });
                            })(index);
                        }
                    }else{
                        populateModal();
                    }
                }else{
                    populateModal();
                }


                function instantiateStringifiedDOM() {
                    relatedIncidentSet.forEach(function(data) {
                        if (data.section_id === 360000037612) {
                            section = "MDX 2.0";
                        } else if (data.section_id === 202580163) {
                            section = "Sizmek Advertising Suite";
                        } else if (data.section_id === 360000037572) {
                            section = "DSP";
                        } else if (data.section_id === 360000041291) {
                            section = "DMP";
                        } else if (data.section_id === 201265859) {
                            section = "Internal";
                        }
                        htmlElementView += '<div class="incident-item-action" id="related-incident"><a class="incident-item-view" href="/hc/en-us/articles/' + data.id + '">' + section + '</a><span>' + data.id + '</span></div>';
                    })
                    populateModal();
                }

                function populateModal() {
                    if (type == "Incident") {
                        var update_btn_id = "update-incident-btn";
                    } else {
                        var update_btn_id = "update-maintenance-btn";
                    }
                    if (title[0] === "[") {
                        title = title.slice(title.indexOf(']') + 1, title.length);
                    }
                    $(view_page + '.incident-view-page').html('<div class="incident-container-show"><div class="incident-navigation"> <div class="incident-nav-header"><div class="incident-header-title" id="incident-title-' + in_severity + '">' + getIncidentLabel(in_status.toUpperCase()) + title + '</div><span class="hide">' + incident_id + '</span></div><h3 class="sub-header">Previous Updates</h3></div> <div class="incident-list-cont show"> <div class="incident-list"><div class="incident-list-item"><div class="incident-item-body"><h5>Investigating</h5></div><div class="incident-item-cont">' + body + '<br><small class="small">Posted on ' + date_created.toDateString() + " " + date_created.toLocaleTimeString() + '</small><span class="hide">' + body + '<span></div><div class="edit_body"><a>Edit</a></div></div></div><a id="back-incident-list" class="plain-button"><br><span style="font-family:arial">←</span> Incidents</a></div></div>')
                    if (in_severity) {
                        $(view_page + '.incident-container-show .incident-header-title').css('color', status_colors[in_severity - 1]);
                    } else if (type == "Maintenance") {
                        $(view_page + '.incident-container-show .incident-header-title').css('color', 'rgb(52, 152, 219)');
                    }
                    $(view_page + '.incident-container-show .incident-header-title').css('font-size', '28px');

                    if (jQuery.inArray("view_support_content", HelpCenter.user.tags) > -1 && type != undefined) {
                        setTimeout(function() {
                            htmlElementView == undefined && (htmlElementView = '');
                            $(view_page + ".incident-view-page .incident-list-cont").append('<a id="delete-incident-btn" class="incident-subscribe-button incident-delete-button">DELETE<span class="hide">' + incident_id + '</span></a><a id=' + update_btn_id + ' class="incident-subscribe-button incident-update-button">Update<span class="hide">' + incident_id + '</span><span style="display:none" id="platform_id">' + platform + '</span></a>' + htmlElementView);
                        }, 200)
                    }
                    $.get('/api/v2/help_center/articles/' + incident_id + '/comments.json').done(function(comments) {
                        for (var x = comments.count - 1; x >= 0; x--) {
                            var update_id = comments.comments[x].id;
                            var date = comments.comments[x].updated_at;
                            var date_created = new Date(date);
                            var body = comments.comments[x].body;
                            var in_status = body.split(getDelim(body), 1);
                            var body = body.substr(body.indexOf(getDelimBody(body)) + 1);
                            $(view_page + '.incident-view-page .incident-list').prepend('<div class="incident-list-item"><div class="incident-item-body"><h5>' + in_status + '</h5></div><div class="incident-item-cont">' + body + '<br><small class="small">Posted on ' + date_created.toDateString() + " " + date_created.toLocaleTimeString() + '</small><span class="hide span-body">' + body + '</span></div><div class="edit_update"><a>Edit<span class="hide">' + update_id + '</span></a></div><div class="delComment"><a>Delete<span class="hide">' + update_id + '</span></a></div></div>');
                        }
                        $(view_page + '.incident-item-action a, .article-list a').css('cursor', 'pointer');
                        $(view_page + '.incident-container, ' + view_page + '.section-tree, ' + view_page + '.article-list, ' + view_page + '.main-components-container, .pagination ul').hide();
                        $(view_page + '.incident-view-page').fadeIn();
                        $(window).scrollTop(0);
                        if (jQuery.inArray("view_support_content", HelpCenter.user.tags) == -1 || type == undefined) { //user_apac
                            $('.edit_update, .edit_body, .delComment').remove();
                        }
                        if (incident_check_status == undefined) {
                            $('.incident-item-body').remove();
                        }
                        $(".incident-item-cont table:not([class*='msgboard'])").addClass("msgboard");
                    });
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
                }
            });
        }

        function subscription() {
            var platforms = JSON.parse(localStorage.getItem("platforms"));
            if (currentUser == "agent" || currentUser == "manager") {
                $.get('/api/v2/users/search.json?query=' + HelpCenter.user.email, function(user) {
                    var user_id = user.users[0].id,
                        total_page = 1;
                    for (var page = 1; page <= total_page; page++) {
                        $.get('/api/v2/help_center/users/' + user_id + '/subscriptions.json?page=' + page, function(subscriptions) {
                            for (var i = 0; i < subscriptions.subscriptions.length; i++) {
                                total_page = subscriptions.page_count;
                                var type = subscriptions.subscriptions[i].content_type;
                                var content = subscriptions.subscriptions[i].content_id.toString();
                                if (type == "Section" && jQuery.inArray(content, platforms) > -1) {
                                    $('#component-' + content).append('<span class="subs-id" style="display:none">' + subscriptions.subscriptions[i].id + '</span>'),
                                        $('#component-' + content + ' .article-subscribe').html("Unfollow").addClass('article-unsubscribe').removeClass('article-subscribe');
                                }
                            }
                            $('.component-loader').hide(),
                                $('.main-components-container').css("opacity", "1");
                            // $('.component > .article-subscribe, .component > .article-unsubscribe').fadeIn();
                        })
                    }
                });
            } else if (currentUser == "end_user") {
                for (var i = 0; i < platforms.length; i++) {
                    $.get('/api/v2/help_center/en-us/sections/' + platforms[i] + '/subscriptions.json', function(subscriptions) {
                        if (subscriptions.subscriptions.length > 0) {
                            $('#component-' + subscriptions.subscriptions[0].content_id).append('<span class="subs-id" style="display:none">' + subscriptions.subscriptions[0].id + '</span>'),
                                $('#component-' + subscriptions.subscriptions[0].content_id + ' .article-subscribe').html("Unfollow").addClass('article-unsubscribe').removeClass('article-subscribe');
                        }
                        $('.component-loader').hide(),
                            $('.main-components-container').css("opacity", "1");
                    })
                }
            }
        }
        $('body').on("click", ".component .article-subscribe", function() {
            if ($(this).text() == "Follow") {
                $(this).css('cursor', 'progress');
                var platform = $(this).parent().find("span.hide").text();
                var clicked = $(this);
                $.ajax({
                    url: '/api/v2/help_center/sections/' + platform + '/subscriptions.json',
                    type: 'POST',
                    data: {
                        "subscription": {
                            "source_locale": "en-us",
                            "include_comments": true
                        }
                    },
                    success: function(subscribe) {
                        clicked.parent().append('<span class="subs-id" style="display:none">' + subscribe.subscription.id + '</span>'),
                            clicked.html("Unfollow").addClass('article-unsubscribe').removeClass('article-subscribe');
                        clicked.css('cursor', 'pointer');
                    }
                })
            }
        });
        $('body').on("click", ".component .article-unsubscribe", function() {
            var platform = $(this).parent().find("span.hide").text();
            var subscription = $(this).parent().find("span.subs-id").text();
            var clicked = $(this);
            $.ajax({
                url: '/api/v2/help_center/sections/' + platform + '/subscriptions/' + subscription + '.json',
                type: 'DELETE'
            });
            clicked.parent().find("span.subs-id").remove(),
                clicked.html("Follow").addClass('article-subscribe').removeClass('article-unsubscribe');
        });
    } //End Of messageBoard
    //KSelect
    function KSelect_status() {
        $('.plat-status:visible').each(function() {
            $(this).hide().addClass("k-selected").removeClass("select-picker");
            var selected = $(this).val();
            $(this).before('<div class="k-select" tabindex="-1"><span></span><ul></ul></div>');
            $(this).find("option").each(function(i) {
                var option = $(this).html();
                var value = $(this).val();
                if (selected == value) {
                    $(this).parent().prev(".k-select").find("span").first().html('<i class="fa fa-circle" style="color:' + status_colors[i] + '"></i>' + option);
                    $(this).parent().prev(".k-select").find("ul").append('<li style="display:none"><i class="fa fa-circle" style="color:' + status_colors[i] + '"></i>' + option + '<span>' + value + '</span></li>');
                } else {
                    $(this).parent().prev(".k-select").find("ul").append('<li><i class="fa fa-circle" style="color:' + status_colors[i] + '"></i>' + option + '<span>' + value + '</span></li>')
                }
            });
        })
    }

    function KSelect() {
        $('.select-picker').each(function() {
            $(this).prev(".k-select").remove();
            $(this).hide().addClass("k-selected").removeClass("select-picker");
            var selected = $(this).val();
            $(this).before('<div class="k-select" tabindex="-1"><span></span><ul></ul></div>');
            $(this).find("option").each(function() {
                var option = $(this).text();
                var value = $(this).val();
                if (selected == value) {
                    $(this).parent().prev(".k-select").find("span").first().html(option);
                    $(this).parent().prev(".k-select").find("ul").append('<li style="display:none">' + option + '<span>' + value + '</span></li>');
                } else {
                    $(this).parent().prev(".k-select").find("ul").append("<li>" + option + "<span>" + value + "</span></li>")
                }
            });
        })
    }
    // $('body').on("click", ".k-select", function() {
    //      if ($(this).find("ul").is(":visible")) {
    //          $(this).find("ul").slideUp("fast"), $(this).removeAttr('style')
    //      } else {
    //          $('.k-select ul').slideUp("fast"), $(this).find("ul").slideDown("fast"), $(this).css('border-radius', '3px 3px 0 0');
    //          if ($(this).next("select").is(".plat-status,.select-template-dropdown,.update-template-dropdown,.plat-segment")) {
    //              $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/03dd478487f9953b3e1b7f33423c5beef050c8f3.png)')
    //          } else {
    //              $(this).css('background-image', 'url(//theme.zdassets.com/theme_assets/539845/8945cb0bea0bf2bb8175cabd4019a3ef7bade132.png)')
    //          }
    //      }
    //  }),
    //
    //  $('body').on("click", ".k-select > ul > li", function() {
    //      var selected = $(this).clone().children("span").remove().end().html(),
    //          value = $(this).find("span").text();
    //      $(this).parent('ul').find('li').show(), $(this).hide(),
    //          $(this).parent().parent().find("span").first().html(selected),
    //          $(this).parent().parent().next("select.k-selected").val(value).trigger("change");
    //  });
    //
    // $("body").on("focusout", ".k-select", function() {
    //  $(this).find("ul").slideUp("fast"), $(this).removeAttr('style')
    // });
    //end of KSelect
    // // Search Guide
    //  if(window.location.href.indexOf("/search?") > -1 && localStorage.getItem("searchguide")==undefined){
    //  localStorage.setItem("searchguide",1),localStorage.setItem("treesettings",1);
    //  var sideheight = $(window).height();
    //  $('body').append('<div class="modal-backdrop" id="sguide-backdrop" style="display:none; opacity: 1;background-color: #0000008c;"><div class="callout"><div style="font-size: 18px;">You can filter your search by Platform here.</div><div><button class="article-subscribe" id="okay-sguide">Okay</button></div></div></div>');
    //  $('.hamburger:not(.is-active)').click();
    //      setTimeout(function(){
    //          $('html').addClass('stop-scrolling'),
    //          $('#sguide-backdrop').fadeIn(),
    //          $('#sideNavigation').css('height',sideheight+'px').css('position','inherit'),$('#filterContent > .k-select').addClass("guide-k-select");
    //    },3000);
    //
    //      $('#okay-sguide').on("click",function(){
    //          $('html').removeClass('stop-scrolling'),
    //          $('#sguide-backdrop').remove(),
    //          $('#sideNavigation').attr('style','margin-left: 0px;width:300px'),$('#filterContent > .k-select').removeClass("guide-k-select");
    //      })
    //  }
    //the message board admin adjusts depending on the zendesk nav-bar
    setTimeout(function() {
        var setSize = $('#navbar-container').css('height');
        if (setSize === '1px') {
            $('.message-board-container, .side-modal').css('top', '1px');
        } else {
            $('.message-board-container, .side-modal').css('top', '49px');
        }
        $('zd-hc-resizer').on('click', function() {
            $(this).data('clicked', true);
            var hideShow = $('#navbar-container').css('height');
            if ($('zd-hc-resizer').data('clicked')) {
                if (hideShow === '1px') {
                    $('.message-board-container, .side-modal').css('top', '49px');
                } else {
                    $('.message-board-container, .side-modal').css('top', '1px');
                }
            }
        });
    }, 2000);
    //Changing the url without reloading the page
    function changeURL(page, url) {

        if (typeof(history.pushState) != 'undefined') {
            var obj = {
                Page: page,
                Url: url
            };
            history.pushState(obj, obj.Page, obj.Url);
        } else {
            window.location.replace("https://support.sizmek.com/hc/en-us/articles/360003514372");
        }
    }
    setTimeout(function() {
        $('.article-list a').on('click', function() {
            var articleId = $(this).attr('href'),
                getURL = window.location.href,
                newURL;
            if (getURL === 'https://support.sizmek.com/hc/en-us/categories/201680143') {
                newURL = getURL.replace('categories/201680143', 'articles/');
                changeURL(articleId, newURL + articleId);
            } else if (getURL === 'https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board') {
                newURL = getURL.replace('categories/201680143-Message-Board', 'articles/');
                changeURL(articleId, newURL + articleId);
            } else {
                console.log('Incorrect URL address!');
            }
            $(this).addClass('active');
        });
    }, 1000);
    //returns back to the ajax category url
    $('.incident-view-page').on('click', '#back-incident-list', function() {
        var getURL = window.location.href;
        switch (getURL) {
            case 'https://support.sizmek.com/hc/en-us/categories/201680143':
                break;
            case 'https://support.sizmek.com/hc/en-us/categories/201680143-Message-Board':
                break;
            case 'https://support.sizmek.com/hc/en-us/sections/360000037612-Sizmek-MDX2-0-Message-Board':
                break;
            case 'https://support.sizmek.com/hc/en-us/sections/202580163-Sizmek-Advertising-Suite-Message-Board':
                break;
            case 'https://support.sizmek.com/hc/en-us/sections/360000037572-Sizmek-DSP-Message-Board':
                break;
            case 'https://support.sizmek.com/hc/en-us/sections/360000041291-Sizmek-DMP-Message-Board':
                break;
            case 'https://support.sizmek.com/hc/en-us/sections/201265859-Internal':
                break;
            default:
                history.back();
                break;
        }
        $('.article-list a').removeClass('active');
    });
});
