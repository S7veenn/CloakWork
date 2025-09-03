import { useState, useEffect } from 'react';
import { Eye, EyeOff, MessageSquare, Shield, CheckCircle, Clock, Users, Heart, Lock, Unlock, ArrowRight, Star } from 'lucide-react';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';
import { Match, Task } from '@/store/useStore';

export default function MatchCenter() {
  const { currentUser, matches, tasks, setMatches } = useStore();
  const [loading, setLoading] = useState(true);
  const [selectedMatch, setSelectedMatch] = useState<Match | null>(null);
  const [showRevealModal, setShowRevealModal] = useState(false);
  const [revealType, setRevealType] = useState<'contributor' | 'owner'>('contributor');
  const [stats, setStats] = useState({
    totalMatches: 0,
    pendingMatches: 0,
    activeMatches: 0,
    completedMatches: 0,
    mutualConsents: 0,
  });

  useEffect(() => {
    loadMatchData();
  }, [currentUser]);

  const loadMatchData = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      const matchesData = await apiService.getMatches(currentUser.id);
      setMatches(matchesData);
      
      // Calculate stats
      const totalMatches = matchesData.length;
      const pendingMatches = matchesData.filter(m => m.status === 'pending').length;
      const activeMatches = matchesData.filter(m => m.status === 'matched').length;
      const completedMatches = matchesData.filter(m => m.status === 'completed').length;
      const mutualConsents = matchesData.filter(m => m.mutualConsent).length;
      
      setStats({
        totalMatches,
        pendingMatches,
        activeMatches,
        completedMatches,
        mutualConsents,
      });
    } catch (error) {
      console.error('Failed to load match data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRevealIdentity = async (matchId: string, type: 'contributor' | 'owner') => {
    try {
      await apiService.revealIdentity(matchId, type);
      loadMatchData(); // Refresh data
      setShowRevealModal(false);
    } catch (error) {
      console.error('Failed to reveal identity:', error);
    }
  };

  const handleGrantConsent = async (matchId: string) => {
    try {
      await apiService.grantMutualConsent(matchId);
      loadMatchData(); // Refresh data
    } catch (error) {
      console.error('Failed to grant consent:', error);
    }
  };

  const getMatchStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'matched':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTaskForMatch = (match: Match): Task | undefined => {
    return tasks.find(t => t.id === match.taskId);
  };

  const isContributor = currentUser?.role === 'contributor';
  const isOwner = currentUser?.role === 'project_owner';

  const RevealIdentityModal = () => {
    if (!selectedMatch) return null;

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Eye className="h-8 w-8 text-indigo-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reveal Your Identity</h2>
            <p className="text-gray-600">
              This action will reveal your identity to the other party. This cannot be undone.
            </p>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <div className="flex items-start">
              <Shield className="h-5 w-5 text-yellow-600 mt-0.5 mr-3" />
              <div>
                <h3 className="text-sm font-medium text-yellow-800">Privacy Notice</h3>
                <p className="text-sm text-yellow-700 mt-1">
                  Once revealed, your identity will be visible to the other party. Make sure you trust them before proceeding.
                </p>
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowRevealModal(false)}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={() => handleRevealIdentity(selectedMatch.id, revealType)}
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Reveal Identity
            </button>
          </div>
        </div>
      </div>
    );
  };

  const MatchCard = ({ match }: { match: Match }) => {
    const task = getTaskForMatch(match);
    const canReveal = isContributor ? !match.contributorRevealed : !match.ownerRevealed;
    const otherPartyRevealed = isContributor ? match.ownerRevealed : match.contributorRevealed;
    const bothRevealed = match.contributorRevealed && match.ownerRevealed;

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center space-x-2 mb-2">
              <MessageSquare className="h-5 w-5 text-indigo-600" />
              <h3 className="text-lg font-semibold text-gray-900">
                Match #{match.id.slice(-8)}
              </h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getMatchStatusColor(match.status)}`}>
                {match.status}
              </span>
            </div>
            
            {task && (
              <div className="mb-3">
                <h4 className="font-medium text-gray-900">{task.title}</h4>
                <p className="text-sm text-gray-600 line-clamp-2">{task.description}</p>
              </div>
            )}
            
            <div className="flex items-center space-x-4 text-sm text-gray-500">
              <span>Matched: {new Date(match.createdAt).toLocaleDateString()}</span>
              {match.taskBudget && (
                <>
                  <span>•</span>
                  <span>Budget: ${match.taskBudget.toLocaleString()}</span>
                </>
              )}
            </div>
          </div>
          
          <div className="text-right">
            <div className="flex items-center space-x-2 mb-2">
              {match.mutualConsent ? (
                <>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                  <span className="text-xs text-green-600 font-medium">Mutual Consent</span>
                </>
              ) : (
                <>
                  <Clock className="h-4 w-4 text-yellow-600" />
                  <span className="text-xs text-yellow-600 font-medium">Pending Consent</span>
                </>
              )}
            </div>
          </div>
        </div>
        
        {/* Identity Status */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <h4 className="text-sm font-medium text-gray-900 mb-3">Identity Status</h4>
          <div className="grid grid-cols-2 gap-4">
            <div className="flex items-center space-x-2">
              {match.contributorRevealed ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-700">
                Contributor: {match.contributorRevealed ? 'Revealed' : 'Anonymous'}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              {match.ownerRevealed ? (
                <Eye className="h-4 w-4 text-green-600" />
              ) : (
                <EyeOff className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm text-gray-700">
                Owner: {match.ownerRevealed ? 'Revealed' : 'Anonymous'}
              </span>
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {bothRevealed ? (
              <div className="flex items-center space-x-2 text-green-600">
                <Unlock className="h-4 w-4" />
                <span className="text-sm font-medium">Both Identities Revealed</span>
              </div>
            ) : otherPartyRevealed ? (
              <div className="flex items-center space-x-2 text-blue-600">
                <Eye className="h-4 w-4" />
                <span className="text-sm font-medium">Other Party Revealed</span>
              </div>
            ) : (
              <div className="flex items-center space-x-2 text-gray-500">
                <Lock className="h-4 w-4" />
                <span className="text-sm font-medium">Both Anonymous</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-3">
            {canReveal && match.status === 'matched' && (
              <button
                onClick={() => {
                  setSelectedMatch(match);
                  setRevealType(isContributor ? 'contributor' : 'owner');
                  setShowRevealModal(true);
                }}
                className="px-4 py-2 bg-indigo-600 text-white text-sm rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Reveal My Identity
              </button>
            )}
            
            {!match.mutualConsent && otherPartyRevealed && match.status === 'matched' && (
              <button
                onClick={() => handleGrantConsent(match.id)}
                className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
              >
                Grant Consent
              </button>
            )}
            
            {match.mutualConsent && bothRevealed && match.status === 'matched' && (
              <button className="px-4 py-2 bg-purple-600 text-white text-sm rounded-lg hover:bg-purple-700 transition-colors flex items-center space-x-2">
                <span>Start Collaboration</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            )}
          </div>
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600" data-testid="loading-spinner" role="status" aria-label="Loading"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Match Center</h1>
          <p className="text-gray-600">
            Manage your matches, reveal identities, and establish mutual consent for collaboration
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <MessageSquare className="h-8 w-8 text-indigo-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.totalMatches}</div>
                <div className="text-sm text-gray-500">Total Matches</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Clock className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.pendingMatches}</div>
                <div className="text-sm text-gray-500">Pending</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.activeMatches}</div>
                <div className="text-sm text-gray-500">Active</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Heart className="h-8 w-8 text-red-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.mutualConsents}</div>
                <div className="text-sm text-gray-500">Mutual Consents</div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <Star className="h-8 w-8 text-green-600" />
              </div>
              <div className="ml-4">
                <div className="text-2xl font-bold text-gray-900">{stats.completedMatches}</div>
                <div className="text-sm text-gray-500">Completed</div>
              </div>
            </div>
          </div>
        </div>

        {/* Matches List */}
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Your Matches</h2>
          </div>
          
          <div className="p-6">
            {matches.length === 0 ? (
              <div className="text-center py-12">
                <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="h-8 w-8 text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-2">No Matches Yet</h3>
                <p className="text-gray-500 mb-4">
                  {isContributor 
                    ? "Apply to tasks to get matched with project owners"
                    : "Accept applications to create matches with contributors"
                  }
                </p>
                <button className="text-indigo-600 hover:text-indigo-700 font-medium">
                  {isContributor ? "Browse Tasks" : "View Applications"}
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {matches.map((match) => (
                  <MatchCard key={match.id} match={match} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {showRevealModal && <RevealIdentityModal />}
    </div>
  );
}