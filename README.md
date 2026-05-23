# vericompute-aggregator

Trust layer for decentralized AI compute — ZK-verified receipts across DePIN networks

## MVP Progress
- [x] Repository created
- [ ] Express.js API built
- [ ] Mock ZK receipt generation
- [ ] Deploy to production

Built by @sbudacated-bitconst express = require('express');
const crypto = require('crypto');
const app = express();
app.use(express.json());

// In-memory job store (replace with DB later)
const jobs = new Map();

// Simulate routing to different DePIN networks
const NETWORKS = ['render', 'akash', 'io.net'];

// Mock ZK-proof generator (will be replaced with real prover)
function generateMockProof(inputHash, outputHash, network) {
  const proofId = crypto.randomBytes(32).toString('hex');
  const publicInputs = {
    input_hash: inputHash,
    output_hash: outputHash,
    network_id: Buffer.from(network).toString('hex'),
    timestamp: Math.floor(Date.now() / 1000)
  };
  
  return {
    proof_id: proofId,
    proof_bytes: crypto.randomBytes(256).toString('hex'), // Simulated ZK proof
    public_inputs: publicInputs,
    verification_key_hash: crypto.createHash('sha256').update('vericompute_v1_key').digest('hex'),
    circuit_id: "inference_verifier_v1"
  };
}

// POST /compute - AI inference with ZK receipt
app.post('/compute', (req, res) => {
  const { model, input, network_preference, callback_url } = req.body;
  
  if (!model || !input) {
    return res.status(400).json({ error: 'Missing model or input' });
  }
  
  // Select network (with fallback logic)
  let selectedNetwork = network_preference;
  if (!selectedNetwork || !NETWORKS.includes(selectedNetwork)) {
    selectedNetwork = NETWORKS[Math.floor(Math.random() * NETWORKS.length)];
  }
  
  // Simulate job execution
  const jobId = crypto.randomBytes(16).toString('hex');
  const inputHash = crypto.createHash('sha256').update(JSON.stringify(input)).digest('hex');
  const mockOutput = { result: `Processed ${model} with input: ${JSON.stringify(input).substring(0, 50)}...` };
  const outputHash = crypto.createHash('sha256').update(JSON.stringify(mockOutput)).digest('hex');
  
  // Generate mock ZK proof
  const proof = generateMockProof(inputHash, outputHash, selectedNetwork);
  
  // Construct Solana-compatible receipt
  const receipt = {
    job_id: jobId,
    timestamp: Math.floor(Date.now() / 1000),
    network: selectedNetwork,
    model: model,
    input_hash: inputHash,
    output_hash: outputHash,
    output_preview: mockOutput.result.substring(0, 100),
    zk_proof: proof,
    solana_tx_ready: {
      program_id: "verify11c1m1xuZxy7HyNqR2GcdjZmw7J1GXkfU5d",
      accounts: [
        { name: "job", pubkey: `job_${jobId.substring(0, 32)}`, writable: true },
        { name: "verifier", pubkey: "verif_verify1c1m1xuZxy7HyNqR2GcdjZm", writable: false }
      ],
      instruction_data: `0x${Buffer.from(JSON.stringify({ jobId, outputHash })).toString('hex')}`
    },
    verification_status: "pending_chain"
  };
  
  // Store job
  jobs.set(jobId, { receipt, output: mockOutput, status: 'completed' });
  
  // Simulate callback if provided
  if (callback_url) {
    console.log(`[callback] Would POST to ${callback_url}`);
    // In production: axios.post(callback_url, receipt)
  }
  
  res.json({
    success: true,
    job_id: jobId,
    receipt: receipt,
    next_steps: [
      "Verify on Solana devnet via our verify() function (coming soon)",
      "Or inspect receipt.zk_proof.proof_bytes as placeholder for real ZK proof"
    ]
  });
});

// GET /verify/:jobId - Retrieve receipt
app.get('/verify/:jobId', (req, res) => {
  const job = jobs.get(req.params.jobId);
  if (!job) {
    return res.status(404).json({ error: 'Job not found' });
  }
  res.json({ receipt: job.receipt });
});

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'online', version: '0.2.0-zk-simulation' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ VeriCompute aggregator running on port ${PORT}`);
  console.log(`📡 POST /compute - submit inference job`);
  console.log(`🔍 GET /verify/:jobId - fetch ZK receipt`);
  console.log(`⚠️  Current proofs are MOCK — real ZK prover in progress`);
});# Restart your server (Ctrl+C then)
node server.js

# In another terminal:
curl -X POST http://localhost:3000/compute \
  -H "Content-Type: application/json" \
  -d '{"model":"llama2-7b","input":"What is DePIN?"}'