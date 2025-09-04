import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { useEffect, useState } from 'react';
import axios from 'axios';
import Home from './pages/Home';
import MedicineDetail from './components/MedicineDetail';
import LoginPage from './pages/auth/LoginPage';
import ResetPassword from './pages/auth/./ResetPassword';
import RegisterPage from './pages/auth/RegisterPage';
import Layout from './components/Layout';
import ProductPage from './pages/Product/ProductPage';
import AvailabilityRequest from './components/AvailabilityRequest';
import OrderForm from './components/OrderForm';
import ReservationForm from './components/ReservationForm';
import PrescriptionForm from './components/PrescriptionForm';
import ProductList from './components/ProductList';
import PharmacienDashboard from './pages/PharmacienDashboard';
import AdminDashboard from './pages/AdminDashboard';

interface Medicament {
    _id: string;
    name: string;
    quantity: number;
    price: number;
    isOverTheCounter?: boolean;
}

const App: React.FC = () => {
    const [medicaments, setMedicaments] = useState<Medicament[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchMedicaments = async () => {
        try {
            const response = await axios.get<Medicament[]>('http://localhost:3000/medicaments');
            setMedicaments(response.data);
        } catch (error) {
            console.error('Erreur lors de la récupération des médicaments:', error);
            setError('Erreur de chargement des médicaments');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMedicaments();
    }, []);

    return (
        <Router>
            <Layout>
                {loading && <p>Chargement...</p>}
                {error && <p>{error}</p>}
                <Routes>
                    <Route path="/" element={<Home />} />
                    <Route path="/products" element={<ProductPage medicaments={medicaments} />} />
                    <Route path="/medicine/:id" element={<MedicineDetail medicaments={medicaments} />} />
                    <Route path="/login" element={<LoginPage />} />
                    <Route path="/register" element={<RegisterPage />} />
                    <Route path="/commander" element={<OrderForm />} />
                    <Route path="/demande" element={<AvailabilityRequest />} />
                    <Route path="/reserver" element={<ReservationForm />} /> 
                    <Route path="/ordonance" element={<PrescriptionForm />} />
                    <Route path="/product-list" element={<ProductList />} />
                    <Route path="/pharmacien-dashboard" element={<PharmacienDashboard />} />
                    <Route path="/admin-dashboard" element={<AdminDashboard />} />
                    <Route path="/reset-password" element={<ResetPassword />} />
                </Routes>
            </Layout>
        </Router>
    );
};

export default App;