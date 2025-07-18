import React, { useState } from 'react';
import { X, Save, Eye, EyeOff, User, AlertCircle, CheckCircle } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useData } from '../../contexts/DataContext';
import { supabase } from '../../lib/supabase';
import { verifyPassword, validatePassword } from '../../utils/passwordUtils';
import { showNotification } from '../../utils/notification';

interface AccountSettingsProps {
  onClose: () => void;
}

const AccountSettings: React.FC<AccountSettingsProps> = ({ onClose }) => {
  const { user } = useAuth();
  const { updateUser, users, generateUsernameFromName } = useData();
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const [formData, setFormData] = useState({
    username: user?.username || '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [usernameAvailable, setUsernameAvailable] = useState<boolean | null>(null);

  const checkUsernameAvailability = (username: string) => {
    if (username === user?.username) {
      setUsernameAvailable(true);
      return;
    }
    
    const isAvailable = !users.some(u => u.username === username && u.id !== user?.id);
    setUsernameAvailable(isAvailable);
  };

  const handleUsernameChange = (username: string) => {
    setFormData(prev => ({ ...prev, username }));
    if (username.length >= 3) {
      checkUsernameAvailability(username);
    } else {
      setUsernameAvailable(null);
    }
  };

  const generateSuggestedUsername = () => {
    if (user?.name) {
      const suggested = generateUsernameFromName(user.name);
      setFormData(prev => ({ ...prev, username: suggested }));
      checkUsernameAvailability(suggested);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    setLoading(true);
    setMessage(null);

    try {
      // Get user's hashed password from database
      const { data: userData, error } = await supabase
        .from('users')
        .select('password')
        .eq('id', user.id)
        .single();

      if (error || !userData) {
        setMessage({ type: 'error', text: 'Failed to verify current password' });
        showNotification('Failed to verify current password', 'error');
        setLoading(false);
        return;
      }

      // Verify current password using bcrypt
      const isCurrentPasswordValid = await verifyPassword(formData.currentPassword, userData.password);
      if (!isCurrentPasswordValid) {
        setMessage({ type: 'error', text: 'Current password is incorrect' });
        showNotification('Current password is incorrect', 'error');
        setLoading(false);
        return;
      }

      // Validate new password if provided
      if (formData.newPassword) {
        const passwordValidation = validatePassword(formData.newPassword);
        if (!passwordValidation.isValid) {
          const errorMessage = passwordValidation.errors.join('. ');
          setMessage({ type: 'error', text: errorMessage });
          showNotification(errorMessage, 'error');
          setLoading(false);
          return;
        }

        if (formData.newPassword !== formData.confirmPassword) {
          setMessage({ type: 'error', text: 'New passwords do not match' });
          showNotification('New passwords do not match', 'error');
          setLoading(false);
          return;
        }
      }

      // Validate username
      if (formData.username !== user.username && !usernameAvailable) {
        setMessage({ type: 'error', text: 'Username is not available' });
        showNotification('Username is not available', 'error');
        setLoading(false);
        return;
      }

      // Update user data
      const updateData: any = {};
      
      if (formData.username !== user.username) {
        updateData.username = formData.username;
      }
      
      if (formData.newPassword) {
        updateData.password = formData.newPassword;
      }

      if (Object.keys(updateData).length > 0) {
        await updateUser(user.id, updateData);
        setMessage({ type: 'success', text: 'Account updated successfully!' });
        showNotification('Account updated successfully!', 'success');
        
        // Clear password fields
        setFormData(prev => ({
          ...prev,
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        }));

        // Close modal after 2 seconds
        setTimeout(() => {
          onClose();
        }, 2000);
      } else {
        setMessage({ type: 'error', text: 'No changes to save' });
        showNotification('No changes to save', 'error');
      }
    } catch (error) {
      console.error('Error updating account:', error);
      setMessage({ type: 'error', text: 'Failed to update account. Please try again.' });
      showNotification('Failed to update account. Please try again.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-full">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <h2 className="text-xl font-semibold text-gray-900">Account Settings</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4 sm:space-y-6">
          {/* User Info */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-medium text-gray-900 mb-2">Current Account</h3>
            <div className="space-y-1 text-sm text-gray-600">
              <div>Name: <span className="font-medium">{user?.name}</span></div>
              <div>Email: <span className="font-medium">{user?.email}</span></div>
              <div>Role: <span className="font-medium capitalize">{user?.role}</span></div>
              {user?.accessId && (
                <div>Access ID: <span className="font-medium">{user.accessId}</span></div>
              )}
            </div>
          </div>

          {message && (
            <div className={`p-3 rounded-lg flex items-center ${
              message.type === 'success' 
                ? 'bg-green-50 border border-green-200' 
                : 'bg-red-50 border border-red-200'
            }`}>
              {message.type === 'success' ? (
                <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
              ) : (
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
              )}
              <span className={`text-sm ${
                message.type === 'success' ? 'text-green-700' : 'text-red-700'
              }`}>
                {message.text}
              </span>
            </div>
          )}

          {/* Username */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="space-y-2">
              <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
                <input
                  type="text"
                  value={formData.username}
                  onChange={(e) => handleUsernameChange(e.target.value)}
                  className={`w-full sm:flex-1 px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    usernameAvailable === false ? 'border-red-300' : 
                    usernameAvailable === true ? 'border-green-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={generateSuggestedUsername}
                  className="w-full sm:w-auto px-3 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm"
                >
                  Suggest
                </button>
              </div>
              {usernameAvailable === false && (
                <p className="text-sm text-red-600">Username is already taken</p>
              )}
              {usernameAvailable === true && formData.username !== user?.username && (
                <p className="text-sm text-green-600">Username is available</p>
              )}
            </div>
          </div>

          {/* Current Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Current Password *
            </label>
            <div className="relative">
              <input
                type={showCurrentPassword ? 'text' : 'password'}
                value={formData.currentPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, currentPassword: e.target.value }))}
                required
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* New Password */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              New Password (optional)
            </label>
            <div className="relative">
              <input
                type={showNewPassword ? 'text' : 'password'}
                value={formData.newPassword}
                onChange={(e) => setFormData(prev => ({ ...prev, newPassword: e.target.value }))}
                className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Leave blank to keep current password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword(!showNewPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </div>
          </div>

          {/* Confirm New Password */}
          {formData.newPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Confirm New Password *
              </label>
              <div className="relative">
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                  required
                  className={`w-full px-3 py-2 pr-10 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                    formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword
                      ? 'border-red-300' : 'border-gray-300'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
              {formData.newPassword && (
                <div className="mt-2 text-xs text-gray-600">
                  <p className="font-medium">Password must contain:</p>
                  <ul className="list-disc list-inside ml-2 space-y-1">
                    <li>At least 6 characters</li>
                    <li>One uppercase letter (A-Z)</li>
                    <li>One number (0-9)</li>
                    <li>One special character (!@#$%^&* etc.)</li>
                  </ul>
                </div>
              )}
                  {showConfirmPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
              {formData.newPassword && formData.confirmPassword && formData.newPassword !== formData.confirmPassword && (
                <p className="text-sm text-red-600 mt-1">Passwords do not match</p>
              )}
            </div>
          )}

          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (formData.newPassword && formData.newPassword !== formData.confirmPassword) || (usernameAvailable === false)}
              className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors flex items-center justify-center"
            >
              {loading ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AccountSettings;