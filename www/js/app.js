// window.open wasn't opening a link in the system browser on iOS, so we have to use this function (requires phonegap.js)
function redirectToSystemBrowser(url) {
    // Wait for Cordova to load
    // open URL in default web browser
    var ref = window.open(encodeURI(url), '_system', 'location=yes');  
  }
  
  var hymn = 1;
  var brand = "";
  var path = config.path;
  var vocal_path = (config.vocal_path? config.vocal_path:null);
  

  var app = {
      brand: "",
      lang: "en",
      size: 16,
      contrast: "false",
      currentHymn: 1,
      fontKey: "size",
      langKey:"lang",
      languages: null,
      searchTitleOnly: false,
      hasVocal: false,
      hymn: 1,
      storage: null,
      sheetMusicEnabled: false,
      sheetMusicActive: false,
      currentSearchFilter: "",
      currentTitles: [],
      musicPlayer: null,
      musicOpen: false,
      currentMusicType: "piano",
      init: function(){
            app.getConfig();
            app.eventBindings();
            app.loadCurrentLang(true);
            app.getPageSizing();
            window.addEventListener("resize", function(){
                app.getPageSizing();
            })
            app.setMusicOptions();
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
      getPageSizing: function(){
        // detect if there is a vertical scrollbar

        let isMobile = false;
        if (/Mobi/.test(navigator.userAgent)) {
            // The user is on a mobile device
            console.log("mobile")
            isMobile = true;
        } else {
            // The user is not on a mobile device
            console.log("not actual mobile")
        }

        let hasScrollbar = document.getElementById("hymns").scrollHeight > window.innerHeight;
        if(hasScrollbar && !isMobile){

            document.querySelector("body").classList.add("scrollbar");
        } else {
            document.querySelector("body").classList.remove("scrollbar");
        }
      },
      changePage: function(id){
        document.querySelectorAll(".page.wrapper").forEach(function(page){
            page.classList.remove("active");
        })

        document.querySelector("#" + id).classList.add("active");
        // more logic
        document.querySelector(".mainContent").setAttribute("data-page-show", id)
        


        if(id=="number"){
            window.setTimeout(function(){
                document.getElementById("searchByNumber").focus();
            }, 400);
        }
        else if(id=="search"){
            window.setTimeout(function(){
                document.getElementById("filterSearch").focus();
            }, 400);
        } else {
            document.getElementById("searchByNumber").blur();
            document.getElementById("filterSearch").blur();
        }

      },
      changeStorage:function(key,val){
          app.storage.setItem(key, val);
      },
      getTitle: function(){
          let currentLang = app.lang;
          let currentTitle = "Hymnal";
          let searchTitle = "Search";
          let hymnTitle = "Hcopyrightymn Number";
          let langObj = 'menu_' + currentLang;
          if(window[langObj]){
              currentTitle = window[langObj].Hymnal;
              searchTitle = window[langObj]["Search By Title"];
              hymnTitle = window[langObj]["Search By Number"];
          }
          
          document.getElementById("brand").innerHTML = currentTitle;
          document.getElementById("searchTitle").innerHTML = searchTitle;
          document.getElementById("byNumberTitle").innerHTML = hymnTitle;
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
      showPdfViewer: function(val){
        if(val==true){

            document.getElementById("pdfloader").classList.add("active");
            document.getElementById("pdfloader").classList.remove("hidden");
            document.getElementById("loader").classList.add("hidden");
            document.getElementById("loader").classList.remove("active");
            //check if pdf has loaded yet
            
        } else {

            document.getElementById("pdfloader").classList.remove("active");
            document.getElementById("pdfloader").classList.add("hidden");
            document.getElementById("loader").classList.add("active");
            document.getElementById("loader").classList.remove("hidden");
        }
      },
      getHymnText: function(){
        let result;
        let target = document.getElementById("loader");
        let pdfTarget = document.getElementById("pdfloader");
       
        if(app.sheetMusicActive){
           // make a shell for pdf viewing
           // show pdf div
           app.showPdfViewer(true);
           let hymnNumber =app.getHymnWithZeros(app.currentHymn);
           
           const pdfurl = config.pdfpath + hymnNumber + " Guitar.pdf";


            pdf.url = pdfurl;
            pdf.init();
        } else {
            app.showPdfViewer(false);
        }
        
        let file = "hymn" + app.getHymnWithZeros(app.currentHymn);
        if(window['lyrics_' + app.lang]){
            result = window['lyrics_' + app.lang][file];

            if(result==null || typeof result == "undefined"){

                result = `<p>Cannot find hymn # ${app.currentHymn}</p>`;
            } 
            target.innerHTML = result;
            document.querySelector(".page#hymns .contentMain").scrollTo(0,0);

            
        }

        // if music is playing, stop it
        if(app.musicPlayer)
            app.musicPlayer.pause()

        
        document.querySelectorAll(".hymnFooter .musicType").forEach(function(elem){
            elem.classList.remove("active");
        });
       
        /*if(app.musicOpen){
            document.querySelector(".musicPlayer").classList.add("active");
        } else {
            document.querySelector(".musicPlayer").classList.remove("active");
        }
        */
      },
      toggleTheme: function(reverse){

        if(document.querySelector("html").classList.contains("dim")){
            app.contrast = "false";
            document.querySelector("html").classList.remove("dim")
        } else {
            app.contrast = "true";
            document.querySelector("html").classList.add("dim")
        }

        const sunSolid = document.getElementById("sunSolid");
        const moonSolid =   document.getElementById("moonSolid");
        if(app.contrast=="false"){
            sunSolid.classList.add("hidden");
            moonSolid.classList.remove("hidden");
        } else {
            sunSolid.classList.remove("hidden");
            moonSolid.classList.add("hidden");
        }
        app.storage.setItem("contrast", app.contrast)

      },
      setFontSize: function(size){
        app.size = size;
        app.storage.setItem(app.fontKey, size);
        document.documentElement.style.setProperty('--fontSize', size + "px");
        document.querySelector("body").setAttribute("data-font-size", size);
        document.getElementById("fontSlider").value=size;
        //set font slider
        app.getPageSizing()
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

        let currentMusicType = app.storage.getItem("currentMusicType");
        if(currentMusicType!=null){
            app.currentMusicType = currentMusicType;
        }
        if(app.currentMusicType=="vocal"){
            document.getElementById("vocal_version").checked=true;
        }

        
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
            app.storage.setItem(contrastKey, contrastVal);
            
        }
        app.contrast = contrastVal;
        if(app.contrast=="true"){
            document.querySelector("html").classList.add("dim");
        } else {
            document.querySelector("html").classList.remove("dim");
        }

        const sunSolid = document.getElementById("sunSolid");
        const moonSolid =   document.getElementById("moonSolid");
        if(app.contrast=="false"){
            sunSolid.classList.add("hidden");
            moonSolid.classList.remove("hidden");
        } else {
            sunSolid.classList.remove("hidden");
            moonSolid.classList.add("hidden");
        }

        /*
        if(config.icon!=""){
            var icon = config.icon;
            var link = document.querySelector("link[rel*='icon']") || document.createElement('link');
            link.type = 'image/x-icon';
            link.rel = 'shortcut icon';
            link.href = icon;
            //document.getElementsByTagName('head')[0].appendChild(link);
        }
        */
  
        app.languages = langs.split(",");
        const sheetMusicOption = (config.pdf? config.pdf:false);
        app.sheetMusicEnabled = sheetMusicOption;
        if(app.sheetMusicEnabled){
            const sheetMusicToggleWrapperNode = document.getElementById("toggleType");
            sheetMusicToggleWrapperNode.classList.remove("hidden");
            const sheetMusicToggleNode = document.getElementById("sheetMusicToggle");
            let sheetMusicActiveInit = (app.storage.getItem("sheetMusicActive")? app.storage.getItem("sheetMusicActive"): false);

            app.sheetMusicActive =  (sheetMusicActiveInit=="true"? true:false);
            if(app.sheetMusicActive){
                app.sheetMusicEnabled = true;
                // get the sheetMusicToggleNode node and set it to checked
                sheetMusicToggleNode.checked=true;
            }

            }
      },
      setLang: function(langValue){
        app.lang = langValue;
        app.storage.setItem(app.langKey, langValue)
        document.querySelector("html").setAttribute("lang", langValue);
        app.getTitle();
        app.setMusicOptions();
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
      setMusicOptions: function(){
        
        const bodyTag = document.querySelector("body");
        const vocal_version_toggle = document.getElementById("vocal_version_toggle");

        if(app.lang=="en"){
            app.hasVocal = true;
        } else {
            app.hasVocal = false;
        }
        if(app.hasVocal==true){
            
            bodyTag.classList.add("hasVocal");
            vocal_version_toggle.classList.remove("hidden");
        } else {

            
            bodyTag.classList.remove("hasVocal");
            vocal_version_toggle.classList.add("hidden");
            
        }
      },
      makeCopyrightTabs: function(){
       
        
        document.querySelectorAll("#loadCopyright .tabs li a").forEach(elem=>{
            elem.addEventListener("click", function(e){

                e.target.closest("ul").querySelectorAll("li a").forEach(element=>{
                    element.classList.remove("active")
                })
                e.target.classList.add("active");
                let tarId = e.target.getAttribute("data-id");
                document.querySelectorAll(`.tabContents>div`).forEach(element=>{
                    element.classList.remove("active");
                })
                document.querySelectorAll(`.tabContents>div.${tarId}`).forEach(element=>{
                    element.classList.add("active");

                })
            });
        })
        document.querySelector("#loadCopyright .tabs>li:nth-child(1) a").click()
        
        // now make dropdown
        let select= document.createElement("select");
        select.classList.add("form-control");
        select.classList.add("tab-alt");
        select.classList.add("form-select");
        document.querySelectorAll(`#loadCopyright .${app.lang} .tabs li a`).forEach(function(tab){
            let id = tab.getAttribute("data-id");
            let text = tab.innerHTML;
            let option = document.createElement("option");
            option.value=id;
            option.innerHTML = text;
            select.append(option);
        });
        let div = document.createElement("div");
        div.append(select)

        document.querySelector(`#loadCopyright .${app.lang} .tabs`).classList.add("p-2")
        document.querySelector(`#loadCopyright .${app.lang} .tabs`).innerHTML = div.innerHTML;
        document.querySelector(`#loadCopyright .${app.lang} .tabs .form-control`).addEventListener("change", function(e){
            
            let tarId = e.target.value;
            document.querySelectorAll(`.tabContents>div`).forEach(element=>{
                element.classList.remove("active");
            })
            document.querySelectorAll(`.tabContents>div.${tarId}`).forEach(element=>{
                element.classList.add("active");

            })
        })


      },
      setCurrentMusicState: function(type){
        //app.storage.setItem("music", type);
        app.currentMusicType = type;
        document.querySelectorAll(".musicType").forEach(function(elem){
            elem.classList.remove("active")
        })
        //document.querySelector(`#${type}Icon`).classList.add("active");
      },

      eventBindings: function(){
        
        document.getElementById("musicControl").addEventListener("click", function(e){
            let thisbutton = document.getElementById("musicControl");

            
            let originalState = app.musicOpen;
            app.musicOpen = !app.musicOpen;

            const bodyTag = document.querySelector("body");
            const musicPlayerWrapper  = document.querySelector(".musicPlayer");
            const hymnFooter = document.querySelector(".hymnFooter");
            if(app.musicOpen==false){
                
                bodyTag.classList.remove("hasMusicOpen");
                
                musicPlayerWrapper.classList.remove("active");
                hymnFooter.classList.remove("musicOpen");
                app.musicPlayer.pause();
                thisbutton.classList.remove("active");
            } else {
                console.log("should be active")
                
                bodyTag.classList.add("hasMusicOpen");
                
                musicPlayerWrapper.classList.add("active");
                hymnFooter.classList.add("musicOpen")
                thisbutton.classList.add("active");
            }

            let musicType = app.currentMusicType;
            
            if(originalState==false){
                app.makeMusic(musicType);
                app.setCurrentMusicState("piano")
            }
            
        });

        document.getElementById("closeMusic").addEventListener("click", function(e){
            e.preventDefault();
            app.musicOpen = false;

            const bodyTag = document.querySelector("body");
            const musicPlayerWrapper  = document.querySelector(".musicPlayer");
            const hymnFooter = document.querySelector(".hymnFooter");
            const musicToggle= document.getElementById("musicControl");

            musicToggle.classList.remove("active");
           
            bodyTag.classList.remove("hasMusicOpen");
                
            musicPlayerWrapper.classList.remove("active");
            hymnFooter.classList.remove("musicOpen");
            app.musicPlayer.pause();

        });

        document.getElementById("vocal_version").addEventListener("change", function(e){
            let val = e.target.checked;
            let currentType = "piano";
            if(val){
                currentType = "vocal";
            }
            app.hasVocal = val;
            app.currentMusicType = currentType;
            app.storage.setItem("currentMusicType", currentType);

            app.setMusicOptions();
            app.makeMusic(currentType);
        });


        document.querySelector(".navbar-toggler").addEventListener("click", function(e){
            let button = e.target;
            app.toggleHamburger();
        });

        document.getElementById("sheetMusicToggle").addEventListener("change", function(e){
            let val = e.target.checked;

            app.sheetMusicActive = val;

            if(val==true){
                app.showPdfViewer(true);
               
                
            } else {
                app.showPdfViewer(false);
               
            }
            app.storage.setItem("sheetMusicActive", val);
        });

        

        if(document.querySelector("#midiIcon")){
            document.querySelector("#midiIcon").addEventListener("click", function(e){

                e.preventDefault();
                app.makeMusic("midi");
                app.setCurrentMusicState("midi")
                
            })
        }
        

        document.querySelectorAll(".changePageButton").forEach(function(item){

            item.addEventListener("click", function(e){
                e.preventDefault();
               
                let page ="";
                if(e.target.getAttribute("data-page")){
                    page = e.target.getAttribute("data-page");
                } else {
                    page = e.target.closest("a").getAttribute("data-page");
                }

                document.querySelectorAll(".changePageButton").forEach(function(item){
                    item.classList.add("inactive");

                    window.setTimeout(function(){
                        item.classList.remove("inactive");
                    }, 1000)
                })

                
                app.changePage(page)
            })
        });

        document.getElementById("hymnSelect").addEventListener("change", function(e){
            app.currentHymn = parseInt(e.target.value);
            app.getHymnText();
        })

        document.getElementById("contrast").addEventListener("click", function(e){
            e.preventDefault();
            app.toggleTheme();
            
        })

        document.getElementById("formByNum").addEventListener("submit", function(e){
            e.preventDefault();
            app.currentHymn = document.getElementById("searchByNumber").value;
            app.changePage("hymns");
            app.setHymn(app.currentHymn);
            
        })


        document.querySelectorAll(".fontSizer").forEach(function(el){
            el.addEventListener("click", function(e){
                e.preventDefault();
                
                let tar = document.querySelector("#hymns");
                if(tar.classList.contains("showFontSizer")){
                    tar.classList.remove("showFontSizer")
                } else {
                    tar.classList.add("showFontSizer")
                }
            
              
            })
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
      highlightMatches: function(text, filterText) {
        // Use a regular expression with 'gi' flags for case-insensitive global matching
        const regex = new RegExp(filterText, 'gi');
        
        // Replace matched substrings with <mark> tags
        return text.replace(regex, match => `<mark>${match}</mark>`);
      },
      filterAndHighlightData: function(data, filterText) {
        const filteredData = [];
    
        data.forEach(item => {
            const { title } = item;
    
            // Case-insensitive search for the filter text in title and lyrics
            const titleMatched = title.toLowerCase().includes(filterText.toLowerCase());
            //const lyricsMatched = lyrics.toLowerCase().includes(filterText.toLowerCase());
    
            if (titleMatched) {
                // Create a new object with highlighted matches
                const highlightedItem = {
                    title: titleMatched ? highlightMatches(title, filterText) : null,
                    lyrics: lyricsMatched ? highlightMatches(lyrics, filterText) : lyrics,
                };
    
                filteredData.push(highlightedItem);
            }
        });
    
        return filteredData;
      },
      sortTable: function(column) {
        const table = document.getElementById("tocBody");
        const rows = Array.from(table.querySelectorAll('tr'));
    
        rows.sort((a, b) => {
            const numA = parseFloat(a.cells[0].textContent);
            const numB = parseFloat(b.cells[0].textContent);
            const alphaA = a.cells[1].textContent.toLowerCase();
            const alphaB = b.cells[1].textContent.toLowerCase();
    
            if(column === 0){
                return numA - numB;
            } else if(column === 1){
                return alphaA.localeCompare(alphaB);
            } else {
                return 0;
            }
            
        });
        
    
        // Remove existing rows from the table
        while (table.firstChild) {
            table.removeChild(table.firstChild);
        }
    
        // Append sorted rows back to the table
        rows.forEach(row => {
            table.appendChild(row);
        });
    },
    trimHighlightedMatches: function(text) {

        // trim the text before and after the first occurance of <mark>
        let firstMark = text.indexOf("<mark>");
        let lastMark = text.indexOf("</mark>");
        let newText = text;
        let startIndex = firstMark - 95;
        let startPrefix = "...";
        let endPrefix = "...";
        if(startIndex<0){
            startIndex = 0;
            startPrefix = "";
        }
        // get number of characters of the text
        let totalChars = text.length;
        let endIndex = lastMark + 95;
        if(endIndex>totalChars){
            endIndex = totalChars;
            endPrefix = "";
        }
        let splits = newText.split(" ");
        // find out what entry in the splits array our firstMark is
        let markIndex = 0;
        for(var i=0; i<splits.length; i++){
            let split = splits[i];
            if(split.indexOf("<mark>")>-1){
                markIndex = i;
                break;
            }
        }

        let startIndex2 = ((markIndex - 17)>=0? markIndex - 17:0);
        let endIndex2 = markIndex+17;

        let newString = splits.slice(startIndex2, endIndex2).join(" ");



        newText = startPrefix + newText.substring(startIndex, endIndex) + endPrefix;

        return  startPrefix +  newString + endPrefix;
    },
    
      makeSearchContent: function(){

        let title;
        if(window['title_'+app.lang]){
            title = window['title_'+app.lang];

          let content = '';

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
                
                    name = app.highlightMatches(name, lowerFilter);

                }
                if(origTitle == lowerFilter){
                    addThis = true;
                }
                if(theseSearchLyrics.toLowerCase().indexOf(lowerFilter) >-1){
                    addThis = true;
                    showLyrics = true;

                    
                    highlightedSearchLyrics = theseSearchLyrics;
                    let searchSplits = lowerFilter.split(" ");
                    let filterText = app.currentSearchFilter;

                    highlightedSearchLyrics = highlightedSearchLyrics.replace(/;/g, ' ');
                    highlightedSearchLyrics = highlightedSearchLyrics.replace(/\./g, ' ');
                    highlightedSearchLyrics = highlightedSearchLyrics.replace(/,/g, " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replace(/:/g, " ");
                    highlightedSearchLyrics = highlightedSearchLyrics.replace(/Chorus/g, " ");
                    
                    highlightedSearchLyrics = app.highlightMatches(highlightedSearchLyrics, filterText);
                    highlightedSearchLyrics = app.trimHighlightedMatches(highlightedSearchLyrics);
                }
            }
            

            if(addThis==true){
                content += `
              
                    <tr>
                        <td>${origTitle}</td>
                        <td>
                            <a href="javascript:app.loadSearch('${num}');" class="searchLink">
                                <span class="text-link d-block">${name}</span>
                                
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
                sourcePath = vocal_path + sourcePath;
                if(config.novocal.includes(app.currentHymn)){
                    sourcePath = null;
                }
            } else if(type=="piano"){
                sourcePath = path + sourcePath
            } 

            if(sourcePath!=null){
                document.querySelector(".musicPlayer").classList.add("active");

                source.setAttribute("src", sourcePath);

                if(app.musicPlayer){
                    app.musicPlayer.pause();
                } else {

                    app.musicPlayer = videojs('audio_player', {
                        "playbackRates": [0.6, 0.7, 0.8, 0.9, 1, 1.2, 1.3, 1.4, 1.5, 2],
                        controls: true,
                        autoplay: false,
                        preload: 'auto'
                    });
                }

                app.musicPlayer.src({type: 'audio/mp3', src: sourcePath});

                app.musicPlayer.on('play',()=>{

                    const playerWrapper = document.querySelector(".video-js");
                    playerWrapper.setAttribute("data-playing", "true");
                });
                app.musicPlayer.on('pause',()=>{

                    const playerWrapper = document.querySelector(".video-js");
                    playerWrapper.setAttribute("data-playing", "false");
                });
                app.musicPlayer.ready(function() {

                    // add logic to know if we should auto play
                    //app.musicPlayer.play();\
                    // in the future, add shuffle controls
                    //app.addShuffleControls();
                });
   
              
            }
        } else {
           // future functionality

            
            
        }

      },
      addShuffleControls: function(){
        const controlBar = document.querySelector(".musicPlayer .video-js .vjs-control-bar");
        let shufflestring = `
        
      `;

      const temp = document.createElement('div');
      temp.classList.add("playlist-controls")
        temp.innerHTML = shufflestring;

      //controlBar.appendChild(temp);
        
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
                  a.setAttribute("href", "#");
                  
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
              infoLi.classList.add("copyrightLi");
              infoLi.innerHTML = `<a href="#" id='copyrightBtn' class="nav-link"><i class="fa fa-info-circle"></i> Copyright Information</a>`
              target.appendChild(infoLi);


              document.querySelectorAll("#languageSelector li a").forEach(element=>{
                
                element.addEventListener("click", function(el){
                    el.preventDefault();

                    let id = el.target.id;

                    if(id!="copyrightBtn"){
                        
                        let lang = el.target.getAttribute("data-lang");

                        app.setLang(lang)
                        app.toggleHamburger();
                        app.loadCurrentLang();
                    } else {
                        
    
                        app.toggleHamburger();
                        app.changePage("copyright");
                        if(true){
                            //load it in!
                            fetch("about.html?about=true")
                            .then(resp=>{
                                if (!resp.ok) {
                                    throw new Error('Network response was not ok');
                                    //alert("ahh!")
                                }
                                return resp.text()
                            })
                            .then(data=>{

                                document.getElementById("loadCopyright").innerHTML = data;
                                app.makeCopyrightTabs();
                                document.getElementById("copyright").classList.add("loaded");

                            }).catch(error => {
                                // Handle the error here
                                console.warn('Fetch error wee:', error);
                              });
                        }
                    }
                })
              })
          }
      },
      
      
  
  }
  
  app.init();
  