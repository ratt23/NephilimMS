import React, { useState, useEffect, useCallback } from 'react';
import LoadingSpinner from './LoadingSpinner';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import TextAlign from '@tiptap/extension-text-align';
import {
    Bold, Italic, List, ListOrdered, Image as ImageIcon, Link as LinkIcon,
    AlignLeft, AlignCenter, AlignRight, Heading1, Heading2, Quote, Undo, Redo
} from 'lucide-react';

// --- Tiptap Menu Bar ---
const MenuBar = ({ editor, addImage }) => {
    if (!editor) return null;

    const setLink = useCallback(() => {
        const previousUrl = editor.getAttributes('link').href;
        const url = window.prompt('URL', previousUrl);
        if (url === null) return;
        if (url === '') {
            editor.chain().focus().extendMarkRange('link').unsetLink().run();
            return;
        }
        editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }, [editor]);

    return (
        <div className="border-b border-sanctum-border p-2 flex flex-wrap gap-1 bg-sanctum-sidebar sticky top-0 z-10">
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBold().run()}
                disabled={!editor.can().chain().focus().toggleBold().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bold') ? 'bg-gray-300' : ''}`}
                title="Bold"
            >
                <Bold size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                disabled={!editor.can().chain().focus().toggleItalic().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('italic') ? 'bg-gray-300' : ''}`}
                title="Italic"
            >
                <Italic size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 1 }) ? 'bg-gray-300' : ''}`}
                title="Heading 1"
            >
                <Heading1 size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('heading', { level: 2 }) ? 'bg-gray-300' : ''}`}
                title="Heading 2"
            >
                <Heading2 size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('bulletList') ? 'bg-gray-300' : ''}`}
                title="Bullet List"
            >
                <List size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('orderedList') ? 'bg-gray-300' : ''}`}
                title="Ordered List"
            >
                <ListOrdered size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('blockquote') ? 'bg-gray-300' : ''}`}
                title="Quote"
            >
                <Quote size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('left').run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'left' }) ? 'bg-gray-300' : ''}`}
                title="Align Left"
            >
                <AlignLeft size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('center').run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'center' }) ? 'bg-gray-300' : ''}`}
                title="Align Center"
            >
                <AlignCenter size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().setTextAlign('right').run()}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive({ textAlign: 'right' }) ? 'bg-gray-300' : ''}`}
                title="Align Right"
            >
                <AlignRight size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={setLink}
                className={`p-1.5 rounded hover:bg-gray-200 ${editor.isActive('link') ? 'bg-gray-300' : ''}`}
                title="Link"
            >
                <LinkIcon size={18} />
            </button>
            <button
                type="button"
                onClick={addImage}
                className="p-1.5 rounded hover:bg-gray-200"
                title="Insert Image"
            >
                <ImageIcon size={18} />
            </button>

            <div className="w-px h-6 bg-gray-300 mx-1 self-center"></div>

            <button
                type="button"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
                title="Undo"
            >
                <Undo size={18} />
            </button>
            <button
                type="button"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                className="p-1.5 rounded hover:bg-gray-200 disabled:opacity-30"
                title="Redo"
            >
                <Redo size={18} />
            </button>
        </div>
    );
};


// --- Helper Functions ---
// Helper API
import { getApiBaseUrl } from '../utils/apiConfig';

async function fetchApi(endpoint, options = {}) {
    const baseUrl = getApiBaseUrl();
    let cleanPath = endpoint;

    if (cleanPath.startsWith('/.netlify/functions/api')) {
        cleanPath = cleanPath.replace('/.netlify/functions/api', '');
    } else if (cleanPath.startsWith('/.netlify/functions')) {
        cleanPath = cleanPath.replace('/.netlify/functions', '');
    }

    const url = `${baseUrl}${cleanPath}`;
    const response = await fetch(url, { ...options, credentials: 'include' });
    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error ${response.status}`);
    }
    return response.json();
}

