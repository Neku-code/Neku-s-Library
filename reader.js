const urlParams = new URLSearchParams(window.location.search);
const pdfUrl = urlParams.get('book');
const title = urlParams.get('title');
const themeStorageKey = 'reader-theme';
const progressStorageKey = pdfUrl ? `reader-progress:${pdfUrl}` : null;


document.getElementById('bookTitle').textContent = title || 'Reader';

let pdfDoc = null;
let pageNum = 1;
let zoomLevel = 1;
let spreadMode = window.innerWidth <= 768 ? 'one' : 'two'; 
let renderVersion = 0;
let fullscreenPageScale = '1';

const leftCanvas = document.getElementById('leftPage');
const rightCanvas = document.getElementById('rightPage');

const leftCtx = leftCanvas.getContext('2d');
const rightCtx = rightCanvas.getContext('2d');

const leftWrapper = document.getElementById('leftWrapper');
const rightWrapper = document.getElementById('rightWrapper');
const bookView = document.getElementById('bookView');
const pageCounter = document.getElementById('pageCounter');
const spreadToggle = document.getElementById('spreadToggle');
const fullscreenScaleSelect = document.getElementById('fullscreenScale');
const zoomButtons = document.querySelectorAll('.zoom-controls button');
const prevPageHitbox = document.getElementById('prevPageHitbox');
const nextPageHitbox = document.getElementById('nextPageHitbox');

const savedTheme = localStorage.getItem(themeStorageKey);
if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
}

function applyZoom() {
    leftWrapper.style.overflow = 'hidden';
    rightWrapper.style.overflow = 'hidden';
    const zoomScale = isReaderFullscreen() ? 1 : zoomLevel;
    leftCanvas.style.transform = `scale(${zoomScale})`;
    rightCanvas.style.transform = `scale(${zoomScale})`;
    leftCanvas.style.transformOrigin = 'center center';
    rightCanvas.style.transformOrigin = 'center center';
}

function updateFullscreenControls() {
    const isFullscreen = isReaderFullscreen();

    zoomButtons.forEach(button => {
        button.disabled = isFullscreen;
        button.setAttribute('aria-disabled', String(isFullscreen));
        button.title = isFullscreen ? 'Zoom buttons are disabled in fullscreen mode' : '';
    });
}

function updatePageNavPositions() {
    if (!prevPageHitbox || !nextPageHitbox) return;

    const containerRect = readcnt.getBoundingClientRect();
    const leftRect = leftWrapper.getBoundingClientRect();
    const rightCanvasVisible = spreadMode === 'two' && getComputedStyle(rightWrapper).display !== 'none';
    const rightRect = rightCanvasVisible ? rightWrapper.getBoundingClientRect() : leftRect;
    const hitboxWidth = prevPageHitbox.offsetWidth || 76;
    const gutterOffset = 8;
    const minInset = 4;
    const maxLeft = Math.max(containerRect.width - hitboxWidth - minInset, minInset);
    const leftPosition = Math.min(
        Math.max(leftRect.left - containerRect.left - hitboxWidth - gutterOffset, minInset),
        maxLeft
    );
    const rightPosition = Math.min(
        Math.max(rightRect.right - containerRect.left + gutterOffset, minInset),
        maxLeft
    );

    prevPageHitbox.style.left = `${leftPosition}px`;
    nextPageHitbox.style.left = `${rightPosition}px`;
    nextPageHitbox.style.right = 'auto';
}

function scheduleRenderPages() {
    requestAnimationFrame(() => {
        requestAnimationFrame(() => {
            renderPages();
        });
    });
}

function getFullscreenFitScale(widthFitScale, heightFitScale) {
    const containScale = Math.min(widthFitScale, heightFitScale);
    const maxSafeScale = Math.min(widthFitScale, heightFitScale * 1.02);
    const scalePresets = {
        '1': 1,
        '1.5': 1.08,
        '2': 1.16
    };

    if (fullscreenPageScale === 'full') {
        return maxSafeScale;
    }

    const presetMultiplier = scalePresets[fullscreenPageScale] || 1;
    return Math.min(containScale * presetMultiplier, maxSafeScale);
}

window.addEventListener('resize', () => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile && spreadMode === 'two') {
        spreadMode = 'one';
        renderPages();
    } else if (!isMobile && spreadMode === 'one' && pdfDoc) {
    
    }

    if (isReaderFullscreen() && pdfDoc) {
        scheduleRenderPages();
    }

    updatePageNavPositions();
});

pdfjsLib.getDocument(pdfUrl).promise.then(pdf => {
    pdfDoc = pdf;
    if (progressStorageKey) {
        const savedPage = parseInt(localStorage.getItem(progressStorageKey), 10);
        if (!isNaN(savedPage) && savedPage >= 1 && savedPage <= pdfDoc.numPages) {
            pageNum = savedPage;
        }
    }
    renderPages();
});

