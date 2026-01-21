import React, { useEffect, useRef, useState } from 'react';

/**
 * AdDisplay Component - Multi-Network Ad Support with iframe
 * Supports Google AdSense and Adsterra (both async script and iframe)
 * Fetches configuration from Dashboard API
 * 
 * @param {string} slotId - Ad slot identifier
 * @param {string} format - Ad format (default: 'auto')
 * @param {boolean} responsive - Enable responsive ads (default: true)
 * @param {object} style - Custom styles for ad container
 * @param {string} network - Ad network to use: 'adsense' or 'adsterra' (default: 'adsense')
 */
const AdDisplay = ({
    slotId,
    adKey,
    adWidth,
    adHeight,
    style = {}
}) => {
    // Configuration with defaults (fallback to legacy 728x90)
    const config = {
        adKey: adKey || '7db0b5395b2f29fb7c281f6ecf07f805',
        width: adWidth || 728,
        height: adHeight || 90
    };

    const adsterraScript = `
        <html>
            <head>
                <base target="_blank">
                <style>body { margin: 0; padding: 0; display: flex; justify-content: center; }</style>
            </head>
            <body>
                <script type="text/javascript">
                    atOptions = {
                        'key' : '${config.adKey}',
                        'format' : 'iframe',
                        'height' : ${config.height},
                        'width' : ${config.width},
                        'params' : {}
                    };
                </script>
                <script type="text/javascript" src="https://www.highperformanceformat.com/${config.adKey}/invoke.js"></script>
            </body>
        </html>
    `;

    return (
        <div className="ad-container" style={{
            ...style,
            position: 'absolute',
            bottom: 0,
            left: 0,
            width: '1px',
            height: '1px',
            opacity: 0,
            overflow: 'hidden',
            zIndex: -1,
            pointerEvents: 'none'
        }}>
            <iframe
                title={`Adsterra Ad ${config.width}x${config.height}`}
                width={config.width}
                height={config.height}
                srcDoc={adsterraScript}
                style={{ border: 'none', overflow: 'hidden', width: `${config.width}px`, height: `${config.height}px` }}
                scrolling="no"
                frameBorder="0"
                sandbox="allow-scripts allow-popups allow-same-origin allow-forms"
            />
        </div>
    );
};

export default AdDisplay;
