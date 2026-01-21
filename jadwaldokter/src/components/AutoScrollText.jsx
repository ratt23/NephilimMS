import React, { useEffect, useRef, useState } from 'react';

const AutoScrollText = ({ text, className = '' }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [shouldScroll, setShouldScroll] = useState(false);
    const [containerWidth, setContainerWidth] = useState(0);

    useEffect(() => {
        const checkOverflow = () => {
            if (containerRef.current && textRef.current) {
                const cWidth = containerRef.current.offsetWidth;
                const tWidth = textRef.current.scrollWidth;

                if (tWidth > cWidth) {
                    setContainerWidth(cWidth);
                    setShouldScroll(true);
                } else {
                    setShouldScroll(false);
                }
            }
        };

        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    return (
        <div ref={containerRef} className={`overflow-hidden whitespace-nowrap ${className}`} style={{ width: '100%' }}>
            <div
                ref={textRef}
                className="inline-block"
                style={shouldScroll ? {
                    animation: 'ping-pong 8s infinite linear',
                    '--container-width': `${containerWidth}px`
                } : {}}
            >
                {text}
            </div>
        </div>
    );
};

export default AutoScrollText;
