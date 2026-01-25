import React, { useEffect, useRef, useState } from 'react';
import * as pdfjsLib from 'pdfjs-dist';
import {
    ChevronLeft,
    ChevronRight,
    ZoomIn,
    ZoomOut,
    Maximize
} from 'lucide-react';
import { useSwipeable } from 'react-swipeable';
import { get, set } from 'idb-keyval';

// IMPORTANT: Worker configuration matching Vite setup
pdfjsLib.GlobalWorkerOptions.workerSrc = '/pdf.worker.min.mjs';

// Cache utilities
const CACHE_DURATION = 30 * 24 * 60 * 60 * 1000; // 30 days in milliseconds

const getCacheKey = (url) => {
    return `pdf_cache_${btoa(url).replace(/[^a-zA-Z0-9]/g, '_')}`;
};

const getCachedPDF = (url) => {
    try {
        const cacheKey = getCacheKey(url);
        const cached = localStorage.getItem(cacheKey);
        if (!cached) return null;

        const { data, timestamp, cachedUrl } = JSON.parse(cached);

        // Validate TTL
        if (Date.now() - timestamp > CACHE_DURATION || cachedUrl !== url) {
            localStorage.removeItem(cacheKey);
            return null;
        }

        return data;
    } catch (error) {
        console.error('Cache read error:', error);
        return null;
    }
};

const setCachedPDF = (url, data) => {
    try {
        const cacheKey = getCacheKey(url);
        const cacheData = {
            data,
            timestamp: Date.now(),
            cachedUrl: url
        };
        localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
        console.error('Cache write error:', error);
        // If quota exceeded, clear old caches
        if (error.name === 'QuotaExceededError') {
            clearOldCaches();
        }
    }
};

const clearOldCaches = () => {
    const keys = Object.keys(localStorage);
    keys.forEach(key => {
        if (key.startsWith('pdf_cache_')) {
            try {
                const cached = JSON.parse(localStorage.getItem(key));
                if (Date.now() - cached.timestamp > CACHE_DURATION) {
                    localStorage.removeItem(key);
                }
            } catch (e) {
                localStorage.removeItem(key);
            }
        }
    });
};

