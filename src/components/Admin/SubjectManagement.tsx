import React, { useState } from 'react';
import { Plus, Search, Edit, Trash2, BookOpen } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { Subject } from '../../types';

const SubjectManagement: React.FC = () => {
  const { subjects, classes, addSubject, updateSubject, deleteSubject } = useData();
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingSubject, setEditingSubject] = useState<Subject | null>(null);

  const filteredSubjects = subjects.filter(subject =>
    subject.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    subject.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    maxMarks: 100,
    passingMarks: 40,
    classes: [] as string[]
  });

  const handleAddSubject = () => {
    setFormData({
      name: '',
      code: '',
      maxMarks: 100,
      passingMarks: 40,
      classes: []
    });
    setShowAddForm(true);
    setEditingSubject(null);
  };

  const handleEditSubject = (subject: Subject) => {
    setEditingSubject(subject);
    setFormData({
      name: subject.name,
      code: subject.code,
      maxMarks: subject.maxMarks,
      passingMarks: subject.passingMarks,
      classes: subject.classes
    });
    setShowAddForm(true);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (editingSubject) {
      updateSubject(editingSubject.id, formData);
    } else {
      addSubject(formData);
    }
    
    setShowAddForm(false);
    setEditingSubject(null);
  };

  const handleDeleteSubject = (subject: Subject) => {
    if (window.confirm(`Are you sure you want to delete ${subject.name}? This will also remove all related grades.`)) {
      deleteSubject(subject.id);
    }
  };

  const getClassNames = (classIds: string[]) => {
    return classIds.map(classId => {
      const classInfo = classes.find(c => c.id === classId);
      return classInfo ? classInfo.name : classId;
    }).join(', ');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Subject Management</h2>
        <button
          onClick={handleAddSubject}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center"
        >
          <Plus className="h-5 w-5 mr-2" />
          Add Subject
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search subjects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>

      {/* Subjects List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6 border-b">
          <h3 className="text-lg font-medium text-gray-900">Subjects ({filteredSubjects.length})</h3>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Subject</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Code</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Max Marks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Passing Marks</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Classes</th>
                <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredSubjects.map(subject => (
                <tr key={subject.id} className="border-t hover:bg-gray-50">
                  <td className="py-3 px-4">
                    <div className="flex items-center">
                      <BookOpen className="h-5 w-5 text-blue-600 mr-3" />
                      <span className="font-medium text-gray-900">{subject.name}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <span className="font-mono text-sm bg-gray-100 text-gray-800 px-2 py-1 rounded">
                      {subject.code}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-gray-600">{subject.maxMarks}</td>
                  <td className="py-3 px-4 text-gray-600">{subject.passingMarks}</td>
                  <td className="py-3 px-4">
                    <span className="text-sm text-gray-600">
                      {getClassNames(subject.classes)}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex space-x-2">
                      <button
                        onClick={() => handleEditSubject(subject)}
                        className="text-blue-600 hover:text-blue-800"
                      >
                        <Edit className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDeleteSubject(subject)}
                        className="text-red-600 hover:text-red-800"
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

        {filteredSubjects.length === 0 && (
          <div className="text-center py-12">
            <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No subjects found</h3>
            <p className="text-gray-600">Add your first subject to get started.</p>
          </div>
        )}
      </div>

      {/* Add/Edit Subject Modal */}
      {showAddForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-start sm:items-center justify-center p-2 sm:p-4 z-50 overflow-y-auto">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full my-4 sm:my-0 max-h-[calc(100vh-2rem)] overflow-y-auto">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingSubject ? 'Edit Subject' : 'Add New Subject'}
              </h3>
            </div>

            <form onSubmit={handleSubmit} className="p-4 sm:p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Subject Code *</label>
                <input
                  type="text"
                  value={formData.code}
                  onChange={(e) => setFormData(prev => ({ ...prev, code: e.target.value.toUpperCase() }))}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max Marks *</label>
                  <input
                    type="number"
                    value={formData.maxMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxMarks: parseInt(e.target.value) }))}
                    required
                    min="1"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Passing Marks *</label>
                  <input
                    type="number"
                    value={formData.passingMarks}
                    onChange={(e) => setFormData(prev => ({ ...prev, passingMarks: parseInt(e.target.value) }))}
                    required
                    min="1"
                    max={formData.maxMarks}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Taught in Classes</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 max-h-32 overflow-y-auto border rounded-lg p-2">
                  {classes.map(cls => (
                    <label key={cls.id} className="flex items-center">
                      <input
                        type="checkbox"
                        checked={formData.classes.includes(cls.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setFormData(prev => ({
                              ...prev,
                              classes: [...prev.classes, cls.id]
                            }));
                          } else {
                            setFormData(prev => ({
                              ...prev,
                              classes: prev.classes.filter(id => id !== cls.id)
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
                    setEditingSubject(null);
                  }}
                  className="w-full sm:w-auto px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  {editingSubject ? 'Update Subject' : 'Add Subject'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SubjectManagement;