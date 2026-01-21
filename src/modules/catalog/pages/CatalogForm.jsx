import { catalogAPI } from '../api';

export default function CatalogForm() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState({
        category: 'tarif-kamar',
        title: '',
        description: '',
        price: '',
        image_url: '',
        cloudinary_public_id: '',
        features: []
    });

    const [newFeature, setNewFeature] = useState('');

    useEffect(() => {
        if (id) {
            fetchItem();
        }
    }, [id]);

    const fetchItem = async () => {
        try {
            setLoading(true);
            const item = await catalogAPI.getById(id);
            if (item) {
                setFormData(item);
            }
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = (error, result, widget) => {
        if (error) {
            console.error("Upload error:", error);
            return;
        }
        setFormData(prev => ({
            ...prev,
            image_url: result.info.secure_url,
            cloudinary_public_id: result.info.public_id
        }));
    };

    const addFeature = () => {
        if (!newFeature.trim()) return;
        setFormData(prev => ({
            ...prev,
            features: [...(prev.features || []), newFeature.trim()]
        }));
        setNewFeature('');
    };

    const removeFeature = (index) => {
        setFormData(prev => ({
            ...prev,
            features: prev.features.filter((_, i) => i !== index)
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const body = {
                ...formData,
                id: id || undefined
            };

            if (id) {
                await catalogAPI.update(id, body);
            } else {
                await catalogAPI.create(body);
            }
            navigate(-1);
        } catch (err) {
            console.error(err);
            alert('Error saving item: ' + err.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="bg-white rounded-lg shadow-sm max-w-4xl mx-auto">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center bg-gray-50 rounded-t-lg">
                <h1 className="text-lg font-bold text-gray-800">
                    {id ? 'Edit Item' : 'New Catalog Item'}
                </h1>
                <button onClick={() => navigate(-1)} className="text-gray-500 hover:text-gray-700 text-sm">
                    Cancel
                </button>
            </div>

            <form onSubmit={handleSubmit} className="p-8 space-y-8">

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
                            <select
                                name="category"
                                value={formData.category}
                                onChange={handleChange}
                                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-shadow"
                            >
                                <option value="tarif-kamar">Tarif Kamar</option>
                                <option value="fasilitas">Fasilitas</option>
                                <option value="layanan-unggulan">Layanan Unggulan</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Title / Name</label>
                            <input
                                type="text"
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. VIP, Kelas 1, IGD"
                                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Price (Optional)</label>
                            <input
                                type="text"
                                name="price"
                                value={formData.price}
                                onChange={handleChange}
                                placeholder="e.g. Rp 500.000"
                                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">Short Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                rows="3"
                                className="w-full border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                            ></textarea>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <label className="block text-sm font-semibold text-gray-700">Image</label>
                        <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center bg-gray-50 min-h-[240px]">
                            {formData.image_url ? (
                                <div className="relative w-full h-48 group">
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-full h-full object-cover rounded shadow-sm"
                                    />
                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <CloudinaryUploadWidget onUpload={handleImageUpload}>
                                            {({ open }) => (
                                                <button type="button" onClick={() => open()} className="bg-white text-gray-800 px-4 py-2 rounded-full font-bold text-xs hover:bg-gray-100">
                                                    Change Image
                                                </button>
                                            )}
                                        </CloudinaryUploadWidget>
                                    </div>
                                </div>
                            ) : (
                                <CloudinaryUploadWidget onUpload={handleImageUpload}>
                                    {({ open }) => (
                                        <div className="text-center">
                                            <button
                                                type="button"
                                                onClick={() => open()}
                                                className="bg-blue-600 text-white px-6 py-2.5 rounded-full font-bold text-sm hover:bg-blue-700 transition-transform hover:scale-105 shadow-sm"
                                            >
                                                Upload Photo
                                            </button>
                                            <p className="text-xs text-gray-400 mt-3">Supports JPG, PNG, WEBP</p>
                                        </div>
                                    )}
                                </CloudinaryUploadWidget>
                            )}
                        </div>
                    </div>
                </div>

                <div className="border-t border-gray-100 pt-8">
                    <label className="block text-sm font-semibold text-gray-700 mb-4">Features / Facilities (Bullet Points)</label>

                    <div className="flex gap-2 mb-4">
                        <input
                            type="text"
                            value={newFeature}
                            onChange={(e) => setNewFeature(e.target.value)}
                            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                            placeholder="Add a feature (e.g. 'AC', 'TV Cable')"
                            className="flex-1 border border-gray-300 rounded-md px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                        />
                        <button
                            type="button"
                            onClick={addFeature}
                            className="bg-gray-800 text-white px-6 py-2.5 rounded-md text-sm font-medium hover:bg-black transition-colors"
                        >
                            Add
                        </button>
                    </div>

                    <ul className="space-y-2">
                        {formData.features && formData.features.map((feature, index) => (
                            <li key={index} className="flex items-center justify-between bg-white border border-gray-200 px-4 py-3 rounded-md shadow-sm group">
                                <span className="text-sm text-gray-700">{feature}</span>
                                <button
                                    type="button"
                                    onClick={() => removeFeature(index)}
                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                                </button>
                            </li>
                        ))}
                    </ul>
                </div>

                <div className="flex justify-end pt-6 border-t border-gray-100">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-green-600 text-white px-8 py-3 rounded-md font-bold text-sm hover:bg-green-700 transition-all shadow-sm hover:shadow-md disabled:opacity-50"
                    >
                        {loading ? 'Saving...' : 'Save Item'}
                    </button>
                </div>

            </form>
        </div>
    );
}
