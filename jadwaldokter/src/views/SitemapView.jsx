import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const SitemapRoute = () => {
    const location = useLocation();

    useEffect(() => {
        const generateSitemap = async () => {
            try {
                // Use production domain
                const baseUrl = 'https://shab.web.id';
                const currentDate = new Date().toISOString();

                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
                xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

                // Homepage
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/</loc>\n`;
                xml += `    <lastmod>${currentDate}</lastmod>\n`;
                xml += '    <changefreq>daily</changefreq>\n';
                xml += '    <priority>1.0</priority>\n';
                xml += '  </url>\n';

                // Home page
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/home</loc>\n`;
                xml += `    <lastmod>${currentDate}</lastmod>\n`;
                xml += '    <changefreq>daily</changefreq>\n';
                xml += '    <priority>0.9</priority>\n';
                xml += '  </url>\n';

                // Article list page
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/article</loc>\n`;
                xml += `    <lastmod>${currentDate}</lastmod>\n`;
                xml += '    <changefreq>daily</changefreq>\n';
                xml += '    <priority>0.9</priority>\n';
                xml += '  </url>\n';

                // Fetch articles
                try {
                    const apiBase = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
                    const response = await fetch(`${apiBase}/posts?status=published`);

                    if (response.ok) {
                        const data = await response.json();
                        const articles = Array.isArray(data) ? data : (data.posts || []);

                        // Individual articles
                        articles.forEach(article => {
                            if (article.slug) {
                                const lastmod = article.updated_at || article.created_at || currentDate;
                                xml += '  <url>\n';
                                xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
                                xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
                                xml += '    <changefreq>weekly</changefreq>\n';
                                xml += '    <priority>0.8</priority>\n';

                                // Add image if available
                                if (article.image_url || article.image) {
                                    xml += '    <image:image>\n';
                                    xml += `      <image:loc>${article.image_url || article.image}</image:loc>\n`;
                                    xml += `      <image:title>${article.title}</image:title>\n`;
                                    xml += '    </image:image>\n';
                                }

                                xml += '  </url>\n';
                            }
                        });
                    } else {
                        console.error('Failed to fetch articles:', response.status);
                    }
                } catch (apiError) {
                    console.error('Error fetching articles for sitemap:', apiError);
                    // Continue generating sitemap without articles
                }

                xml += '</urlset>';

                // Set proper headers and return XML
                const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
                const url = URL.createObjectURL(blob);

                // Download the sitemap
                const a = document.createElement('a');
                a.href = url;
                a.download = 'sitemap.xml';
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
                URL.revokeObjectURL(url);

                // Also display the XML
                document.body.innerHTML = `<pre style="font-family: monospace; white-space: pre-wrap; word-wrap: break-word;">${xml.replace(/</g, '&lt;').replace(/>/g, '&gt;')}</pre>`;
            } catch (error) {
                console.error('Error generating sitemap:', error);
                document.body.innerHTML = `<div style="padding: 20px; font-family: Arial;"><h1>Error Generating Sitemap</h1><p>${error.message}</p></div>`;
            }
        };

        if (location.pathname === '/sitemap.xml') {
            generateSitemap();
        }
    }, [location]);

    return (
        <div style={{ padding: '20px', fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
            <h1>Generating Sitemap...</h1>
            <p>Please wait while we generate the sitemap for you.</p>
        </div>
    );
};

export default SitemapRoute;
