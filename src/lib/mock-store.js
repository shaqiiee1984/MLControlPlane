/**
 * mock-store.js
 * localStorage-backed mock CRUD store for all ML entities.
 * Seeds rich sample data on first load so all pages show populated states.
 */

const NS = "mlcp_mock_";

// ── Helpers ────────────────────────────────────────────────────────────────

function uid() {
    return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function read(entity) {
    try {
        return JSON.parse(localStorage.getItem(NS + entity) || "null") || null;
    } catch {
        return null;
    }
}

function write(entity, data) {
    localStorage.setItem(NS + entity, JSON.stringify(data));
}

// ── Seed Data ──────────────────────────────────────────────────────────────

const SEED_VERSION = "v4"; // bump this to force re-seed

function daysAgo(n) {
    return new Date(Date.now() - n * 86400000).toISOString();
}
function hoursAgo(n) {
    return new Date(Date.now() - n * 3600000).toISOString();
}

const SEED = {
    Dataset: [
        {
            id: uid(), name: "imagenet-clean", version: "3.2.0",
            description: "Filtered ImageNet with quality-scored images, duplicates removed.",
            source_url: "s3://ml-data/imagenet-clean/v3.2.0", format: "parquet",
            size_gb: 142.4, row_count: 1281167, project: "vision-core",
            status: "active", tags: ["vision", "classification", "curated"],
            created_date: daysAgo(25),
        },
        {
            id: uid(), name: "cc-100-multilingual", version: "1.0.1",
            description: "CommonCrawl multilingual corpus for NLP pre-training.",
            source_url: "s3://ml-data/cc100/v1.0.1", format: "jsonl",
            size_gb: 528.7, row_count: 4200000000, project: "nlp-core",
            status: "active", tags: ["nlp", "multilingual", "pretraining"],
            created_date: daysAgo(40),
        },
        {
            id: uid(), name: "rl-gym-transitions", version: "2.0.0",
            description: "Replay buffer dataset from gym environments for offline RL.",
            source_url: "s3://ml-data/rl-gym/v2.0.0", format: "hdf5",
            size_gb: 38.2, row_count: 50000000, project: "rl-research",
            status: "active", tags: ["rl", "offline-rl", "atari"],
            created_date: daysAgo(12),
        },
        {
            id: uid(), name: "medical-xray-annotated", version: "0.9.0",
            description: "Chest X-ray dataset with radiologist annotations.",
            source_url: "s3://ml-data/xray/v0.9.0", format: "images",
            size_gb: 74.6, row_count: 112120, project: "medical-ai",
            status: "active", tags: ["medical", "vision", "classification"],
            created_date: daysAgo(7),
        },
        {
            id: uid(), name: "imagenet-clean", version: "2.8.0",
            description: "Previous version of ImageNet-clean (deprecated).",
            source_url: "s3://ml-data/imagenet-clean/v2.8.0", format: "parquet",
            size_gb: 138.1, row_count: 1262000, project: "vision-core",
            status: "deprecated", tags: ["vision"],
            created_date: daysAgo(90),
        },
        {
            id: uid(), name: "code-python-10b", version: "1.5.0",
            description: "Python source code scraped from GitHub for code LLM training.",
            source_url: "s3://ml-data/code/python-10b/v1.5.0", format: "jsonl",
            size_gb: 210.3, row_count: 850000000, project: "code-intelligence",
            status: "active", tags: ["code", "python", "llm"],
            created_date: daysAgo(3),
        },
    ],
    Experiment: [
        {
            id: uid(), name: "llama-3-8b-sft-v12", project: "nlp-core",
            status: "running", priority: "critical",
            framework: "pytorch", container_image: "ghcr.io/nlp/trainer:cuda12.1",
            git_commit: "a3f92c1", dataset_version: "cc-100-multilingual@1.0.1",
            gpu_count: 32, gpu_type: "H100-SXM", node_count: 4, cpu_count: 128, memory_gb: 512,
            hyperparameters: { lr: "2e-4", batch_size: "64", epochs: "3", warmup_steps: "500" },
            description: "SFT fine-tune on merged instruction dataset.",
            tags: ["llm", "sft", "production-candidate"], team: "nlp-team",
            created_date: hoursAgo(3),
        },
        {
            id: uid(), name: "clip-vit-large-finetune", project: "vision-core",
            status: "running", priority: "high",
            framework: "pytorch", container_image: "ghcr.io/vision/clip-trainer:latest",
            git_commit: "b912f44", dataset_version: "imagenet-clean@3.2.0",
            gpu_count: 8, gpu_type: "A100-80GB", node_count: 1, cpu_count: 32, memory_gb: 128,
            hyperparameters: { lr: "1e-5", batch_size: "256", epochs: "10" },
            description: "CLIP ViT-Large fine-tuned on domain-specific data.",
            tags: ["vision", "clip", "contrastive"], team: "vision-team",
            created_date: hoursAgo(8),
        },
        {
            id: uid(), name: "ppo-agent-lunar-v3", project: "rl-research",
            status: "running", priority: "normal",
            framework: "pytorch", container_image: "ghcr.io/rl/ppo:v3",
            git_commit: "c448ad2", dataset_version: "rl-gym-transitions@2.0.0",
            gpu_count: 4, gpu_type: "V100-32GB", node_count: 1, cpu_count: 16, memory_gb: 64,
            hyperparameters: { lr: "3e-4", gamma: "0.99", clip_ratio: "0.2" },
            description: "PPO agent trained on LunarLander environment.",
            tags: ["rl", "ppo"], team: "rl-team",
            created_date: hoursAgo(1),
        },
        {
            id: uid(), name: "bert-base-intent-classification", project: "nlp-core",
            status: "queued", priority: "normal",
            framework: "huggingface", container_image: "ghcr.io/nlp/hf-trainer:latest",
            git_commit: "d12bc98", dataset_version: "cc-100-multilingual@1.0.1",
            gpu_count: 8, gpu_type: "A100-80GB", node_count: 1, cpu_count: 32, memory_gb: 128,
            hyperparameters: { lr: "3e-5", batch_size: "32", epochs: "5" },
            description: "BERT fine-tuned for multi-label intent classification.",
            tags: ["nlp", "bert", "classification"], team: "nlp-team",
            created_date: hoursAgo(0.5),
        },
        {
            id: uid(), name: "stable-diffusion-xl-lora", project: "vision-core",
            status: "queued", priority: "normal",
            framework: "pytorch", container_image: "ghcr.io/vision/diffusion:latest",
            git_commit: "e7a23b1", dataset_version: "imagenet-clean@3.2.0",
            gpu_count: 16, gpu_type: "A100-80GB", node_count: 2, cpu_count: 64, memory_gb: 256,
            hyperparameters: { lr: "5e-5", batch_size: "16", steps: "5000" },
            description: "LoRA fine-tuning of SDXL for product image generation.",
            tags: ["vision", "diffusion", "lora"], team: "vision-team",
            created_date: hoursAgo(0.2),
        },
        {
            id: uid(), name: "gpt2-medical-finetuned", project: "medical-ai",
            status: "completed", priority: "high",
            framework: "huggingface", container_image: "ghcr.io/medical/gpt2-trainer:v2",
            git_commit: "f9d154a", dataset_version: "medical-xray-annotated@0.9.0",
            gpu_count: 4, gpu_type: "A100-80GB", node_count: 1, cpu_count: 16, memory_gb: 64,
            duration_seconds: 14400,
            hyperparameters: { lr: "5e-5", batch_size: "16", epochs: "8" },
            metrics: { val_loss: 0.312, accuracy: 0.891, f1: 0.878 },
            description: "GPT-2 fine-tuned on radiology report generation.",
            tags: ["medical", "nlp", "gpt2"], team: "nlp-team",
            created_date: daysAgo(2),
        },
        {
            id: uid(), name: "llama-3-8b-sft-v11", project: "nlp-core",
            status: "completed", priority: "critical",
            framework: "pytorch", container_image: "ghcr.io/nlp/trainer:cuda12.1",
            git_commit: "g2a81f3", dataset_version: "cc-100-multilingual@1.0.1",
            gpu_count: 32, gpu_type: "H100-SXM", node_count: 4, cpu_count: 128, memory_gb: 512,
            duration_seconds: 86400,
            hyperparameters: { lr: "2e-4", batch_size: "64", epochs: "3" },
            metrics: { val_loss: 1.42, perplexity: 4.13 },
            description: "Previous iteration of SFT fine-tune.",
            tags: ["llm", "sft"], team: "nlp-team",
            created_date: daysAgo(4),
        },
        {
            id: uid(), name: "reward-model-rlhf-v2", project: "nlp-core",
            status: "failed", priority: "high",
            framework: "pytorch", container_image: "ghcr.io/nlp/rm-trainer:v2",
            git_commit: "h5c90d4", dataset_version: "cc-100-multilingual@1.0.1",
            gpu_count: 8, gpu_type: "A100-80GB", node_count: 1, cpu_count: 32, memory_gb: 128,
            duration_seconds: 3600,
            hyperparameters: { lr: "1e-5", batch_size: "16" },
            description: "Reward model training — OOM error on step 8500.",
            tags: ["rlhf", "reward"], team: "nlp-team",
            created_date: daysAgo(1),
        },
        {
            id: uid(), name: "code-llm-pretraining-v1", project: "code-intelligence",
            status: "canceled", priority: "normal",
            framework: "pytorch", container_image: "ghcr.io/code/trainer:latest",
            git_commit: "i7b22e5", dataset_version: "code-python-10b@1.5.0",
            gpu_count: 64, gpu_type: "H100-SXM", node_count: 8, cpu_count: 256, memory_gb: 1024,
            duration_seconds: 7200,
            hyperparameters: { lr: "1e-4", batch_size: "128" },
            description: "Full pretraining run — canceled to switch dataset.",
            tags: ["code", "llm", "pretraining"], team: "nlp-team",
            created_date: daysAgo(5),
        },
    ],
    Model: [
        {
            id: uid(), name: "llama-3-8b-sft", version: "1.0.0",
            stage: "production", framework: "pytorch",
            experiment_id: "llama-3-8b-sft-v11",
            dataset_version: "cc-100-multilingual@1.0.1",
            artifact_url: "s3://ml-artifacts/models/llama-3-8b-sft/v1.0.0",
            metrics: { val_loss: 1.42, perplexity: 4.13 },
            description: "Production-grade SFT model serving API traffic.",
            approved_by: "alice@acme.ai", size_mb: 15360,
            tags: ["llm", "production", "sft"], project: "nlp-core",
            created_date: daysAgo(3),
        },
        {
            id: uid(), name: "clip-vit-large", version: "2.1.0",
            stage: "staging", framework: "pytorch",
            experiment_id: "clip-vit-large-finetune",
            dataset_version: "imagenet-clean@3.2.0",
            artifact_url: "s3://ml-artifacts/models/clip-vit-large/v2.1.0",
            metrics: { val_accuracy: 0.874, val_loss: 0.213 },
            description: "CLIP ViT-Large for visual search.",
            approved_by: "bob@acme.ai", size_mb: 2048,
            tags: ["vision", "clip"], project: "vision-core",
            created_date: daysAgo(6),
        },
        {
            id: uid(), name: "gpt2-radiology", version: "1.2.0",
            stage: "validated", framework: "huggingface",
            experiment_id: "gpt2-medical-finetuned",
            dataset_version: "medical-xray-annotated@0.9.0",
            artifact_url: "s3://ml-artifacts/models/gpt2-radiology/v1.2.0",
            metrics: { val_loss: 0.312, accuracy: 0.891 },
            description: "Radiology report generation, awaiting clinical review.",
            approved_by: null, size_mb: 512,
            tags: ["medical", "nlp"], project: "medical-ai",
            created_date: daysAgo(1),
        },
        {
            id: uid(), name: "sd-xl-product", version: "0.4.0",
            stage: "draft", framework: "pytorch",
            experiment_id: "",
            dataset_version: "imagenet-clean@3.2.0",
            artifact_url: "",
            metrics: {},
            description: "SDXL LoRA for product photography — training in progress.",
            approved_by: null, size_mb: 786,
            tags: ["diffusion", "lora"], project: "vision-core",
            created_date: hoursAgo(6),
        },
        {
            id: uid(), name: "bert-intent-v3", version: "3.0.1",
            stage: "production", framework: "huggingface",
            experiment_id: "",
            dataset_version: "cc-100-multilingual@1.0.1",
            artifact_url: "s3://ml-artifacts/models/bert-intent/v3.0.1",
            metrics: { accuracy: 0.934, f1: 0.921 },
            description: "Intent classifier powering the chatbot product.",
            approved_by: "alice@acme.ai", size_mb: 440,
            tags: ["nlp", "production"], project: "nlp-core",
            created_date: daysAgo(14),
        },
        {
            id: uid(), name: "ppo-agent-lunar", version: "3.0.0",
            stage: "archived", framework: "pytorch",
            experiment_id: "",
            dataset_version: "rl-gym-transitions@2.0.0",
            artifact_url: "s3://ml-artifacts/models/ppo-lunar/v3.0.0",
            metrics: { mean_reward: 287.4 },
            description: "Archived — superceded by DreamerV3.",
            approved_by: "carol@acme.ai", size_mb: 128,
            tags: ["rl"], project: "rl-research",
            created_date: daysAgo(30),
        },
    ],
    Pipeline: [
        {
            id: uid(), name: "nlp-core-ci", type: "ci",
            status: "success", git_branch: "main", git_commit: "a3f92c1",
            trigger: "push", project: "nlp-core", duration_seconds: 412,
            stages: [
                { name: "checkout" }, { name: "lint" }, { name: "test" }, { name: "build" }, { name: "push" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12491",
            created_date: hoursAgo(2),
        },
        {
            id: uid(), name: "vision-core-training", type: "training",
            status: "running", git_branch: "feat/clip-v2", git_commit: "b912f44",
            trigger: "manual", project: "vision-core", duration_seconds: null,
            stages: [
                { name: "pull-data" }, { name: "preprocess" }, { name: "train" }, { name: "eval" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12492",
            created_date: hoursAgo(8),
        },
        {
            id: uid(), name: "nlp-core-cd", type: "cd",
            status: "success", git_branch: "main", git_commit: "g2a81f3",
            trigger: "manual", project: "nlp-core", duration_seconds: 223,
            stages: [
                { name: "build" }, { name: "push" }, { name: "deploy-staging" }, { name: "smoke-test" }, { name: "promote" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12480",
            created_date: daysAgo(3),
        },
        {
            id: uid(), name: "medical-ai-eval", type: "evaluation",
            status: "failed", git_branch: "main", git_commit: "f9d154a",
            trigger: "schedule", project: "medical-ai", duration_seconds: 890,
            stages: [
                { name: "load-model" }, { name: "run-benchmarks" }, { name: "report" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12493",
            created_date: daysAgo(1),
        },
        {
            id: uid(), name: "vision-core-ci", type: "ci",
            status: "success", git_branch: "main", git_commit: "e7a23b1",
            trigger: "push", project: "vision-core", duration_seconds: 381,
            stages: [
                { name: "checkout" }, { name: "lint" }, { name: "test" }, { name: "build" }, { name: "push" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12490",
            created_date: daysAgo(2),
        },
        {
            id: uid(), name: "code-intel-training", type: "training",
            status: "failed", git_branch: "main", git_commit: "i7b22e5",
            trigger: "schedule", project: "code-intelligence", duration_seconds: 7200,
            stages: [
                { name: "pull-data" }, { name: "preprocess" }, { name: "train" }
            ],
            logs_url: "https://ci.acme.ai/jobs/12488",
            created_date: daysAgo(5),
        },
        {
            id: uid(), name: "rl-research-ci", type: "ci",
            status: "pending", git_branch: "feat/ppo-v3", git_commit: "c448ad2",
            trigger: "pull_request", project: "rl-research", duration_seconds: null,
            stages: [
                { name: "checkout" }, { name: "lint" }, { name: "test" }
            ],
            logs_url: "",
            created_date: hoursAgo(0.3),
        },
    ],
};

// ── Store engine ───────────────────────────────────────────────────────────

function ensureSeeded() {
    if (localStorage.getItem(NS + "__seed_version") === SEED_VERSION) return;
    // Write seed data for each entity
    Object.entries(SEED).forEach(([entity, rows]) => {
        write(entity, rows);
    });
    localStorage.setItem(NS + "__seed_version", SEED_VERSION);
}

export function mockStore(entityName) {
    ensureSeeded();

    return {
        list: (sort, limit) => {
            let rows = read(entityName) || [];
            // Sort: supports "-created_date" style
            if (sort) {
                const desc = sort.startsWith("-");
                const field = desc ? sort.slice(1) : sort;
                rows = [...rows].sort((a, b) => {
                    const va = a[field] ?? "";
                    const vb = b[field] ?? "";
                    return desc ? (vb > va ? 1 : -1) : (va > vb ? 1 : -1);
                });
            }
            if (limit) rows = rows.slice(0, Number(limit));
            return Promise.resolve(rows);
        },
        create: (body) => {
            const rows = read(entityName) || [];
            const record = { ...body, id: uid(), created_date: new Date().toISOString() };
            rows.unshift(record);
            write(entityName, rows);
            return Promise.resolve(record);
        },
        update: (id, body) => {
            const rows = read(entityName) || [];
            const idx = rows.findIndex(r => r.id === id);
            if (idx === -1) return Promise.reject(new Error("Not found"));
            rows[idx] = { ...rows[idx], ...body };
            write(entityName, rows);
            return Promise.resolve(rows[idx]);
        },
        delete: (id) => {
            const rows = read(entityName) || [];
            write(entityName, rows.filter(r => r.id !== id));
            return Promise.resolve(true);
        },
    };
}
