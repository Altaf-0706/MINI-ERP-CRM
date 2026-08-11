import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { Plus, CheckCircle, FileText, XCircle, Trash2 } from 'lucide-react';

const Challans = () => {
  const [challans, setChallans] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedChallan, setSelectedChallan] = useState<any>(null);
  
  const [customers, setCustomers] = useState([]);
  const [products, setProducts] = useState([]);
  
  const [formData, setFormData] = useState({
    customerId: '',
    status: 'DRAFT',
    items: [{ productId: '', quantity: 1, unitPrice: '' }]
  });

  const fetchChallans = async () => {
    setLoading(true);
    try {
      const res = await api.get('/challans');
      setChallans(res.data.challans);
    } catch (error) {
      console.error('Failed to fetch challans', error);
    } finally {
      setLoading(false);
    }
  };

  const loadDependencies = async () => {
    try {
      const [custRes, prodRes] = await Promise.all([
        api.get('/customers?limit=100'),
        api.get('/products?limit=100')
      ]);
      setCustomers(custRes.data.customers);
      setProducts(prodRes.data.products);
    } catch (error) {
      console.error('Failed to load dependencies', error);
    }
  };

  useEffect(() => {
    fetchChallans();
    loadDependencies();
  }, []);

  const handleAddItem = () => {
    setFormData({
      ...formData,
      items: [...formData.items, { productId: '', quantity: 1, unitPrice: '' }]
    });
  };

  const handleItemChange = (index: number, field: string, value: string) => {
    const newItems = [...formData.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    // Auto-fill price if product is selected
    if (field === 'productId' && value) {
      const prod: any = products.find((p: any) => p.id === value);
      if (prod) {
        newItems[index].unitPrice = prod.unitPrice;
      }
    }
    
    setFormData({ ...formData, items: newItems });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/challans', formData);
      setShowModal(false);
      setFormData({ customerId: '', status: 'DRAFT', items: [{ productId: '', quantity: 1, unitPrice: '' }] });
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create challan');
    }
  };

  const handleViewChallan = async (id: string) => {
    try {
      const res = await api.get(`/challans/${id}`);
      setSelectedChallan(res.data);
      setShowViewModal(true);
    } catch (error) {
      console.error('Failed to fetch challan details', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this challan?')) return;
    try {
      await api.delete(`/challans/${id}`);
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete challan');
    }
  };

  const confirmChallan = async (id: string) => {
    if (!window.confirm('Are you sure you want to confirm this challan? Stock will be reduced.')) return;
    try {
      await api.put(`/challans/${id}/confirm`);
      fetchChallans();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to confirm challan');
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Sales Challans</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Create Challan
        </button>
      </div>

      <div className="card">
        {loading ? (
          <div style={{ textAlign: 'center', padding: '40px' }}>Loading...</div>
        ) : (
          <div className="table-container">
            <table>
              <thead>
                <tr>
                  <th>Challan No</th>
                  <th>Date</th>
                  <th>Customer</th>
                  <th>Items Qty</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {challans.map((c: any) => (
                  <tr key={c.id}>
                    <td style={{ fontWeight: 600 }}>{c.challanNumber}</td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>{c.customer?.name}</td>
                    <td>{c.totalQuantity}</td>
                    <td>
                      <span className={`badge ${c.status === 'CONFIRMED' ? 'badge-success' : c.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      {c.status === 'DRAFT' && (
                        <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#D1FAE5', color: '#065F46' }} onClick={() => confirmChallan(c.id)}>
                          <CheckCircle size={14} /> Confirm
                        </button>
                      )}
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#F3F4F6', marginLeft: '8px', marginRight: '8px' }} onClick={() => handleViewChallan(c.id)}>
                        <FileText size={14} /> View
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#DC2626' }} onClick={() => handleDelete(c.id)} title="Delete Challan">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {challans.length === 0 && (
                  <tr>
                    <td colSpan={6} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      No challans found.
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
          <div className="card" style={{ width: '100%', maxWidth: '700px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Create Sales Challan</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px' }}>
                <div className="form-group">
                  <label className="form-label">Select Customer *</label>
                  <select required className="form-select" value={formData.customerId} onChange={e => setFormData({...formData, customerId: e.target.value})}>
                    <option value="">-- Choose Customer --</option>
                    {customers.map((c: any) => (
                      <option key={c.id} value={c.id}>{c.name} {c.businessName ? `(${c.businessName})` : ''}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Save As</label>
                  <select className="form-select" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})}>
                    <option value="DRAFT">Draft</option>
                    <option value="CONFIRMED">Confirmed (Reduces Stock)</option>
                  </select>
                </div>
              </div>

              <div style={{ marginBottom: '16px', fontWeight: 600 }}>Products List</div>
              
              {formData.items.map((item, index) => (
                <div key={index} style={{ display: 'flex', gap: '12px', marginBottom: '12px', alignItems: 'flex-start' }}>
                  <div style={{ flex: 2 }}>
                    <select required className="form-select" value={item.productId} onChange={e => handleItemChange(index, 'productId', e.target.value)}>
                      <option value="">-- Product --</option>
                      {products.map((p: any) => (
                        <option key={p.id} value={p.id}>{p.name} (Stock: {p.currentStock})</option>
                      ))}
                    </select>
                  </div>
                  <div style={{ flex: 1 }}>
                    <input required type="number" min="1" placeholder="Qty" className="form-input" value={item.quantity} onChange={e => handleItemChange(index, 'quantity', e.target.value)} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <input required type="number" step="0.01" placeholder="Price" className="form-input" value={item.unitPrice} onChange={e => handleItemChange(index, 'unitPrice', e.target.value)} />
                  </div>
                  {formData.items.length > 1 && (
                    <button type="button" className="btn" style={{ padding: '12px', color: '#DC2626', backgroundColor: '#FEE2E2' }} onClick={() => handleRemoveItem(index)}>
                      <XCircle size={18} />
                    </button>
                  )}
                </div>
              ))}
              
              <button type="button" className="btn" style={{ fontSize: '0.875rem', backgroundColor: '#F3F4F6' }} onClick={handleAddItem}>
                <Plus size={14} /> Add Another Product
              </button>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '32px', paddingTop: '16px', borderTop: '1px solid #E5E7EB' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Create Challan</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedChallan && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Challan Details</h2>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
              <div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.875rem' }}>Challan No</p>
                <p style={{ margin: 0, fontWeight: 600 }}>{selectedChallan.challanNumber}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.875rem' }}>Status</p>
                <span className={`badge ${selectedChallan.status === 'CONFIRMED' ? 'badge-success' : selectedChallan.status === 'DRAFT' ? 'badge-warning' : 'badge-danger'}`}>
                  {selectedChallan.status}
                </span>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.875rem' }}>Customer</p>
                <p style={{ margin: 0, fontWeight: 500 }}>{selectedChallan.customer?.name} {selectedChallan.customer?.businessName ? `(${selectedChallan.customer.businessName})` : ''}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.875rem' }}>Created By</p>
                <p style={{ margin: 0 }}>{selectedChallan.user?.name}</p>
              </div>
              <div>
                <p style={{ margin: '0 0 4px', color: '#6B7280', fontSize: '0.875rem' }}>Date</p>
                <p style={{ margin: 0 }}>{new Date(selectedChallan.createdAt).toLocaleString()}</p>
              </div>
            </div>
            
            <h3 style={{ fontSize: '1rem', marginBottom: '12px', borderBottom: '1px solid #E5E7EB', paddingBottom: '8px' }}>Items</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead style={{ backgroundColor: '#F9FAFB', textAlign: 'left' }}>
                <tr>
                  <th style={{ padding: '8px', borderBottom: '1px solid #E5E7EB' }}>Product</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>Qty</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>Unit Price</th>
                  <th style={{ padding: '8px', borderBottom: '1px solid #E5E7EB', textAlign: 'right' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {selectedChallan.items?.map((item: any) => {
                  const snapshot = JSON.parse(item.productSnapshot || '{}');
                  return (
                    <tr key={item.id} style={{ borderBottom: '1px solid #F3F4F6' }}>
                      <td style={{ padding: '8px' }}>{snapshot.name || item.productId} <div style={{ fontSize: '0.75rem', color: '#6B7280' }}>{snapshot.sku}</div></td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>{item.quantity}</td>
                      <td style={{ padding: '8px', textAlign: 'right' }}>${item.unitPrice.toFixed(2)}</td>
                      <td style={{ padding: '8px', textAlign: 'right', fontWeight: 500 }}>${(item.quantity * item.unitPrice).toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Challans;
