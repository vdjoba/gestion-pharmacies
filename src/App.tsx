import { BrowserRouter, HashRouter, Navigate, Route, Routes } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import MedicineDetail from './components/MedicineDetail';
import LoginPage from './pages/auth/LoginPage';
import ResetPassword from './pages/auth/ResetPassword';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout';
import ProductPage from './pages/Product/ProductPage';
import AvailabilityRequest from './components/AvailabilityRequest';
import OrderForm from './components/OrderForm';
import ReservationForm from './components/ReservationForm';
import PrescriptionForm from './components/PrescriptionForm';
import ProductList from './components/ProductList';
import ProtectedRoute from './components/ProtectedRoute';
import PharmacienDashboard from './pages/PharmacienDashboard';
import AdminDashboard from './pages/AdminDashboard';
import ClientDashboard from './pages/ClientDashboard';
import AdminHome from './pages/AdminHome';
import type { Medicine } from './types/Medicine';
import { API_BASE_URL } from './services/medicineService';
import { isDesktopShell } from './services/runtime';

const App: React.FC = () => {
  const [medicaments, setMedicaments] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [medicamentRefreshKey, setMedicamentRefreshKey] = useState(0);

  const fetchMedicaments = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.get<Medicine[]>(`${API_BASE_URL}/medicaments`);
      setMedicaments(response.data);
    } catch (requestError) {
      console.error('Erreur lors de la recuperation des medicaments:', requestError);
      setError('Erreur de chargement des medicaments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchMedicaments();
  }, [medicamentRefreshKey]);

  const refreshMedicaments = () => {
    setMedicamentRefreshKey((current) => current + 1);
  };

  const statusBanner = (
    <>
      {loading && <p className="px-4 py-3 text-sm text-slate-600">Chargement...</p>}
      {error && <p className="px-4 py-3 text-sm text-red-600">{error}</p>}
    </>
  );

  const RouterComponent = isDesktopShell() ? HashRouter : BrowserRouter;

  return (
    <RouterComponent>
      <Routes>
        <Route
          path="/"
          element={
            <Layout section="public">
              {statusBanner}
              <Home />
            </Layout>
          }
        />
        <Route
          path="/products"
          element={
            <Layout section="public">
              {statusBanner}
              <ProductPage medicaments={medicaments} />
            </Layout>
          }
        />
        <Route
          path="/medicine/:id"
          element={
            <Layout section="public">
              {statusBanner}
              <MedicineDetail medicaments={medicaments} />
            </Layout>
          }
        />
        <Route
          path="/login"
          element={
            <Layout section="public">
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/register"
          element={
            <Layout section="public">
              <RegisterPage />
            </Layout>
          }
        />
        <Route
          path="/reset-password"
          element={
            <Layout section="public">
              <ResetPassword />
            </Layout>
          }
        />
        <Route
          path="/client/dashboard"
          element={
            <Layout section="public">
              <ProtectedRoute allowedRoles={['client']}>
                <ClientDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/commander"
          element={
            <Layout section="public">
              <ProtectedRoute allowedRoles={['client']}>
                <OrderForm />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/demande"
          element={
            <Layout section="public">
              <ProtectedRoute allowedRoles={['client']}>
                <AvailabilityRequest />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/reserver"
          element={
            <Layout section="public">
              <ProtectedRoute allowedRoles={['client']}>
                <ReservationForm />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/client/ordonnance"
          element={
            <Layout section="public">
              <PrescriptionForm />
            </Layout>
          }
        />
        <Route
          path="/admin/login"
          element={
            <Layout section="admin">
              <LoginPage />
            </Layout>
          }
        />
        <Route
          path="/admin"
          element={
            <Layout section="admin">
              <ProtectedRoute allowedRoles={['pharmacien', 'admin']}>
                <AdminHome />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/pharmacien"
          element={
            <Layout section="admin">
              <ProtectedRoute allowedRoles={['pharmacien', 'admin']}>
                <PharmacienDashboard onMedicamentsChanged={refreshMedicaments} />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <Layout section="admin">
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route
          path="/product-list"
          element={
            <Layout section="admin">
              <ProtectedRoute allowedRoles={['pharmacien', 'admin']}>
                <ProductList />
              </ProtectedRoute>
            </Layout>
          }
        />
        <Route path="/client-dashboard" element={<Navigate to="/client/dashboard" replace />} />
        <Route path="/commander" element={<Navigate to="/client/commander" replace />} />
        <Route path="/demande" element={<Navigate to="/client/demande" replace />} />
        <Route path="/reserver" element={<Navigate to="/client/reserver" replace />} />
        <Route path="/ordonance" element={<Navigate to="/client/ordonnance" replace />} />
        <Route path="/pharmacien-dashboard" element={<Navigate to="/admin/pharmacien" replace />} />
        <Route path="/admin-dashboard" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </RouterComponent>
  );
};

export default App;
