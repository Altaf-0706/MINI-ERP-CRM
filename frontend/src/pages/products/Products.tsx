import { useEffect, useState } from 'react';
import api from '../../services/api';
import { Search, Plus, Edit, AlertCircle, FileText, Trash2, Sliders } from 'lucide-react';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [adjustFormData, setAdjustFormData] = useState({ quantityChanged: '', movementType: 'IN', reason: '' });
  
  const [formData, setFormData] = useState({
    name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '', location: ''
  });

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const res = await api.get(`/products?search=${search}`);
      setProducts(res.data.products);
    } catch (error) {
      console.error('Failed to fetch products', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [search]);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this product?')) return;
    try {
      await api.delete(`/products/${id}`);
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete product');
    }
  };

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post(`/products/${selectedProduct.id}/adjust-stock`, adjustFormData);
      setShowAdjustModal(false);
      setAdjustFormData({ quantityChanged: '', movementType: 'IN', reason: '' });
      fetchProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to adjust stock');
    }
  };

  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.put(`/products/${selectedProduct.id}`, formData);
      setShowEditModal(false);
      setFormData({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '', location: '' });
      fetchProducts();
    } catch (error) {
      console.error('Failed to update product', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await api.post('/products', formData);
      setShowModal(false);
      setFormData({ name: '', sku: '', category: '', unitPrice: '', currentStock: '', minStockAlert: '', location: '' });
      fetchProducts();
    } catch (error) {
      console.error('Failed to create product', error);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1>Products & Inventory</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          <Plus size={16} /> Add Product
        </button>
      </div>

      <div className="card">
        <div style={{ marginBottom: '20px', position: 'relative' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '14px', color: '#6B7280' }} />
          <input 
            type="text" 
            className="form-input" 
            placeholder="Search by product name or SKU..." 
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
                  <th>SKU</th>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Unit Price</th>
                  <th>Stock</th>
                  <th>Location</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p: any) => (
                  <tr key={p.id}>
                    <td style={{ fontWeight: 600, color: '#4F46E5' }}>{p.sku}</td>
                    <td style={{ fontWeight: 500 }}>{p.name}</td>
                    <td>{p.category || '-'}</td>
                    <td>${p.unitPrice.toFixed(2)}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontWeight: 600, color: p.currentStock <= p.minStockAlert ? '#DC2626' : 'inherit' }}>
                          {p.currentStock}
                        </span>
                        {p.currentStock <= p.minStockAlert && (
                          <span title="Low Stock Alert"><AlertCircle size={16} color="#DC2626" /></span>
                        )}
                      </div>
                    </td>
                    <td>{p.location || '-'}</td>
                    <td>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#F3F4F6', marginRight: '8px' }} onClick={() => { setSelectedProduct(p); setShowViewModal(true); }}>
                        <FileText size={14} /> View
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#F3F4F6', marginRight: '8px' }} onClick={() => { setSelectedProduct(p); setFormData({ name: p.name, sku: p.sku, category: p.category || '', unitPrice: p.unitPrice, currentStock: p.currentStock, minStockAlert: p.minStockAlert, location: p.location || '' }); setShowEditModal(true); }}>
                        <Edit size={14} /> Edit
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', fontSize: '0.75rem', backgroundColor: '#EEF2FF', color: '#4F46E5', marginRight: '8px' }} onClick={() => { setSelectedProduct(p); setAdjustFormData({ quantityChanged: '', movementType: 'IN', reason: '' }); setShowAdjustModal(true); }} title="Adjust Stock">
                        <Sliders size={14} /> Adjust
                      </button>
                      <button className="btn" style={{ padding: '6px 12px', backgroundColor: '#FEE2E2', color: '#DC2626' }} onClick={() => handleDelete(p.id)} title="Delete Product">
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {products.length === 0 && (
                  <tr>
                    <td colSpan={7} style={{ textAlign: 'center', padding: '40px', color: '#6B7280' }}>
                      No products found.
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
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Add New Product</h2>
            <form onSubmit={handleSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU / Code *</label>
                  <input required className="form-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price ($) *</label>
                  <input required type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" className="form-input" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value.replace(/[^0-9.]/g, '')})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Initial Stock *</label>
                  <input required type="text" inputMode="numeric" pattern="[0-9]*" className="form-input" value={formData.currentStock} onChange={e => setFormData({...formData, currentStock: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Stock Alert</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" className="form-input" value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Location / Warehouse</label>
                  <input className="form-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '600px', margin: '20px', maxHeight: '90vh', overflowY: 'auto' }}>
            <h2 style={{ marginBottom: '20px' }}>Edit Product</h2>
            <form onSubmit={handleEditSubmit}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                <div className="form-group">
                  <label className="form-label">Product Name *</label>
                  <input required className="form-input" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">SKU / Code *</label>
                  <input required className="form-input" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Category</label>
                  <input className="form-input" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Unit Price ($) *</label>
                  <input required type="text" inputMode="decimal" pattern="[0-9]*\.?[0-9]*" className="form-input" value={formData.unitPrice} onChange={e => setFormData({...formData, unitPrice: e.target.value.replace(/[^0-9.]/g, '')})} />
                </div>
                <div className="form-group">
                  <label className="form-label">Current Stock *</label>
                  <input required type="text" className="form-input" value={formData.currentStock} disabled title="Use Stock Adjustments page to change stock" />
                </div>
                <div className="form-group">
                  <label className="form-label">Min Stock Alert</label>
                  <input type="text" inputMode="numeric" pattern="[0-9]*" className="form-input" value={formData.minStockAlert} onChange={e => setFormData({...formData, minStockAlert: e.target.value.replace(/[^0-9]/g, '')})} />
                </div>
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label">Location / Warehouse</label>
                  <input className="form-input" value={formData.location} onChange={e => setFormData({...formData, location: e.target.value})} />
                </div>
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowEditModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Update Product</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showViewModal && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '500px', margin: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Product Details</h2>
            <div style={{ display: 'grid', gap: '12px', fontSize: '0.875rem' }}>
              <div><strong>Name:</strong> {selectedProduct.name}</div>
              <div><strong>SKU:</strong> {selectedProduct.sku}</div>
              <div><strong>Category:</strong> {selectedProduct.category || '-'}</div>
              <div><strong>Unit Price:</strong> ${selectedProduct.unitPrice}</div>
              <div><strong>Stock:</strong> {selectedProduct.currentStock}</div>
              <div><strong>Min Alert:</strong> {selectedProduct.minStockAlert}</div>
              <div><strong>Location:</strong> {selectedProduct.location || '-'}</div>
              <div><strong>Created At:</strong> {new Date(selectedProduct.createdAt).toLocaleDateString()}</div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '24px' }}>
              <button type="button" className="btn" onClick={() => setShowViewModal(false)}>Close</button>
            </div>
          </div>
        </div>
      )}

      {showAdjustModal && selectedProduct && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="card" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
            <h2 style={{ marginBottom: '20px' }}>Adjust Stock</h2>
            <div style={{ marginBottom: '16px', fontSize: '0.875rem', color: '#4B5563' }}>
              <strong>Product:</strong> {selectedProduct.name} ({selectedProduct.sku})<br />
              <strong>Current Stock:</strong> {selectedProduct.currentStock}
            </div>
            
            <form onSubmit={handleAdjustSubmit}>
              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <div style={{ display: 'flex', gap: '12px' }}>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="movementType" value="IN" checked={adjustFormData.movementType === 'IN'} onChange={(e) => setAdjustFormData({ ...adjustFormData, movementType: e.target.value })} />
                    Stock IN (Add)
                  </label>
                  <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                    <input type="radio" name="movementType" value="OUT" checked={adjustFormData.movementType === 'OUT'} onChange={(e) => setAdjustFormData({ ...adjustFormData, movementType: e.target.value })} />
                    Stock OUT (Remove)
                  </label>
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity to {adjustFormData.movementType === 'IN' ? 'Add' : 'Remove'} *</label>
                <input required type="number" min="1" className="form-input" value={adjustFormData.quantityChanged} onChange={e => setAdjustFormData({...adjustFormData, quantityChanged: e.target.value})} />
              </div>
              <div className="form-group">
                <label className="form-label">Reason / Notes</label>
                <input className="form-input" placeholder="e.g. Restock, Damaged, Manual Audit" value={adjustFormData.reason} onChange={e => setAdjustFormData({...adjustFormData, reason: e.target.value})} />
              </div>
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" className="btn" onClick={() => setShowAdjustModal(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">Confirm Adjustment</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Products;
