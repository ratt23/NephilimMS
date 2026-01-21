import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import AdDisplay from '../components/AdDisplay';

import { useConfig } from '../context/ConfigContext';

const ArticleDetailView = () => {
    const { slug } = useParams();
    const config = useConfig();
    const [article, setArticle] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [tableOfContents, setTableOfContents] = useState([]);

    useEffect(() => {
        const fetchArticleDetail = async () => {
            try {
                const apiBase = import.meta.env.VITE_API_BASE_URL || '/.netlify/functions';
                const response = await fetch(`${apiBase}/api/posts?slug=${slug}`);
                if (!response.ok) {
                    throw new Error('Failed to fetch article');
                }
                const data = await response.json();
                // API might return array with one item or the object directly
                const articleData = Array.isArray(data) ? data[0] : (data.posts ? data.posts[0] : data);

                if (!articleData) {
                    // Fallback for "not found" if API returns empty array/object but status 200
                    throw new Error('Artikel tidak ditemukan');
                }

                setArticle(articleData);
            } catch (err) {
                console.error('Error fetching article detail:', err);
                setError('Artikel tidak ditemukan atau terjadi kesalahan.');
            } finally {
                setLoading(false);
            }
        };

        if (slug) {
            fetchArticleDetail();
        }
    }, [slug]);

    // SEO Meta Tags - Update when article loads
    useEffect(() => {
        if (article) {
            // Update title
            const hospitalName = config.hospitalName || 'RSU Siloam Ambon';
            document.title = `${article.title} - ${hospitalName}`;

            // Update meta description
            let metaDescription = document.querySelector('meta[name="description"]');
            if (!metaDescription) {
                metaDescription = document.createElement('meta');
                metaDescription.name = 'description';
                document.head.appendChild(metaDescription);
            }
            const description = article.excerpt || (article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 155) + '...' : `Artikel kesehatan dari ${hospitalName}`);
            metaDescription.content = description;

            // Update robots meta tag
            let metaRobots = document.querySelector('meta[name="robots"]');
            if (!metaRobots) {
                metaRobots = document.createElement('meta');
                metaRobots.name = 'robots';
                document.head.appendChild(metaRobots);
            }
            metaRobots.content = 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1';

            // Update canonical URL
            let canonical = document.querySelector('link[rel="canonical"]');
            if (!canonical) {
                canonical = document.createElement('link');
                canonical.rel = 'canonical';
                document.head.appendChild(canonical);
            }
            canonical.href = `https://shab.web.id/article/${article.slug}`;

            // Open Graph
            const updateOgTag = (property, content) => {
                let tag = document.querySelector(`meta[property="${property}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.setAttribute('property', property);
                    document.head.appendChild(tag);
                }
                tag.content = content;
            };

            updateOgTag('og:type', 'article');
            updateOgTag('og:url', `https://shab.web.id/article/${article.slug}`);
            updateOgTag('og:title', article.title);
            updateOgTag('og:description', description);
            updateOgTag('og:image', article.image || 'https://shab.web.id/asset/logo/logo.png');
            if (article.created_at) updateOgTag('article:published_time', article.created_at);
            if (article.author) updateOgTag('article:author', article.author);

            // Twitter Card
            const updateTwitterTag = (name, content) => {
                let tag = document.querySelector(`meta[name="${name}"]`);
                if (!tag) {
                    tag = document.createElement('meta');
                    tag.name = name;
                    document.head.appendChild(tag);
                }
                tag.content = content;
            };

            updateTwitterTag('twitter:card', 'summary_large_image');
            updateTwitterTag('twitter:url', `https://shab.web.id/article/${article.slug}`);
            updateTwitterTag('twitter:title', article.title);
            updateTwitterTag('twitter:description', description);
            updateTwitterTag('twitter:image', article.image || 'https://shab.web.id/asset/logo/logo.png');

            // Structured Data (JSON-LD for Article)
            let structuredData = document.querySelector('#article-structured-data');
            if (!structuredData) {
                structuredData = document.createElement('script');
                structuredData.id = 'article-structured-data';
                structuredData.type = 'application/ld+json';
                document.head.appendChild(structuredData);
            }
            structuredData.textContent = JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                "headline": article.title,
                "description": description,
                "image": article.image || 'https://shab.web.id/asset/logo/logo.png',
                "datePublished": article.created_at || new Date().toISOString(),
                "dateModified": article.updated_at || article.created_at || new Date().toISOString(),
                "author": {
                    "@type": article.author ? "Person" : "Organization",
                    "name": article.author || hospitalName
                },
                "publisher": {
                    "@type": "Organization",
                    "name": hospitalName,
                    "logo": {
                        "@type": "ImageObject",
                        "url": "https://shab.web.id/asset/logo/logo.png"
                    }
                },
                "mainEntityOfPage": {
                    "@type": "WebPage",
                    "@id": `https://shab.web.id/article/${article.slug}`
                }
            });
        }
    }, [article, config.hospitalName]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            weekday: 'long'
        });
    };

    // Extract table of contents from article content
    useEffect(() => {
        if (article && article.content) {
            const parser = new DOMParser();
            const doc = parser.parseFromString(article.content, 'text/html');
            const headings = doc.querySelectorAll('h2, h3');

            const toc = Array.from(headings).map((heading, index) => {
                const id = `heading-${index}`;
                heading.id = id; // Add ID to headings for smooth scroll
                return {
                    id,
                    text: heading.textContent,
                    level: parseInt(heading.tagName.substring(1))
                };
            });

            setTableOfContents(toc);
        }
    }, [article]);

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-3xl animate-pulse">
                <div className="h-4 bg-gray-200 w-24 mb-6 rounded"></div>
                <div className="h-64 bg-gray-300 rounded-lg mb-8"></div>
                <div className="h-8 bg-gray-300 w-3/4 mb-4 rounded"></div>
                <div className="h-4 bg-gray-200 w-1/3 mb-8 rounded"></div>
                <div className="space-y-4">
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                    <div className="h-4 bg-gray-200 rounded w-5/6"></div>
                    <div className="h-4 bg-gray-200 rounded w-full"></div>
                </div>
            </div>
        );
    }

    if (error || !article) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-3xl text-center">
                <h2 className="text-2xl font-bold text-gray-800 mb-4">Oops!</h2>
                <p className="text-gray-600 mb-6">{error || 'Artikel tidak ditemukan'}</p>
                <Link to="/article" className="text-blue-600 hover:text-blue-800 font-medium">
                    &larr; Kembali ke Daftar Artikel
                </Link>
            </div>
        );
    }

    return (
        <div className="bg-gray-50 min-h-screen">
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <Link to="/article" className="inline-flex items-center text-gray-500 hover:text-blue-600 mb-6 transition-colors">
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
                    </svg>
                    Kembali ke Artikel
                </Link>



                {/* 2 Column Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
                    {/* Main Content - 3 columns */}
                    <div className="lg:col-span-3">
                        <article className="bg-white rounded-xl shadow-sm overflow-hidden p-6 md:p-8">
                            <header className="mb-8">
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {article.category && (
                                        <span className="bg-blue-100 text-blue-800 text-xs font-semibold px-2.5 py-0.5 rounded">
                                            {article.category}
                                        </span>
                                    )}
                                </div>
                                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4 leading-tight">
                                    {article.title}
                                </h1>
                                <div className="flex items-center text-gray-500 text-sm border-b border-gray-100 pb-6 mb-6">
                                    <span className="mr-4">
                                        <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                        </svg>
                                        {formatDate(article.created_at || article.date)}
                                    </span>
                                    {article.author && (
                                        <span>
                                            <svg className="w-4 h-4 inline mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                            {article.author}
                                        </span>
                                    )}
                                </div>


                                {(article.image_url || article.image) ? (
                                    <div className="rounded-lg overflow-hidden shadow-sm mb-8 w-full">
                                        <img
                                            src={article.image_url || article.image}
                                            alt={article.title}
                                            className="w-full h-auto object-cover max-h-[500px]"
                                            loading="lazy"
                                            onError={(e) => {
                                                // If image fails to load, show placeholder
                                                const shortName = config.hospitalShortName || 'Healthcare';
                                                e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2301007f;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230c4a6e;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="500" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="36" fill="white" text-anchor="middle" dy=".3em"%3E${shortName}%3C/text%3E%3C/svg%3E`;
                                            }}
                                        />
                                        {article.image_caption && (
                                            <p className="text-gray-500 text-sm italic mt-2 text-center">{article.image_caption}</p>
                                        )}
                                    </div>
                                ) : (
                                    <div className="rounded-lg overflow-hidden shadow-sm mb-8 w-full bg-gradient-to-br from-[#01007f] to-[#0c4a6e] h-64 md:h-96 flex items-center justify-center">
                                        <div className="text-center text-white">
                                            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                            </svg>
                                            <p className="text-lg font-semibold">{config.hospitalName || 'RSU Siloam Ambon'}</p>
                                        </div>
                                    </div>
                                )}
                            </header>

                            <div className="prose prose-blue prose-lg max-w-none text-gray-700 leading-relaxed">
                                {/* Use dangerouslySetInnerHTML to render HTML content from wysiwyg editors */}
                                <div dangerouslySetInnerHTML={{ __html: article.content }} />
                            </div>

                            {/* Bottom Banner Ad */}
                            <div className="mt-12 pt-8 border-t border-gray-100 flex justify-center">
                                <AdDisplay slotId="ARTICLE_BOTTOM_SLOT_ID" style={{ width: '100%', maxWidth: '728px', height: '90px' }} />
                            </div>
                        </article>
                    </div>

                    {/* Sidebar - Table of Contents - 1 column */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24">
                            {tableOfContents.length > 0 && (
                                <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
                                    <h3 className="text-lg font-bold border-l-4 border-blue-600 pl-3 mb-4">Daftar Isi</h3>
                                    <nav className="space-y-2">
                                        {tableOfContents.map((item) => (
                                            <a
                                                key={item.id}
                                                href={`#${item.id}`}
                                                className={`block text-sm hover:text-blue-600 transition-colors ${item.level === 3 ? 'pl-4 text-gray-600' : 'font-semibold text-gray-900'
                                                    }`}
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                                                }}
                                            >
                                                {item.text}
                                            </a>
                                        ))}
                                    </nav>
                                </div>
                            )}

                            {/* Sidebar Ad */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <AdDisplay slotId="SIDEBAR_AD_SLOT" style={{ width: '100%', height: '250px' }} />
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    );
};

export default ArticleDetailView;
