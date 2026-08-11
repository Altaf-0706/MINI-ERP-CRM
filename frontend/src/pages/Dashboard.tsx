import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';

const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState({
    customers: 0,
    products: 0,
    challans: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [custRes, prodRes, chalRes] = await Promise.all([
          api.get('/customers?limit=1'),
          api.get('/products?limit=1'),
          api.get('/challans?limit=1'),
        ]);
        setStats({
          customers: custRes.data.total || 0,
          products: prodRes.data.total || 0,
          challans: chalRes.data.total || 0,
        });
      } catch (error) {
        console.error('Failed to fetch stats', error);
      }
    };
    fetchStats();
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <p style={{ marginBottom: '24px', color: '#6B7280' }}>
        Welcome back, <strong>{user?.name}</strong>! Here is what's happening today.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '24px' }}>
        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#E0E7FF', color: '#4F46E5', padding: '16px', borderRadius: '12px' }}>
            <Users size={32} />
          </div>
          <div>
            <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Customers</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.customers}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#D1FAE5', color: '#10B981', padding: '16px', borderRadius: '12px' }}>
            <Package size={32} />
          </div>
          <div>
            <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Products</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.products}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#FEF3C7', color: '#F59E0B', padding: '16px', borderRadius: '12px' }}>
            <FileText size={32} />
          </div>
          <div>
            <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Total Challans</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>{stats.challans}</div>
          </div>
        </div>

        <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div style={{ backgroundColor: '#FEE2E2', color: '#EF4444', padding: '16px', borderRadius: '12px' }}>
            <TrendingUp size={32} />
          </div>
          <div>
            <div style={{ color: '#6B7280', fontSize: '0.875rem', fontWeight: 600 }}>Revenue MTD</div>
            <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>$0.00</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
