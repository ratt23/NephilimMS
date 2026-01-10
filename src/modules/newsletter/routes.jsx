import { Route } from 'react-router-dom';
import NewsletterList from './pages/NewsletterList';
import NewsletterForm from './pages/NewsletterForm';

export const newsletterRoutes = (
    <>
        <Route path="/admin/newsletter" element={<NewsletterList />} />
        <Route path="/admin/newsletter/new" element={<NewsletterForm />} />
        <Route path="/admin/newsletter/edit/:id" element={<NewsletterForm />} />
    </>
);
