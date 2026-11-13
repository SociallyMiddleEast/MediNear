import { Navigate, Route, Routes } from 'react-router-dom';
import type { ReactElement } from 'react';
import { useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import { ToastHost } from './components/ui';
import Welcome from './pages/auth/Welcome';
import SignIn from './pages/auth/SignIn';
import SignUp from './pages/auth/SignUp';
import Home from './pages/patient/Home';
import Doctors from './pages/patient/Doctors';
import DoctorDetail from './pages/patient/DoctorDetail';
import Pharmacies, { PharmacyDetail } from './pages/patient/Pharmacies';
import Hospitals, { HospitalDetail } from './pages/patient/Hospitals';
import Labs, { LabDetail } from './pages/patient/Labs';
import Visits from './pages/patient/Visits';
import Profile from './pages/patient/Profile';
import Dashboard from './pages/provider/Dashboard';
import { DoctorSchedule, DoctorPatients, DoctorLabs } from './pages/provider/DoctorPages';
import { PharmacyInventory, PharmacyOrders } from './pages/provider/PharmacyPages';
import { HospitalAdmissions, HospitalDepartments } from './pages/provider/HospitalPages';
import { LabOrders, LabCatalog } from './pages/provider/LabPages';

function Guard({ portal, children }: { portal: 'patient' | 'provider'; children: ReactElement }) {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-wrap muted">Loading…</div>;
  if (!user) return <Navigate to="/signin" replace />;
  const isPatient = user.role === 'patient';
  if (portal === 'patient' && !isPatient) return <Navigate to="/portal" replace />;
  if (portal === 'provider' && isPatient) return <Navigate to="/app" replace />;
  return children;
}

function Entry() {
  const { user, loading } = useAuth();
  if (loading) return <div className="auth-wrap muted">Loading…</div>;
  if (user) return <Navigate to={user.role === 'patient' ? '/app' : '/portal'} replace />;
  return <Welcome />;
}

function ProviderOrders() {
  const { user } = useAuth();
  return user?.role === 'lab' ? <LabOrders /> : <PharmacyOrders />;
}
function ProviderPatients() {
  const { user } = useAuth();
  return user?.role === 'hospital' ? <HospitalAdmissions /> : <DoctorPatients />;
}

export default function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Entry />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<SignUp />} />

        <Route path="/app" element={<Guard portal="patient"><Layout /></Guard>}>
          <Route index element={<Home />} />
          <Route path="doctors" element={<Doctors />} />
          <Route path="doctors/:id" element={<DoctorDetail />} />
          <Route path="pharmacies" element={<Pharmacies />} />
          <Route path="pharmacies/:id" element={<PharmacyDetail />} />
          <Route path="hospitals" element={<Hospitals />} />
          <Route path="hospitals/:id" element={<HospitalDetail />} />
          <Route path="labs" element={<Labs />} />
          <Route path="labs/:id" element={<LabDetail />} />
          <Route path="visits" element={<Visits />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="/portal" element={<Guard portal="provider"><Layout /></Guard>}>
          <Route index element={<Dashboard />} />
          <Route path="schedule" element={<DoctorSchedule />} />
          <Route path="patients" element={<ProviderPatients />} />
          <Route path="labs" element={<DoctorLabs />} />
          <Route path="inventory" element={<PharmacyInventory />} />
          <Route path="orders" element={<ProviderOrders />} />
          <Route path="departments" element={<HospitalDepartments />} />
          <Route path="catalog" element={<LabCatalog />} />
          <Route path="profile" element={<Profile />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastHost />
    </>
  );
}
