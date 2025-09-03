// Utility functions for ZK proof generation

/**
 * Generate a cryptographic secret for the submitter
 */
export const generateSubmitterSecret = async (contributorId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`${contributorId}_${Date.now()}_${Math.random()}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate a cryptographic secret for the task
 */
export const generateTaskSecret = async (taskId: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(`task_${taskId}`);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Generate a cryptographic commitment for the proof data
 */
export const generateProofCommitment = async (proofData: {
  skillProofs: string[];
  experienceYears: string;
  portfolioLinks: string[];
  certifications: string[];
  coverLetter?: string;
}): Promise<string> => {
  const encoder = new TextEncoder();
  const dataString = JSON.stringify({
    skillProofs: proofData.skillProofs,
    experienceYears: proofData.experienceYears,
    portfolioLinks: proofData.portfolioLinks,
    certifications: proofData.certifications,
    coverLetter: proofData.coverLetter || '',
    timestamp: Date.now()
  });
  const data = encoder.encode(dataString);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
};

/**
 * Determine proof type based on task requirements and provided data
 */
export const determineProofType = (task: any, proofData: any): string => {
  if (proofData.certifications.length > 0) {
    return 'SKILL_PROOF';
  }
  if (proofData.experienceYears && proofData.experienceYears !== '') {
    return 'EXPERIENCE_PROOF';
  }
  return 'TASK_COMPLETION_PROOF';
};

/**
 * Convert hex string to Bytes<32> format expected by Midnight contracts
 */
export const hexToBytes32 = (hex: string): string => {
  // Ensure the hex string is 64 characters (32 bytes)
  const cleanHex = hex.replace('0x', '').padStart(64, '0');
  return '0x' + cleanHex;
};

/**
 * Create ZK proof data structure for contract submission
 */
export const createZkProofData = async ({
  taskId,
  contributorId,
  proofData,
  proofType
}: {
  taskId: string;
  contributorId: string;
  proofData: any;
  proofType: string;
}) => {
  const submitterSecret = await generateSubmitterSecret(contributorId);
  const taskSecret = await generateTaskSecret(taskId);
  const proofCommitment = await generateProofCommitment(proofData);

  return {
    taskId,
    contributorId,
    type: proofType,
    description: `ZK Proof submission`,
    zkProof: {
      submitterSecret: hexToBytes32(submitterSecret),
      proofCommitment: hexToBytes32(proofCommitment),
      taskSecret: hexToBytes32(taskSecret),
      proofType: proofType,
    },
    metadata: {
      skillsProven: proofData.skillProofs || [],
      experienceLevel: proofData.experienceYears,
      portfolioCount: proofData.portfolioLinks?.length || 0,
      certificationCount: proofData.certifications?.length || 0,
    }
  };
};