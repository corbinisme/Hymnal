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
      langKey:"lang",
      languages: null,
      hymn: 1,
      novocal: [100,115,121,124,127,129,133,136,147,171,183,186],
      storage: null,
      currentSearchFilter: "",
      currentTitles: [],
      init: function(){
          app.getConfig();
          app.eventBindings();
          app.loadCurrentLang(true);
          //app.makeDropdown();
          /*
          
          app.initJplayer();
          
          app.startRandom();
          */
      },
      loadCurrentLang: function(random){
        app.makeLanguageDropdown();
        app.makeHymnList();
        app.makeSearchContent();
        if(random){
            app.startRandom();
        } 
        app.setHymn(app.currentHymn);
        
        
       

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
      getHymnWithZeros:function(num){
        let newnum = num;
        if(num<100){
            newnum = "0"+newnum;
        }
        if(num<10){
            newnum = "0"+newnum;
        }
        return newnum;
      },
      getHymnText: function(){
        let result;
        let target = document.getElementById("loader");
        let file = "hymn" + app.getHymnWithZeros(app.currentHymn);
        if(window['lyrics_' + app.lang]){
            result = window['lyrics_' + app.lang][file];

            target.innerHTML = result;
            document.querySelector(".page#hymns .contentMain").scrollTo(0,0)
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
        
        let langValue = app.storage.getItem(app.langKey); 
        
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
           
        }
        
        app.setLang(langValue);
         
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
        
        //$("#footerBot").addClass(app.lang)
      },
      setLang: function(langValue){
        app.lang = langValue;
        app.storage.setItem(app.langKey, langValue)
        document.querySelector("html").setAttribute("lang", langValue);

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
       
        document.querySelectorAll("#loadCopyright .tabs li a").forEach(elem=>{
            elem.addEventListener("click", function(e){
                console.log("show tab", e.target);
                e.target.closest("ul").querySelectorAll("li a").forEach(element=>{
                    element.classList.remove("active")
                })
                e.target.classList.add("active");
                let tarId = e.target.getAttribute("data-id");
                document.querySelectorAll(`.tab-pane`).forEach(element=>{
                    element.classList.remove("active");
                })
                document.querySelectorAll(`.tab-pane.${tarId}`).forEach(element=>{
                    element.classList.add("active");

                })
            });
        })
        
      },
      eventBindings: function(){
        
        document.querySelector(".navbar-toggler").addEventListener("click", function(e){
            let button = e.target;
            app.toggleHamburger();
        })

        document.querySelector("#pianoIcon").addEventListener("click", function(e){

            e.preventDefault();
            app.makeMusic("piano");
            
        })
        document.querySelector("#midiIcon").addEventListener("click", function(e){

            e.preventDefault();
            app.makeMusic("midi");
            
        })
        document.querySelector("#vocalIcon").addEventListener("click", function(e){

            e.preventDefault();
            app.makeMusic("vocal");
            
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
            app.currentHymn = parseInt(e.target.value);
            app.getHymnText();
        })

        document.getElementById("contrast").addEventListener("click", function(e){
            app.toggleTheme();
            
        })

        document.getElementById("formByNum").addEventListener("submit", function(e){
            e.preventDefault();
            app.currentHymn = document.getElementById("searchByNumber").value;
            app.changePage("hymns");
            app.setHymn(app.currentHymn);
            
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

      loadSearch: function(num){

        let numInt = parseInt(num);
        document.getElementById("hymnSelect").value = num;
        app.currentHymn = numInt;
        app.getHymnText();
        app.changePage("hymns");
      },
      updateSearchFilter: function(node){
          let value = node.value;
          app.currentSearchFilter = value;
          app.makeSearchContent();
      },
      makeSearchContent: function(){

        let title;
        if(window['title_'+app.lang]){
            title = window['title_'+app.lang];
        
          let content = '';
          console.log("test filter: ", app.currentSearchFilter)
          for(var i=0; i<title.length; i++){
  
            // see if this makes the cut using the current search filter
            let addThis = false;
            
            let titleSub = title[i];
            titleSub = titleSub.substring(0, titleSub.indexOf(")"));
            let titleInt = parseInt(titleSub);
            titleSub = titleInt.toString();
            let origTitle = titleSub;

            let num = app.getHymnWithZeros(titleSub);
            
  
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
        hymnSelector.innerHTML = "";
          
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

            
            
        }

      },
      
      setHymn: function(number){
        
        let startVal = number;
        let pre = "";
        app.currentHymn = number;
        if(startVal<100) {
            pre="0";
        }
        if(startVal<10){
            pre="00";
        }
        startVal = pre + "" +startVal;

        
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
    
            app.currentHymn = startVal;
            
      },

      makeMusic:function(type){
        
        let audio = document.querySelector(".video-js");
        let source = audio.querySelector("source");
        let sourcePath = app.getHymnWithZeros(app.currentHymn) + ".mp3";
        if(type=="piano" || type=="vocal"){
            if(type=="vocal"){
                sourcePath = vocal_path + sourcePath
            } else if(type=="piano"){
                sourcePath = path + sourcePath
            } 

            document.querySelector(".musicPlayer").classList.add("active");

            source.setAttribute("src", sourcePath);
            let myPlayer = videojs('audio_player', {
                "playbackRates": [0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.3, 1.4, 1.5, 2],
                controls: true,
                autoplay: false,
                preload: 'auto'
            });

            myPlayer.src({type: 'audio/mp3', src: sourcePath});
            myPlayer.ready(function() {
                myPlayer.play();
            });
        } else {
            // midi

            document.getElementById("midi").innerHTML="Playing " + app.getHymnWithZeros(app.currentHymn);
            //window['playMidi'](app.getHymnWithZeros(app.currentHymn));
            MIDIjs.play('./hinematov.mid')
            
        }

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
                  a.setAttribute("data-lang", thisLang);
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
              target.appendChild(infoLi);


              document.querySelectorAll("#languageSelector li a").forEach(element=>{
                
                element.addEventListener("click", function(el){
                    el.preventDefault();

                    console.log("getting buttons", element)
                    let id = el.target.id;
                    console.log("id", id)
                    if(id!="copyrightBtn"){
                        let lang = el.target.getAttribute("data-lang");

                        app.setLang(lang)
                        app.toggleHamburger();
                        app.loadCurrentLang();
                    } else {
                        app.toggleHamburger();
                        app.changePage("copyright");
                        if(!document.getElementById("copyright").classList.contains("loaded")){
                            //load it in!
                            fetch("about.html?about=true")
                            .then(resp=>resp.text())
                            .then(data=>{
                                console.log("about data", data);
                                document.getElementById("loadCopyright").innerHTML = data;
                                app.makeCopyrightTabs();
                                document.getElementById("copyright").classList.add("loaded")
                            })
                        }
                    }
                })
              })
          }
      },
      
      
  
  }
  
  app.init();
  