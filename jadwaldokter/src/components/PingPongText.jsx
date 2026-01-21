import React, { useEffect, useRef, useState } from 'react';

const PingPongText = ({ text, className = '' }) => {
    const containerRef = useRef(null);
    const textRef = useRef(null);
    const [distance, setDistance] = useState(0);

    const checkOverflow = () => {
        if (containerRef.current && textRef.current) {
            const contW = containerRef.current.clientWidth;
            const textW = textRef.current.scrollWidth;
            if (textW > contW) {
                setDistance(textW - contW);
            } else {
                setDistance(0);
            }
        }
    };

    useEffect(() => {
        checkOverflow();
        window.addEventListener('resize', checkOverflow);
        return () => window.removeEventListener('resize', checkOverflow);
    }, [text]);

    const style = distance > 0 ? {
        '--move-x': `-${distance}px`,
        animation: `ping-pong-dynamic ${Math.max(4, distance / 15)}s linear infinite alternate`
    } : {};

    return (
        <div ref={containerRef} className={`overflow-hidden relative ${className}`}>
            <div ref={textRef} className="whitespace-nowrap inline-block" style={style}>
                {text}
            </div>
        </div>
    );
};

export default PingPongText;
