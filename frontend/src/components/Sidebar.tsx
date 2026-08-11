
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';

const Sidebar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="sidebar">
      <div className="sidebar-header">
        Mini ERP CRM
      </div>
      <div className="sidebar-nav">
        <NavLink to="/" end className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <LayoutDashboard size={20} />
          <span>Dashboard</span>
        </NavLink>
        
        <NavLink to="/customers" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Users size={20} />
          <span>Customers</span>
        </NavLink>
        
        <NavLink to="/products" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <Package size={20} />
          <span>Products</span>
        </NavLink>
        
        <NavLink to="/challans" className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}>
          <FileText size={20} />
          <span>Sales Challans</span>
        </NavLink>
      </div>
      
      <div style={{ padding: '24px', borderTop: '1px solid #374151' }}>
        <div style={{ marginBottom: '16px', fontSize: '0.875rem' }}>
          <div>{user?.name}</div>
          <div style={{ color: '#9CA3AF' }}>{user?.role}</div>
        </div>
        <button onClick={handleLogout} className="btn" style={{ width: '100%', backgroundColor: '#374151', color: 'white' }}>
          <LogOut size={16} />
          Logout
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
