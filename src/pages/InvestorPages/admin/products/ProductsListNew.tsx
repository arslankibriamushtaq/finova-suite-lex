import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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

export default function ProductsList() {
  const navigate = useNavigate();

  // Helper function to get product status text
  const getProductStatusText = (status: number) => {
    const statusMap = {
      0: 'Active',
      1: 'Inactive', 
      2: 'Closed',
      3: 'Suspended',
      4: 'Launching'
    };
    return statusMap[status as keyof typeof statusMap] || 'Unknown';
  };

  // Helper function to get product category text
  const getProductCategoryText = (category: number) => {
    const categoryMap = {
      0: 'Equity',
      1: 'Fixed Income',
      2: 'Real Estate',
      3: 'Commodities',
      4: 'Mutual Funds',
      5: 'Exchange Traded Funds',
      6: 'Cryptocurrencies',
      7: 'Alternative Investments',
      8: 'Cash and Cash Equivalents'
    };
    return categoryMap[category as keyof typeof categoryMap] || 'Unknown';
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
        setError('Failed to fetch products');
      }
    } catch (err) {
      setError('Error fetching products');
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
        toast.success(response.notificationMessage || 'Product created successfully');
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
        toast.error(response.notificationMessage || 'Failed to create product');
      }
    } catch (err) {
      toast.error('Error creating product');
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
        toast.success('Product updated successfully!');
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
        toast.error(response.notificationMessage || 'Failed to update product');
      }
    } catch (err) {
      toast.error('Error updating product');
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
        toast.success('Product deleted successfully!');
        setShowDeleteModal(false);
        fetchProducts();
      } else {
        toast.error(response.notificationMessage || 'Failed to delete product');
      }
    } catch (err) {
      toast.error('Error deleting product');
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
        <Eye className="w-4 h-4 mr-2" style={{ display: 'inline' }} />
        View Details
      </Menu.Item>
      <Menu.Item key="config" onClick={() => navigate(`/InvestorDashboard/Products/${row.id}/config`)}>
        <Settings className="w-4 h-4 mr-2" style={{ display: 'inline' }} />
        Product Configurations
      </Menu.Item>
      <Menu.Item key="delete" onClick={() => handleDeleteClick(row)}>
        <Trash2 className="w-4 h-4 mr-2" style={{ display: 'inline' }} />
        Delete
      </Menu.Item>
    </Menu>
  );

  const Product_Headers = [
    {
      name: "Product",
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
      name: "Type",
      selector: (row: { type: any }) => (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-900">
          {row.type}
        </span>
      ),
      sortable: true,
    },
    {
      name: "Code",
      selector: (row: { code: any }) => (
        <span className="text-sm text-gray-900">{row.code}</span>
      ),
      sortable: true,
    },
    {
      name: "Expected Return",
      selector: (row: { expectedReturn: any }) => (
        <div className="flex items-center">
          <Target className="w-4 h-4 text-green-500 mr-1" />
          <span>{row.expectedReturn}%</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Min Investment",
      selector: (row: { minimumInvestment: any }) => (
        <div className="flex items-center">
        
          <span>{`SAR ${row.minimumInvestment.toLocaleString()}`}</span>
        </div>
      ),
      sortable: true,
    },
    {
      name: "Launch Date",
      selector: (row: { launchDate: any }) => (
        <div className="flex items-center">
          <Calendar className="w-4 h-4 text-gray-400 mr-1" />
          <span>{new Date(row.launchDate).toLocaleDateString()}</span>
        </div>
      ),
      sortable: true,
      width: "150px",
    },
    {
      name: "Status",
      cell: (row: any) => (
        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
          row.status === 0 ? 'bg-green-100 text-green-800' : // Active
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
      name: "Action",
      cell: (row: any) => (
        <Dropdown overlay={menu(row)} trigger={["click"]}>
          <Button type="primary" style={{ backgroundColor: "var(--foreground)" }}>
            Select <DownOutlined />
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
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-2 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Products & Rates Management</h1>
          <p className="text-gray-600">Manage investment products and their configurations</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
          style={{ borderRadius: '2px' }}
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Product
        </button>
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
              <h3 className="text-xl font-semibold text-gray-900">Create Product</h3>
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product type"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Expected Return (%)
                  </label>
                  <input
                    type="text"
                   
                    value={formData.expectedReturn}
                    onChange={(e) => setFormData({ ...formData, expectedReturn: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter expected return"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Minimum Investment
                  </label>
                  <input
                    type="text"
                    value={formData.minimumInvestment}
                    onChange={(e) => setFormData({ ...formData, minimumInvestment: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter minimum investment"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Category
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>Equity</option>
                    <option value={1}>Fixed Income</option>
                    <option value={2}>Real Estate</option>
                    <option value={3}>Commodities</option>
                    <option value={4}>Mutual Funds</option>
                    <option value={5}>Exchange Traded Funds</option>
                    <option value={6}>Cryptocurrencies</option>
                    <option value={7}>Alternative Investments</option>
                    <option value={8}>Cash and Cash Equivalents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status
                  </label>
                  <select
                    value={formData.productStatus}
                    onChange={(e) => setFormData({ ...formData, productStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>Active</option>
                    <option value={1}>Inactive</option>
                    <option value={2}>Closed</option>
                    <option value={3}>Suspended</option>
                    <option value={4}>Launching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Launch Date
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
                    Investment Duration (months)
                  </label>
                  <input
                    type="text"
                    value={formData.investmentDuration}
                    onChange={(e) => setFormData({ ...formData, investmentDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter investment duration"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment ID
                  </label>
                  <input
                    type="text"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter segment ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  placeholder="Enter product description"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  style={{ borderRadius: '2px' }}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Creating...
                    </div>
                  ) : (
                    'Create Product'
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
              <h3 className="text-xl font-semibold text-gray-900">Edit Product</h3>
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
                    Product Name
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Type
                  </label>
                  <input
                    type="text"
                    value={formData.type}
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product type"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Code
                  </label>
                  <input
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter product code"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Category
                  </label>
                  <select
                    value={formData.productCategory}
                    onChange={(e) => setFormData({ ...formData, productCategory: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>Equity</option>
                    <option value={1}>Fixed Income</option>
                    <option value={2}>Real Estate</option>
                    <option value={3}>Commodities</option>
                    <option value={4}>Mutual Funds</option>
                    <option value={5}>Exchange Traded Funds</option>
                    <option value={6}>Cryptocurrencies</option>
                    <option value={7}>Alternative Investments</option>
                    <option value={8}>Cash and Cash Equivalents</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Product Status
                  </label>
                  <select
                    value={formData.productStatus}
                    onChange={(e) => setFormData({ ...formData, productStatus: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    required
                  >
                    <option value={0}>Active</option>
                    <option value={1}>Inactive</option>
                    <option value={2}>Closed</option>
                    <option value={3}>Suspended</option>
                    <option value={4}>Launching</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Launch Date
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
                    Investment Duration (months)
                  </label>
                  <input
                    type="text"
                    value={formData.investmentDuration}
                    onChange={(e) => setFormData({ ...formData, investmentDuration: Number(e.target.value) })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter investment duration"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Segment ID
                  </label>
                  <input
                    type="text"
                    value={formData.segmentId}
                    onChange={(e) => setFormData({ ...formData, segmentId: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                    placeholder="Enter segment ID"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-black"
                  placeholder="Enter product description"
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
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={formLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-black rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
                >
                  {formLoading ? (
                    <div className="flex items-center">
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Updating...
                    </div>
                  ) : (
                    'Update Product'
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
              <h3 className="text-xl font-semibold text-gray-900">Product Details</h3>
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                  <p className="text-sm text-gray-900">{selectedProduct.id}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                  <p className="text-lg font-semibold text-gray-900">{selectedProduct.name}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                  <p className="text-sm text-gray-900">{selectedProduct.type}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Code</label>
                  <p className="text-sm text-gray-900">{selectedProduct.code}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Return</label>
                  <p className="text-sm text-gray-900">{selectedProduct.expectedReturn}%</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Investment</label>
                  <p className="text-sm text-gray-900">{selectedProduct.minimumInvestment.toLocaleString()}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Category</label>
                  <p className="text-sm text-gray-900">{getProductCategoryText(selectedProduct.productCategory)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Product Status</label>
                  <p className="text-sm text-gray-900">{getProductStatusText(selectedProduct.productStatus)}</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Launch Date</label>
                  <p className="text-sm text-gray-900">
                    {new Date(selectedProduct.launchDate).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Investment Duration</label>
                  <p className="text-sm text-gray-900">{selectedProduct.investmentDuration} months</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Segment ID</label>
                  <p className="text-sm text-gray-900">{selectedProduct.segmentId}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <p className="text-sm text-gray-900">{selectedProduct.description}</p>
              </div>
            </div>

            <div className="mt-6 flex justify-end">
              <button
                onClick={() => setShowViewModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Close
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
              <h3 className="text-xl font-semibold text-gray-900">Delete Product</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this product?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Package className="w-5 h-5 text-gray-700 mr-2" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Product:</span> {selectedProduct.name}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={formLoading}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {formLoading ? (
                  <div className="flex items-center">
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Deleting...
                  </div>
                ) : (
                  'Delete Product'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
