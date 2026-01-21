import React, { useEffect, useRef, useState } from 'react';

const Ticker = ({ title, children, speed = 50, height = 'h-48', onClick, headerClassName = '' }) => {
    const scrollRef = useRef(null);
    const [scrolling, setScrolling] = useState(true);

    useEffect(() => {
        const container = scrollRef.current;
        if (!container || !scrolling) return;

        const interval = setInterval(() => {
            if (container.scrollTop >= (container.scrollHeight / 2)) {
                container.scrollTop = 0;
            } else {
                container.scrollTop += 1;
            }
        }, speed);

        return () => clearInterval(interval);
    }, [scrolling, speed, children]);

    return (
        <div>
            <div
                className={`flex items-center justify-between mb-2 px-3 py-2 rounded-lg transition-all shadow-sm ${onClick ? 'cursor-pointer hover:opacity-90 active:scale-95' : ''} ${headerClassName}`}
                onClick={onClick}
            >
                <h3 className={`text-base font-bold ${headerClassName ? 'text-white' : 'text-[#1f2937]'}`}>{title}</h3>
                {onClick && (
                    <svg xmlns="http://www.w3.org/2000/svg" className={`h-5 w-5 ${headerClassName ? 'text-white/90' : 'text-slate-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                    </svg>
                )}
            </div>
            <div
                className={`ticker-wrap ${height} bg-white rounded-xl shadow-sm border border-slate-100 overflow-y-auto relative group scrollbar-hide`}
                ref={scrollRef}
                onMouseEnter={() => setScrolling(false)}
                onMouseLeave={() => setScrolling(true)}
                onTouchStart={() => setScrolling(false)}
                onTouchEnd={() => setScrolling(true)}
            >
                <div className="ticker-track flex flex-col gap-3 p-3">
                    {/* Double the children for seamless loop */}
                    {children}
                    {children}
                </div>
            </div>
        </div>
    );
};

export default Ticker;
