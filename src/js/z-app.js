// window.open wasn't opening a link in the system browser on iOS, so we have to use this function (requires phonegap.js)
function redirectToSystemBrowser(url) {
  // Wait for Cordova to load
  // open URL in default web browser
  var ref = window.open(encodeURI(url), '_system', 'location=yes');  
}

var hymn = 1;
var brand = "";
var espXML ={};
var frXML = {};
var deXML = {};
var pgXML = {};
var aslXML = {};
var path = config.path;
var vocal_path = config.vocal_path;

var browserLang = navigator.language;
var langOverride = "";
if(browserLang.indexOf("en")>-1){
	langOverride = "en";
}
if(browserLang.indexOf("fr")>-1){
	langOverride = "fr";
}
if(browserLang.indexOf("de")>-1){
	langOverride = "de";
}
if(browserLang.indexOf("es")>-1){
	langOverride = "es";
}
if(browserLang.indexOf("pg")>-1){
	langOverride = "pg";
}



var app = {
	brand: "",
	lang: "en",
	size: 16,
	contrast: "false",
	languages: null,
	hymn: 1,
	novocal: [100,115,121,124,127,129,133,136,147,171,183,186],
	storage: null,
	init: function(){
		app.getConfig();
		app.eventBindings();
		app.initJplayer();
		app.makeDropdown();

		app.startRandom();
	},
	changeStorage:function(key,val){
		app.storage.setItem(key, val);
	},
	getTitle: function(){
		var currentLang = app.lang;
		var currentTitle = "Hymnal";
		let langObj = 'menu_' + currentLang;
		if(window[langObj]){
			currentTitle = window[langObj].Hymnal;
		}
		
		$("#brand").html(currentTitle)
	},
	getConfig: function(){
		app.brand = config.brand;
	  	$("#brand em").text(app.brand);
	  	$("title").html(app.brand + " hymnal");

	  	var langs = config.langs;
	  	app.storage = window.localStorage;
		var langKey = "lang";
		var langValue = app.storage.getItem(langKey); // Pass a key name to get its value.
		//var value =app.lang;
		if(langValue==null || langValue==""){
			
			if(langOverride!==""){
				langValue = langOverride;
			} else {
				langValue = app.lang;
			}
			app.storage.setItem(langKey, langValue)
		}
		app.lang = langValue;
		app.getTitle();
		var fontKey = "size";
		var fontSize = app.storage.getItem(fontKey);
		if(fontSize==null){
			fontSize = "24";
			app.storage.setItem(fontKey, fontSize)
		}
		app.size = fontSize;
		$("#fontSlider").val(app.size)
		$(".main.ui-content, #copyrightPage").css("font-size", app.size + "px");

		var contrastKey = "contrast";
		var contrastVal = app.storage.getItem(contrastKey);
		if(contrastVal==null){
			contrastVal = "true";
			app.storage.setItem(contrastKey, contrastVal)
		}
		app.contrast = contrastVal;
		if(app.contrast=="true"){
			$("body").addClass("dim");
		}


		if(config.icon!=""){
			var icon = config.icon;
		    var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
		    link.type = 'image/x-icon';
		    link.rel = 'shortcut icon';
		    link.href = icon;
		    document.getElementsByTagName('head')[0].appendChild(link);
		}


		//console.log(app.storage)
		// Pass a key name and its value to add or update that key.
		//storage.removeItem(key) // Pass a key name to remove that key from storage.


	  	app.languages = langs.split(",");
	  	app.makeLanguageDropdown();
	  	$("#footerBot").addClass(app.lang)
	  	// set languages
	},
	eventBindings: function(){

		$(document).on("click", ".closeCopyright", function(){
			$("#copyrightPage").hide()
			$("#home").show();
		});

		$(document).on("click", ".tabs li a", function(){
			var id = $(this).attr("id");
			console.log("id?", typeof id)
			if(typeof id=="undefined"){
				id = $(this).attr("data-id");
				$(".tabContents>div").removeClass("current");
				$(".tabContents>div[class='" + id + "']").addClass("current");
				$(".tabs li").removeClass("current");
				$(this).closest("li").addClass("current");
			} else {
				id = id.substring(0, id.length-3);
				$(".tabs li").removeClass("current");
				$(this).closest("li").addClass("current");
				$(".tabContent").removeClass("active");
				$("#" + id).addClass("active")
			}
		});

		// contrast icon
	    $(".contrastIcon").on("click", function(){
	      $("body").toggleClass("dim");
	      contrastValue = false;
	      if($("body").hasClass("dim")){
	      	contrastValue = true;
	      }
	      app.storage.setItem("contrast", contrastValue);
	    });

	    $(".fontSizer").on("click", function(){
	    	$(".fontOptions").toggle()

	    });

	    $("#fontSlider").on("change", function(){
	    	var current = $(this).val();
	    	var $context = $(".ui-content");
		    app.size = current;
		    app.storage.setItem("size", current)
		    $context.css("font-size", current + "px");
	    });

	    // language selector
	    $(".custom-btns a").on("click", function(){
	      $(".custom-btns a").removeClass("current");
	      $(this).toggleClass("current");
	      $("#musicPlayer").hide();
	      $("#search").hide();
	      $("#numSearch").hide();
	      $("#copyrightPage").hide();
	      //$("#musicPlayer").hide();
	      $("#home").hide();

	      if($(this).attr("id")=="byNumber"){
	      	// search by number

	        $("#numSearch").show();
	        $(".hymnalSelection").hide();
	        $("#numSearch #nums").val("").focus();
	        $("#numSearch .overlay").css("height", $(window).height());
	      } else if($(this).attr("id")=="searcher") {
	      	// search by text

	        $("#search").show();
	        $(".hymnalSelection").hide();
	        $("#searchField").val("").focus();
	        $("#search .overlay").css("height", $(window).height());
	      } else if($(this).attr("id")=="information") {
	      	// show copyright
	         //console.log("copyright");
	         $("#copyrightPage").show().css("height", "100vh");
	         $("#copyrightPage .wrapForm")
	         .removeClass()
	         .addClass(app.lang)
	         .addClass("wrapForm");
	         $.ajax({
	         	url: "about.html",
	         	success: function(htm){
	         		$("#copyrightPage .wrapForm").html(htm)
	         	},
	         	error: function(e){
	         		console.log("about text fail", englishCopyright)
	         		$("#copyrightPage .wrapForm").html(englishCopyright);
	         	}
	         });
	         

	      } else {
	        $("#home").show();
	        /*
	        var valu = $("#hymnSelect").val();
	        valu = parseInt(valu, 10);
	        
	        var hymnURL = path + "?hymn="+valu;
	        var shareFB = "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(hymnURL);
	        $("#facebookShare").attr("href", shareFB);
	        var shareTW = "https://twitter.com/intent/tweet?source=webclient&text=check%20out%20this%20Sabbath%20song%3A%2" + encodeURIComponent(hymnURL);
	        $("#twitterShare").attr("href", shareTW);
	        $("#emailShareURL").attr("value",hymnURL);
	        $("#home").hide();
	        $("#sharePage").show();
	      	console.log(shareFB + "\n" + shareTW);
	        $("#aboutText").load("about.html");
	        */
	        
	        
	      }

	    });

	    $("#music").on("click", function(){
	    	$("#musicPlayer").toggleClass("active");
	    	$("#musicVocal").removeClass("active");
			$(this).toggleClass("active");
			if(!$(this).hasClass("active")) {

			    	$("#musicPlayer").hide();
			    	$('#jquery_jplayer_1').jPlayer("stop")

			  } else {
		          $('#jquery_jplayer_1').jPlayer("stop")
			    $("#musicPlayer").show();

			    var hymnNum = $("#hymnSelect").val();
			    var title = $("#hymnSelect option[value="+hymnNum+"]").html();
			    title = title.substring(title.indexOf(")")+1, title.length);
			    var songname = hymnNum;
			    
			    // get new source files for cogwa!
			    pathTemplate = path;
			    if(hymnNum){
			        hymn = pathTemplate + hymnNum + ".mp3";
			    } else {
			        hymn = pathTemplate + "001" + ".mp3";
			        //alert("no hymn selected");
			    }

			     $('#jquery_jplayer_1').jPlayer('setMedia', {
			        mp3: hymn
			     }).jPlayer("play");

			}
		});

		$("#musicVocal").on("click", function(){
			$("#musicPlayer").toggleClass("active");
			$("#music").removeClass("active");
			$(this).toggleClass("active");

			var hymnNum = $("#hymnSelect").val();
			var isValid = true;
			for(var j=0; j<app.novocal.length; j++){
				
				if(app.novocal[j].toString() == hymnNum){
					isValid=false;
				}
			}
			  if(!$(this).hasClass("active")) {

			    	$("#musicPlayer").hide();
			    	$('#jquery_jplayer_1').jPlayer("stop")

			  } else {
			        
			  		if(isValid){
			  			$('#jquery_jplayer_1').jPlayer("stop")
					    $("#musicPlayer").show();

					    


					    var title = $("#hymnSelect option[value="+hymnNum+"]").html();
					    title = title.substring(title.indexOf(")")+1, title.length);
					    var songname = hymnNum;
					    
					    // get new source files for cogwa!
					    pathTemplate = vocal_path;
					    if(hymnNum){
					        hymn = pathTemplate + hymnNum + ".mp3";
					    } else {
					        hymn = pathTemplate + "001" + ".mp3";
					        //alert("no hymn selected");
					    }

					     $('#jquery_jplayer_1').jPlayer('setMedia', {
					        mp3: hymn
					     }).jPlayer("play");
					 } else {
					 	alert("Vocal version of this song not included due to copyright");
					 	$(this).removeClass("active");
					 }

				}
		});

	    // dropdown hymn selector
	    $(".mainPage #hymnSelect").change(function(){
		    var id = $(this).val();
		    var file = "hymn"+id;
		    $("#copyrightPage").hide();
		    $("#sharePage").hide();
		    $(".musicIcon").removeClass("active");
		    $('#jquery_jplayer_1').jPlayer("stop")
		    // get language support
		    //console.log(id + " and " + app.lang);
			var result = null;
		    if(app.lang=='es'){
		      result = lyrics_es[file];
		      if(result){
		        $(".mainPage #loader").html(result);
		      } else {
		        $(".mainPage #loader").html("Select a hymn!");
		      }
		    } else if(app.lang=='fr'){
		      result = lyrics_fr[file];

		      if(result){
		        $(".mainPage #loader").html(result);
		      } else {
		        $(".mainPage #loader").html("Select a hymn!");
		      }

		    } else if(app.lang=='pg'){
		      result = lyrics_pg[file];
		      if(result){
		        $(".mainPage #loader").html(result);
		      } else {
		        $(".mainPage #loader").html("Select a hymn!");
		      }
		    }  else if(app.lang=='nl'){
		      result = lyrics_nl[file];
		      if(result){
		        $(".mainPage #loader").html(result);
		      } else {
		        $(".mainPage #loader").html("Select a hymn!");
		      }  
			 } else if(app.lang=='de'){
				result = lyrics_de[file];
				if(result){
				  $(".mainPage #loader").html(result);
				} else {
				  $(".mainPage #loader").html("Select a hymn!");
				}
			  
		    } else {
		      // english
		      result = lyrics_en[file];
		      if(result){
		        $(".mainPage #loader").html(result);
		      } else {
		        $(".mainPage #loader").html("Select a hymn!");
		      }
		    }
		    //var result = lyrics[file];
		    
		    $("#home").show();
		    $("#musicPlayer").hide();

		    var share = '<div class="actions"><a href="javascript:;"><i class="fa fa-share-square-o"></i>Share</a><a href="javascript:;"><i class="fa fa-music"></i>Music</a></div>';
		    //$(".mainPage #loader").append(share)
		    //var load = '<iframe width="100%" height="166" scrolling="no" frameborder="no" src="https://w.soundcloud.com/player/?url=https%3A//api.soundcloud.com/tracks/128417090&amp;color=ff5500&amp;auto_play=false&amp;hide_related=false&amp;show_artwork=true"></iframe>';
		    //$(".mainPage #loader").append(load);
		    //$(".mainPage #loader").append("<div class='media clearfix'><ul><li><a href=''><img src='assets/music.jpg' /></a></li><li><a href=''><img src='assets/share.jpg' /></a></li></ul></div>");
		    //$(".mainPage #loader").load("pages/hymn"+id+".html");
		  });


    $(".shareClose").on("click", function(){
	    $("#home").show();
	    $("#sharePage").hide();
	    $(".custom-btns a").removeClass("current");
	    $("#musicPlayer").hide();
	    $("#search").hide();
	    $("#copyrightPage").hide();
	    $("#numSearch").hide();
	    $(".hymnalSelection").show();
	});
  
  $(".tabs li a").on("click", function(){
      $par = $(this).parent();
      $(".tabs li").removeClass("current");
      $par.addClass("current");
      var which = $(this).attr("id");
      which= which.substring(0, which.length-3);
      $(".tabContent").removeClass("active");
      $("#"+which).addClass("active");
      if(which == "copyright") {
        $("#copyright").load("copyright.html");
      } else {
        $("#aboutText").load("about.html");
      }

  });

  $(".overlay").on("click", function(){
    $(this).parent().hide();
    $(".custom-btns a").removeClass("current");
  });



     $('#formByNum').on("submit", function (evt) {

      evt.preventDefault();
      var variable = $("#nums").val();
      $("#musicPlayer").hide();
      //alert(variable);
      variable = parseInt(variable,10);
      var prepend="";
      if(variable<192&&variable>0) {
        if(variable<100) {
          prepend="0";
        }
        if(variable<10) {
          prepend="00";
        }
        variable = prepend + variable;
        $("#hymnSelect").val(variable).change();
        $("#numSearch").hide();
        $(".custom-btns a").removeClass("current");
        $("#nums").blur();
        $("#home").show();
        $(".hymnalSelection").show();
      } else {
        //alert("try again");
        $("#nums").val("").focus();
      }
      return false;
  });
  
 
  $(".hamburger").on("click", function(){
    $(this).toggleClass("highlight");
    $(".dropdown").toggle();

    $("#byNumber, #searcher").removeClass("current");
        $("#numSearch").hide();
        $("#search").hide();
        $(".hymnalSelection").show();
        //$("#footerBot").show();
  });

  $(".dropdown li a").on("click", function(){
    //$(".currentApp h1 span").html($(this).attr("rel"));
    $(".dropdown").removeClass("open").hide();

    $(".dropdown li a").removeClass("active");
    $(this).addClass("active");
    $("#musicPlayer").hide();
    
    app.lang = $(this).attr("rel");
    app.storage.setItem("lang", app.lang);
    $("#footerBot").removeClass().addClass(app.lang)
    $("html").attr("lang", app.lang);
    app.getTitle();
    var returnHymn = $("#hymnSelect").val();
    $("#copyrightPage").hide();
    app.makeDropdown(app.lang, returnHymn);
   // console.log(lang + " | " + returnHymn);
    $("#hymnSelect").val(returnHymn).change();

  });
  

  

  $("footer a.textSize").on("click", function(){
      var $context = $(".ui-content");
      var size = $context.css("font-size");
      if(typeof size=="string"){
        size = size.substring(0, size.length-2);
        size = parseInt(size,10);
      } else {
        size = app.size;
      }
      
      if($(this).hasClass("smallerText"))  {
        size -=1;
      } else if($(this).hasClass("biggerText")) {
        size+=1;
      } else {
      	size = 16;
      }

      if(size<8){
        size = 8;
      }
      if(size>70){
        size = 70;
      }
      app.size = size;
      app.storage.setItem("size", app.size);
      $context.css("fontSize", size+"px");
  });

   $( "#searchField" ).autocomplete({
      source: searchArray,
      select: function(event, ui){
        var match = ui.item.value;
        var value=0;
        var numVal = match.substring(match.indexOf("(")+1, match.length-1);
        var variable = parseInt(numVal, 10);
      

        var prepend="";
        if(variable<100) {
          prepend="0";
        }
        if(variable<10) {
          prepend="00";
        }
        variable = prepend + variable;

        $("#hymnSelect").val(variable).change();
        $("#searchField").blur();
        $("#home").show();
        $("#search").hide();
        $(".custom-btns a").removeClass("current");
        $( "body, html" ).scrollTop( 0 );
      }
    });


	},
	loadSearch: function(num){
	  $("#loader2 .shareClose").click();
	  $("#hymnSelect").val(num).change();
	},
	makeDropdown(){
	  var lang = app.lang;
	  var hymn = app.hymn;
	  var scriptPath = "lang/" + lang + "/list.js";
	  $("#tocWrap").html("");

	  var titleText = "Title";
      var pageText = "Page";
      var searchText = "Search";
      var searchByNumText = "Search By Number";
      var goText = "Go"
      var title = null;
	
	  if(window['menu_'+lang]){
		title = window['title_'+lang];
		titleText = window['menu_'+lang]['Title']; 
		pageText = window['menu_'+lang]['Page'];
		searchText = window['menu_'+lang]['Search By Title'];
		searchByNumText = window['menu_'+lang]['Search By Number'];
		goText = window['menu_'+lang]['Search'];
	  }

	  if(title){

	  	$("#searchByNum").html(searchByNumText);
	  	$(".goBtn").val(goText);
	    
	      $("#hymnSelect").html("");
	      var $toc = $(document.createElement("table"));
	          $toc.attr("id", "toc");

	          $toc.append("<thead><tr><th>" + titleText + "</th><th>" + pageText + "</th></tr></thead>");
				var $tbody = $(document.createElement("tbody"));
				for(var i=0; i<title.length; i++){
					var num = i+1;
					if(num<100){
					num = "0"+num;
					}
					if(num<10){
					num = "0"+num;
					}
					var $option = $(document.createElement("option"));
					$option.attr("value", num);
					$option.html(title[i]); 
					$("#hymnSelect").append($option);

					var $row = $(document.createElement("tr"));
					var name = title[i];
					name = name.substring(name.indexOf(")")+2,name.length);
					$firstCell = $(document.createElement("td"));
					$link = $(document.createElement("a"));
					$link.attr("href", "javascript:app.loadSearch('"+num+"');").html(name).addClass("searchLink");
					$firstCell.append($link);

					$lastCell = $(document.createElement("td"));
					$lastCell.html(num);
					$row.append($firstCell, $lastCell);
					//$row.append("<td>"+num+"</td>");
					$tbody.append($row);
				}
				$toc.append($tbody);

	      $("#tocWrap").append($toc);
	      $('#toc').dataTable().fnDestroy();
	      $("#toc").dataTable({
	        'iDisplayLength': 300,
	        language: {
	          searchPlaceholder: searchText
	         },
	         "dom": '<"filter"f>t<"clear">'
	      });

	      if(hymn==0) {
	        app.startRandom();
	      } else {
	        $("#hymnSelect").val(hymn).change();
	      }
	    
	  } else {
	    // false
	  }

	},
	startRandom: function(){
	  if(typeof start=="undefined"){
		  var startVal;
		  var random;
		  var min=1;
		  var max = 191;
		  random = Math.floor(Math.random() * (max - min +1)) + min;
		  startVal = random;
	  } else {
	  	var startVal = start;
	  }


	  var pre = "";
	  if(startVal<100) {
	    pre="0";
	  }
	  if(startVal<10){
	    pre="00";
	  }
	  startVal = pre + "" +startVal;

	  //startVal=1;
	  $("#hymnSelect").val(startVal).change();
	  //console.log("start "+startVal);
	},
	initJplayer: function(){
		var player = $("#jquery_jplayer_1").jPlayer({
	    /*
	    ready: function () {
	      $(this).jPlayer("setMedia", {
	        title: "Hymn",
	        mp3: hymn
	      });
	      
	    },
	    */
	    swfPath: "dist/jplayer",
	    supplied: "mp3",
	    wmode: "window",
	    useStateClassSkin: true,
	    autoBlur: false,
	    smoothPlayBar: true,
	    autoPlay: true,
	    keyEnabled: true,
	    remainingDuration: true,
	    toggleDuration: true
	  });
	},
	makeLanguageDropdown: function(){
		if(app.languages.length==1){
			// only english
			// hide dropdown
			$(".navvy .first").hide();
		} else {
			var $target = $(".headerTop .dropdown ul");
			$target.html("");
			for(var i=0;i<app.languages.length; i++){
				var thisLang = app.languages[i];

				var $li = $(document.createElement("li"));
				var $a = $(document.createElement("a"));
				$a.attr("rel", thisLang);
				let languageDisplay = "Hymnal";
				if(window['menu_'+ thisLang]){
					languageDisplay = window['menu_'+ thisLang]["Language"]
				} 
				$a.html(languageDisplay);

				$li.append($a);
				$target.append($li);
			}
		}
	},
	
	

}

app.init();
