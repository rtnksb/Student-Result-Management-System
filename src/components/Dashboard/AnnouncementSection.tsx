import React, { useState } from 'react';
import { Plus, Megaphone, AlertCircle, Info, Clock, Edit, Trash2, X, Save } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';
import { Announcement } from '../../types';
import { showNotification } from '../../utils/notification';

const AnnouncementSection: React.FC = () => {
  const { announcements, addAnnouncement, updateAnnouncement, deleteAnnouncement } = useData();
  const { user } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    priority: 'medium' as 'low' | 'medium' | 'high'
  });

  const handleAddAnnouncement = () => {
    setFormData({ title: '', content: '', priority: 'medium' });
    setEditingAnnouncement(null);
    setShowAddForm(true);
  };

  const handleEditAnnouncement = (announcement: Announcement) => {
    setFormData({
      title: announcement.title,
      content: announcement.content,
      priority: announcement.priority
    });
    setEditingAnnouncement(announcement);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      if (editingAnnouncement) {
        await updateAnnouncement(editingAnnouncement.id, {
          title: formData.title,
          content: formData.content,
          priority: formData.priority
        });
        showNotification('Announcement updated successfully!', 'success');
      } else {
        await addAnnouncement({
          title: formData.title,
          content: formData.content,
          priority: formData.priority,
          createdBy: user.id,
          isActive: true
        });
        showNotification('Announcement created successfully!', 'success');
      }
      
      setShowAddForm(false);
      setEditingAnnouncement(null);
      setFormData({ title: '', content: '', priority: 'medium' });
    } catch (error) {
      console.error('Error saving announcement:', error);
      showNotification('Error saving announcement. Please try again.', 'error');
    }
  };

  const handleDeleteAnnouncement = async (announcement: Announcement) => {
    if (window.confirm(`Are you sure you want to delete "${announcement.title}"?`)) {
      try {
        await deleteAnnouncement(announcement.id);
        showNotification('Announcement deleted successfully!', 'success');
      } catch (error) {
        console.error('Error deleting announcement:', error);
        showNotification('Error deleting announcement.', 'error');
      }
    }
  };

  const getPriorityIcon = (priority: string) => {
    switch (priority) {
      case 'high':
        return <AlertCircle className="h-5 w-5 text-red-600" />;
      case 'medium':
        return <Info className="h-5 w-5 text-yellow-600" />;
      case 'low':
        return <Clock className="h-5 w-5 text-blue-600" />;
      default:
        return <Info className="h-5 w-5 text-gray-600" />;
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'border-l-red-500 bg-red-50';
      case 'medium':
        return 'border-l-yellow-500 bg-yellow-50';
      case 'low':
        return 'border-l-blue-500 bg-blue-50';
      default:
        return 'border-l-gray-500 bg-gray-50';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-2">
          <Megaphone className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold text-gray-900">Announcements</h3>
        </div>
        {user?.role === 'admin' && (
          <button
            onClick={handleAddAnnouncement}
            className="bg-blue-600 text-white px-3 py-1.5 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm"
          >
            <Plus className="h-4 w-4 mr-1" />
            Add
          </button>
        )}
      </div>

      {/* Announcements List */}
      <div className="space-y-3 max-h-64 overflow-y-auto">
        {announcements.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <Megaphone className="h-12 w-12 text-gray-300 mx-auto mb-2" />
            <p>No announcements yet</p>
            {user?.role === 'admin' && (
              <p className="text-sm">Create your first announcement to communicate with teachers</p>
            )}
          </div>
        ) : (
          announcements.map(announcement => (
            <div
              key={announcement.id}
              className={`border-l-4 p-3 rounded-r-lg ${getPriorityColor(announcement.priority)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {getPriorityIcon(announcement.priority)}
                    <h4 className="font-medium text-gray-900 text-sm">{announcement.title}</h4>
                  </div>
                  <p className="text-sm text-gray-700 mb-2 break-words">{announcement.content}</p>
                  <p className="text-xs text-gray-500">
                    {formatDate(announcement.createdAt)}
                  </p>
                </div>
                {user?.role === 'admin' && (
                  <div className="flex items-center space-x-1 ml-2">
                    <button
                      onClick={() => handleEditAnnouncement(announcement)}
                      className="text-blue-600 hover:text-blue-800 p-1"
                      title="Edit Announcement"
                    >
                      <Edit className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteAnnouncement(announcement)}
                      className="text-red-600 hover:text-red-800 p-1"
                      title="Delete Announcement"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Announcement Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="flex items-center justify-between p-6 border-b">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-100 rounded-full">
                  <Megaphone className="h-6 w-6 text-blue-600" />
                </div>
                <h2 className="text-xl font-semibold text-gray-900">
                  {editingAnnouncement ? 'Edit Announcement' : 'Add New Announcement'}
                </h2>
              </div>
              <button
                onClick={() => {
                  setShowAddForm(false);
                  setEditingAnnouncement(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Title *
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement title"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Priority *
                </label>
                <select
                  value={formData.priority}
                  onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.value as 'low' | 'medium' | 'high' }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="low">Low Priority</option>
                  <option value="medium">Medium Priority</option>
                  <option value="high">High Priority</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Content *
                </label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
                  required
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter announcement content"
                />
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingAnnouncement(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  <Save className="h-4 w-4 mr-2" />
                  {editingAnnouncement ? 'Update Announcement' : 'Create Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AnnouncementSection;