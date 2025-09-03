import { useState, useEffect } from 'react';
import { Plus, Eye, EyeOff, Clock, CheckCircle, XCircle, Users, Briefcase, DollarSign, Calendar, Edit, Trash2, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import { Task, Proof, Match } from '@/store/useStore';

export default function ProjectOwnerDashboard() {
  const { currentUser, tasks, proofs, matches, setTasks, setProofs, setMatches } = useStore();
  const [activeTab, setActiveTab] = useState('tasks');
  const [loading, setLoading] = useState(true);
  const [showCreateTask, setShowCreateTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [stats, setStats] = useState({
    totalTasks: 0,
    activeTasks: 0,
    totalApplications: 0,
    activeMatches: 0,
    completedProjects: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [tasksData, applicationsData, matchesData] = await Promise.all([
          apiService.getOwnerTasks(currentUser.id),
          apiService.getTaskApplications('all'),
          apiService.getMatches(currentUser.id)
        ]);
      
      setTasks(tasksData);
      setProofs(proofsData);
        setMatches(matchesData);
      
      // Calculate stats
      const totalTasks = tasksData.length;
      const activeTasks = tasksData.filter(t => t.status === 'open').length;
      const totalApplications = proofsData.length;
      const activeMatches = matchesData.filter(m => m.status === 'matched').length;
      const completedProjects = tasksData.filter(t => t.status === 'completed').length;
      
      setStats({
        totalTasks,
        activeTasks,
        totalApplications,
        activeMatches,
        completedProjects,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateTask = async (taskData: Partial<Task>) => {
    try {
      const newTask = await apiService.createTask(taskData);
      setTasks([...tasks, newTask]);
      setShowCreateTask(false);
      loadDashboardData(); // Refresh stats
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const handleAcceptApplication = async (proofId: string) => {
    try {
      await apiService.updateProofStatus(proofId, 'accepted');
      loadDashboardData();
    } catch (error) {
      console.error('Failed to accept application:', error);
    }
  };

  const handleRejectApplication = async (proofId: string) => {
    try {
      await apiService.updateProofStatus(proofId, 'rejected');
      loadDashboardData();
    } catch (error) {
      console.error('Failed to reject application:', error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-green-100 text-green-800';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const CreateTaskModal = () => {
    const [formData, setFormData] = useState({
      title: '',
      description: '',
      requiredSkills: '',
      budget: '',
      deadline: '',
      category: 'development'
    });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      handleCreateTask({
        ...formData,
        requiredSkills: formData.requiredSkills.split(',').map(s => s.trim()),
        budget: parseFloat(formData.budget),
        deadline: new Date(formData.deadline),
        ownerId: currentUser?.id || '',
        status: 'open',
        createdAt: new Date(),
      });
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Create New Task</h2>
          
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                required
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Required Skills (comma-separated)</label>
                <input
                  type="text"
                  value={formData.requiredSkills}
                  onChange={(e) => setFormData({ ...formData, requiredSkills: e.target.value })}
                  placeholder="React, TypeScript, Node.js"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="development">Development</option>
                  <option value="design">Design</option>
                  <option value="marketing">Marketing</option>
                  <option value="writing">Writing</option>
                  <option value="consulting">Consulting</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Budget ($)</label>
                <input
                  type="number"
                  value={formData.budget}
                  onChange={(e) => setFormData({ ...formData, budget: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline</label>
                <input
                  type="date"
                  value={formData.deadline}
                  onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  required
                />
              </div>
            </div>
            
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={() => setShowCreateTask(false)}
                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Create Task
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderTasksTab = () => (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold text-gray-900">My Tasks</h3>
        <button
          onClick={() => setShowCreateTask(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
        >
          <Plus className="h-4 w-4" />
          <span>Create Task</span>
        </button>
      </div>
      
      {tasks.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Briefcase className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Tasks Created</h3>
          <p className="text-gray-500 mb-4">Create your first task to start finding contributors</p>
          <button
            onClick={() => setShowCreateTask(true)}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Create Your First Task
          </button>
        </div>
      ) : (
        tasks.map((task) => (
          <div key={task.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">{task.title}</h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(task.status)}`}>
                    {task.status}
                  </span>
                </div>
                <p className="text-gray-600 mb-3">{task.description}</p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Budget: {formatCurrency(task.budget)}</span>
                  <span>•</span>
                  <span>Deadline: {new Date(task.deadline).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>Applications: {proofs.filter(p => p.taskId === task.id).length}</span>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <Edit className="h-4 w-4" />
                </button>
                <button className="p-2 text-gray-400 hover:text-red-600">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mb-4">
              {task.requiredSkills.map((skill, index) => (
                <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                  {skill}
                </span>
              ))}
            </div>
            
            <div className="flex justify-between items-center">
              <div className="text-sm text-gray-500">
                Created: {new Date(task.createdAt).toLocaleDateString()}
              </div>
              <button
                onClick={() => setSelectedTask(task)}
                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
              >
                View Applications ({proofs.filter(p => p.taskId === task.id).length})
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );

  const renderApplicationsTab = () => (
    <div className="space-y-4">
      {proofs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Users className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500">Applications will appear here when contributors apply to your tasks</p>
        </div>
      ) : (
        proofs.map((proof) => {
          const task = tasks.find(t => t.id === proof.taskId);
          return (
            <div key={proof.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Application for: {task?.title || 'Unknown Task'}
                    </h3>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                      {proof.status}
                    </span>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">
                    Contributor ID: {proof.contributorId} • Applied: {new Date(proof.createdAt).toLocaleDateString()}
                  </p>
                  <div className="text-sm text-gray-500">
                    Skills Proven: {proof.skillsProven.join(', ')}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm text-gray-500 mb-1">ZK Proof Hash</div>
                  <div className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                    {proof.zkProofHash}
                  </div>
                </div>
              </div>
              
              {proof.proofData && (
                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <h4 className="text-sm font-medium text-gray-900 mb-2">Proof Details</h4>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Experience:</span>
                      <div className="font-medium">{proof.proofData.experienceLevel}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Verifications:</span>
                      <div className="font-medium">{proof.proofData.skillVerifications?.length || 0}</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Portfolio:</span>
                      <div className="font-medium">{proof.proofData.portfolioCount || 0} items</div>
                    </div>
                    <div>
                      <span className="text-gray-500">Certifications:</span>
                      <div className="font-medium">{proof.proofData.certificationCount || 0}</div>
                    </div>
                  </div>
                  {proof.proofData.coverLetter && (
                    <div className="mt-3">
                      <span className="text-gray-500 text-sm">Cover Letter:</span>
                      <p className="text-sm text-gray-700 mt-1">{proof.proofData.coverLetter}</p>
                    </div>
                  )}
                </div>
              )}
              
              {proof.status === 'pending' && (
                <div className="flex justify-end space-x-3">
                  <button
                    onClick={() => handleRejectApplication(proof.id)}
                    className="px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
                  >
                    Reject
                  </button>
                  <button
                    onClick={() => handleAcceptApplication(proof.id)}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                  >
                    Accept & Create Match
                  </button>
                </div>
              )}
            </div>
          );
        })
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Project Owner Dashboard</h1>
          <p className="text-gray-600">
            Manage your tasks, review applications, and track project progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Briefcase className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalTasks}</div>
                <div className="text-sm text-gray-500">Total Tasks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.activeTasks}</div>
                <div className="text-sm text-gray-500">Active Tasks</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
                <div className="text-sm text-gray-500">Applications</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.activeMatches}</div>
                <div className="text-sm text-gray-500">Active Matches</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.completedProjects}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('tasks')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'tasks'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Tasks ({stats.totalTasks})
              </button>
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Applications ({stats.totalApplications})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'tasks' && renderTasksTab()}
            {activeTab === 'applications' && renderApplicationsTab()}
          </div>
        </div>
      </div>
      
      {showCreateTask && <CreateTaskModal />}
    </div>
  );
}