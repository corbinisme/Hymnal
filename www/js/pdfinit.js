var pdf = {
    url: "pdf/001%20Guitar.pdf",
    pageNum:1,
    pageRendering:false,
    pageNumPending:null,
    scale:0.8,
    canvas:document.getElementById('thecanvas'),
    ctx: null,
    init: function(){
      pdf.ctx = pdf.canvas.getContext('2d');
      pdf.binding();
      pdfjsLib.getDocument({
            url:pdf.url,
            withCredentials: true
        }).promise.then(function(pdfDoc_) {
        pdfDoc = pdfDoc_;
        document.getElementById('page_count').textContent = pdfDoc.numPages;
        document.getElementById('pdfPlus').addEventListener('click', 
          function(){
            pdf.zoomPdf('plus')
          });
        document.getElementById('pdfMinus').addEventListener('click', 
          function(){
            pdf.zoomPdf('minus')
          });

        // Initial/first page rendering
        pdf.renderPage();
      });
      
    },
    
    binding: function(){

      document.getElementById('prev').addEventListener('click', pdf.onPrevPage);
      document.getElementById('next').addEventListener('click', pdf.onNextPage);
      
      

      // Listen for document to be loaded
      document.addEventListener('pagesinit', function () {
        // Create the measurement div.
        var div = document.createElement('div');
        div.id = 'page-measure';
        document.body.appendChild(div);
      });

      // Listen for document to be unloaded
      document.addEventListener('pageunload', function () {
        // Remove the measurement div.
        var div = document.getElementById('page-measure');
        if (div) {
          document.body.removeChild(div);
        }
      });
    },
    renderPage: function(){
      pdf.pageRendering = true;
      console.log("render page", pdfDoc)
      pdfDoc.getPage(pdf.pageNum).then(function(page) {
        var viewport = page.getViewport({scale: pdf.scale});
        pdf.canvas.height = viewport.height;
        pdf.canvas.width = viewport.width;

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: pdf.ctx,
          viewport: viewport
        };
        var renderTask = page.render(renderContext);

        // Wait for rendering to finish
        renderTask.promise.then(function() {
          pdf.pageRendering = false;
          if (pdf.pageNumPending !== null) {
            // New page rendering is pending
            pdf.renderPage(pdf.pageNumPending);
            pdf.pageNumPending = null;
          }
        });
      });

      // Update page counters
      document.getElementById('page_num').textContent = pdf.pageNum;
    },
    queueRenderPage: function(num) {
      if (pdf.pageRendering) {
        pdf.pageNumPending = num;
      } else {
        pdf.renderPage(num);
      }
    },
    onPrevPage: function() {
      if (pdf.pageNum <= 1) {
        return;
      }
      pdf.pageNum--;
      pdf.queueRenderPage(pdf.pageNum);
    },
    onNextPage: function() {
      if (pdf.pageNum >= pdfDoc.numPages) {
        return;
      }
      pdf.pageNum++;
      pdf.queueRenderPage(pdf.pageNum);
    },
    zoomPdf: function(dir){
      //pdf.pageRendering = true;
      console.log("zoomies", dir)
      if(dir == "plus"){
        pdf.scale += 0.1;
      }else{
        pdf.scale -= 0.1;
      }
      pdf.renderPage();
    }


  }