function renderPage(num, canvas, ctx) {
    if (num > pdfDoc.numPages) {
        if (canvas.renderTask) {
            canvas.renderTask.cancel();
            canvas.renderTask = null;
        }
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        return;
    }

    const currentRenderVersion = renderVersion;

    if (canvas.renderTask) {
        canvas.renderTask.cancel();
        canvas.renderTask = null;
    }

    pdfDoc.getPage(num).then(page => {
        if (currentRenderVersion !== renderVersion) return;

        const container = document.getElementById("mainreader");
        const containerRect = container.getBoundingClientRect();
        const baseViewport = page.getViewport({ scale: 1 });
        const isFullscreen = isReaderFullscreen();
        const gap = spreadMode === 'two' ? 30 : 0;
        const visiblePageCount = spreadMode === 'two' ? 2 : 1;
        const availableWidth = isFullscreen
            ? Math.max((containerRect.width - gap - 40) / visiblePageCount, 1)
            : Math.max(containerRect.width * 0.9, 1);
        const availableHeight = Math.max(containerRect.height - 40, 1);

        if (isFullscreen && (containerRect.width < 100 || containerRect.height < 100)) {
            scheduleRenderPages();
            return;
        }

        const widthFitScale = availableWidth / baseViewport.width;
        const heightFitScale = availableHeight / baseViewport.height;

        let fitScale;
        if (isFullscreen) {
            fitScale = getFullscreenFitScale(widthFitScale, heightFitScale);
        } else {
            fitScale = widthFitScale;
        }

        const viewport = page.getViewport({ scale: fitScale });
        const outputScale = isFullscreen ? Math.max(window.devicePixelRatio || 1, 2) : 1;
        const outputViewport = page.getViewport({ scale: fitScale * outputScale });

        canvas.width = Math.floor(outputViewport.width);
        canvas.height = Math.floor(outputViewport.height);
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;

        const renderTask = page.render({
            canvasContext: ctx,
            viewport: outputViewport
        });

        canvas.renderTask = renderTask;

        renderTask.promise
            .catch(error => {
                if (error?.name !== 'RenderingCancelledException') {
                    throw error;
                }
            })
            .finally(() => {
                if (canvas.renderTask === renderTask) {
                    canvas.renderTask = null;
                }
                updatePageNavPositions();
            });
    });
}

function renderPages() {
    if (!pdfDoc) return;
    renderVersion += 1;
    applyZoom();

    if (spreadMode === 'two') {
        renderPage(pageNum, leftCanvas, leftCtx);
        renderPage(pageNum + 1, rightCanvas, rightCtx);
    } else {
        renderPage(pageNum, leftCanvas, leftCtx);
        rightCtx.clearRect(0, 0, rightCanvas.width, rightCanvas.height);
    }

    updateCounter();
    updateLayoutMode();
    updatePageNavPositions();

    if (progressStorageKey) {
        localStorage.setItem(progressStorageKey, pageNum);
    }
}

function updateCounter() {
    if (!pdfDoc) return;
    const pageInput = document.getElementById('pageInput');
    const totalPagesSpan = document.getElementById('totalPages');
    
    pageInput.value = pageNum;
    totalPagesSpan.textContent = pdfDoc.numPages;
}

document.getElementById('pageInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
        let newPage = parseInt(e.target.value);
        if (isNaN(newPage)) return;

        if (newPage < 1) newPage = 1;
        if (newPage > pdfDoc.numPages) newPage = pdfDoc.numPages;

        pageNum = newPage;
        renderPages();
    }
});

function updateLayoutMode() {
    if (spreadMode === 'two') {
        bookView.classList.remove('single-page');
        spreadToggle.textContent = 'Two Page';
    } else {
        bookView.classList.add('single-page');
        spreadToggle.textContent = 'One Page';
    }
}

function animateFlip(direction) {
    if (direction === 'next') {
        if (spreadMode === 'two') {
            rightWrapper.classList.add('flip-right');
            setTimeout(() => rightWrapper.classList.remove('flip-right'), 350);
        } else {
            leftWrapper.classList.add('flip-right');
            setTimeout(() => leftWrapper.classList.remove('flip-right'), 350);
        }
    } else {
        if (spreadMode === 'two') {
            leftWrapper.classList.add('flip-left');
            setTimeout(() => leftWrapper.classList.remove('flip-left'), 350);
        } else {
            leftWrapper.classList.add('flip-left');
            setTimeout(() => leftWrapper.classList.remove('flip-left'), 350);
        }
    }
}

