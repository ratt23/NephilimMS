import { Route } from 'react-router-dom';
import CatalogList from './pages/CatalogList';
import CatalogForm from './pages/CatalogForm';

export const catalogRoutes = (
    <>
        <Route path="/admin/catalog" element={<CatalogList />} />
        <Route path="/admin/catalog/new" element={<CatalogForm />} />
        <Route path="/admin/catalog/edit/:id" element={<CatalogForm />} />
    </>
);
