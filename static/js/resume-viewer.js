// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

const url = 'assets/resume/Resume.pdf';

let pdfDoc = null,
    pageNum = 1,
    pageRendering = false,
    pageNumPending = null,
    scale = 1.5,
    canvas = document.getElementById('resume-render'),
    ctx = canvas.getContext('2d'),
    textLayerDiv = document.getElementById('text-layer'),
    annotationLayerDiv = document.getElementById('annotation-layer'),
    pdfWrapper = document.getElementById('pdf-wrapper');

/**
 * Get page info from document, resize canvas accordingly, and render page.
 * @param num Page number.
 */
function renderPage(num) {
  pageRendering = true;
  
  // Clear previous layers
  textLayerDiv.innerHTML = '';
  annotationLayerDiv.innerHTML = '';

  // Fetch page
  pdfDoc.getPage(num).then(function(page) {
    const viewport = page.getViewport({scale: scale});
    
    // Set dimensions for canvas and wrapper
    canvas.height = viewport.height;
    canvas.width = viewport.width;
    pdfWrapper.style.width = `${viewport.width}px`;
    pdfWrapper.style.height = `${viewport.height}px`;

    // --- 1. Render Visuals (Canvas) ---
    const renderContext = {
      canvasContext: ctx,
      viewport: viewport
    };
    const renderTask = page.render(renderContext);

    // Wait for render to finish
    renderTask.promise.then(function() {
      pageRendering = false;
      if (pageNumPending !== null) {
        renderPage(pageNumPending);
        pageNumPending = null;
      }
    }).then(() => {
        // --- 2. Render Text Layer (Selectable Text) ---
        return page.getTextContent();
    }).then((textContent) => {
        // We need to set the CSS variables for the text layer to match the viewport
        textLayerDiv.style.left = '0';
        textLayerDiv.style.top = '0';
        textLayerDiv.style.height = `${viewport.height}px`;
        textLayerDiv.style.width = `${viewport.width}px`;
        // Pass the viewport to the text layer
        textLayerDiv.style.setProperty('--scale-factor', scale);
        
        // Render text items using the official API
        const textLayerPromise = pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayerDiv,
            viewport: viewport,
            textDivs: []
        }).promise;
        
        return textLayerPromise;

    }).then(() => {
        // --- 3. Render Annotation Layer (Links) ---
        return page.getAnnotations();
    }).then((annotations) => {
        if (annotations.length === 0) return;

        // Ensure dimensions match
        annotationLayerDiv.style.left = '0';
        annotationLayerDiv.style.top = '0';
        annotationLayerDiv.style.height = `${viewport.height}px`;
        annotationLayerDiv.style.width = `${viewport.width}px`;

        // Render annotations
        // We can use pdfjsLib.AnnotationLayer (if available) or build it manually.
        // Manual is safer for avoiding dependencies.
        
        annotations.forEach(annotation => {
            if (annotation.subtype === 'Link' && annotation.url) {
                const link = document.createElement('a');
                link.href = annotation.url;
                link.target = "_blank"; // Open in new tab
                link.title = annotation.url;
                
                // Calculate position
                // Rect is [x_bottom_left, y_bottom_left, x_top_right, y_top_right] (PDF coords)
                // We need to convert to viewport coords
                const rect = viewport.convertToViewportRectangle(annotation.rect);
                
                // rect is now [x_min, y_min, x_max, y_max] in standard Cartesian (y goes up? No, viewport y goes down)
                // Actually convertToViewportRectangle returns [minX, minY, maxX, maxY] usually.
                // Let's double check standard PDF.js output.
                // Usually: [x, y, w, h] or similar.
                
                // Let's use the rect directly from the viewport transform
                // Viewport returns [x1, y1, x2, y2]
                // We need left, top, width, height
                
                // Normalize rect (handle potential coordinate flips)
                const x1 = Math.min(rect[0], rect[2]);
                const x2 = Math.max(rect[0], rect[2]);
                const y1 = Math.min(rect[1], rect[3]);
                const y2 = Math.max(rect[1], rect[3]);
                
                link.style.left = `${x1}px`;
                link.style.top = `${y1}px`;
                link.style.width = `${x2 - x1}px`;
                link.style.height = `${y2 - y1}px`;
                link.style.position = 'absolute';
                link.className = 'linkAnnotation'; // For styling
                
                annotationLayerDiv.appendChild(link);
            }
        });
    });
  });

  // Update page counters
  document.getElementById('page-num').textContent = num;
}

/**
 * If another page rendering in progress, waits until the rendering is
 * finised. Otherwise, executes rendering immediately.
 */
function queueRenderPage(num) {
  if (pageRendering) {
    pageNumPending = num;
  } else {
    renderPage(num);
  }
}

/**
 * Displays previous page.
 */
function onPrevPage() {
  if (pageNum <= 1) {
    return;
  }
  pageNum--;
  queueRenderPage(pageNum);
}
document.getElementById('prev-page').addEventListener('click', onPrevPage);

/**
 * Displays next page.
 */
function onNextPage() {
  if (pageNum >= pdfDoc.numPages) {
    return;
  }
  pageNum++;
  queueRenderPage(pageNum);
}
document.getElementById('next-page').addEventListener('click', onNextPage);

/**
 * Zoom In
 */
document.getElementById('zoom-in').addEventListener('click', function() {
    scale += 0.2;
    queueRenderPage(pageNum);
});

/**
 * Zoom Out
 */
document.getElementById('zoom-out').addEventListener('click', function() {
    if (scale <= 0.6) return;
    scale -= 0.2;
    queueRenderPage(pageNum);
});

/**
 * Asynchronously downloads PDF.
 */
pdfjsLib.getDocument(url).promise.then(function(pdfDoc_) {
  pdfDoc = pdfDoc_;
  document.getElementById('page-count').textContent = pdfDoc.numPages;

  // Initial render
  // Auto-calculate initial scale to fit container nicely
  const container = document.getElementById('canvas-container');
  // We need to fetch the first page to know its dimensions for auto-scaling
  pdfDoc.getPage(1).then((page) => {
      const viewport_unscaled = page.getViewport({scale: 1});
      const desiredWidth = container.clientWidth - 40;
      if (desiredWidth < viewport_unscaled.width) {
          scale = desiredWidth / viewport_unscaled.width;
      } else {
          scale = 1.2; // Default nice size
      }
      renderPage(pageNum);
  });
}).catch(function(error) {
    console.error('Error loading PDF:', error);
    // Fallback?
    document.getElementById('canvas-container').innerHTML = '<p style="color:white; text-align:center; padding:2rem;">Error loading PDF. Please download it using the button above.</p>';
});