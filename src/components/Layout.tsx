import { NavLink, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import type { Role } from '../types';
import { ThemeToggle } from './ThemePicker';

type NavItem = { to: string; icon: string; label: string };

const NAV: Record<Role, NavItem[]> = {
  patient: [
    { to: '/app', icon: '🏠', label: 'Home' },
    { to: '/app/doctors', icon: '🩺', label: 'Doctors' },
    { to: '/app/pharmacies', icon: '💊', label: 'Pharmacies' },
    { to: '/app/hospitals', icon: '🏥', label: 'Hospitals' },
    { to: '/app/labs', icon: '🧪', label: 'Labs' },
    { to: '/app/visits', icon: '📅', label: 'My care' },
    { to: '/app/profile', icon: '👤', label: 'Profile' },
  ],
  doctor: [
    { to: '/portal', icon: '📊', label: 'Dashboard' },
    { to: '/portal/schedule', icon: '📅', label: 'Schedule' },
    { to: '/portal/patients', icon: '👥', label: 'Patients' },
    { to: '/portal/labs', icon: '🧪', label: 'Lab results' },
    { to: '/portal/profile', icon: '⚙️', label: 'Account' },
  ],
  pharmacy: [
    { to: '/portal', icon: '📊', label: 'Dashboard' },
    { to: '/portal/inventory', icon: '💊', label: 'Inventory' },
    { to: '/portal/orders', icon: '🧾', label: 'Reservations' },
    { to: '/portal/profile', icon: '⚙️', label: 'Account' },
  ],
  hospital: [
    { to: '/portal', icon: '📊', label: 'Dashboard' },
    { to: '/portal/patients', icon: '🛏️', label: 'Admissions' },
    { to: '/portal/departments', icon: '🏥', label: 'Departments' },
    { to: '/portal/profile', icon: '⚙️', label: 'Account' },
  ],
  lab: [
    { to: '/portal', icon: '📊', label: 'Dashboard' },
    { to: '/portal/orders', icon: '🧪', label: 'Test orders' },
    { to: '/portal/catalog', icon: '📋', label: 'Test catalog' },
    { to: '/portal/profile', icon: '⚙️', label: 'Account' },
  ],
};

export default function Layout() {
  const { user } = useAuth();
  const items = NAV[user?.role ?? 'patient'];
  // Phones only have room for 5 tabs.
  const mobile = items.length > 5 ? items.filter((i) => !['/app/hospitals', '/app/labs'].includes(i.to)) : items;
  const end = (to: string) => to === '/app' || to === '/portal';
  return (
    <div className="shell">
      <nav className="sidebar" aria-label="Main">
        <div className="brand"><div className="logo">✚</div>MediNear</div>
        {items.map((i) => (
          <NavLink key={i.to} to={i.to} end={end(i.to)}><span>{i.icon}</span>{i.label}</NavLink>
        ))}
        <div style={{ flex: 1 }} />
        <div className="row between">
          {user?.role !== 'patient' ? <div className="chip primary">Provider portal · {user?.role}</div> : <span />}
          <ThemeToggle />
        </div>
      </nav>
      <main className="main">
        <Outlet />
      </main>
      <nav className="tabbar" aria-label="Tabs">
        {mobile.map((i) => (
          <NavLink key={i.to} to={i.to} end={end(i.to)}><span className="ico">{i.icon}</span>{i.label}</NavLink>
        ))}
      </nav>
    </div>
  );
}
