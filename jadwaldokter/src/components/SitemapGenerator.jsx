import React, { useEffect, useState } from 'react';
import { Helmet } from 'react-helmet-async';

const SitemapGenerator = () => {
    const [sitemap, setSitemap] = useState('');

    useEffect(() => {
        const generateSitemap = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
                const response = await fetch(`${apiBase}/posts?status=published`);
                const data = await response.json();
                const articles = Array.isArray(data) ? data : (data.posts || []);

                const baseUrl = 'https://shab.web.id';
                const currentDate = new Date().toISOString();

                let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
                xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

                // Homepage
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/</loc>\n`;
                xml += `    <lastmod>${currentDate}</lastmod>\n`;
                xml += '    <changefreq>daily</changefreq>\n';
                xml += '    <priority>1.0</priority>\n';
                xml += '  </url>\n';

                // Article list page
                xml += '  <url>\n';
                xml += `    <loc>${baseUrl}/article</loc>\n`;
                xml += `    <lastmod>${currentDate}</lastmod>\n`;
                xml += '    <changefreq>daily</changefreq>\n';
                xml += '    <priority>0.9</priority>\n';
                xml += '  </url>\n';

                // Individual articles
                articles.forEach(article => {
                    const lastmod = article.updated_at || article.created_at || currentDate;
                    xml += '  <url>\n';
                    xml += `    <loc>${baseUrl}/article/${article.slug}</loc>\n`;
                    xml += `    <lastmod>${new Date(lastmod).toISOString()}</lastmod>\n`;
                    xml += '    <changefreq>weekly</changefreq>\n';
                    xml += '    <priority>0.8</priority>\n';
                    xml += '  </url>\n';
                });

                xml += '</urlset>';

                setSitemap(xml);
            } catch (error) {
                console.error('Error generating sitemap:', error);
            }
        };

        generateSitemap();
    }, []);

    return (
        <Helmet>
            <link rel="sitemap" type="application/xml" title="Sitemap" href="/sitemap.xml" />
        </Helmet>
    );
};

export default SitemapGenerator;
