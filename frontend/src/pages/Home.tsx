import { useNavigate } from 'react-router-dom';
import { Shield, Users, Briefcase, Zap, Lock, Eye } from 'lucide-react';
import { useStore } from '@/store/useStore';

export default function Home() {
  const navigate = useNavigate();
  const { setUserRole, setCurrentUser } = useStore();

  const handleRoleSelection = (role: 'contributor' | 'project_owner') => {
    setUserRole(role);
    // Create a mock user for demo purposes
    setCurrentUser({
      id: `user_${Date.now()}`,
      role,
      isAnonymous: true,
      reputation: 0,
    });
    
    if (role === 'contributor') {
      navigate('/tasks');
    } else {
      navigate('/owner/dashboard');
    }
  };

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <div className="flex justify-center mb-8">
              <div className="flex items-center space-x-2 px-4 py-2 bg-indigo-100 rounded-full">
                <Shield className="h-5 w-5 text-indigo-600" />
                <span className="text-sm font-medium text-indigo-700">Privacy-First Collaboration</span>
              </div>
            </div>
            
            <h1 className="text-4xl md:text-6xl font-bold text-slate-900 mb-6">
              Welcome to{' '}
              <span className="bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                CloakWork
              </span>
            </h1>
            
            <p className="text-xl text-slate-600 mb-12 max-w-3xl mx-auto leading-relaxed">
              The first privacy-first collaboration platform where contributors prove their skills 
              anonymously through Zero-Knowledge Proofs while keeping transactions secure on Midnight Network.
            </p>

            {/* Role Selection Cards */}
            <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto mb-16">
              {/* Contributor Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-indigo-200 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-center w-16 h-16 bg-indigo-100 rounded-2xl mb-6 mx-auto group-hover:bg-indigo-200 transition-colors">
                    <Users className="h-8 w-8 text-indigo-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">I'm a Contributor</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Find exciting projects, prove your skills anonymously, and get paid fairly 
                    without revealing your identity until you choose to.
                  </p>
                  
                  <ul className="text-sm text-slate-500 mb-8 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      <span>Browse tasks anonymously</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      <span>Generate ZK proofs of your skills</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-indigo-400 rounded-full"></div>
                      <span>Control when to reveal identity</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleRoleSelection('contributor')}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Start as Contributor</span>
                    <Zap className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {/* Project Owner Card */}
              <div className="group relative">
                <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-2xl blur opacity-25 group-hover:opacity-75 transition duration-1000 group-hover:duration-200"></div>
                <div className="relative bg-white p-8 rounded-2xl border border-slate-200 hover:border-purple-200 transition-all duration-300 hover:shadow-xl">
                  <div className="flex items-center justify-center w-16 h-16 bg-purple-100 rounded-2xl mb-6 mx-auto group-hover:bg-purple-200 transition-colors">
                    <Briefcase className="h-8 w-8 text-purple-600" />
                  </div>
                  
                  <h3 className="text-2xl font-bold text-slate-900 mb-4">I'm a Project Owner</h3>
                  <p className="text-slate-600 mb-6 leading-relaxed">
                    Post projects, receive verified proof of skills from contributors, 
                    and hire the best talent based on merit, not bias.
                  </p>
                  
                  <ul className="text-sm text-slate-500 mb-8 space-y-2">
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span>Post tasks with encrypted requirements</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span>Receive verified skill proofs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <div className="w-1.5 h-1.5 bg-purple-400 rounded-full"></div>
                      <span>Hire based on proven merit</span>
                    </li>
                  </ul>
                  
                  <button
                    onClick={() => handleRoleSelection('project_owner')}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-3 px-6 rounded-xl transition-colors duration-200 flex items-center justify-center space-x-2"
                  >
                    <span>Start as Project Owner</span>
                    <Briefcase className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <div className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-slate-900 mb-4">Privacy by Design</h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Built on Midnight Network with Zero-Knowledge Proofs to ensure your data stays private
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-indigo-100 rounded-xl mb-4 mx-auto">
                <Lock className="h-6 w-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Anonymous by Default</h3>
              <p className="text-slate-600">
                Your identity remains hidden until you explicitly choose to reveal it
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4 mx-auto">
                <Shield className="h-6 w-6 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Zero-Knowledge Proofs</h3>
              <p className="text-slate-600">
                Prove your skills and contributions without revealing sensitive information
              </p>
            </div>
            
            <div className="text-center">
              <div className="flex items-center justify-center w-12 h-12 bg-green-100 rounded-xl mb-4 mx-auto">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-slate-900 mb-2">Mutual Consent</h3>
              <p className="text-slate-600">
                Both parties must agree before any identity or contact details are shared
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}