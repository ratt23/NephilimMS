import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import CatalogList from './CatalogList';
import CatalogForm from './CatalogForm';

export default function CatalogManager() {
    return (
        <div className="p-6">
            <Routes>
                <Route path="/" element={<CatalogList />} />
                <Route path="/new" element={<CatalogForm />} />
                <Route path="/edit/:id" element={<CatalogForm />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
        </div>
    );
}
