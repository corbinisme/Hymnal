// window.open wasn't opening a link in the system browser on iOS, so we have to use this function (requires phonegap.js)
function redirectToSystemBrowser(url) {
    // Wait for Cordova to load
    // open URL in default web browser
    var ref = window.open(encodeURI(url), '_system', 'location=yes');  
  }
  
  var hymn = 1;
  var brand = "";
  var path = config.path;
  var vocal_path = config.vocal_path;
  
  var app = {
      brand: "",
      lang: "en",
      size: 16,
      contrast: "false",
      currentHymn: 1,
      fontKey: "size",
      languages: null,
      hymn: 1,
      novocal: [100,115,121,124,127,129,133,136,147,171,183,186],
      storage: null,
      init: function(){
          app.getConfig();
          app.eventBindings();
          app.makeHymnList();
          app.makeSearchContent();
          //app.makeDropdown();
          /*
          
          app.initJplayer();
          
          app.startRandom();
          */
      },
      changePage: function(id){
        document.querySelectorAll(".page.wrapper").forEach(function(page){
            page.classList.remove("active");
        })
        console.log("change page", id)
        document.querySelector("#" + id).classList.add("active");
        // more logic
        document.querySelector(".mainContent").setAttribute("data-page-show", id)
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
          
          document.getElementById("brand").innerHTML = currentTitle;
      },
      getHymnText: function(){
        let target = document.getElementById("loader");
        let file = "hymn" + app.currentHymn;
        if(window['lyrics_' + app.lang]){
            result = window['lyrics_' + app.lang][file];

            target.innerHTML = result;
        }
      },
      toggleTheme: function(){
        if(document.querySelector("html").classList.contains("dim")){
            app.contrast = "false";
            document.querySelector("html").classList.remove("dim")
        } else {
            app.contrast = "true";
            document.querySelector("html").classList.add("dim")
        }

      },
      setFontSize: function(size){
        app.size = size;
        app.storage.setItem(app.fontKey, size);
        document.documentElement.style.setProperty('--fontSize', size + "px");
        document.querySelector("body").setAttribute("data-font-size", size);
        document.getElementById("fontSlider").value=size;
        //set font slider
      },
      getConfig: function(){
        app.brand = config.brand;
        let current = document.querySelector("#brand").innerHTML;
        document.querySelector("head title").innerHTML = app.brand + " hymnal";
        
        let langs = config.langs;
        app.storage = window.localStorage;
        let langKey = "lang";
        let langValue = app.storage.getItem(langKey); 
        
        let browserLang = navigator.language;
        let langOverride = "";

        let allLangs = config.langs.split(",");
        allLangs.forEach(function(la){
            if(browserLang.indexOf(la)>-1){
                langOverride = la;
            }
        })
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
        }
        app.setFontSize(fontSize);
       
        var contrastKey = "contrast";
        var contrastVal = app.storage.getItem(contrastKey);
        if(contrastVal==null){
            contrastVal = "true";
            app.storage.setItem(contrastKey, contrastVal)
        }
        app.contrast = contrastVal;
        if(app.contrast=="true"){
            document.querySelector("html").classList.add("dim");
        }

        if(config.icon!=""){
            var icon = config.icon;
            var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = icon;
            document.getElementsByTagName('head')[0].appendChild(link);
        }

        app.languages = langs.split(",");
        app.makeLanguageDropdown();
        //$("#footerBot").addClass(app.lang)
      },
      toggleHamburger: function(){
        let button = document.querySelector(".navbar-toggler")
        let menu = document.getElementById("navbarSupportedContent");
        if(button.classList.contains("collapsed")){
            button.classList.remove("collapsed");
            menu.classList.remove("show")
        } else {
            button.classList.add("collapsed")
            menu.classList.add("show")
        }
      },
      makeCopyrightTabs: function(){
        document.querySelectorAll("#copyright .tabs li a").addEventListener("click", function(e){
            console.log("show tab", e.target)
        });
      },
      eventBindings: function(){
        
        document.querySelector(".navbar-toggler").addEventListener("click", function(e){
            let button = e.target;
            app.toggleHamburger();
        })

        document.querySelector("#copyrightBtn").addEventListener("click", function(e){
            e.preventDefault();
            app.toggleHamburger();
            app.changePage("copyright");
            if(!document.getElementById("copyright").classList.contains("loaded")){
                //load it in!
                fetch("about.html")
                .then(resp=>resp.text())
                .then(data=>{
                    console.log("about data", data);
                    document.getElementById("loadCopyright").innerHTML = data;
                    app.makeCopyrightTabs();
                    document.getElementById("copyright").classList.add("laoded")

                })
            }
        })
        

        document.querySelectorAll(".changePageButton").forEach(function(item){

            item.addEventListener("click", function(e){
                e.preventDefault();
               
                let page ="";
                if(e.target.getAttribute("data-page")){
                    page = e.target.getAttribute("data-page");
                } else {
                    page = e.target.closest("a").getAttribute("data-page");
                }
                app.changePage(page)
            })
        });

        document.getElementById("hymnSelect").addEventListener("change", function(e){
            app.currentHymn = e.target.value;
            app.getHymnText();
        })

        document.getElementById("contrast").addEventListener("click", function(e){
            app.toggleTheme();
            
        })

        document.getElementById("searchByNumberBtn").addEventListener("click", function(e){
            e.preventDefault();
            app.currentHymn = document.getElementById("searchByNumber").value;
            app.changePage("hymns");
            app.getHymnText();
            
        })


        document.querySelector(".fontSizer").addEventListener("click", function(e){
            let tar = document.querySelector("#hymns");
            if(tar.classList.contains("showFontSizer")){
                tar.classList.remove("showFontSizer")
            } else {
                tar.classList.add("showFontSizer")
            }
        })
        
        
        document.querySelector("#fontSlider").addEventListener("change", function(e){
            app.setFontSize(e.target.value)
        });
        

        document.getElementById("filterSearch").addEventListener("keyup", function(e){
            let val = e.target.value;
            app.updateSearchFilter(e.target)
        })
      
  
      },
      currentSearchFilter: "",
      currentTitles: [],
      loadSearch: function(num){

        document.getElementById("hymnSelect").value = num;
        app.currentHymn = num;
        app.getHymnText();
        app.changePage("hymns");
      },
      updateSearchFilter: function(node){
          let value = node.value;
          app.currentSearchFilter = value;
          app.makeSearchContent();
      },
      makeSearchContent: function(){

        if(window['title_'+app.lang]){
            title = window['title_'+app.lang];
        
          let content = '';
          console.log("test filter: ", app.currentSearchFilter)
          for(var i=0; i<title.length; i++){
  
  
            let addThis = false;
            
            let titleSub = title[i];
            titleSub = titleSub.substring(0, titleSub.indexOf(")"));
            //console.log(titleSub);
            let titleInt = parseInt(titleSub);
            titleSub = titleInt.toString();
            let origTitle = titleSub;
            if(titleInt<100){
                titleSub = "0"+titleSub;
            }
            if(titleInt<10){
                titleSub = "0"+titleSub;
            }
            
            var num = i+1;

            if(num<100){
                num = "0"+num;
            }
            if(num<10){
                num = "0"+num;
            }
  
            var name = title[i];
            name = name.substring(name.indexOf(")")+2,name.length);

            let lowerFilter = app.currentSearchFilter.toLowerCase();
            let theseLyrics = window['lyrics_' + app.lang]["hymn" + num];

            theseLyrics = theseLyrics.substring(theseLyrics.indexOf("</h1>")+5);
            var dom = new DOMParser().parseFromString(theseLyrics, 'text/html');
            let theseSearchLyrics = dom.body.textContent;
            let showLyrics = false;
            let highlightedSearchLyrics = null;

            if(lowerFilter==""){
                addThis = true;
            } else {
                // lots of search logic
                if(name.toLowerCase().indexOf(lowerFilter)>-1){
                    addThis = true;
                    //name = name.replaceAll(filterText, "<mark>" + filterText + "</mark>");
                    name = name.toLowerCase().replaceAll(lowerFilter, "<mark>" + lowerFilter + "</mark>");
                    name = name.toUpperCase();
                    
                }
                if(origTitle == lowerFilter){
                    addThis = true;
                }
                if(theseSearchLyrics.indexOf(lowerFilter) >-1){
                    addThis = true;
                    showLyrics = true;

                    
                    highlightedSearchLyrics = theseSearchLyrics;
                    let searchSplits = lowerFilter.split(" ");
                    let filterText = app.currentSearchFilter;
                    highlightedSearchLyrics = highlightedSearchLyrics.replaceAll(";", " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replaceAll(".", " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replaceAll(",", " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replaceAll(":", " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replaceAll("Chorus", " ");
                   

                    if(theseSearchLyrics.toLowerCase().indexOf(filterText)>-1){
                        highlightedSearchLyrics = highlightedSearchLyrics.replaceAll(filterText, "<mark>" + filterText + "</mark>");

                    }
                }
            }
            

            if(addThis==true){
                content += `
              
                <tr>
                    <td>${origTitle}</td>
                    <td>
                        <a href="javascript:app.loadSearch('${num}');" class="searchLink">
                            <span class="badge bg-info">${name}</span>
                            
                        </a>
                        ${(showLyrics? "<br />" + highlightedSearchLyrics: "")}
                    </td>
                </tr>
                 `
            }
  
          }
          document.getElementById("tocBody").innerHTML=content;
        }
      },
      makeHymnList: function(){
        let lang = app.lang;
        let hymn = app.hymn;
        let title = null;
        let hymnSelector = document.getElementById("hymnSelect");
          
        if(window['menu_'+lang]){
            title = window['title_'+lang];

            for(var i=0; i<title.length; i++){
  
                // need to get actual number, not just index
                let titleSub = title[i];
                titleSub = titleSub.substring(0, titleSub.indexOf(")"));

                let titleInt = parseInt(titleSub);
                titleSub = titleInt.toString();
                if(titleInt<100){
                    titleSub = "0"+titleSub;
                }
                if(titleInt<10){
                    titleSub = "0"+titleSub;
                }
                var num = i+1;

                if(num<100){
                    num = "0"+num;
                }
                if(num<10){
                    num = "0"+num;
                }
                var option = document.createElement("option");
                option.setAttribute("value", titleSub);
                option.innerHTML = title[i]; 
                hymnSelector.append(option);
            }

            app.startRandom();
            
        }

      },
      
      makeDropdown: function(){
          let lang = app.lang;
          let hymn = app.hymn;

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
  
                  for(var i=0; i<title.length; i++){
  
                      // need to get actual number, not just index
                      let titleSub = title[i];
                      titleSub = titleSub.substring(0, titleSub.indexOf(")"));

                      let titleInt = parseInt(titleSub);
                      titleSub = titleInt.toString();
                      if(titleInt<100){
                          titleSub = "0"+titleSub;
                      }
                      if(titleInt<10){
                          titleSub = "0"+titleSub;
                      }
                      
                      var num = i+1;
  
                      if(num<100){
                          num = "0"+num;
                      }
                      if(num<10){
                          num = "0"+num;
                      }
                      var $option = $(document.createElement("option"));
                      $option.attr("value", titleSub);
                      $option.html(title[i]); 
                      $("#hymnSelect").append($option);
  
                      
                  }
                  $toc.append($tbody);
  
              $("#tocWrap").append($toc);
              app.makeSearchContent(title);
              
              if(hymn==0) {
                  app.startRandom();
              } else {
                  $("#hymnSelect").val(hymn).change();
              }
        }
      },
      setHymn: function(number){
        
        let startVal = number;
        let pre = "";
        if(startVal<100) {
            pre="0";
        }
        if(startVal<10){
            pre="00";
        }
        startVal = pre + "" +startVal;

        app.currentHymn = startVal;
        let hymnSelector = document.getElementById("hymnSelect");
            hymnSelector.value = startVal;
        app.getHymnText();
      }, 
      startRandom: function(){
        // get actual list of values for the current lang
        let titles = window["title_" + app.lang];
        let startVal = "";

         // start is a variable set from the url
            if(typeof start=="undefined"){
               
                var random;
                var min=1;
                var max = titles.length;
                random = Math.floor(Math.random() * (max - min +1)) + min;
    
                let title = titles[random];
                title = parseInt(title.substring(0, title.indexOf(")")));
    
                startVal = title;
            
            } else {
                 // if we hardcode the hymn in the url, load it
                startVal = start;
            }
    
    
            
    
            app.setHymn(startVal)
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
              document.querySelector(".navbar-toggler").remove();
          } else {
              let target = document.getElementById("languageSelector");
              target.innerHTML = "";
              for(var i=0;i<app.languages.length; i++){
                  var thisLang = app.languages[i];
  
                  var li = document.createElement("li");
                  li.classList.add("nav-item")
                  var a = document.createElement("a");
                  a.setAttribute("rel", thisLang);
                  a.classList.add("nav-link")
                  
                  let languageDisplay = "Hymnal";
                  if(window['menu_'+ thisLang]){
                      languageDisplay = window['menu_'+ thisLang]["Language"]
                  } 
                  a.innerHTML = languageDisplay;
  
                  li.append(a);
                  target.append(li);
              }

              
              let infoLi = document.createElement("li");
              infoLi.classList.add("nav-item");
              infoLi.innerHTML = `<a href="#" id='copyrightBtn' class="nav-link"><i class="fa fa-info-circle"></i> Copyright Information</a>`
              target.appendChild(infoLi)
          }
      },
      
      
  
  }
  
  app.init();
  