const PDFViewer = ({ url, catalogCount = 1, currentIndex = 0, onPrevious, onNext }) => {
    const canvasRef = useRef(null);
    const containerRef = useRef(null);
    const [loading, setLoading] = useState(true);
    const [loadingProgress, setLoadingProgress] = useState(0);
    const [error, setError] = useState(null);
    const [pdfDoc, setPdfDoc] = useState(null);
    const [pageNum, setPageNum] = useState(1);
    const [pageCount, setPageCount] = useState(0);
    const [scale, setScale] = useState(1.0);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [showLeftArrow, setShowLeftArrow] = useState(false);
    const [showRightArrow, setShowRightArrow] = useState(false);

    // Auto-scale logic
    const updateScale = (pdf) => {
        if (!containerRef.current || !pdf) return;

        const container = containerRef.current;
        const padding = window.innerWidth < 768 ? 20 : 64;
        const availableWidth = container.clientWidth - padding;
        const availableHeight = container.clientHeight - padding;

        pdf.getPage(pageNum).then(page => {
            const viewport = page.getViewport({ scale: 1.0 });
            const scaleX = availableWidth / viewport.width;
            const scaleY = availableHeight / viewport.height;

            // Adjust scale to fit width mainly, but respect height
            let newScale = Math.min(scaleX, scaleY);

            // If on mobile, prioritize width to make it readable
            if (window.innerWidth < 768) {
                newScale = scaleX;
            }

            setScale(Math.min(newScale, 2.0)); // Cap at 2x
        });
    };

    useEffect(() => {
        if (pdfDoc) {
            updateScale(pdfDoc);

            const handleResize = () => updateScale(pdfDoc);
            window.addEventListener('resize', handleResize);
            return () => window.removeEventListener('resize', handleResize);
        }
    }, [pdfDoc, pageNum]);

    // Use configured API base or default to relative path
    const API_BASE = import.meta.env.VITE_API_BASE || '/.netlify/functions';

    let proxyUrl = url;

    if (url) {
        if (url.includes('res.cloudinary.com')) {
            // Cloudinary Rewrite (Bypasses Lambda 6MB limit)
            let apiOrigin = '';
            try {
                if (API_BASE.startsWith('http')) {
                    apiOrigin = new URL(API_BASE).origin;
                }
            } catch (e) { console.warn('Invalid API_BASE', e); }

            const cloudinaryPath = url.split('res.cloudinary.com')[1];
            proxyUrl = `${apiOrigin}/cloudinary-proxy${cloudinaryPath}`;

        } else if (url.startsWith('http')) {
            // Lambda Proxy Fallback
            const proxyEndpoint = `${API_BASE}/pdf-proxy`;
            proxyUrl = `${proxyEndpoint}?url=${encodeURIComponent(url)}`;
        }
    }

    // Check cache
    const getCachedPDF = async (pdfUrl) => {
        try {
            const cached = await get(`pdf_cache_${pdfUrl}`);
            if (cached) {
                const { data, timestamp } = cached;
                // Check if expired (30 days)
                const now = new Date().getTime();
                const diff = now - timestamp;
                const days = diff / (1000 * 60 * 60 * 24);

                if (days < 30) {
                    console.log('Serving PDF from IndexedDB Cache (Valid for 30 days)');
                    return data; // This will be an ArrayBuffer
                } else {
                    console.log('Cache expired, re-fetching');
                }
            }
        } catch (err) {
            console.error('Error reading from IndexedDB:', err);
        }
        return null;
    };

    // Save to cache (IndexedDB handles large files >5MB easily)
    const setCachedPDF = async (pdfUrl, data) => { // data is ArrayBuffer
        try {
            const cacheData = {
                data, // Store ArrayBuffer directly
                timestamp: new Date().getTime()
            };
            await set(`pdf_cache_${pdfUrl}`, cacheData);
            console.log('PDF saved to IndexedDB Cache (30 days)');
        } catch (err) {
            console.error('Error saving to IndexedDB:', err);
        }
    };

    useEffect(() => {
        const loadPDF = async () => {
            try {
                setLoading(true);
                setLoadingProgress(10);
                setError(null);

                // 1. Try cache first
                const cachedArrayBuffer = await getCachedPDF(proxyUrl);
                if (cachedArrayBuffer) {
                    setLoadingProgress(100);
                    const loadingTask = pdfjsLib.getDocument({ data: cachedArrayBuffer });
                    const pdf = await loadingTask.promise;
                    setPdfDoc(pdf);
                    setPageCount(pdf.numPages);
                    setPageNum(1);
                    setTimeout(() => setLoading(false), 300);
                    return;
                }

                // 2. If no cache, fetch from network
                console.log('Fetching PDF from network:', proxyUrl);

                const response = await fetch(proxyUrl);
                if (!response.ok) throw new Error(`Failed to load PDF: ${response.statusText}`);

                const contentLength = response.headers.get('content-length');
                const total = parseInt(contentLength, 10);
                let loaded = 0;

                const reader = response.body.getReader();
                const chunks = [];

                while (true) {
                    const { done, value } = await reader.read();
                    if (done) break;

                    chunks.push(value);
                    loaded += value.length;

                    if (total) {
                        // Progress from 30% to 90% (allocating first 30% for init)
                        const progress = 30 + Math.round((loaded / total) * 60);
                        setLoadingProgress(progress);
                    }
                }

                const blob = new Blob(chunks, { type: 'application/pdf' });
                const arrayBuffer = await blob.arrayBuffer();

                // Render PDF
                setLoadingProgress(95);

                // Clone buffer for cache BEFORE it gets transferred/detached by pdf.js logic
                const bufferForCache = arrayBuffer.slice(0);

                const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
                const pdf = await loadingTask.promise;

                setPdfDoc(pdf);
                setPageCount(pdf.numPages);
                setPageNum(1);

                // Save to Cache (Async) - Store the clone
                setCachedPDF(proxyUrl, bufferForCache);

                setLoadingProgress(100);
                setTimeout(() => setLoading(false), 300);

            } catch (err) {
                console.error('Error loading PDF:', err);
                setError(err.message || 'Failed to load PDF');
                setLoading(false);
            }
        };

        if (url) {
            loadPDF();
        }
    }, [url, proxyUrl]);

    useEffect(() => {
        let renderTask = null;
        let cancelled = false;

        const renderPage = async () => {
            if (!pdfDoc || !canvasRef.current || cancelled) return;

            try {
                const page = await pdfDoc.getPage(pageNum);
                if (cancelled) return;

                const viewport = page.getViewport({ scale });
                const canvas = canvasRef.current;
                if (!canvas || cancelled) return;

                const context = canvas.getContext('2d');

                const outputScale = window.devicePixelRatio || 1;
                canvas.width = Math.floor(viewport.width * outputScale);
                canvas.height = Math.floor(viewport.height * outputScale);
                canvas.style.width = Math.floor(viewport.width) + "px";
                canvas.style.height = Math.floor(viewport.height) + "px";

                const transform = outputScale !== 1
                    ? [outputScale, 0, 0, outputScale, 0, 0]
                    : null;

                const renderContext = {
                    canvasContext: context,
                    transform: transform,
                    viewport: viewport,
                };

                renderTask = page.render(renderContext);
                await renderTask.promise;
            } catch (err) {
                if (err.name !== 'RenderingCancelledException') {
                    console.error('Error rendering page:', err);
                }
            }
        };

        renderPage();

        return () => {
            cancelled = true;
            if (renderTask) {
                renderTask.cancel();
            }
        };
    }, [pdfDoc, pageNum, scale]);

    // Swipe handlers using react-swipeable
    const handlers = useSwipeable({
        onSwipedLeft: () => {
            if (pageNum < pageCount) setPageNum(p => p + 1);
        },
        onSwipedRight: () => {
            if (pageNum > 1) setPageNum(p => p - 1);
        },
        preventDefaultTouchmoveEvent: true,
        trackMouse: false
    });

    // Navigate to specific page
    const handlePageInput = (e) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val) && val >= 1 && val <= pageCount) {
            setPageNum(val);
        }
    };

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen();
            setIsFullscreen(true);
        } else {
            if (document.exitFullscreen) {
                document.exitFullscreen();
                setIsFullscreen(false);
            }
        }
    };

    return (
        <div
            className="flex-1 flex flex-col bg-zinc-900 h-full relative font-sans"
            ref={containerRef}
            {...handlers}
        >
            {/* Loading Popup Animation - "e-Newsletter" Style */}
            {loading && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-fade-in">
                    <div className="bg-white rounded-xl shadow-2xl p-8 max-w-sm w-full mx-4 animate-zoom-in-95 flex flex-col items-center">
                        <div className="w-16 h-16 mb-4 relative">
                            <div className="absolute inset-0 border-4 border-blue-100 rounded-full"></div>
                            <div className="absolute inset-0 border-4 border-blue-600 rounded-full border-t-transparent animate-spin"></div>
                        </div>
                        <h3 className="text-xl font-bold text-gray-800 mb-1">eCatalog</h3>
                        <p className="text-gray-500 font-medium animate-pulse">Loading...</p>

                        {/* Progress Bar */}
                        <div className="w-full mt-6 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-blue-600 transition-all duration-300 ease-out"
                                style={{ width: `${loadingProgress}%` }}
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Viewer Content */}
            <div className="flex-1 overflow-auto bg-[#2e2e2e] flex justify-center items-start md:items-center relative group min-h-0">
                {error && (
                    <div className="bg-zinc-800 border border-zinc-700 p-8 rounded-2xl shadow-2xl max-w-md text-center my-auto">
                        <div className="bg-red-900/30 p-4 rounded-full inline-block mb-4">
                            <svg className="w-12 h-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                            </svg>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">Unavailable</h3>
                        <p className="text-zinc-400 mb-6">{error}</p>
                    </div>
                )}

                <div className="relative py-4 md:py-8">
                    <canvas
                        ref={canvasRef}
                        className={`shadow-2xl shadow-black/70 transition-all duration-300 ease-out border border-white/5 ${loading || error ? 'opacity-0 hidden' : 'opacity-100'}`}
                    />
                </div>

                {/* Click to view in fullscreen overlay */}
                {!loading && !error && !isFullscreen && (
                    <div className="absolute bottom-24 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none">
                        <div className="bg-black/70 backdrop-blur-md text-white px-6 py-2 rounded-full text-sm font-medium shadow-lg pointer-events-auto cursor-pointer hover:bg-black/90 transition-colors" onClick={toggleFullscreen}>
                            Click to view in fullscreen
                        </div>
                    </div>
                )}
            </div>

            {/* Side Arrow - Left */}
            {!loading && !error && pageNum > 1 && (
                <div
                    className="hidden md:block fixed left-4 top-1/2 transform -translate-y-1/2 z-40"
                    onMouseEnter={() => setShowLeftArrow(true)}
                    onMouseLeave={() => setShowLeftArrow(false)}
                >
                    <button
                        onClick={() => setPageNum(p => Math.max(1, p - 1))}
                        className={`p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-full shadow-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 active:scale-95 ${showLeftArrow ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}
                    >
                        <ChevronLeft size={30} strokeWidth={2} />
                    </button>
                </div>
            )}

            {/* Side Arrow - Right */}
            {!loading && !error && pageNum < pageCount && (
                <div
                    className="hidden md:block fixed right-4 top-1/2 transform -translate-y-1/2 z-40"
                    onMouseEnter={() => setShowRightArrow(true)}
                    onMouseLeave={() => setShowRightArrow(false)}
                >
                    <button
                        onClick={() => setPageNum(p => Math.min(pageCount, p + 1))}
                        className={`p-3 bg-black/30 backdrop-blur-md border border-white/10 rounded-full shadow-lg transition-all duration-300 text-white/80 hover:text-white hover:bg-black/60 hover:scale-110 active:scale-95 ${showRightArrow ? 'opacity-100 translate-x-0' : 'opacity-0 translate-x-4'}`}
                    >
                        <ChevronRight size={30} strokeWidth={2} />
                    </button>
                </div>
            )}

            {/* Bottom Navigation Reference Style */}
            {!loading && !error && (
                <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center pb-6 pointer-events-none">
                    <div className="bg-[#1a1a1a]/95 backdrop-blur-xl border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl flex items-center gap-4 pointer-events-auto mx-4 overflow-x-auto max-w-full">

                        {/* First Page */}
                        <button
                            onClick={() => setPageNum(1)}
                            disabled={pageNum <= 1}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white disabled:opacity-30"
                            title="First Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
                        </button>

                        {/* Prev Page */}
                        <button
                            onClick={() => setPageNum(p => Math.max(1, p - 1))}
                            disabled={pageNum <= 1}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/90 hover:text-white disabled:opacity-30"
                            title="Previous Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
                        </button>

                        {/* Page Input Display */}
                        <div className="flex items-center bg-white rounded px-2 py-0.5 h-7">
                            <input
                                type="text"
                                value={pageNum}
                                onChange={handlePageInput}
                                className="w-8 text-center bg-transparent border-none outline-none text-black font-semibold text-sm p-0 focus:ring-0"
                            />
                            <span className="text-gray-500 text-sm font-medium border-l border-gray-300 pl-2 ml-1">
                                {pageCount}
                            </span>
                        </div>

                        {/* Next Page */}
                        <button
                            onClick={() => setPageNum(p => Math.min(pageCount, p + 1))}
                            disabled={pageNum >= pageCount}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/90 hover:text-white disabled:opacity-30"
                            title="Next Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
                        </button>

                        {/* Last Page */}
                        <button
                            onClick={() => setPageNum(pageCount)}
                            disabled={pageNum >= pageCount}
                            className="p-1.5 hover:bg-white/10 rounded transition-colors text-white/70 hover:text-white disabled:opacity-30"
                            title="Last Page"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                        </button>

                        {/* Separator */}
                        <div className="w-px h-5 bg-white/20 mx-1"></div>

                        {/* Zoom Controls */}
                        <div className="flex items-center gap-1">
                            <button onClick={() => setScale(s => Math.max(0.5, s - 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white"><ZoomOut size={18} /></button>
                            <button onClick={() => setScale(s => Math.min(3, s + 0.1))} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white"><ZoomIn size={18} /></button>
                        </div>

                        {/* Separator */}
                        <div className="w-px h-5 bg-white/20 mx-1"></div>

                        {/* More Options / Fullscreen */}
                        <button onClick={toggleFullscreen} className="p-1.5 hover:bg-white/10 rounded text-white/80 hover:text-white" title="Toggle Fullscreen">
                            <Maximize size={18} />
                        </button>
                    </div>

                    {/* Catalog Nav Floating Below (Mobile Only if needed, otherwise integrated) */}
                    {catalogCount > 1 && (
                        <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 flex items-center gap-2 bg-black/60 backdrop-blur rounded-full px-4 py-1.5 pointer-events-auto">
                            <button onClick={onPrevious} disabled={currentIndex === 0} className="text-white/70 hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                            <span className="text-xs text-white/90 font-medium">Vol {currentIndex + 1}</span>
                            <button onClick={onNext} disabled={currentIndex === newsletterCount - 1} className="text-white/70 hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default PDFViewer;
