import { getApiBaseUrl } from '../utils/apiConfig';

const ITEMS_PER_PAGE = 20;

export default function RadiologySearch() {
    // ... hooks
    // inside fetchPrices:
    const fetchPrices = async (isLoadMore = false) => {
        if (!hasMore && isLoadMore) return;

        setLoading(true);
        setError(null);
        try {
            const baseUrl = getApiBaseUrl();
            const offset = (isLoadMore ? page : 0) * ITEMS_PER_PAGE;
            const url = `${baseUrl}/radiology?search=${encodeURIComponent(debouncedSearch)}&limit=${ITEMS_PER_PAGE}&offset=${offset}`;

            const response = await fetch(url);
            if (!response.ok) {
                throw new Error('Gagal mengambil data harga');
            }
            const data = await response.json();

            if (data.length < ITEMS_PER_PAGE) {
                setHasMore(false);
            }

            if (isLoadMore) {
                setItems(prev => [...prev, ...data]);
                setPage(prev => prev + 1);
            } else {
                setItems(data);
                setPage(1); // Set to next page info
            }
        } catch (err) {
            setError(err.message);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    // Initial fetch or search change
    useEffect(() => {
        fetchPrices(false);
    }, [debouncedSearch]);

    const handleLoadMore = () => {
        fetchPrices(true);
    };

    return (
        <div className="radiology-search-container max-w-5xl mx-auto px-4 pt-16 pb-12">
            {/* Search Section */}
            <div className="text-center mb-10">
                <div className="bg-white p-2 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.08)] max-w-2xl mx-auto border border-gray-100 transform transition-all hover:scale-[1.01]">
                    <div className="relative flex items-center">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-6 w-6 text-blue-500" />
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-12 pr-4 py-4 rounded-xl leading-relaxed bg-transparent placeholder-gray-400 text-gray-900 focus:outline-none text-lg font-medium"
                            placeholder="Cari pemeriksaan (contoh: MRI Brain, Thorax, USG)..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        // Autofocus removed to prevent jumpy behavior on mobile
                        />
                        {searchTerm && (
                            <button
                                onClick={() => setSearchTerm('')}
                                className="absolute inset-y-0 right-0 pr-4 flex items-center text-gray-400 hover:text-gray-600 cursor-pointer"
                            >
                                <span className="sr-only">Clear</span>
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                <p className="mt-4 text-gray-500 text-sm">
                    Menampilkan estimasi harga resmi RSU Siloam Ambon for <span className="font-semibold text-blue-600">{new Date().getFullYear()}</span>
                </p>
            </div>

            {/* Results Area */}
            <div className="results-area min-h-[400px]">
                {items.length === 0 && !loading && !error ? (
                    <div className="text-center py-20">
                        <div className="bg-gray-50 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 shadow-inner">
                            <Search className="h-10 w-10 text-gray-300" />
                        </div>
                        <h3 className="text-xl font-bold text-gray-700 mb-2">Tidak ada data ditemukan</h3>
                        <p className="text-gray-500 max-w-md mx-auto">
                            {searchTerm ? `Kami tidak menemukan pemeriksaan dengan kata kunci "${searchTerm}".` : "Silakan ketik nama pemeriksaan di atas untuk mulai mencari."}
                        </p>
                    </div>
                ) : error ? (
                    <div className="mx-auto max-w-lg text-center p-8 bg-red-50 rounded-2xl border border-red-100">
                        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
                        <h3 className="text-lg font-bold text-red-800 mb-2">Terjadi Kesalahan</h3>
                        <p className="text-red-600">{error}</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 animation-fade-in-up">
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-100">
                                <thead>
                                    <tr className="bg-gradient-to-r from-[#0f1d3d] to-[#1e3a8a] text-white">
                                        <th scope="col" className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider w-1/4">Kategori</th>
                                        <th scope="col" className="px-8 py-5 text-left text-sm font-bold uppercase tracking-wider w-1/2">Pemeriksaan</th>
                                        <th scope="col" className="px-8 py-5 text-right text-sm font-bold uppercase tracking-wider w-1/4">Estimasi Harga</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-100">
                                    {items.map((item, index) => (
                                        <tr
                                            key={`${item.id}-${index}`}
                                            className="hover:bg-blue-50/50 transition-colors duration-150 group"
                                        >
                                            <td className="px-8 py-5 whitespace-nowrap">
                                                <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-bold bg-blue-100 text-blue-700 group-hover:bg-blue-200 transition-colors">
                                                    {item.category}
                                                </span>
                                            </td>
                                            <td className="px-8 py-5">
                                                <div className="flex flex-col">
                                                    {/* PROMPT: Medical Name First, Common Name Below */}
                                                    <span className="text-lg font-bold text-gray-800 mb-1">
                                                        {item.name}
                                                    </span>
                                                    {item.common_name && (
                                                        <span className="text-sm text-gray-500 font-medium">
                                                            {item.common_name}
                                                        </span>
                                                    )}
                                                </div>
                                            </td>
                                            <td className="px-8 py-5 whitespace-nowrap text-right">
                                                <div className="text-lg font-bold text-[#0f1d3d]">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(item.price)}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Status Footer */}
                        <div className="bg-gray-50 px-8 py-4 border-t border-gray-100 flex justify-between items-center text-xs text-gray-500">
                            <span>Menampilkan {items.length} pemeriksaan</span>
                            {/* Load More Button */}
                            {hasMore ? (
                                <button
                                    onClick={handleLoadMore}
                                    disabled={loading}
                                    className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-lg shadow-sm hover:bg-gray-50 text-blue-600 font-bold transition-all disabled:opacity-50"
                                >
                                    {loading ? 'Memuat...' : (
                                        <>
                                            Tampilkan Lebih Banyak <ChevronDown size={14} />
                                        </>
                                    )}
                                </button>
                            ) : (
                                <span>Semua data telah ditampilkan</span>
                            )}
                        </div>
                    </div>
                )}

                {/* Loading Spinner for Load More (outside table if desired, or inline) */}
                {loading && items.length > 0 && (
                    <div className="text-center py-4">
                        <div className="inline-block animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                    </div>
                )}
            </div>

            <div className="mt-8 p-4 bg-blue-50/50 rounded-xl border border-blue-100 text-center">
                <p className="text-sm text-blue-800">
                    <span className="font-bold">Catatan:</span> Harga yang tertera adalah estimasi untuk pasien umum dan dapat berubah sewaktu-waktu. Untuk pasien asuransi/BPJS, silakan hubungi bagian pendaftaran.
                </p>
            </div>
        </div>
    );
}
