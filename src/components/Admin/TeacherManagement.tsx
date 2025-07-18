import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, Eye, EyeOff, Copy, UserPlus, Mail } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { User } from '../../types';
import { sendTeacherCredentials } from '../../utils/emailService';
import { showNotification } from '../../utils/notification';

const TeacherManagement: React.FC = () => {
  const { users, classes, addUser, updateUser, deleteUser, generateTeacherCredentials, generateUsernameFromName } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingTeacher, setEditingTeacher] = useState<User | null>(null);
  const [showPasswords, setShowPasswords] = useState<{ [key: string]: boolean }>({});
  const [generatedCredentials, setGeneratedCredentials] = useState<{ username: string; password: string; accessId: string } | null>(null);
  const [emailSending, setEmailSending] = useState<{ [key: string]: boolean }>({});

  const teachers = users.filter(user => user.role === 'teacher');
  const filteredTeachers = teachers.filter(teacher =>
    teacher.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    teacher.accessId?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    assignedClasses: [] as string[]
  });

  const handleAddTeacher = () => {
    const { username, password, accessId } = generateTeacherCredentials();
    setGeneratedCredentials({ username, password, accessId });
    setFormData({
      name: '',
      email: '',
      assignedClasses: []
    });
    setShowAddForm(true);
    setEditingTeacher(null);
  };

  // Update username when name changes for new teachers
  const handleNameChange = (name: string) => {
    setFormData(prev => ({ ...prev, name }));
    
    if (!editingTeacher && generatedCredentials) {
      const username = generateUsernameFromName(name);
      setGeneratedCredentials(prev => prev ? { ...prev, username } : null);
    }
  };

  const handleEditTeacher = (teacher: User) => {
    setEditingTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      assignedClasses: teacher.assignedClasses || []
    });
    setGeneratedCredentials(null);
    setShowAddForm(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (editingTeacher) {
        // Update existing teacher
        await updateUser(editingTeacher.id, {
          name: formData.name,
          email: formData.email,
          assignedClasses: formData.assignedClasses
        });
      } else {
        // Add new teacher
        if (!generatedCredentials) return;
        
        await addUser({
          username: generatedCredentials.username,
          password: generatedCredentials.password,
          role: 'teacher',
          name: formData.name,
          email: formData.email,
          assignedClasses: formData.assignedClasses,
          accessId: generatedCredentials.accessId
        });

        // Send email with credentials
        if (formData.email) {
          setEmailSending(prev => ({ ...prev, [generatedCredentials.username]: true }));
          
          try {
            await sendTeacherCredentials({
              username: generatedCredentials.username,
              password: generatedCredentials.password,
              accessId: generatedCredentials.accessId,
              teacherName: formData.name,
              teacherEmail: formData.email
            });
          } catch (emailError) {
            console.error('Error sending email:', emailError);
          } finally {
            setEmailSending(prev => ({ ...prev, [generatedCredentials.username]: false }));
          }
        }
      }
      
      setShowAddForm(false);
      setEditingTeacher(null);
      setGeneratedCredentials(null);
    } catch (error) {
      console.error('Error saving teacher:', error);
      alert('Error saving teacher. Please try again.');
    }
  };

  const handleDeleteTeacher = async (teacher: User) => {
    if (window.confirm(`Are you sure you want to delete ${teacher.name}? This will remove their access and unassign them from all classes.`)) {
      try {
        await deleteUser(teacher.id);
        showNotification('Teacher removed successfully.', 'success');
      } catch (error) {
        console.error('Error deleting teacher:', error);
        showNotification('Error removing teacher.', 'error');
      }
    }
  };

  const handleSendCredentials = async (teacher: User) => {
    if (!teacher.email) {
      alert('Teacher email is not available.');
      return;
    }

    setEmailSending(prev => ({ ...prev, [teacher.id]: true }));
    
    try {
      await sendTeacherCredentials({
        username: teacher.username,
        password: teacher.password,
        accessId: teacher.accessId || '',
        teacherName: teacher.name,
        teacherEmail: teacher.email
      });
    } catch (error) {
      console.error('Error sending email:', error);
      alert('Error sending email. Please try again.');
    } finally {
      setEmailSending(prev => ({ ...prev, [teacher.id]: false }));
    }
  };

  const togglePasswordVisibility = (teacherId: string) => {
    setShowPasswords(prev => ({
      ...prev,
      [teacherId]: !prev[teacherId]
    }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showNotification('Copied to clipboard!', 'success');
    }).catch(() => {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      showNotification('Copied to clipboard!', 'success');
    });
  };

  const getAssignedClassNames = (assignedClasses: string[] = []) => {
    return assignedClasses.map(classId => {
      const classInfo = classes.find(c => c.id === classId);
      return classInfo ? classInfo.name : classId;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Teacher Management</h2>
        <button
          onClick={handleAddTeacher}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Teacher
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search teachers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Teachers List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Teachers ({filteredTeachers.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Teacher</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Access ID</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Username</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Password</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Assigned Classes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredTeachers.map(teacher => (
                <tr key={teacher.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div>
                      <div className="font-medium text-gray-900">{teacher.name}</div>
                      <div className="text-sm text-gray-600">{teacher.email}</div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                        {teacher.accessId}
                      </span>
                      <button
                        onClick={() => copyToClipboard(teacher.accessId || '')}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy Access ID"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">{teacher.username}</span>
                      <button
                        onClick={() => copyToClipboard(teacher.username)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy Username"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {showPasswords[teacher.id] ? teacher.password : '••••••••'}
                      </span>
                      <button
                        onClick={() => togglePasswordVisibility(teacher.id)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        {showPasswords[teacher.id] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                      <button
                        onClick={() => copyToClipboard(teacher.password)}
                        className="text-gray-400 hover:text-gray-600"
                        title="Copy Password"
                      >
                        <Copy className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {getAssignedClassNames(teacher.assignedClasses) || 'No classes assigned'}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditTeacher(teacher)}
                        className="text-blue-600 hover:text-blue-800"
                        title="Edit Teacher"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleSendCredentials(teacher)}
                        disabled={emailSending[teacher.id] || !teacher.email}
                        className="text-green-600 hover:text-green-800 disabled:text-gray-400 disabled:cursor-not-allowed"
                        title="Send Credentials via Email"
                      >
                        {emailSending[teacher.id] ? (
                          <div className="w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                        ) : (
                          <Mail className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleDeleteTeacher(teacher)}
                        className="text-red-600 hover:text-red-800"
                        title="Delete Teacher"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTeachers.length === 0 && (
          <div className="text-center py-12">
            <UserPlus className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No teachers found</h3>
            <p className="text-gray-600">Add your first teacher to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Teacher Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingTeacher ? 'Edit Teacher' : 'Add New Teacher'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              {generatedCredentials && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <h4 className="font-medium text-green-900 mb-2">Generated Credentials</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Access ID:</span>
                      <span className="font-mono">{generatedCredentials.accessId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Username:</span>
                      <span className="font-mono">{generatedCredentials.username}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Password:</span>
                      <span className="font-mono">{generatedCredentials.password}</span>
                    </div>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded text-xs text-blue-800">
                    <Mail className="h-4 w-4 inline mr-1" />
                    Credentials will be automatically emailed to the teacher after creation.
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleNameChange(e.target.value)}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Login credentials will be sent to this email address
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Assigned Classes</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.assignedClasses.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              assignedClasses: [...prev.assignedClasses, cls.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              assignedClasses: prev.assignedClasses.filter(id => id !== cls.id)
                            }));
                          }
                        }}
                        className="mr-2"
                      />
                      <span className="text-sm">{cls.name}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowAddForm(false);
                    setEditingTeacher(null);
                    setGeneratedCredentials(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
                >
                  {editingTeacher ? 'Update Teacher' : (
                    <>
                      <Mail className="h-4 w-4 mr-2" />
                      Add & Email Credentials
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeacherManagement;