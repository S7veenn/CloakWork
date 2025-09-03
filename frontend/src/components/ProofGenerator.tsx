import { useState } from 'react';
import { X, Shield, Upload, FileText, Github, Linkedin, Award, Zap, CheckCircle } from 'lucide-react';
import { Task, Proof } from '@/store/useStore';
import { useStore } from '@/store/useStore';
import { apiService } from '@/services/api';

interface ProofGeneratorProps {
  task: Task;
  onClose: () => void;
  onProofGenerated?: (proof: Proof) => void;
  testMode?: boolean; // For testing purposes
  isOpen?: boolean; // Modal visibility state
}

export default function ProofGenerator({ task, onClose, onProofGenerated, testMode = false }: ProofGeneratorProps) {
  const { currentUser, addProof } = useStore();
  const [step, setStep] = useState(1);
  const [proofData, setProofData] = useState({
    skillProofs: [] as string[],
    portfolioLinks: [] as string[],
    experienceYears: '',
    certifications: [] as string[],
    previousWork: '',
    coverLetter: '',
  });
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedProof, setGeneratedProof] = useState<Proof | null>(null);

  const handleSkillProofAdd = (proof: string) => {
    if (proof && !proofData.skillProofs.includes(proof)) {
      setProofData(prev => ({
        ...prev,
        skillProofs: [...prev.skillProofs, proof]
      }));
    }
  };

  const handlePortfolioAdd = (link: string) => {
    if (link && !proofData.portfolioLinks.includes(link)) {
      setProofData(prev => ({
        ...prev,
        portfolioLinks: [...prev.portfolioLinks, link]
      }));
    }
  };

  const handleCertificationAdd = (cert: string) => {
    if (cert && !proofData.certifications.includes(cert)) {
      setProofData(prev => ({
        ...prev,
        certifications: [...prev.certifications, cert]
      }));
    }
  };

  const removeItem = (array: string[], index: number, field: keyof typeof proofData) => {
    setProofData(prev => ({
      ...prev,
      [field]: array.filter((_, i) => i !== index)
    }));
  };

  const generateProof = async () => {
    if (!currentUser) return;

    setIsGenerating(true);
    try {
      // Simulate ZK proof generation
      const delay = testMode ? 10 : 3000; // Use shorter delay in test mode
      await new Promise(resolve => setTimeout(resolve, delay));
      
      const proof: Proof = {
        id: `proof_${Date.now()}`,
        taskId: task.id,
        contributorId: currentUser.id,
        zkProofHash: `zk_${Math.random().toString(36).substr(2, 16)}`,
        skillsProven: task.skills,
        proofData: {
          experienceLevel: proofData.experienceYears,
          skillVerifications: proofData.skillProofs,
          portfolioCount: proofData.portfolioLinks.length,
          certificationCount: proofData.certifications.length,
        },
        status: 'pending',
        createdAt: new Date().toISOString(),
        isAnonymous: true,
      };

      // Submit proof via API
      await apiService.submitProof(proof);
      
      setGeneratedProof(proof);
      addProof(proof);
      setStep(3);
    } catch (error) {
      console.error('Failed to generate proof:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const renderStep1 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Skill Verification</h3>
        <p className="text-sm text-gray-600 mb-4">
          Add evidence of your skills for: {task.requirements ? task.requirements.join(', ') : 'this task'}
        </p>
        
        <div className="space-y-4">
          {/* Skill Proofs */}
          <div>
            <label htmlFor="skill-evidence-input" className="block text-sm font-medium text-gray-700 mb-2">
              Skill Evidence (GitHub repos, code samples, etc.)
            </label>
            <div className="flex space-x-2">
              <input
                id="skill-evidence-input"
                type="text"
                placeholder="Enter GitHub repo URL or description"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleSkillProofAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleSkillProofAdd(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {proofData.skillProofs.map((proof, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700">{proof}</span>
                  <button
                    onClick={() => removeItem(proofData.skillProofs, index, 'skillProofs')}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${proof}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Experience Years */}
          <div>
            <label htmlFor="experience-years-select" className="block text-sm font-medium text-gray-700 mb-2">
              Years of Experience
            </label>
            <select
              id="experience-years-select"
              value={proofData.experienceYears}
              onChange={(e) => setProofData(prev => ({ ...prev, experienceYears: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            >
              <option value="">Select experience level</option>
              <option value="0-1">0-1 years (Beginner)</option>
              <option value="1-3">1-3 years (Junior)</option>
              <option value="3-5">3-5 years (Mid-level)</option>
              <option value="5-8">5-8 years (Senior)</option>
              <option value="8+">8+ years (Expert)</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Additional Credentials</h3>
        
        <div className="space-y-4">
          {/* Portfolio Links */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Portfolio & Work Samples
            </label>
            <div className="flex space-x-2">
              <input
                type="url"
                placeholder="Enter portfolio URL"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handlePortfolioAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handlePortfolioAdd(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {proofData.portfolioLinks.map((link, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700 truncate">{link}</span>
                  <button
                    onClick={() => removeItem(proofData.portfolioLinks, index, 'portfolioLinks')}
                    className="text-red-500 hover:text-red-700 ml-2"
                    aria-label={`Remove ${link}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Certifications */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Certifications & Awards
            </label>
            <div className="flex space-x-2">
              <input
                type="text"
                placeholder="Enter certification name"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                onKeyPress={(e) => {
                  if (e.key === 'Enter') {
                    handleCertificationAdd(e.currentTarget.value);
                    e.currentTarget.value = '';
                  }
                }}
              />
              <button
                onClick={(e) => {
                  const input = e.currentTarget.previousElementSibling as HTMLInputElement;
                  handleCertificationAdd(input.value);
                  input.value = '';
                }}
                className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
              >
                Add
              </button>
            </div>
            <div className="mt-2 space-y-1">
              {proofData.certifications.map((cert, index) => (
                <div key={index} className="flex items-center justify-between bg-gray-50 px-3 py-2 rounded-md">
                  <span className="text-sm text-gray-700">{cert}</span>
                  <button
                    onClick={() => removeItem(proofData.certifications, index, 'certifications')}
                    className="text-red-500 hover:text-red-700"
                    aria-label={`Remove ${cert}`}
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Cover Letter */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Cover Letter (Optional)
            </label>
            <textarea
              value={proofData.coverLetter}
              onChange={(e) => setProofData(prev => ({ ...prev, coverLetter: e.target.value }))}
              placeholder="Briefly explain why you're the right fit for this task..."
              rows={4}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="text-center space-y-6">
      <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto">
        <CheckCircle className="h-8 w-8 text-green-600" />
      </div>
      
      <div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">Proof Generated Successfully!</h3>
        <p className="text-gray-600 mb-4">
          Your zero-knowledge proof has been created and submitted to the project owner.
        </p>
        
        {generatedProof && (
          <div className="bg-gray-50 rounded-lg p-4 text-left">
            <div className="text-sm space-y-2">
              <div className="flex justify-between">
                <span className="font-medium">Proof ID:</span>
                <span className="font-mono text-xs">{generatedProof.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">ZK Hash:</span>
                <span className="font-mono text-xs">{generatedProof.zkProofHash}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Status:</span>
                <span className="capitalize">{generatedProof.status}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-medium">Skills Proven:</span>
                <span>{generatedProof.skillsProven.join(', ')}</span>
              </div>
            </div>
          </div>
        )}
        
        <p className="text-sm text-gray-500 mt-4">
          You'll be notified if the project owner is interested in your application.
        </p>
      </div>
    </div>
  );

  const canProceedToStep2 = proofData.skillProofs.length > 0 && proofData.experienceYears;
  const canGenerateProof = canProceedToStep2;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">
              <Shield className="h-5 w-5 text-indigo-600" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-gray-900">Generate ZK Proof</h2>
              <p className="text-sm text-gray-500">For: {task.title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Close"
          >
            <X className="h-6 w-6" />
          </button>
        </div>

        {/* Progress Steps */}
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((stepNum) => (
              <div key={stepNum} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  step >= stepNum 
                    ? 'bg-indigo-600 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {stepNum}
                </div>
                {stepNum < 3 && (
                  <div className={`w-12 h-0.5 ml-2 ${
                    step > stepNum ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between mt-2 text-xs text-gray-500">
            <span>Skills</span>
            <span>Credentials</span>
            <span>Complete</span>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-96">
          {step === 1 && renderStep1()}
          {step === 2 && renderStep2()}
          {step === 3 && renderStep3()}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex space-x-3">
            {step > 1 && step < 3 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          
          <div className="flex space-x-3">
            {step === 1 && (
              <button
                onClick={() => setStep(2)}
                disabled={!canProceedToStep2}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Next
              </button>
            )}
            
            {step === 2 && (
              <button
                onClick={generateProof}
                disabled={!canGenerateProof || isGenerating}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
              >
                {isGenerating ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Generating...</span>
                  </>
                ) : (
                  <>
                    <Zap className="h-4 w-4" />
                    <span>Generate Proof</span>
                  </>
                )}
              </button>
            )}
            
            {step === 3 && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
              >
                Done
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}