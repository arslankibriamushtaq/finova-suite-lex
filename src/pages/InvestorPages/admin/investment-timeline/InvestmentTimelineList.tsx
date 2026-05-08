import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Search, 
  Edit, 
  Trash2, 
  Eye, 
  X, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  Clock
} from 'lucide-react';
import {
  getAllInvestmentTimeline,
  createInvestmentTimeline,
  updateInvestmentTimeline,
  getInvestmentTimelineById,
  deleteInvestmentTimelineById,
  InvestmentTimeline,
  InvestmentTimelineCreateRequest,
  InvestmentTimelineUpdateRequest
} from '../../../../redux/apis/apisInvestor';
import toast from 'react-hot-toast';
import Loader from '../../../../components/Loader/Loader';

export default function InvestmentTimelineList() {
  const [investmentTimelines, setInvestmentTimelines] = useState<InvestmentTimeline[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedInvestmentTimeline, setSelectedInvestmentTimeline] = useState<InvestmentTimeline | null>(null);
  const [formData, setFormData] = useState<InvestmentTimelineCreateRequest>({
    timeline: ''
  });
  const [formLoading, setFormLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Fetch investment timelines
  const fetchInvestmentTimelines = async () => {
    try {
      setLoading(true);
      const response = await getAllInvestmentTimeline(currentPage, pageSize);
      if (response.success) {
        setInvestmentTimelines(response.data);
        setTotalPages(response.pageInfo.totalPages);
        setTotalCount(response.pageInfo.totalCount);
      } else {
        setError('Failed to fetch investment timelines');
      }
    } catch (err) {
      setError('Error fetching investment timelines');
   
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestmentTimelines();
  }, [currentPage]);

  // Handle create
  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setFormLoading(true);
      const response = await createInvestmentTimeline(formData);
      if (response.success) {
        toast.success('Investment timeline created successfully!');
        setShowCreateModal(false);
        setFormData({ timeline: '' });
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || 'Failed to create investment timeline');
      }
    } catch (err) {
      toast.error('Error creating investment timeline');
      console.error('Error creating investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle update
  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedInvestmentTimeline) return;
    
    try {
      setFormLoading(true);
      const updateData: InvestmentTimelineUpdateRequest = {
        id: selectedInvestmentTimeline.id,
        timeline: formData.timeline
      };
      
      const response = await updateInvestmentTimeline(updateData);
      if (response.success) {
        toast.success(response.notificationMessage || 'Investment timeline updated successfully!');
        setShowEditModal(false);
        setFormData({ timeline: '' });
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || 'Failed to update investment timeline');
      }
    } catch (err) {
      toast.error('Error updating investment timeline');
      console.error('Error updating investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async () => {
    if (!selectedInvestmentTimeline) return;
    try {
      setFormLoading(true);
      const response = await deleteInvestmentTimelineById(selectedInvestmentTimeline.id);
      if (response.success) {
        toast.success('Investment timeline deleted successfully!');
        setShowDeleteModal(false);
        fetchInvestmentTimelines();
      } else {
        toast.error(response.notificationMessage || 'Failed to delete investment timeline');
      }
    } catch (err) {
      toast.error('Error deleting investment timeline');
      console.error('Error deleting investment timeline:', err);
    } finally {
      setFormLoading(false);
    }
  };

  // Handle edit click
  const handleEditClick = async (id: string) => {
    try {
      const response = await getInvestmentTimelineById(id);
      if (response.success) {
        setSelectedInvestmentTimeline(response.data);
        setFormData({
          timeline: response.data.timeline
        });
        setShowEditModal(true);
      } else {
        toast.error('Failed to fetch investment timeline details');
      }
    } catch (err) {
      toast.error('Error fetching investment timeline details');
      console.error('Error fetching investment timeline details:', err);
    }
  };

  // Handle view click
  const handleViewClick = async (id: string) => {
    try {
      const response = await getInvestmentTimelineById(id);
      if (response.success) {
        setSelectedInvestmentTimeline(response.data);
        setShowViewModal(true);
      } else {
        toast.error('Failed to fetch investment timeline details');
      }
    } catch (err) {
      toast.error('Error fetching investment timeline details');
      console.error('Error fetching investment timeline details:', err);
    }
  };

  // Handle delete click
  const handleDeleteClick = (investmentTimeline: InvestmentTimeline) => {
    setSelectedInvestmentTimeline(investmentTimeline);
    setShowDeleteModal(true);
  };

  // Filter investment timelines based on search term
  const filteredInvestmentTimelines = investmentTimelines.filter(investmentTimeline =>
    investmentTimeline.timeline.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const renderPagination = () => {
    const pages = [];
    for (let i = 1; i <= totalPages; i++) {
      pages.push(
        <button
          key={i}
          onClick={() => handlePageChange(i)}
          className={`px-3 py-2 text-sm font-medium rounded-lg ${
            currentPage === i
              ? 'bg-black text-white'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    return pages;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader />
        <span className="ml-2 text-gray-600">Loading investment timelines...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-600">{error}</p>
        <button
          onClick={fetchInvestmentTimelines}
          className="mt-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Investment Timeline Management</h1>
          <p className="text-gray-600">Manage investment timeline periods</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Investment Timeline
        </button>
      </div>

      {/* Search and Stats */}
      <div className="flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              placeholder="Search by timeline..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent"
            />
          </div>
        </div>
        <div className="text-sm text-gray-600">
          Showing {filteredInvestmentTimelines.length} of {totalCount} investment timelines
        </div>
      </div>

      {/* Investment Timelines Table */}
      {!loading && (
        <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Timeline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Updated
                  </th>
                  <th className="relative px-6 py-3">
                    <span className="sr-only">Actions</span>
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvestmentTimelines.map((investmentTimeline) => (
                  <tr key={investmentTimeline.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <Clock className="w-5 h-5 text-gray-700 mr-3" />
                        <span className="text-sm font-medium text-gray-900">
                          {investmentTimeline.timeline}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(investmentTimeline.createdAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(investmentTimeline.updatedAt).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button 
                          onClick={() => handleViewClick(investmentTimeline.id)}
                          className="text-black hover:text-blue-900" 
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleEditClick(investmentTimeline.id)}
                          className="text-yellow-600 hover:text-yellow-900" 
                          title="Edit"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button 
                          onClick={() => handleDeleteClick(investmentTimeline)}
                          className="text-red-600 hover:text-red-900" 
                          title="Delete"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button
                  onClick={() => handlePageChange(currentPage - 1)}
                  disabled={currentPage === 1}
                  className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Previous
                </button>
                <button
                  onClick={() => handlePageChange(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing page <span className="font-medium">{currentPage}</span> of{' '}
                    <span className="font-medium">{totalPages}</span>
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                    <button
                      onClick={() => handlePageChange(currentPage - 1)}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronLeft className="h-5 w-5" />
                    </button>
                    {renderPagination()}
                    <button
                      onClick={() => handlePageChange(currentPage + 1)}
                      disabled={currentPage === totalPages}
                      className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Investment Timeline Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Create Investment Timeline</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Period
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder="Enter timeline period (e.g., 1-3 years, 5-10 years, Long-term)"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
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
                      Creating...
                    </div>
                  ) : (
                    'Create Investment Timeline'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Investment Timeline Modal */}
      {showEditModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Edit Investment Timeline</h3>
              <button
                onClick={() => setShowEditModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Timeline Period
                </label>
                <input
                  type="text"
                  value={formData.timeline}
                  onChange={(e) => setFormData({
                    ...formData,
                    timeline: e.target.value
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-gray-500 focus:border-transparent text-gray-900 font-medium"
                  placeholder="Enter timeline period (e.g., 1-3 years, 5-10 years, Long-term)"
                  required
                />
              </div>

              <div className="mt-6 flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
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
                    'Update Investment Timeline'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* View Investment Timeline Modal */}
      {showViewModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Investment Timeline Details</h3>
              <button
                onClick={() => setShowViewModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ID</label>
                <p className="text-sm text-gray-900">{selectedInvestmentTimeline.id}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Timeline Period</label>
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-700 mr-2" />
                  <p className="text-lg font-semibold text-gray-900">{selectedInvestmentTimeline.timeline}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Created At</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedInvestmentTimeline.createdAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Updated At</label>
                <p className="text-sm text-gray-900">
                  {new Date(selectedInvestmentTimeline.updatedAt).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                    second: '2-digit'
                  })}
                </p>
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
      {showDeleteModal && selectedInvestmentTimeline && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900">Delete Investment Timeline</h3>
              <button
                onClick={() => setShowDeleteModal(false)}
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="mb-6">
              <p className="text-gray-600 mb-4">
                Are you sure you want to delete this investment timeline?
              </p>
              <div className="bg-gray-50 p-4 rounded-lg">
                <div className="flex items-center">
                  <Clock className="w-5 h-5 text-gray-700 mr-2" />
                  <p className="text-sm text-gray-700">
                    <span className="font-medium">Timeline:</span> {selectedInvestmentTimeline.timeline}
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
                  'Delete Investment Timeline'
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
