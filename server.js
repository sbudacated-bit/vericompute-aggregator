const express = require("express");
const app = express();
app.use(express.json());

const jobs = new Map();

app.post("/compute", (req, res) => {
const jobId = Date.now().toString();
const receipt = "mock_zk_proof_" + Math.random().toString(36).substring(2, 10);
jobs.set(jobId, { receipt, input: req.body });
console.log("Job received:", jobId);
res.json({ success: true, jobId: jobId, receipt: receipt });
});

app.get("/verify/:jobId", (req, res) => {
const job = jobs.get(req.params.jobId);
if (!job) {
return res.status(404).json({ error: "Job not found" });
}
res.json({ receipt: job.receipt });
});

app.get("/health", (req, res) => {
res.json({ status: "online", version: "0.2.0-zk-simulation" });
});

const PORT = 3000;
app.listen(PORT, () => {
console.log(`VeriCompute running on http://localhost:${PORT}`);
});
