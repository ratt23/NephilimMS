import { catalogAPI } from '../api';

export default function CatalogList() {
    const navigate = useNavigate();
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [categoryFilter, setCategoryFilter] = useState('');

    useEffect(() => {
        fetchItems();
    }, [categoryFilter]);

    const fetchItems = async () => {
        try {
            setLoading(true);
            // Use admin endpoint (getAllItems) to see everything, or getItems for public
            // Assuming this is admin dashboard, we used getAllItems logic
            const data = await catalogAPI.getAllItems(categoryFilter);
            setItems(data);
        } catch (err) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this item?')) return;

        try {
            await catalogAPI.delete(id);
            fetchItems();
        } catch (err) {
            console.error(err);
            alert('Failed to delete: ' + err.message);
        }
    };

    if (loading) return <div className="p-8 text-center text-gray-500">Loading catalog...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Error: {error}</div>;

    const groupedItems = items.reduce((acc, item) => {
        const cat = item.category || 'Uncategorized';
        if (!acc[cat]) acc[cat] = [];
        acc[cat].push(item);
        return acc;
    }, {});

    return (
        <div className="bg-white rounded-lg shadow-sm">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-white">
                <div className="flex gap-4 items-center">
                    <select
                        value={categoryFilter}
                        onChange={(e) => setCategoryFilter(e.target.value)}
                        className="border border-gray-300 rounded px-3 py-2 text-sm focus:outline-none focus:border-blue-500"
                    >
                        <option value="">All Categories</option>
                        <option value="tarif-kamar">Tarif Kamar</option>
                        <option value="fasilitas">Fasilitas</option>
                        <option value="layanan-unggulan">Layanan Unggulan</option>
                    </select>
                </div>
                <button
                    onClick={() => navigate('/admin/catalog/new')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded text-sm font-medium transition-colors flex items-center gap-2"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" x2="12" y1="5" y2="19" /><line x1="5" x2="19" y1="12" y2="12" /></svg>
                    New Item
                </button>
            </div>

            <div className="p-0">
                {Object.keys(groupedItems).length === 0 ? (
                    <div className="p-8 text-center text-gray-400">No items found. Create one!</div>
                ) : (
                    Object.keys(groupedItems).map(cat => (
                        <div key={cat} className="border-b last:border-0">
                            <div className="bg-gray-50 px-6 py-3 font-semibold text-gray-700 uppercase text-xs tracking-wider">
                                {cat.replace('-', ' ')}
                            </div>
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="text-xs text-gray-400 border-b border-gray-100">
                                        <th className="px-6 py-3 font-medium">Image</th>
                                        <th className="px-6 py-3 font-medium">Title</th>
                                        <th className="px-6 py-3 font-medium">Price</th>
                                        <th className="px-6 py-3 font-medium text-right">Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {groupedItems[cat].map(item => (
                                        <tr key={item.id} className="hover:bg-gray-50 group border-b border-gray-100 last:border-0 transition-colors">
                                            <td className="px-6 py-3 w-24">
                                                {item.image_url ? (
                                                    <img src={item.image_url} alt={item.title} className="w-16 h-12 object-cover rounded shadow-sm" />
                                                ) : (
                                                    <div className="w-16 h-12 bg-gray-100 rounded flex items-center justify-center text-xs text-gray-400">No Img</div>
                                                )}
                                            </td>
                                            <td className="px-6 py-3 font-medium text-gray-800">
                                                {item.title}
                                                <div className="text-xs text-gray-400 font-normal mt-0.5 line-clamp-1">{item.description}</div>
                                            </td>
                                            <td className="px-6 py-3 text-sm text-gray-600 font-mono">
                                                {item.price || '-'}
                                            </td>
                                            <td className="px-6 py-3 text-right">
                                                <div className="flex justify-end items-center gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    <button
                                                        onClick={() => navigate(`/admin/catalog/edit/${item.id}`)}
                                                        className="text-blue-600 hover:text-blue-800 text-xs font-medium flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 3a2.828 2.828 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5L17 3z" /></svg>
                                                        Edit
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(item.id)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium flex items-center gap-1"
                                                    >
                                                        <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /></svg>
                                                        Delete
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
