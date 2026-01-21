import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import AdDisplay from '../components/AdDisplay';
import { useSearchContext } from '../context/SearchContext';
import { useConfig } from '../context/ConfigContext';
import { getApiBaseUrl } from '../utils/apiConfig';

const ArticleView = () => {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const { searchQuery } = useSearchContext();
    const config = useConfig();

    useEffect(() => {
        const fetchArticles = async () => {
            try {
                const apiBase = getApiBaseUrl();
                const response = await fetch(`${apiBase}/posts?status=published`);
                if (!response.ok) {
                    throw new Error('Failed to fetch articles');
                }
                const data = await response.json();
                // Ensure data is an array
                const articlesArray = Array.isArray(data) ? data : (data.posts || []);
                setArticles(articlesArray);
            } catch (err) {
                console.error('Error fetching articles:', err);
                setError('Gagal memuat artikel.');
            } finally {
                setLoading(false);
            }
        };

        fetchArticles();
    }, []);

    // SEO Meta Tags
    useEffect(() => {
        const hospitalName = config.hospitalName || 'RSU Siloam Ambon';
        document.title = `Berita & Artikel Kesehatan - ${hospitalName}`;

        // Update meta description
        let metaDescription = document.querySelector('meta[name="description"]');
        if (!metaDescription) {
            metaDescription = document.createElement('meta');
            metaDescription.name = 'description';
            document.head.appendChild(metaDescription);
        }
        metaDescription.content = `Baca berita terkini dan artikel kesehatan dari ${hospitalName}. Informasi kesehatan, tips medis, dan update pelayanan rumah sakit.`;

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
        canonical.href = 'https://shab.web.id/article';

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

        updateOgTag('og:type', 'website');
        updateOgTag('og:url', 'https://shab.web.id/article');
        updateOgTag('og:title', `Berita & Artikel Kesehatan - ${hospitalName}`);
        updateOgTag('og:description', `Informasi kesehatan terkini dan artikel medis dari ${hospitalName}.`);
        updateOgTag('og:image', 'https://shab.web.id/asset/logo/logo.png');

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
        updateTwitterTag('twitter:url', 'https://shab.web.id/article');
        updateTwitterTag('twitter:title', `Berita & Artikel Kesehatan - ${hospitalName}`);
        updateTwitterTag('twitter:description', `Informasi kesehatan terkini dan artikel medis dari ${hospitalName}.`);
        updateTwitterTag('twitter:image', 'https://shab.web.id/asset/logo/logo.png');
    }, [config.hospitalName]);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('id-ID', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    // Fallback image for articles without images
    const getArticleImage = (article) => {
        // Support both 'image' and 'image_url' field names
        const imageUrl = article.image_url || article.image;
        if (imageUrl) return imageUrl;
        // Use a medical/health themed gradient as fallback
        const shortName = config.hospitalShortName || 'Healthcare';
        return `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Cdefs%3E%3ClinearGradient id="grad" x1="0%25" y1="0%25" x2="100%25" y2="100%25"%3E%3Cstop offset="0%25" style="stop-color:%2301007f;stop-opacity:1" /%3E%3Cstop offset="100%25" style="stop-color:%230c4a6e;stop-opacity:1" /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width="800" height="600" fill="url(%23grad)"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial, sans-serif" font-size="48" fill="white" text-anchor="middle" dy=".3em"%3E${shortName}%3C/text%3E%3C/svg%3E`;
    };

    if (loading) {
        return (
            <div className="container mx-auto px-4 py-8 max-w-7xl">
                <div className="animate-pulse">
                    <div className="h-96 bg-gray-300 rounded-lg mb-8"></div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="h-64 bg-gray-300 rounded-lg"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error || articles.length === 0) {
        return (
            <div className="container mx-auto px-4 py-12 max-w-7xl text-center">
                <p className="text-gray-600">{error || 'Belum ada artikel yang diterbitkan.'}</p>
            </div>
        );
    }

    // Filter articles based on search query
    const filteredArticles = searchQuery
        ? articles.filter(article =>
            article.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.excerpt?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            article.content?.toLowerCase().includes(searchQuery.toLowerCase())
        )
        : articles;

    const [featuredArticle, ...restArticles] = filteredArticles;
    const popularArticles = filteredArticles.slice(0, 5); // Top 5 as "popular"

    return (
        <div className="bg-gray-50 min-h-screen">


            <div className="container mx-auto px-4 py-6 max-w-7xl">
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2">
                        {/* Featured Article */}
                        {featuredArticle && (
                            <Link to={`/article/${featuredArticle.slug}`} className="block group mb-8">
                                <div className="bg-white rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow">
                                    <div className="relative h-64 md:h-96 overflow-hidden">
                                        <img
                                            src={getArticleImage(featuredArticle)}
                                            alt={featuredArticle.title}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            loading="lazy"
                                            onError={(e) => {
                                                const shortName = config.hospitalShortName || 'Healthcare';
                                                e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="800" height="600" viewBox="0 0 800 600"%3E%3Crect width="800" height="600" fill="%2301007f"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="36" fill="white" text-anchor="middle" dy=".3em"%3E${shortName}%3C/text%3E%3C/svg%3E`;
                                            }}
                                        />
                                        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-6">
                                            {featuredArticle.category && (
                                                <span className="inline-block bg-red-600 text-white text-xs font-bold px-3 py-1 rounded mb-2">
                                                    {featuredArticle.category}
                                                </span>
                                            )}
                                            <h2 className="text-2xl md:text-3xl font-bold text-white mb-2 group-hover:text-red-500 transition-colors">
                                                {featuredArticle.title}
                                            </h2>
                                            <p className="text-gray-200 text-sm line-clamp-2">
                                                {featuredArticle.excerpt || (featuredArticle.content ? featuredArticle.content.replace(/<[^>]+>/g, '').substring(0, 150) : '')}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )}

                        {/* Secondary Articles Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {restArticles.slice(0, 6).map((article) => (
                                <Link key={article.id} to={`/article/${article.slug}`} className="group">
                                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow h-full flex flex-col">
                                        <div className="h-48 overflow-hidden">
                                            <img
                                                src={getArticleImage(article)}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                                loading="lazy"
                                                onError={(e) => {
                                                    const shortName = config.hospitalShortName || 'Healthcare';
                                                    e.target.src = `data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="400" height="300" viewBox="0 0 400 300"%3E%3Crect width="400" height="300" fill="%2301007f"/%3E%3Ctext x="50%25" y="50%25" font-family="Arial" font-size="24" fill="white" text-anchor="middle" dy=".3em"%3E${shortName}%3C/text%3E%3C/svg%3E`;
                                                }}
                                            />
                                        </div>
                                        <div className="p-4 flex-grow flex flex-col">
                                            {article.category && (
                                                <span className="inline-block bg-gray-200 text-gray-700 text-xs font-semibold px-2 py-1 rounded mb-2 self-start">
                                                    {article.category}
                                                </span>
                                            )}
                                            <h3 className="font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {article.title}
                                            </h3>
                                            <p className="text-sm text-gray-600 line-clamp-3 flex-grow">
                                                {article.excerpt || (article.content ? article.content.replace(/<[^>]+>/g, '').substring(0, 100) + '...' : '')}
                                            </p>
                                            <span className="text-xs text-gray-400 mt-2">
                                                {formatDate(article.created_at || article.date)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>

                        {/* In-feed Ad */}
                        {restArticles.length > 6 && (
                            <div className="my-8">
                                <AdDisplay slotId="INFEED_SLOT_ID" format="fluid" />
                            </div>
                        )}
                    </div>

                    {/* Sidebar - Terpopuler */}
                    <div className="lg:col-span-1">
                        <div className="sticky top-24">
                            <div className="bg-white rounded-lg shadow-lg p-4 mb-6">
                                <h3 className="text-lg font-bold border-l-4 border-red-600 pl-3 mb-4">Terpopuler</h3>
                                <div className="space-y-4">
                                    {popularArticles.map((article, index) => (
                                        <Link key={article.id} to={`/article/${article.slug}`} className="flex gap-3 group">
                                            <div className="flex-shrink-0">
                                                <span className="inline-flex items-center justify-center w-8 h-8 bg-gray-100 text-gray-600 font-bold text-sm rounded">
                                                    {index + 1}
                                                </span>
                                            </div>
                                            <div className="flex-grow">
                                                <h4 className="font-semibold text-sm text-gray-900 line-clamp-3 group-hover:text-red-600 transition-colors mb-1">
                                                    {article.title}
                                                </h4>
                                                {article.category && (
                                                    <span className="text-xs text-gray-500">{article.category}</span>
                                                )}
                                            </div>
                                        </Link>
                                    ))}
                                </div>
                            </div>

                            {/* Sidebar Ad */}
                            <div className="bg-gray-100 p-4 rounded-lg">
                                <AdDisplay slotId="SIDEBAR_AD_SLOT" style={{ width: '100%', height: '250px' }} />
                            </div>
                        </div>
                    </div>
                </div>

                {restArticles.length > 6 && (
                    <div className="mt-12">
                        <h3 className="text-2xl font-bold mb-6 border-l-4 border-red-600 pl-4">Artikel Lainnya</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {restArticles.slice(6).map((article) => (
                                <Link key={article.id} to={`/article/${article.slug}`} className="group">
                                    <div className="bg-white rounded-lg overflow-hidden shadow hover:shadow-lg transition-shadow">
                                        <div className="h-40 overflow-hidden">
                                            <img
                                                src={article.image || 'https://via.placeholder.com/400x300?text=Article'}
                                                alt={article.title}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-4">
                                            <h4 className="font-bold text-sm mb-2 line-clamp-2 group-hover:text-red-600 transition-colors">
                                                {article.title}
                                            </h4>
                                            <span className="text-xs text-gray-400">
                                                {formatDate(article.created_at || article.date)}
                                            </span>
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Ad Banner */}
            <div className="bg-white py-4 mt-6">
                <div className="container mx-auto px-4 flex justify-center">
                    <AdDisplay slotId="BOTTOM_BANNER_SLOT_ID" style={{ width: '100%', maxWidth: '728px', height: '90px' }} />
                </div>
            </div>
        </div>
    );
};

export default ArticleView;
