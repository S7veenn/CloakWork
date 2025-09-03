import { useState, useEffect } from 'react';
import { Eye, EyeOff, Clock, CheckCircle, XCircle, MessageSquare, Star, Shield, Zap, Calendar, DollarSign } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import { Proof, Match } from '@/store/useStore';

export default function ContributorDashboard() {
  const { currentUser, proofs, matches, setProofs, setMatches } = useStore();
  const [activeTab, setActiveTab] = useState('applications');
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    activeMatches: 0,
    totalEarnings: 0,
  });

  useEffect(() => {
    loadDashboardData();
  }, [currentUser]);

  const loadDashboardData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const [proofsData, matchesData] = await Promise.all([
        apiService.getUserProofs(currentUser.id),
        apiService.getMatches(currentUser.id)
      ]);
      
      setProofs(proofsData);
      setMatches(matchesData);
      
      // Calculate stats
      const totalApplications = proofsData.length;
      const pendingApplications = proofsData.filter(p => p.status === 'pending').length;
      const acceptedApplications = proofsData.filter(p => p.status === 'accepted').length;
      const activeMatches = matchesData.filter(m => m.status === 'matched').length;
      const totalEarnings = matchesData
        .filter(m => m.status === 'completed')
        .reduce((sum, m) => sum + (m.taskBudget || 0), 0);
      
      setStats({
        totalApplications,
        pendingApplications,
        acceptedApplications,
        activeMatches,
        totalEarnings,
      });
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'accepted':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'rejected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'accepted':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-purple-100 text-purple-800';
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

  const renderApplicationsTab = () => (
    <div className="space-y-4">
      {proofs.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Shield className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Applications Yet</h3>
          <p className="text-gray-500 mb-4">Start browsing tasks and apply with your ZK proofs</p>
          <button className="text-indigo-600 hover:text-indigo-700 font-medium">
            Browse Tasks
          </button>
        </div>
      ) : (
        proofs.map((proof) => (
          <div key={proof.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  {getStatusIcon(proof.status)}
                  <h3 className="text-lg font-semibold text-gray-900">
                    Application #{proof.id.slice(-8)}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(proof.status)}`}>
                    {proof.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Task ID: {proof.taskId}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Skills: {proof.skillsProven.join(', ')}</span>
                  <span>•</span>
                  <span>Applied: {new Date(proof.createdAt).toLocaleDateString()}</span>
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
              <div className="bg-gray-50 rounded-lg p-4">
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
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );

  const renderMatchesTab = () => (
    <div className="space-y-4">
      {matches.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <MessageSquare className="h-8 w-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Yet</h3>
          <p className="text-gray-500">When project owners are interested in your applications, matches will appear here</p>
        </div>
      ) : (
        matches.map((match) => (
          <div key={match.id} className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <MessageSquare className="h-5 w-5 text-indigo-600" />
                  <h3 className="text-lg font-semibold text-gray-900">
                    Match #{match.id.slice(-8)}
                  </h3>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                    {match.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-2">
                  Task: {match.taskId} • Project Owner: {match.projectOwnerId}
                </p>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span>Matched: {new Date(match.createdAt).toLocaleDateString()}</span>
                  {match.taskBudget && (
                    <>
                      <span>•</span>
                      <span>Budget: {formatCurrency(match.taskBudget)}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center space-x-2">
                {match.contributorRevealed ? (
                  <Eye className="h-4 w-4 text-green-600" />
                ) : (
                  <EyeOff className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-xs text-gray-500">
                  {match.contributorRevealed ? 'Identity Revealed' : 'Anonymous'}
                </span>
              </div>
            </div>
            
            <div className="flex items-center justify-between">
              <div className="text-sm text-gray-600">
                Mutual consent: {match.mutualConsent ? 'Granted' : 'Pending'}
              </div>
              
              {match.status === 'matched' && !match.contributorRevealed && (
                <button className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors">
                  Reveal Identity
                </button>
              )}
              
              {match.status === 'matched' && match.mutualConsent && (
                <button className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                  Start Collaboration
                </button>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div data-testid="loading-spinner" className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Contributor Dashboard</h1>
          <p className="text-gray-600">
            Track your applications, manage matches, and monitor your progress
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalApplications}</div>
                <div className="text-sm text-gray-500">Total Applications</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.pendingApplications}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.acceptedApplications}</div>
                <div className="text-sm text-gray-500">Accepted</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-blue-600" />
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
                <DollarSign className="h-8 w-8 text-purple-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{formatCurrency(stats.totalEarnings)}</div>
                <div className="text-sm text-gray-500">Total Earnings</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="border-b border-gray-200">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab('applications')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'applications'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                My Applications ({stats.totalApplications})
              </button>
              <button
                onClick={() => setActiveTab('matches')}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === 'matches'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Matches ({stats.activeMatches})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'applications' && renderApplicationsTab()}
            {activeTab === 'matches' && renderMatchesTab()}
          </div>
        </div>
      </div>
    </div>
  );
}