function nextPage() {
    if (!pdfDoc) return;

    const step = spreadMode === 'two' ? 2 : 1;

    if (pageNum + step <= pdfDoc.numPages) {
        animateFlip('next');
        setTimeout(() => {
            pageNum += step;
            renderPages();
        }, 180);
    }
}

function prevPage() {
    if (!pdfDoc) return;

    const step = spreadMode === 'two' ? 2 : 1;

    if (pageNum - step >= 1) {
        animateFlip('prev');
        setTimeout(() => {
            pageNum -= step;
            renderPages();
        }, 350);
    }
}

function toggleSpreadMode() {
    if (spreadMode === 'two') {
        spreadMode = 'one';
        if (pageNum > pdfDoc.numPages) pageNum = pdfDoc.numPages;
    } else {
        spreadMode = 'two';
        if (pageNum % 2 === 0) pageNum = Math.max(1, pageNum - 1);
    }
    renderPages();
}

// function zoomIn() {
//     zoomLevel += 0.1;
//     bookView.style.transform = `scale(${zoomLevel})`;
// }
function zoomIn() {
    if (isReaderFullscreen()) return;
    zoomLevel += 0.1;
    renderPages();
}

function zoomOut() {
    if (isReaderFullscreen()) return;
    if (zoomLevel > 0.6) {
        zoomLevel -= 0.1;
        renderPages();
    }
}

function goBack() {
    window.location.href = 'index.html';
}

function setTheme(mode) {
    document.documentElement.setAttribute('data-theme', mode);
    localStorage.setItem(themeStorageKey, mode);
}

document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowRight') nextPage();
    if (e.key === 'ArrowLeft') prevPage();
});

function dropdownHider(){
    const themeChanger = document.getElementById("Show");
   if(themeChanger.style.display === "none"){
    themeChanger.style.display ="flex";
   } else {
    themeChanger.style.display = "none";
   }
}
const leftFilter = document.getElementById("leftPage")
const rightFilter = document.getElementById("rightPage")

function applyFilter(filterValue){
        const leftCanvas = document.getElementById("leftPage");
    const rightCanvas = document.getElementById("rightPage");

    leftCanvas.style.filter = filterValue;
    rightCanvas.style.filter = filterValue;
}
    document.getElementById("aply-soft").onclick = () =>{
        applyFilter("brightness(0.96) contrast(0.92) sepia(0.15)");}
    document.getElementById('aply-dark').onclick = ()=>{
        applyFilter("invert(1) hue-rotate(180deg) brightness(0.9) contrast(0.85)");
    }
    document.getElementById("aply-sepia").onclick = () => {
        applyFilter("sepia(0.35) brightness(0.95) contrast(0.9)");
    }
    document.getElementById("aply-sharp").onclick = () =>{
        applyFilter("contrast(1.1) brightness(1.02)");
    }
    document.getElementById("aply-eyecomfort").onclick = () =>{
        applyFilter("brightness(0.94) contrast(0.85) saturate(0.8)");
    }
    document.getElementById("aply-balanced").onclick = () =>{
        applyFilter("sepia(0.25) brightness(0.93) contrast(0.88) saturate(0.95)");
    }
    document.getElementById("aply-none").onclick = () =>{
        applyFilter("brightness(1) contrast(1) saturate(1) sepia(0) invert(0) hue-rotate(0deg) blur(0px)");
    }
//     const leftWrapper = document.getElementById('leftWrapper');
// const rightWrapper = document.getElementById('rightWrapper');

const readcnt = document.getElementById("mainreader");
const btner = document.getElementById("fullscreener");
let isFullscreenTransitioning = false;

function isReaderFullscreen() {
    return document.fullscreenElement === readcnt;
}

async function toggleFullscreen() {
    if (isFullscreenTransitioning) return;

    isFullscreenTransitioning = true;

    try {
        if (!document.fullscreenElement) {
            await readcnt.requestFullscreen();
        } else if (isReaderFullscreen()) {
            await document.exitFullscreen();
        }
    } catch (error) {
        console.error('Fullscreen toggle failed:', error);
    } finally {
        if (document.fullscreenElement !== readcnt && document.fullscreenElement !== null) {
            isFullscreenTransitioning = false;
        }
    }
}

document.addEventListener('fullscreenchange', () => {
    isFullscreenTransitioning = false;
    updateFullscreenControls();
    scheduleRenderPages();
});

btner.addEventListener("click", toggleFullscreen);

fullscreenScaleSelect.addEventListener('change', (e) => {
    fullscreenPageScale = e.target.value || '1';

    if (isReaderFullscreen()) {
        renderPages();
    }
});

updateFullscreenControls();
updatePageNavPositions();
