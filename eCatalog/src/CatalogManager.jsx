import React from 'react';
import PDFViewer from './components/PDFViewer';
import { FileText } from 'lucide-react';

export default function CatalogManager({
    catalogs,
    loading,
    error,
    currentIndex,
    setCurrentIndex,
    reload
}) {
    const currentCatalog = catalogs[currentIndex];

    const goToPrevious = () => {
        if (currentIndex > 0) {
            setCurrentIndex(currentIndex - 1);
        }
    };

    const goToNext = () => {
        if (currentIndex < catalogs.length - 1) {
            setCurrentIndex(currentIndex + 1);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-4 border-blue-500 border-t-transparent mb-4 mx-auto"></div>
                    <p className="text-zinc-400 text-lg">Memuat Catalog...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8 max-w-md text-center">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h3 className="text-xl font-bold text-white mb-2">Error</h3>
                    <p className="text-zinc-400 mb-4">{error}</p>
                    <button
                        onClick={reload}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                        Coba Lagi
                    </button>
                </div>
            </div>
        );
    }

    if (catalogs.length === 0) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center p-4">
                <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8 max-w-md text-center">
                    <FileText className="mx-auto mb-4 text-zinc-600" size={64} />
                    <h3 className="text-xl font-bold text-white mb-2">Belum Ada Catalog</h3>
                    <p className="text-zinc-400">
                        Catalog yang telah dipublikasikan akan tampil di sini.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-[calc(100vh-160px)] bg-zinc-900 flex flex-col">
            {/* Embedded PDF Viewer - No Modal, Always Visible */}
            {currentCatalog && currentCatalog.pdf_url && (
                <PDFViewer
                    url={currentCatalog.pdf_url}
                    catalogCount={catalogs.length}
                    currentIndex={currentIndex}
                    onPrevious={goToPrevious}
                    onNext={goToNext}
                />
            )}
        </div>
    );
}
