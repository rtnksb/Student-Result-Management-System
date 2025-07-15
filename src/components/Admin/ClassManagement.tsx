import React, { useState } from 'react';
import { Users, UserCheck, Settings } from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { showNotification } from '../../utils/notification';

const ClassManagement: React.FC = () => {
  const { classes, users, students, updateClass } = useData();
  const teachers = users.filter(user => user.role === 'teacher');

  const handleAssignTeacher = async (classId: string, teacherId: string) => {
    try {
      // Remove teacher from other classes first
      const updatePromises = classes
        .filter(cls => cls.assignedTeacher === teacherId && cls.id !== classId)
        .map(cls => updateClass(cls.id, { assignedTeacher: undefined }));
      
      await Promise.all(updatePromises);

      // Assign teacher to new class
      await updateClass(classId, { assignedTeacher: teacherId || undefined });
    } catch (error) {
      console.error('Error assigning teacher:', error);
      showNotification('Error assigning teacher.', 'error');
    }
  };

  const getTeacherName = (teacherId?: string) => {
    if (!teacherId) return 'No teacher assigned';
    const teacher = teachers.find(t => t.id === teacherId);
    return teacher ? teacher.name : 'Unknown teacher';
  };

  const getStudentCount = (classId: string) => {
    return students.filter(student => student.class === classId).length;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Class Management</h2>
        <div className="flex items-center space-x-2 text-sm text-gray-600">
          <Settings className="h-4 w-4" />
          <span>Manage class assignments and teachers</span>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {classes.map(classInfo => (
          <div key={classInfo.id} className="bg-white rounded-lg shadow hover:shadow-md transition-shadow p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                  <Users className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{classInfo.name}</h3>
                  <p className="text-sm text-gray-600">
                    Sections: {classInfo.sections.join(', ')}
                  </p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Students:</span>
                <span className="text-sm font-medium text-gray-900">
                  {getStudentCount(classInfo.id)}
                </span>
              </div>
              
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Assigned Teacher:</span>
                <div className="flex items-center space-x-1">
                  {classInfo.assignedTeacher ? (
                    <UserCheck className="h-4 w-4 text-green-600" />
                  ) : (
                    <Users className="h-4 w-4 text-gray-400" />
                  )}
                  <span className={`text-sm font-medium ${
                    classInfo.assignedTeacher ? 'text-green-700' : 'text-gray-500'
                  }`}>
                    {getTeacherName(classInfo.assignedTeacher)}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Assign Teacher
              </label>
              <select
                value={classInfo.assignedTeacher || ''}
                onChange={(e) => handleAssignTeacher(classInfo.id, e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">No teacher assigned</option>
                {teachers.map(teacher => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.name} ({teacher.accessId})
                  </option>
                ))}
              </select>
            </div>

            {classInfo.assignedTeacher && (
              <div className="mt-3 p-3 bg-green-50 rounded-lg">
                <div className="text-sm text-green-800">
                  <strong>Teacher Access:</strong>
                  <div className="mt-1">
                    {(() => {
                      const teacher = teachers.find(t => t.id === classInfo.assignedTeacher);
                      return teacher ? (
                        <div className="space-y-1">
                          <div>Username: <span className="font-mono">{teacher.username}</span></div>
                          <div>Access ID: <span className="font-mono">{teacher.accessId}</span></div>
                        </div>
                      ) : null;
                    })()}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Summary */}
      <div className="bg-white rounded-lg shadow p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Assignment Summary</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-blue-600">{classes.length}</div>
            <div className="text-sm text-gray-600">Total Classes</div>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-green-600">
              {classes.filter(c => c.assignedTeacher).length}
            </div>
            <div className="text-sm text-gray-600">Classes with Teachers</div>
          </div>
          
          <div className="bg-orange-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-orange-600">
              {classes.filter(c => !c.assignedTeacher).length}
            </div>
            <div className="text-sm text-gray-600">Unassigned Classes</div>
          </div>

          <div className="bg-purple-50 rounded-lg p-4">
            <div className="text-2xl font-bold text-purple-600">
              {students.length}
            </div>
            <div className="text-sm text-gray-600">Total Students</div>
          </div>
        </div>

        {classes.filter(c => !c.assignedTeacher).length > 0 && (
          <div className="mt-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
            <h4 className="font-medium text-amber-900 mb-2">Unassigned Classes:</h4>
            <div className="text-sm text-amber-800">
              {classes
                .filter(c => !c.assignedTeacher)
                .map(c => c.name)
                .join(', ')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ClassManagement;