import axios from 'axios';

// Test script to verify API endpoints and contract integration
const API_BASE_URL = 'http://localhost:3001';

async function testAPI() {
  console.log('🧪 Testing CloakWork API endpoints...');
  console.log('=' .repeat(50));

  try {
    // Test 1: Health check
    console.log('\n1. Testing health endpoint...');
    const healthResponse = await axios.get(`${API_BASE_URL}/health`);
    console.log('✅ Health check:', healthResponse.data);

    // Test 2: Get tasks
    console.log('\n2. Testing get tasks endpoint...');
    const tasksResponse = await axios.get(`${API_BASE_URL}/api/tasks`);
    console.log('✅ Tasks retrieved:', tasksResponse.data);
    console.log('   Number of tasks:', tasksResponse.data.length);

    // Test 3: Create a new task
    console.log('\n3. Testing create task endpoint...');
    const newTask = {
      title: 'Test Task - Contract Integration',
      description: 'Testing if contract is being used for task creation',
      reward: '100',
      requiredSkills: ['testing', 'blockchain'],
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };
    
    const createTaskResponse = await axios.post(`${API_BASE_URL}/api/tasks`, newTask);
    console.log('✅ Task created:', createTaskResponse.data);
    console.log('   Task ID:', createTaskResponse.data.id);
    console.log('   Contract interaction:', createTaskResponse.data.contractTxId ? 'YES' : 'NO');

    const taskId = createTaskResponse.data.id;

    // Test 4: Submit a proof
    console.log('\n4. Testing submit proof endpoint...');
    const proofData = {
      taskId: taskId,
      proof: 'test-proof-data-' + Date.now(),
      metadata: {
        timestamp: Date.now(),
        testProof: true
      }
    };

    const submitProofResponse = await axios.post(`${API_BASE_URL}/api/proofs`, proofData);
    console.log('✅ Proof submitted:', submitProofResponse.data);
    console.log('   Proof ID:', submitProofResponse.data.id);
    console.log('   Contract verification:', submitProofResponse.data.contractTxId ? 'YES' : 'NO');

    // Test 5: Get proofs for the task
    console.log('\n5. Testing get proofs endpoint...');
    const proofsResponse = await axios.get(`${API_BASE_URL}/api/proofs?taskId=${taskId}`);
    console.log('✅ Proofs retrieved:', proofsResponse.data);
    console.log('   Number of proofs:', proofsResponse.data.length);

    console.log('\n' + '=' .repeat(50));
    console.log('🎉 All API tests completed successfully!');
    console.log('\n📊 Contract Integration Summary:');
    console.log('   - Task creation uses contract:', createTaskResponse.data.contractTxId ? '✅ YES' : '❌ NO');
    console.log('   - Proof submission uses contract:', submitProofResponse.data.contractTxId ? '✅ YES' : '❌ NO');
    
  } catch (error) {
    console.error('\n❌ API test failed:');
    if (error.response) {
      console.error('   Status:', error.response.status);
      console.error('   Data:', error.response.data);
    } else if (error.request) {
      console.error('   No response received. Is the server running on port 3001?');
    } else {
      console.error('   Error:', error.message);
    }
    
    console.log('\n💡 Troubleshooting tips:');
    console.log('   1. Make sure the backend server is running: npm run server');
    console.log('   2. Check if the server is listening on port 3001');
    console.log('   3. Verify Docker containers are running for blockchain components');
    console.log('   4. Check server logs for any errors');
  }
}

// Run the test
testAPI();