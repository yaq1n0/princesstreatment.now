import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import CreatorPage from './pages/CreatorPage';
import ViewPage from './pages/ViewPage';

const router = createBrowserRouter([
  { path: '/', element: <CreatorPage /> },
  { path: '/view', element: <ViewPage /> },
]);

export default function App() {
  return <RouterProvider router={router} />;
}
