// Hashtag Feature
// Author: Lawrence C. Bonilla
// Ver 1.02
// Most of the css here are under messageBoardStyle.css
$(document).ready(function(){

var currentUser = HelpCenter.user.role;
var articleURL = window.location.href.split("--")[0];
var hashtagAdminURL = "https://support.sizmek.com/hc/en-us/articles/360004850231-Hashtag-Management";

if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
	$("#user-menu").append("<a id='hashAdmin' role='menuitem' href='https://support.sizmek.com/hc/en-us/articles/360004850231-Hashtag-Management'>Hashtag Management</a>");
}

if(window.location.href.indexOf("/articles/") > -1 && currentUser != "end_user" && currentUser != "anonymous"){		
	
	var currArticleID = window.location.href.split("articles/")[1].split("#")[0].split("-")[0].split("?")[0],
        currCategoryID,
        currSectionID;
	if (jQuery.inArray("view_support_content", HelpCenter.user.tags) !== -1) {
		$.get('/api/v2/help_center/articles/' + currArticleID + '.json', function(data){                  
            currSectionID = data.article.section_id;
            $.get('/api/v2/help_center/sections/' + currSectionID + '.json', function(data2){
                currCategoryID = data2.section.category_id;
                hashTag(currCategoryID, currSectionID); 
            });
        }); 
	
		$('.article-wrapper').prepend('<div class="incident-wrapper"></div>');
		$('.incident-wrapper').prepend('<div class="article-hashtags"></div>');
			
		$('body').on('click', '#hashBtn', function(){
			var hashWord,
				hashtagList = [];
					
			$('#hashTxt').toggle('fast');
			$("#hashTxt").focus();
			hashWord = $('#hashTxt').val().replace(/\s/g, '');
			if(hashWord != ''){
				hashtagList.push(hashWord);
				$('#hashTxt').val('');
			}
			for(var x = 0; x < hashtagList.length; x++){
				$.ajax({
					url: '/api/v2/help_center/articles/' + currArticleID + '/labels.json',
					type: 'POST',
					data: {
						"label": {
							"name": "Tags:" + hashtagList[x]
						}
					},
					success: function(){
						$(".tagList").remove();
						$(".tagList").html(hashTag(currCategoryID, currSectionID));						
						$("#hashTxt").css("display","inline-block").focus();
					}
				})
			}	
		});	
			
		// When pressing enter it triggers the hashBtn function
		// $('#hashBtn').trigger('click');
		// Javascript Keycode for 'Enter' is 13
		$('body').keypress(function(e){
			var key = e.which;
			if(key === 13 && $('#hashTxt').css('display') === 'inline-block'){
				$('#hashBtn').trigger('click');
				return false;
			}
		});
		
		$('body').on('click', '.cssCircle.minusSign', function(e){
			e.stopPropagation();
			var delTag = $(this).find('span.hide').text();
			$("#query").val("");
			$.ajax({
				url: '/api/v2/help_center/articles/' + currArticleID + '/labels/' + delTag + '.json',
				type: 'DELETE',
				success: function(){		
					$(".tagList").remove();
					$(".tagList").html(hashTag(currCategoryID, currSectionID));
				}
			})
		});
		
		$('body').on('click', 'a.hashTags', function(){
			var currTag = $(this).find('.tagName:first').text();
			$("#query").val(currTag);
			$("#query").focus();
			window.location.href = "https://support.sizmek.com/hc/en-us/search?utf8=%E2%9C%93&query=" + encodeURIComponent(currTag) + "&commit=Search";
		});
		// Starts Hashtag Admin Features
		if(window.location.href == hashtagAdminURL){
			removeUnnecessaries();
			$('<div class="hashtagHeader"></div>').insertAfter(".article-info");
			$('<div class="hashtagList body"></div>').insertAfter(".hashtagHeader");
			$("<div><input id='searchTag' type='text' placeholder='Im a search hashtag, and I have bugs...' style='width: 300px;'></div>").insertBefore(".user-nav");
			$('.hashtagHeader').append("<div class='searchContainer' style='float: right;'><input id='sortTagBtn' type='button' value='Sort tags by...'></div>");
			$('.searchContainer').append("<div class='sortOptions' style='display: none;'></div>");
			getHashtags();
				
			$("body").on("click", "#sortTagBtn", function(){
				if($(".sortOptions").css("display") == "none"){
					$(".sortOptions").css("display", "block");
					$(".sortOptions").append("<a class='optionBtn' href='#' data-value='alphaTag'>Alphabetical</a><br><a class='optionBtn' href='#' data-value='numTag'>No. of tags</a><br><a class='optionBtn' href='#' data-value='dateTag'>Update date</a>")
				} else {
					$(".sortOptions").css("display", "none");
					$(".sortOptions").empty();
				}
			});
				
			$("body").on("click", ".h3Tag", displayArticle);
			
			$('body').keypress(function(e){
				var key = e.which;
				if(key === 13 && $('#searchTag').is(":focus") == true && $('#searchTag').val() != ""){
					var scrollToView = $('.tag-' + $('#searchTag').val()),
						container = $("html,body");
				
					container.animate({
						scrollTop: (scrollToView.offset().top)
					}, 500);
						
					$("body").on("click", ".h3Tag", displayArticle);
					return false;
				}
			});
		}
	} // end view_support_content tag
} 
		function hashTag(currCategoryID, currSectionID){
			var hashtagList = [];
			$('.article-hashtags').append('<div class="tagList"><a id="hashBtn" style="font-weight: bold;">+</a><input list="recoHashtag" type="text" id="hashTxt" placeholder="Enter a term, keyword or tag..." style="display: none; margin: 0px 7px;"><datalist id="recoHashtag"></datalist></div>');
			$('.article-body.markdown p').append('<div class="hidden-tags hide"><ul></ul></div>');
				
			$.get('/api/v2/help_center/articles/' + currArticleID + '/labels.json', function(data){
				var hashNum = 1;
				for(var x = 0; x < data.labels.length; x++){
					if(data.labels[x].name.substr(0,5) == "Tags:"){
						$('<a class="hashTags" id="hash-' + hashNum + '"><div class="cssCircle minusSign" style="display: none; background: #ff0000;">&#8211;<span class="hide">' + data.labels[x].id + '</span></div><div class="tagName">#' +  data.labels[x].name.substr(5) + '</div><span class="hide">' + currCategoryID + '</span></a>').insertAfter('#recoHashtag');
						$('.hidden-tags ul').append('<li>' + data.labels[x].name + '</li>');
						hashNum++;
						hashtagList.push(data.labels[x].name.substr(5).toLowerCase());
					}			
				}
			});	
			hashComboList(hashtagList);
		}// end of hashTag function
			
		// The recommend tags to be listed are based on which category and latest date updated articles			
		function hashComboList(hashtagList){
			// The articles to be grabbed along with their labels are from the 1st page of the json		
			$.get('/api/v2/help_center/categories/' + currCategoryID + '/articles.json?sort_by=updated_at&sort_order=desc', function(data2){
				var tempList = [];
				for(var x = 0; x < data2.articles.length; x++){	
					for(var y = 0; y < data2.articles[x].label_names.length; y++){		
						if(data2.articles[x].label_names[y].substr(0,5) == "Tags:"){
							tempList.push(data2.articles[x].label_names[y].substr(5).toLowerCase());
						}
					}				
				}
					
				// List the recommendations tags that are not yet on the article yet
				var tempList = tempList.filter(function(n){
					return !this.has(n)
				}, new Set(hashtagList));
					
				// Removes the identical values in the list 
				var updateList = [];
				$.each(tempList, function(i, el){
					if($.inArray(el, updateList) == -1)  updateList.push(el);
				});
					
				for(var x = 0; x < updateList.length; x++){
					$('#recoHashtag').append('<option value="' + updateList[x] + '"/>')
				}
			});								
		} // end of hashComboList function
		
		function displayArticle(){
			var revealArticles = $(this).next(".expandingBlock"),
				listArticles = [];
			if(revealArticles.css("display") == "none"){
				revealArticles.slideDown("fast");
				revealArticles.css("display", "block");
			} else {
				revealArticles.slideUp("fast");
				setTimeout(function(){
					revealArticles.css("display", "none");
				}, 500);
			}
		}
		
		function removeUnnecessaries(){
			$('footer.article-footer').remove();
            $('form.comment-form').remove();
            $('.article-comments').remove();
			$('.article-body.markdown').remove();
			$('.article-hashtags').remove();
		}
		
		function sortTags(){
			
		}
		
		// Functions starting here go in a specific order to perform properly
		// 1st
		function getHashtags(){
			var hashtagList = [],
				updateList = [];
			$.get("/api/v2/help_center/articles/labels.json", function(data){
				hashtagList = $.map(data.labels, function(label){
					if(label.name.substr(0,5) == "Tags:"){
						return label.name.toLowerCase();
					}
				});
				$.each(hashtagList, function(i, el){
					if($.inArray(el, updateList) == -1) updateList.push(el);
				});
				updateList.sort();
				$(".hashtagHeader").append("<h2 style='margin-top: 20px;'>Hashtag Count: " + updateList.length + "</h2>");			
				$.each(updateList,function(x){
					var getTag = updateList[x].substr(5);
					$(".hashtagList.body").append("<h3 class='h3Tag'><p class='expanding'><a class='tag-" + getTag + "'>#" + getTag + "</a></p></h3><div class='expandingBlock' style='display: none; overflow: hidden;'><ul class='list-" + getTag + "'></ul>");
					getArticles(getTag);
				}); 
			});
		}
		
		// 2nd
		function getArticles(hashtag){
			$.get("/api/v2/help_center/articles/search.json?label_names=Tags:" + hashtag, function(data){
				var articles = data.results,
					articleCount = $('.expanding').find('.tag-' + hashtag);			
				articleCount.text( articleCount.text() + " (" + data.count + ")");
				for(var x = 0; x < articles.length; x++){
					$(".expandingBlock ul.list-" + hashtag).append("<li id='tagNum-" + x + "' style='background: #FAFAFA; overflow: auto;'><div class='tagData' style='float: left;'><a href='" + articles[x].html_url + "'>" + articles[x].name + "</a><span class='hide'>" + articles[x].id + "</span></div></li>");
					getSectCat(articles[x].id, articles[x].section_id, hashtag, x);
				}
			});
		}
		
		// 3rd
		// directChild is the location of a specific li element
		function getSectCat(articleID, sectionID, hashtag, index){	
			$.get("/api/v2/help_center/sections/" + sectionID + ".json", function(data){
				var directChild = ".expandingBlock ul.list-" + hashtag + " li#tagNum-" + index;
				$(directChild + " .tagData").append("<div class='sectCatName' style='font-size: 11px; margin-top: 7px;'><a href='" + data.section.html_url + "'>" + data.section.name + "</a></div>");
				$.get("/api/v2/help_center/categories/" + data.section.category_id + ".json", function(data2){
					$(directChild + " .sectCatName").prepend("<a href='" + data2.category.html_url + "'>" + data2.category.name + "</a> > ");
					getArticleTags(directChild, articleID, index);
				});
			}); 
		}
		
		// 4th
		function getArticleTags(directChild, currArticle, index){
			$('<div class="tagList" style="float: right;"><a id="hashBtn-' + index + '" style="font-weight: bold; font-size: 11px; display: inline-block;">+</a><input list="recoHashtag" type="text" id="hashTxt-' + index + '" placeholder="Enter a term, keyword or tag..." style="display: none; margin: 0px 7px; font-size: 11px; width: 200px;"><datalist id="recoHashtag"></datalist></div>').insertAfter(directChild + " .tagData");
			setTimeout(function(){
				$.get('/api/v2/help_center/articles/' + currArticle + '/labels.json', function(data){
				var hashNum = 1;
					for(var x = 0; x < data.labels.length; x++){
						if(data.labels[x].name.substr(0,5) == "Tags:"){
							$(directChild + " .tagList").append('<a class="hashTags" id="hash-' + hashNum + '" style="font-size: 11px;"><div class="cssCircle minusSignDiff" style="display: none; background: #ff0000;">&#8211;<span class="hide">' + data.labels[x].id + '</span></div><div class="cssCircle editTag" style="display: none; background: #1a75ff;">*<span class="hide">' + data.labels[x].id + '</span></div><div class="tagName">#' +  data.labels[x].name.substr(5) + '</div></a>');
							//$('.hidden-tags ul').append('<li>' + data.labels[x].name + '</li>');
							hashNum++;
						}			
					}
				});	
			}, 500);
		}
		// end of order of functions
})
