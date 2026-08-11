import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit, FileText, Trash2 } from 'lucide-react';

const Customers = () => {
  const [customers, setCustomers] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null);
  
  // Form State
  const [formData, setFormData] = useState({
    name: '', mobile: '', email: '', businessName: '',
    customerType: 'RETAIL', status: 'LEAD', address: ''
  });

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.customers);
    } catch (error) {
      console.error('Failed to fetch customers', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this customer?')) return;
    try {
      await api.delete(`/customers/${id}`);
      fetchCustomers();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete customer');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/customers/${selectedCustomer.id}`, formData);
      setShowEditModal(false);
      setFormData({ name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'LEAD', address: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Failed to update customer', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/customers', formData);
      setShowModal(false);
      setFormData({ name: '', mobile: '', email: '', businessName: '', customerType: 'RETAIL', status: 'LEAD', address: '' });
      fetchCustomers();
    } catch (error) {
      console.error('Failed to create customer', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Customers</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6B7280' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search customers by name, mobile, or business..." 
            style={{ paddingLeft: '40px' }}
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Business</th>
                  <th>Mobile</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 500 }}>{c.name}</td>
                    <td>{c.businessName || '-'}</td>
                    <td>{c.mobile}</td>
                    <td>
                      <span className="badge badge-info">{c.customerType}</span>
                    </td>
                    <td>
                      <span className={`badge ${c.status === 'ACTIVE' ? 'badge-success' : c.status === 'LEAD' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#F3F4F6', marginRight: '8px' }} onClick={() => { setSelectedCustomer(c); setShowViewModal(true); }}>
                        <FileText size={14} /> View
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#F3F4F6', marginRight: '8px' }} onClick={() => { setSelectedCustomer(c); setFormData({ name: c.name, mobile: c.mobile, email: c.email || '', businessName: c.businessName || '', customerType: c.customerType, status: c.status, address: c.address || '' }); setShowEditModal(true); }}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#DC2626' }} onClick={() => handleDelete(c.id)} title="Delete Customer">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {customers.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      No customers found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {showModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Customer</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input required className="form-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input className="form-input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select className="form-select" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Customer</h2>
            <form onSubmit={handleEditSubmit}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input required className="form-input" value={formData.mobile} onChange={e => setFormData({...formData, mobile: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Business Name</label>
                <input className="form-input" value={formData.businessName} onChange={e => setFormData({...formData, businessName: e.target.value})} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Customer Type</label>
                  <select className="form-select" value={formData.customerType} onChange={e => setFormData({...formData, customerType: e.target.value})}>
                    <option value="RETAIL">Retail</option>
                    <option value="WHOLESALE">Wholesale</option>
                    <option value="DISTRIBUTOR">Distributor</option>
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Status</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="LEAD">Lead</option>
                    <option value="ACTIVE">Active</option>
                    <option value="INACTIVE">Inactive</option>
                  </select>
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Customer</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedCustomer && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Customer Details</h2>
            <div style={{ display: 'grid', gap: '12px', fontSize: '0.875rem' }}>
              <div><strong>Name:</strong> {selectedCustomer.name}</div>
              <div><strong>Mobile:</strong> {selectedCustomer.mobile}</div>
              <div><strong>Business Name:</strong> {selectedCustomer.businessName || '-'}</div>
              <div><strong>Customer Type:</strong> {selectedCustomer.customerType}</div>
              <div><strong>Status:</strong> {selectedCustomer.status}</div>
              <div><strong>Created At:</strong> {new Date(selectedCustomer.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Customers;