// --- Main Component ---
export default function PostManager() {
    const [view, setView] = useState('list'); // 'list' | 'edit' | 'create'
    const [posts, setPosts] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);

    // Editor State
    const [currentPost, setCurrentPost] = useState(null);
    const [formData, setFormData] = useState({
        title: '',
        slug: '',
        status: 'draft',
        image_url: '',
        category: 'article',
        tags: '',
        excerpt: ''
    });
    const [isSaving, setIsSaving] = useState(false);
    const [editorContent, setEditorContent] = useState('');

    // Tiptap Editor
    const editor = useEditor({
        extensions: [
            StarterKit,
            Link.configure({ openOnClick: false }),
            Image,
            TextAlign.configure({ types: ['heading', 'paragraph'] }),
        ],
        content: editorContent,
        onUpdate: ({ editor }) => {
            setEditorContent(editor.getHTML());
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm sm:prose lg:prose-lg xl:prose-2xl mx-auto focus:outline-none min-h-[300px] p-4',
            },
        },
    });

    // Sync content when switching to edit
    useEffect(() => {
        if (editor && currentPost) {
            // Only set content if it's different to prevent loops/cursor jumps if checking blindly
            // But for initial load it's fine
            if (editor.getHTML() !== currentPost.content) {
                editor.commands.setContent(currentPost.content);
            }
        } else if (editor && view === 'create') {
            editor.commands.clearContent();
        }
    }, [currentPost, editor, view]);


    // Fetch Posts
    const loadPosts = useCallback(async () => {
        setIsLoading(true);
        try {
            // Add admin=true to bypass public filtering (is_active=true)
            const data = await fetchApi('/.netlify/functions/api/posts?limit=50&admin=true');
            setPosts(data.posts || []);
        } catch (err) {
            setError(err.message);
        } finally {
            setIsLoading(false);
        }
    }, []);

    useEffect(() => {
        loadPosts();
    }, [loadPosts]);

    // Handlers
    const handleEdit = (post) => {
        setCurrentPost(post);
        setFormData({
            title: post.title,
            slug: post.slug,
            status: post.status,
            image_url: post.image_url || '',
            category: post.category || 'article',
            tags: post.tags || '',
            excerpt: post.excerpt || ''
        });
        setEditorContent(post.content || '');
        setView('edit');
    };

    const handleCreate = () => {
        setCurrentPost(null);
        setFormData({
            title: '',
            slug: '',
            status: 'draft',
            image_url: '',
            category: 'article',
            tags: '',
            excerpt: ''
        });
        setEditorContent('');
        setView('create');
    };

    const generateSlug = (title) => {
        return title
            .toLowerCase()
            .trim()
            .replace(/[^\w\s-]/g, '')
            .replace(/[\s_-]+/g, '-')
            .replace(/^-+|-+$/g, '');
    };

    const handleTitleChange = (e) => {
        const title = e.target.value;
        setFormData(prev => ({
            ...prev,
            title,
            // Auto-generate slug if creating new post OR if slug matches the old title slug
            slug: (view === 'create' || generateSlug(prev.title) === prev.slug) ? generateSlug(title) : prev.slug
        }));
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!CLOUD_NAME || !UPLOAD_PRESET) {
            alert("Missing Cloudinary Config");
            return;
        }

        const formDataApi = new FormData();
        formDataApi.append('file', file);
        formDataApi.append('upload_preset', UPLOAD_PRESET);
        formDataApi.append('cloud_name', CLOUD_NAME);

        try {
            const res = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
                method: 'POST',
                body: formDataApi,
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error.message);

            setFormData(prev => ({ ...prev, image_url: data.secure_url }));
        } catch (err) {
            alert("Upload Failed: " + err.message);
        }
    };

    // Editor Image Upload
    const addImageToEditor = async () => {
        const url = window.prompt('Enter Image URL'); // Simple URL input for now
        if (url) {
            editor.chain().focus().setImage({ src: url }).run();
        }
        // Ideally we would trigger a file input here too using the same Cloudinary logic
        // But sticking to URL for simplicity or we can reuse a hidden file input
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSaving(true);
        try {
            const payload = {
                ...formData,
                content: editorContent // Get content from state which matches editor
            };

            if (view === 'create') {
                await fetchApi('/.netlify/functions/api/posts', {
                    method: 'POST',
                    body: JSON.stringify(payload)
                });
            } else {
                await fetchApi(`/.netlify/functions/api/posts?id=${currentPost.id}`, {
                    method: 'PUT',
                    body: JSON.stringify(payload)
                });
            }

            setView('list');
            loadPosts();
        } catch (err) {
            alert("Error saving: " + err.message);
        } finally {
            setIsSaving(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this post?")) return;
        try {
            await fetchApi(`/.netlify/functions/api/posts?id=${id}`, { method: 'DELETE' });
            loadPosts();
        } catch (err) {
            alert("Failed to delete: " + err.message);
        }
    };


    // --- Render Views ---

    if (view === 'list') {
        return (
            <div className="space-y-6 animate-fade-in font-sans">
                <div className="bg-sanctum-surface border border-sanctum-border shadow-2xl-sm rounded-none">
                    <div className="bg-sanctum-surface p-4 border-b border-sanctum-border flex justify-between items-center">
                        <h2 className="text-lg font-bold text-sanctum-text-curr uppercase tracking-wide">
                            Post Manager
                            <span className="ml-2 bg-blue-100 text-blue-800 text-xs font-semibold px-2 py-0.5 rounded-full">{posts.length}</span>
                        </h2>
                        <button
                            onClick={handleCreate}
                            className="py-1.5 px-4 bg-sanctum-accent text-white font-bold uppercase text-xs rounded-sm shadow-2xl-sm hover:bg-blue-600 transition-colors flex items-center gap-2"
                        >
                            <span>+ New Post</span>
                        </button>
                    </div>

                    {isLoading ? (
                        <div className="p-12"><LoadingSpinner /></div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-sanctum-border">
                                <thead className="bg-sanctum-sidebar">
                                    <tr>
                                        <th className="p-3 text-left text-[11px] font-bold text-sanctum-text-muted uppercase tracking-wider border-r border-sanctum-border">Title</th>
                                        <th className="p-3 text-left text-[11px] font-bold text-sanctum-text-muted uppercase tracking-wider border-r border-sanctum-border">Status</th>
                                        <th className="p-3 text-left text-[11px] font-bold text-sanctum-text-muted uppercase tracking-wider border-r border-sanctum-border">Date</th>
                                        <th className="p-3 text-center text-[11px] font-bold text-sanctum-text-muted uppercase tracking-wider">Actions</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-sanctum-surface divide-y divide-sanctum-border">
                                    {posts.length === 0 && (
                                        <tr><td colSpan="4" className="p-8 text-center text-[#a0a4ab] italic">No posts found.</td></tr>
                                    )}
                                    {posts.map(post => (
                                        <tr key={post.id} className="hover:bg-sanctum-primary/20 transition-colors">
                                            <td className="p-3 text-sm font-medium text-sanctum-text-curr border-r border-sanctum-border">{post.title}</td>
                                            <td className="p-3 text-sm border-r border-sanctum-border">
                                                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${post.status === 'published' ? 'bg-green-100 text-green-800' : 'bg-sanctum-bg text-sanctum-text-curr'}`}>
                                                    {post.status}
                                                </span>
                                            </td>
                                            <td className="p-3 text-xs text-sanctum-text-muted border-r border-sanctum-border">
                                                {new Date(post.created_at).toLocaleDateString()}
                                                <div className="text-[10px] text-sanctum-text-muted/60 mt-1">{post.category}</div>
                                            </td>
                                            <td className="p-3 text-sm text-center">
                                                <div className="flex justify-center items-center gap-2">
                                                    <button onClick={() => handleEdit(post)} className="text-blue-600 hover:text-blue-800 font-medium text-xs uppercase px-2 py-1 bg-blue-900/20 rounded">Edit</button>
                                                    <button onClick={() => handleDelete(post.id)} className="text-red-600 hover:text-red-800 font-medium text-xs uppercase px-2 py-1 bg-red-900/20 rounded">Delete</button>
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Edit / Create View
    return (
        <div className="space-y-6 animate-fade-in font-sans">
            <div className="bg-sanctum-surface border border-sanctum-border shadow-2xl-sm rounded-none">

                {/* Header */}
                <div className="bg-sanctum-surface p-4 border-b border-sanctum-border flex justify-between items-center sticky top-0 z-20">
                    <h2 className="text-lg font-bold text-sanctum-text-curr uppercase tracking-wide">
                        {view === 'create' ? 'Create New Post' : 'Edit Post'}
                    </h2>
                    <div className="flex gap-3">
                        <button
                            onClick={() => setView('list')}
                            className="py-1.5 px-4 bg-sanctum-bg text-sanctum-text-muted font-bold uppercase text-xs rounded-sm shadow-2xl-sm hover:bg-sanctum-sidebar transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleSubmit}
                            disabled={isSaving}
                            className="py-1.5 px-4 bg-sanctum-accent text-white font-bold uppercase text-xs rounded-sm shadow-2xl-sm hover:bg-blue-600 transition-colors disabled:opacity-50"
                        >
                            {isSaving ? 'Saving...' : 'Save Post'}
                        </button>
                    </div>
                </div>

                <div className="p-6 max-w-5xl mx-auto space-y-6">

                    {/* Title & Slug */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-sanctum-text-curr uppercase mb-1">Title</label>
                            <input
                                type="text"
                                value={formData.title}
                                onChange={handleTitleChange}
                                className="block w-full px-3 py-2 border border-sanctum-border rounded-sm focus:ring-sanctum-accent focus:border-sanctum-accent bg-sanctum-bg text-sanctum-text-curr"
                                placeholder="Post Title..."
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-sanctum-text-curr uppercase mb-1">Slug (URL)</label>
                            <input
                                type="text"
                                value={formData.slug}
                                onChange={(e) => setFormData(p => ({ ...p, slug: e.target.value }))}
                                className="block w-full px-3 py-2 border border-sanctum-border rounded-sm bg-sanctum-bg text-sanctum-text-muted focus:ring-sanctum-accent focus:border-sanctum-accent"
                            />
                        </div>
                    </div>

                    {/* Featured Image & Status */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-start">
                        <div>
                            <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Featured Image</label>
                            <div className="flex gap-4 items-center">
                                {formData.image_url && (
                                    <img src={formData.image_url} alt="Preview" className="h-20 w-auto rounded border border-[#8C7A3E]/20" />
                                )}
                                <label className="cursor-pointer py-1.5 px-3 bg-[#1a1d21] border border-[#8C7A3E]/30 rounded-sm shadow-2xl-sm text-xs font-bold uppercase text-[#a0a4ab] hover:bg-[#0B0B0C]">
                                    Upload Image
                                    <input type="file" className="hidden" onChange={handleImageUpload} accept="image/*" />
                                </label>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Status</label>
                            <select
                                value={formData.status}
                                onChange={(e) => setFormData(p => ({ ...p, status: e.target.value }))}
                                className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm"
                            >
                                <option value="draft">Draft</option>
                                <option value="published">Published</option>
                            </select>
                        </div>
                    </div>

                    {/* Category & Tags */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Category</label>
                            <select
                                value={formData.category}
                                onChange={(e) => setFormData(p => ({ ...p, category: e.target.value }))}
                                className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm"
                            >
                                <option value="article">Article</option>
                                <option value="newsletter">Newsletter</option>
                                <option value="review">Review</option>
                                <option value="promo">Promo</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Tags / Labels</label>
                            <input
                                type="text"
                                value={formData.tags}
                                onChange={(e) => setFormData(p => ({ ...p, tags: e.target.value }))}
                                className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                                placeholder="health, diet, updates (comma separated)"
                            />
                        </div>
                    </div>

                    {/* Excerpt */}
                    <div>
                        <label className="block text-sm font-bold text-[#E6E6E3] uppercase mb-1">Excerpt (Short Description)</label>
                        <textarea
                            rows="2"
                            value={formData.excerpt}
                            onChange={(e) => setFormData(p => ({ ...p, excerpt: e.target.value }))}
                            className="block w-full px-3 py-2 border border-[#8C7A3E]/30 rounded-sm focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    {/* Tiptap Editor */}
                    <div className="border border-sanctum-border rounded-sm overflow-hidden bg-sanctum-surface min-h-[400px] flex flex-col">
                        <div className="bg-sanctum-sidebar border-b border-sanctum-border px-4 py-2 text-xs font-bold uppercase text-sanctum-text-muted">
                            Post Content
                        </div>
                        <MenuBar editor={editor} addImage={addImageToEditor} />
                        <div className="flex-1 bg-sanctum-bg text-sanctum-text-curr">
                            <EditorContent editor={editor} />
                        </div>
                    </div>

                </div>

            </div>
        </div>
    );
}
