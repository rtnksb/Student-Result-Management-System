import React, { useState, useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  PieChart, Pie, Cell, LineChart, Line, Area, AreaChart
} from 'recharts';
import { 
  TrendingUp, TrendingDown, Users, BookOpen, Trophy, Target,
  Filter, Download, RefreshCw
} from 'lucide-react';
import { useData } from '../../contexts/DataContext';
import { useAuth } from '../../contexts/AuthContext';


const Analytics: React.FC = () => {
  const { students, subjects, grades, classes } = useData();
  const { user, canAccessClass } = useAuth();
  const [selectedAcademicYear, setSelectedAcademicYear] = useState('2024-25');
  const [selectedClass, setSelectedClass] = useState('all');
  const [selectedTimeframe, setSelectedTimeframe] = useState('current');

  // Filter data based on user permissions
  const accessibleStudents = user?.role === 'admin' 
    ? students 
    : students.filter(student => canAccessClass(student.class));

  const accessibleClasses = user?.role === 'admin' 
    ? classes
    : classes.filter(cls => user?.assignedClasses?.includes(cls.id));

  // Filter grades based on selected filters
  const filteredGrades = useMemo(() => {
    return grades.filter(grade => {
      const student = students.find(s => s.id === grade.studentId);
      if (!student) return false;
      
      const matchesYear = grade.academicYear === selectedAcademicYear;
      const matchesClass = selectedClass === 'all' || student.class === selectedClass;
      const hasAccess = user?.role === 'admin' || canAccessClass(student.class);
      
      return matchesYear && matchesClass && hasAccess;
    });
  }, [grades, students, selectedAcademicYear, selectedClass, user?.role, canAccessClass]);

  // Calculate key metrics
  const totalStudents = accessibleStudents.filter(s => 
    selectedClass === 'all' || s.class === selectedClass
  ).length;

  const totalSubjects = subjects.length;
  const totalGrades = filteredGrades.length;
  const averageMarks = filteredGrades.length > 0 
    ? filteredGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / filteredGrades.length 
    : 0;

  // Show all classes, even if no students/grades
  const allClasses = classes; // Use all classes from context

  // Performance by class
  const classPerformanceData = useMemo(() => {
    return allClasses.map(cls => {
      const classStudents = accessibleStudents.filter(s => s.class === cls.id);
      const classGrades = filteredGrades.filter(grade => {
        const student = students.find(s => s.id === grade.studentId);
        return student && student.class === cls.id;
      });
      
      const avgScore = classGrades.length > 0 
        ? classGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / classGrades.length 
        : 0;
      
      const passCount = classGrades.filter(grade => {
        const subject = subjects.find(s => s.id === grade.subjectId);
        return subject && grade.marksObtained >= subject.passingMarks;
      }).length;
      
      const passRate = classGrades.length > 0 ? (passCount / classGrades.length) * 100 : 0;
      
      return {
        class: cls.name,
        students: classStudents.length,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        totalGrades: classGrades.length
      };
    });
  }, [allClasses, accessibleStudents, filteredGrades, students, subjects]);

  // Subject performance
  const subjectPerformanceData = useMemo(() => {
    return subjects.map(subject => {
      const subjectGrades = filteredGrades.filter(grade => grade.subjectId === subject.id);
      const avgScore = subjectGrades.length > 0 
        ? subjectGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / subjectGrades.length 
        : 0;
      
      const passCount = subjectGrades.filter(grade => grade.marksObtained >= subject.passingMarks).length;
      const passRate = subjectGrades.length > 0 ? (passCount / subjectGrades.length) * 100 : 0;
      
      return {
        subject: subject.name,
        avgScore: Math.round(avgScore * 10) / 10,
        passRate: Math.round(passRate * 10) / 10,
        totalStudents: subjectGrades.length,
        maxMarks: subject.maxMarks
      };
    }).filter(data => data.totalStudents > 0);
  }, [subjects, filteredGrades]);

  // Grade distribution
  const gradeDistributionData = useMemo(() => {
    const distribution = { 'A+': 0, 'A': 0, 'B': 0, 'C': 0, 'D': 0, 'E': 0, 'F': 0 };
    
    filteredGrades.forEach(grade => {
      const subject = subjects.find(s => s.id === grade.subjectId);
      if (subject) {
        const percentage = (grade.marksObtained / subject.maxMarks) * 100;
        const gradeText = percentage >= 90 ? 'A+' :
                         percentage >= 80 ? 'A' :
                         percentage >= 70 ? 'B' :
                         percentage >= 60 ? 'C' :
                         percentage >= 50 ? 'D' :
                         percentage >= 40 ? 'E' : 'F';
        distribution[gradeText]++;
      }
    });
    
    return Object.entries(distribution).map(([grade, count]) => ({
      grade,
      count,
      percentage: filteredGrades.length > 0 ? Math.round((count / filteredGrades.length) * 100) : 0
    }));
  }, [filteredGrades, subjects]);

  // Exam type performance
  const examTypeData = useMemo(() => {
    const types = ['assignment', 'half-yearly', 'final'];
    return types.map(type => {
      const typeGrades = filteredGrades.filter(grade => grade.examType === type);
      const avgScore = typeGrades.length > 0 
        ? typeGrades.reduce((sum, grade) => sum + grade.marksObtained, 0) / typeGrades.length 
        : 0;
      
      return {
        type: type.charAt(0).toUpperCase() + type.slice(1).replace('-', ' '),
        avgScore: Math.round(avgScore * 10) / 10,
        count: typeGrades.length
      };
    }).filter(data => data.count > 0);
  }, [filteredGrades]);

  // Colors for charts
  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D', '#FFC658'];

  const StatCard = ({ title, value, icon: Icon, trend, color }: any) => (
    <div className={`bg-white rounded-lg shadow p-4 sm:p-6 ${color}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-600">{title}</p>
          <p className="text-xl sm:text-2xl font-bold text-gray-900">{value}</p>
          {trend && (
            <div className={`flex items-center mt-1 ${trend > 0 ? 'text-green-600' : 'text-red-600'}`}>
              {trend > 0 ? <TrendingUp className="h-4 w-4 mr-1" /> : <TrendingDown className="h-4 w-4 mr-1" />}
              <span className="text-sm">{Math.abs(trend)}%</span>
            </div>
          )}
        </div>
        <div className={`p-3 rounded-full ${color.replace('bg-', 'bg-').replace('-50', '-100')}`}>
          <Icon className="h-6 w-6 text-blue-600" />
        </div>
      </div>
    </div>
  );

  // Overall pass rate
  const overallPassCount = filteredGrades.filter(grade => {
    const subject = subjects.find(s => s.id === grade.subjectId);
    return subject && grade.marksObtained >= subject.passingMarks;
  }).length;
  const overallPassRate = filteredGrades.length > 0 ? (overallPassCount / filteredGrades.length) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* School Logo and Header */}
      <div className="flex flex-col sm:flex-row items-center justify-between space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">Analytics Dashboard</h2>
            <p className="text-gray-600">Comprehensive insights into academic performance</p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center text-sm">
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </button>
          <button className="bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 transition-colors flex items-center text-sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </button>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <div className="flex items-center space-x-2 mb-4">
          <Filter className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-medium text-gray-900">Filters</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Academic Year</label>
            <select
              value={selectedAcademicYear}
              onChange={(e) => setSelectedAcademicYear(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="2024-25">2024-25</option>
              <option value="2023-24">2023-24</option>
              <option value="2022-23">2022-23</option>
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Class</label>
            <select
              value={selectedClass}
              onChange={(e) => setSelectedClass(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Classes</option>
              {accessibleClasses.map(cls => (
                <option key={cls.id} value={cls.id}>{cls.name}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Timeframe</label>
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="current">Current Term</option>
              <option value="semester">Full Semester</option>
              <option value="year">Full Year</option>
            </select>
          </div>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
        <StatCard
          title="Total Students"
          value={totalStudents}
          icon={Users}
          trend={5.2}
          color="bg-blue-50"
        />
        <StatCard
          title="Total Subjects"
          value={totalSubjects}
          icon={BookOpen}
          color="bg-green-50"
        />
        <StatCard
          title="Grades Recorded"
          value={totalGrades}
          icon={Trophy}
          trend={12.3}
          color="bg-purple-50"
        />
        <StatCard
          title="Average Score"
          value={`${averageMarks.toFixed(1)}%`}
          icon={Target}
          trend={-2.1}
          color="bg-orange-50"
        />
        <StatCard
          title="Overall Pass Rate"
          value={`${overallPassRate.toFixed(1)}%`}
          icon={TrendingUp}
          color="bg-teal-50"
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Class Performance */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Class</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={classPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="class" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Bar dataKey="avgScore" fill="#3B82F6" name="Avg Score" />
                <Bar dataKey="passRate" fill="#10B981" name="Pass Rate %" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Subject Performance */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Subject</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={subjectPerformanceData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="subject" 
                  fontSize={12}
                  angle={-45}
                  textAnchor="end"
                  height={60}
                />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Area 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#8884D8" 
                  fill="#8884D8" 
                  fillOpacity={0.6}
                  name="Avg Score"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Grade Distribution */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Grade Distribution</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={gradeDistributionData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ grade, percentage }) => `${grade}: ${percentage}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="count"
                >
                  {gradeDistributionData.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Exam Type Performance */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Performance by Exam Type</h3>
          <div className="h-64 sm:h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={examTypeData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="type" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="avgScore" 
                  stroke="#F59E0B" 
                  strokeWidth={3}
                  name="Avg Score"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Detailed Tables */}
      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        {/* Class Performance Table */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Class Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Class</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Students</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Avg Score</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {classPerformanceData.map((data, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-3 font-medium">{data.class}</td>
                    <td className="py-2 px-3">{data.students}</td>
                    <td className="py-2 px-3">{data.avgScore}%</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        data.passRate >= 80 ? 'bg-green-100 text-green-800' :
                        data.passRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Subject Performance Table */}
        <div className="bg-white rounded-lg shadow p-4 sm:p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Subject Performance Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Subject</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Students</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Avg Score</th>
                  <th className="text-left py-2 px-3 font-medium text-gray-700">Pass Rate</th>
                </tr>
              </thead>
              <tbody>
                {subjectPerformanceData.map((data, index) => (
                  <tr key={index} className="border-t">
                    <td className="py-2 px-3 font-medium">{data.subject}</td>
                    <td className="py-2 px-3">{data.totalStudents}</td>
                    <td className="py-2 px-3">{data.avgScore}%</td>
                    <td className="py-2 px-3">
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        data.passRate >= 80 ? 'bg-green-100 text-green-800' :
                        data.passRate >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {data.passRate}%
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Insights */}
      <div className="bg-white rounded-lg shadow p-4 sm:p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Key Insights</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-medium text-blue-900 mb-2">Top Performing Class</h4>
            <p className="text-blue-700 text-sm">
              {classPerformanceData.length > 0 && 
                classPerformanceData.reduce((prev, current) => 
                  prev.avgScore > current.avgScore ? prev : current
                ).class
              } with {classPerformanceData.length > 0 && 
                Math.max(...classPerformanceData.map(d => d.avgScore))
              }% average
            </p>
          </div>
          
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-medium text-green-900 mb-2">Best Subject</h4>
            <p className="text-green-700 text-sm">
              {subjectPerformanceData.length > 0 && 
                subjectPerformanceData.reduce((prev, current) => 
                  prev.avgScore > current.avgScore ? prev : current
                ).subject
              } with highest average score
            </p>
          </div>
          
          <div className="bg-purple-50 rounded-lg p-4">
            <h4 className="font-medium text-purple-900 mb-2">Overall Trend</h4>
            <p className="text-purple-700 text-sm">
              {averageMarks >= 75 ? 'Excellent' : averageMarks >= 60 ? 'Good' : 'Needs Improvement'} performance 
              across all subjects
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;