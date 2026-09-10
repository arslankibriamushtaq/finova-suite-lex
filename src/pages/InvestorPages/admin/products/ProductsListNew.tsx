import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Dropdown, Menu } from 'antd';
import { DownOutlined } from '@ant-design/icons';
import { 
  Plus, 
  X, 
  Eye, 
  Settings,
  Trash2,
  Target,
  DollarSign,
  Calendar,
  Loader2,
  Package
} from 'lucide-react';
import TableView from '../../../../components/TableView/TableView';

import {
  getAllProducts,
  createProduct,
  updateProduct,
  getProductById,
  deleteProductById,
  getAllProductConfigurations,
  Product,
  ProductCreateRequest,
  ProductUpdateRequest,
  ProductConfiguration
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';
import { usePermissions } from '../../../../hooks/useProductPermissions';

export default function ProductsList() {
  // The shelf is readable on PORTFOLIO_PRODUCT_READ; creating or deleting a
  // product is _PRODUCT_MANAGE.
  const { hasPermission } = usePermissions();
  const canManage = hasPermission('PORTFOLIO_PRODUCT_MANAGE');
  const navigate = useNavigate();
  const { t } = useTranslation('investor');

  // Helper function to get product status text
  const getProductStatusText = (status: number) => {
    const statusMap = {
      0: 'pln.status.active',
      1: 'pln.status.inactive',
      2: 'pln.status.closed',
      3: 'pln.status.suspended',
      4: 'pln.status.launching'
    };
    const key = statusMap[status as keyof typeof statusMap];
    return key ? t(key) : t('pln.status.unknown');
  };

  // Helper function to get product category text
  const getProductCategoryText = (category: number) => {
    const categoryMap = {
      0: 'pln.cat.equity',
      1: 'pln.cat.fixedIncome',
      2: 'pln.cat.realEstate',
      3: 'pln.cat.commodities',
      4: 'pln.cat.mutualFunds',
      5: 'pln.cat.etf',
      6: 'pln.cat.crypto',
      7: 'pln.cat.altInvestments',
      8: 'pln.cat.cash'
    };
    const key = categoryMap[category as keyof typeof categoryMap];
    return key ? t(key) : t('pln.cat.unknown');
  };

  const [products, setProducts] = useState<Product[]>([]);
  const [productConfigurations, setProductConfigurations] = useState<ProductConfiguration[]>([]);
  const [skelitonLoading, setSkelitonLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [formData, setFormData] = useState<ProductCreateRequest>({
    name: '',
    type: '',
    code: '',
    expectedReturn: 0,
    minimumInvestment: 0,
    productCategory: 0,
    description: '',
    productStatus: 0,
    launchDate: new Date().toISOString(),
    investmentDuration: 0,
    segmentId: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalRows, setTotalRows] = useState(0);
  const [from, setFrom] = useState(0);
  const [to, setTo] = useState(0);
  const [totalPage, setTotalPage] = useState(1);

  // Fetch products
  const fetchProducts = async () => {
    try {
      setSkelitonLoading(true);
      const response = await getAllProducts(page, pageSize);
      if (response.success) {
        setProducts(response.data);
        const pageInfo = response.pageInfo || {} as any;
        setTotalPage(pageInfo.totalPages || 1);
        // API returns totalItems, not totalCount
        const totalItems = (pageInfo as any).totalItems || pageInfo.totalCount || 0;
        setTotalRows(totalItems);
        // Calculate from and to correctly
        const fromValue = (page - 1) * pageSize + 1;
        const toValue = Math.min(page * pageSize, totalItems);
        setFrom(fromValue);
        setTo(toValue);
      } else {
        setError(t('pln.err.fetchFailed'));
      }
    } catch (err) {
      setError(t('pln.err.fetchError'));
      console.error('Error fetching products:', err);
    } finally {
      setSkelitonLoading(false);
    }
  };

  // Fetch product configurations
  const fetchProductConfigurations = async () => {
    try {
      const response = await getAllProductConfigurations(1, 100);
      if (response.success) {
        setProductConfigurations(response.data);
      }
    } catch (err) {
      console.error('Error fetching product configurations:', err);
    }
  };

  useEffect(() => {
    fetchProducts();
    // fetchProductConfigurations();
  }, [page, pageSize]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createProduct(formData);
      if (response.success) {
        toast.success(response.notificationMessage || t('pln.toast.created'));
        setShowCreateModal(false);
        setFormData({
          name: '',
          type: '',
          code: '',
          expectedReturn: 0,
          minimumInvestment: 0,
          productCategory: 0,
          description: '',
          productStatus: 0,
          launchDate: new Date().toISOString(),
          investmentDuration: 0,
          segmentId: ''
        });
        fetchProducts();
      } else {
        toast.error(response.notificationMessage || t('pln.toast.createFailed'));
      }
    } catch (err) {
      toast.error(t('pln.toast.createError'));
      console.error('Error creating product:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProduct) return;
    
    try {
      setFormLoading(true);
      const updateData: ProductUpdateRequest = {
        id: selectedProduct.id,
        name: formData.name,
        type: formData.type,
        code: formData.code,
        productCategory: formData.productCategory,
        description: formData.description,
        productStatus: formData.productStatus,
        launchDate: formData.launchDate,
        investmentDuration: formData.investmentDuration,
        segmentId: formData.segmentId
      };
      
      const response = await updateProduct(updateData);
      if (response.success) {
        toast.success(t('pln.toast.updated'));
        setFormData({
          name: '',
          type: '',
          code: '',
          expectedReturn: 0,
          minimumInvestment: 0,
          productCategory: 0,
          description: '',
          productStatus: 0,
          launchDate: new Date().toISOString(),
          investmentDuration: 0,
          segmentId: ''
        });
        fetchProducts();
      } else {
        toast.error(response.notificationMessage || t('pln.toast.updateFailed'));
      }
    } catch (err) {
      toast.error(t('pln.toast.updateError'));
      console.error('Error updating product:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedProduct) return;
    
    try {
      setFormLoading(true);
      const response = await deleteProductById(selectedProduct.id);
      if (response.success) {
        toast.success(t('pln.toast.deleted'));
        setShowDeleteModal(false);
        fetchProducts();
      } else {
        toast.error(response.notificationMessage || t('pln.toast.deleteFailed'));
      }
    } catch (err) {
      toast.error(t('pln.toast.deleteError'));
      console.error('Error deleting product:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click


  // Handle view click
  const handleViewClick = (id: string) => {
    navigate(`/InvestorDashboard/Products/View/${id}`);
  };

  // Handle delete click
  const handleDeleteClick = (row: any) => {
    const product = products.find(p => p.id === row.id);
    if (product) {
      setSelectedProduct(product);
      setShowDeleteModal(true);
    }
  };

  // Table Headers
  const menu = (row: any) => (
    <Menu>
      <Menu.Item key="view" onClick={() => handleViewClick(row.id)}>
        <Eye className="w-4 h-4 me-2" style={{ display: 'inline' }} />
        {t('pln.menu.viewDetails')}
      </Menu.Item>
      <Menu.Item key="config" onClick={() => navigate(`/InvestorDashboard/Products/${row.id}/config`)}>
        <Settings className="w-4 h-4 me-2" style={{ display: 'inline' }} />
        {t('pln.menu.configurations')}
      </Menu.Item>
      {canManage && (
        <Menu.Item key="delete" onClick={() => handleDeleteClick(row)}>
          <Trash2 className="w-4 h-4 me-2" style={{ display: 'inline' }} />
          {t('common:delete')}
        </Menu.Item>
      )}
    </Menu>
  );

  const Product_Headers = [
    {
      name: t('pln.col.product'),
      selector: (row: { productName: any; description: any }) => (
        <div>
          <div className="text-sm font-medium">{row.productName}</div>
          <div className="text-sm text-gray-500">{row.description}</div>
        </div>
      ),
      sortable: true,
      width: "300px",
    },
    {
      name: t('common:type'),
      selector: (row: { type: any }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
          {row.type}
        </span>
      ),
      sortable: true,
    },
    {
      name: t('pln.col.code'),
      selector: (row: { code: any }) => (
        <span className="text-sm text-gray-900">{row.code}</span>
      ),
      sortable: true,
    },
    {
      name: t('pln.col.expectedReturn'),
      selector: (row: { expectedReturn: any }) => (
        <div className="flex items-center">
          <Target className="w-4 h-4 text-red-500 me-1" />
          <span>{row.expectedReturn}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: t('pln.col.minInvestment'),
      selector: (row: { minimumInvestment: any }) => (
        <div className="flex items-center">
        
          <span>{`SAR ${row.minimumInvestment.toLocaleString()}`}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: t('pln.col.launchDate'),
      selector: (row: { launchDate: any }) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 me-1" />
          <span>{new Date(row.launchDate).toLocaleDateString()}</span>
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: t('common:status'),
      cell: (row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 0 ? 'bg-red-100 text-red-800' : // Active
          row.status === 1 ? 'bg-gray-100 text-gray-800' : // Inactive
          row.status === 2 ? 'bg-red-100 text-red-800' : // Closed
          row.status === 3 ? 'bg-yellow-100 text-yellow-800' : // Suspended (Pending-like)
          row.status === 4 ? 'bg-yellow-100 text-yellow-800' : // Launching (Pending-like)
          'bg-gray-100 text-gray-800' // Default
        }`}>
          {getProductStatusText(row.status)}
        </span>
      ),
      sortable: true,
    },
    {
      name: t('pln.col.action'),
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
            {t('pln.select')} <DownOutlined />
          </Button>
        </Dropdown>
      ),
    },
  ];

  // Map products data for TableView
  const mappedData = products?.map((item: Product) => ({
    id: item.id,
    productName: item.name || "-",
    description: item.description || "-",
    type: item.type || "-",
    code: item.code || "-",
    expectedReturn: item.expectedReturn || 0,
    minimumInvestment: item.minimumInvestment || 0,
    launchDate: item.launchDate || new Date().toISOString(),
    status: item.productStatus,
  }));

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchProducts}
          className="mt-2 px-4 py-2 bg-black text-white rounded-lg "
        >
          {t('pln.retry')}
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">{t('pln.title')}</h1>
          <p className="text-gray-600">{t('pln.subtitle')}</p>
        </div>
        {canManage && (
          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
            style={{ borderRadius: '2px' }}
          >
            <Plus className="w-4 h-4 me-2" />
            {t('pln.addProduct')}
          </button>
        )}
      </div>

      {/* Products Table */}
      <div className="cs-table">
        <TableView
          header={Product_Headers}
          data={mappedData}
          totalRows={totalRows}
          isLoading={skelitonLoading}
          from={from}
          page={page}
          totalPage={totalPage}
          setPage={setPage}
          pageSize={pageSize}
          setPageSize={setPageSize}
          to={to}
        />
      </div>

      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('pln.createProduct')}</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productName')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productType')}
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productType')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productCode')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.expectedReturnPct')}
                  </label>
                  <input
                    type="text"
                   
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.expectedReturn')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.minimumInvestment')}
                  </label>
                  <input
                    type="text"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData({ ...formData, minimumInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.minimumInvestment')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productCategory')}
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>{t('pln.cat.equity')}</option>
                    <option value={1}>{t('pln.cat.fixedIncome')}</option>
                    <option value={2}>{t('pln.cat.realEstate')}</option>
                    <option value={3}>{t('pln.cat.commodities')}</option>
                    <option value={4}>{t('pln.cat.mutualFunds')}</option>
                    <option value={5}>{t('pln.cat.etf')}</option>
                    <option value={6}>{t('pln.cat.crypto')}</option>
                    <option value={7}>{t('pln.cat.altInvestments')}</option>
                    <option value={8}>{t('pln.cat.cash')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productStatus')}
                  </label>
                  <select
                    value={formData.productStatus}
                    onChange={(e) => setFormData({ ...formData, productStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>{t('pln.status.active')}</option>
                    <option value={1}>{t('pln.status.inactive')}</option>
                    <option value={2}>{t('pln.status.closed')}</option>
                    <option value={3}>{t('pln.status.suspended')}</option>
                    <option value={4}>{t('pln.status.launching')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.launchDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.launchDate}
                    onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.investmentDuration')}
                  </label>
                  <input
                    type="text"
                    value={formData.investmentDuration}
                    onChange={(e) => setFormData({ ...formData, investmentDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.investmentDuration')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.segmentId')}
                  </label>
                  <input
                    type="text"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.segmentId')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pln.field.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  placeholder={t('pln.ph.description')}
                  rows={3}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  style={{ borderRadius: '2px' }}
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ borderRadius: '2px' }}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('pln.creating')}
                    </div>
                  ) : (
                    t('pln.createProduct')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Product Modal - Removed since edit functionality is not used */}
      {false && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('pln.editProduct')}</h3>
              <button
                onClick={() => {}}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={(e) => { e.preventDefault(); }} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productName')}
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productName')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productType')}
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productType')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productCode')}
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.productCode')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productCategory')}
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>{t('pln.cat.equity')}</option>
                    <option value={1}>{t('pln.cat.fixedIncome')}</option>
                    <option value={2}>{t('pln.cat.realEstate')}</option>
                    <option value={3}>{t('pln.cat.commodities')}</option>
                    <option value={4}>{t('pln.cat.mutualFunds')}</option>
                    <option value={5}>{t('pln.cat.etf')}</option>
                    <option value={6}>{t('pln.cat.crypto')}</option>
                    <option value={7}>{t('pln.cat.altInvestments')}</option>
                    <option value={8}>{t('pln.cat.cash')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.productStatus')}
                  </label>
                  <select
                    value={formData.productStatus}
                    onChange={(e) => setFormData({ ...formData, productStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>{t('pln.status.active')}</option>
                    <option value={1}>{t('pln.status.inactive')}</option>
                    <option value={2}>{t('pln.status.closed')}</option>
                    <option value={3}>{t('pln.status.suspended')}</option>
                    <option value={4}>{t('pln.status.launching')}</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.launchDate')}
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.launchDate}
                    onChange={(e) => setFormData({ ...formData, launchDate: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.investmentDuration')}
                  </label>
                  <input
                    type="text"
                    value={formData.investmentDuration}
                    onChange={(e) => setFormData({ ...formData, investmentDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.investmentDuration')}
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {t('pln.field.segmentId')}
                  </label>
                  <input
                    type="text"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder={t('pln.ph.segmentId')}
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {t('pln.field.description')}
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  placeholder={t('pln.ph.description')}
                  rows={3}
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {}}
                  className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  {t('common:cancel')}
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin me-2" />
                      {t('pln.updating')}
                    </div>
                  ) : (
                    t('pln.updateProduct')
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Product Modal */}
      {showViewModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('pln.productDetails')}</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.view.id')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.view.name')}</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('common:type')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.col.code')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.col.expectedReturn')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.expectedReturn}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.minimumInvestment')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.minimumInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.productCategory')}</label>
                  <p className="text-sm text-gray-900">{getProductCategoryText(selectedProduct.productCategory)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.productStatus')}</label>
                  <p className="text-sm text-gray-900">{getProductStatusText(selectedProduct.productStatus)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.launchDate')}</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedProduct.launchDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.view.investmentDuration')}</label>
                  <p className="text-sm text-gray-900">{t('pln.view.months', { count: selectedProduct.investmentDuration })}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.segmentId')}</label>
                  <p className="text-sm text-gray-900">{selectedProduct.segmentId}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">{t('pln.field.description')}</label>
                <p className="text-sm text-gray-900">{selectedProduct.description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:close')}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedProduct && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">{t('pln.deleteProduct')}</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                {t('pln.confirmDelete')}
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-700 me-2" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">{t('pln.productLabel')}</span> {selectedProduct.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                {t('common:cancel')}
              </button>
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin me-2" />
                    {t('pln.deleting')}
                  </div>
                ) : (
                  t('pln.deleteProduct')
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
