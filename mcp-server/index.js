#!/usr/bin/env node
/**
 * MCP Server - Manus → GitHub → Vercel Pipeline
 * Receives webhooks from Manus and triggers deployments
 */

const express = require('express');
const bodyParser = require('body-parser');
const { Octokit } = require('@octokit/rest');
const crypto = require('crypto');
const fs = require('fs');
const path = require('path');
const AdmZip = require('adm-zip');

const app = express();
app.use(bodyParser.json({ limit: '50mb' }));

const PORT = process.env.MCP_PORT || 8080;
const GH_TOKEN = process.env.GH_TOKEN;
const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET || 'zentix-manus-secret';
const REPO_OWNER = process.env.REPO_OWNER || 'amrikyy';
const REPO_NAME = process.env.REPO_NAME || 'zentix-protocol';

const octokit = new Octokit({ auth: GH_TOKEN });

/**
 * Verify webhook signature
 */
function verifySignature(payload, signature) {
  const hmac = crypto.createHmac('sha256', WEBHOOK_SECRET);
  const digest = 'sha256=' + hmac.update(payload).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(digest));
}

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    service: 'zentix-mcp-server',
    version: '1.0.0',
    uptime: process.uptime(),
    timestamp: new Date().toISOString(),
  });
});

/**
 * Manus webhook - receives build notifications
 */
app.post('/manus/webhook', async (req, res) => {
  try {
    console.log('\n🔔 Received Manus webhook');

    const {
      event_type,
      app_name,
      build_url,
      zip_data,
      commit_message,
      branch = 'manus-builds',
    } = req.body;

    console.log(`   Event: ${event_type}`);
    console.log(`   App: ${app_name}`);

    // Handle different event types
    switch (event_type) {
      case 'build_complete':
        await handleBuildComplete(app_name, zip_data, commit_message, branch);
        break;

      case 'deploy_request':
        await handleDeployRequest(app_name, build_url);
        break;

      case 'agent_created':
        await handleAgentCreated(req.body);
        break;

      default:
        console.log(`   Unknown event type: ${event_type}`);
    }

    res.json({
      success: true,
      message: 'Webhook processed',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Handle build complete - push to GitHub
 */
async function handleBuildComplete(appName, zipData, commitMessage, branch) {
  console.log(`\n📦 Processing build: ${appName}`);

  try {
    // Decode base64 zip if provided
    let files = {};
    if (zipData) {
      const zipBuffer = Buffer.from(zipData, 'base64');
      const zip = new AdmZip(zipBuffer);
      const zipEntries = zip.getEntries();

      zipEntries.forEach((entry) => {
        if (!entry.isDirectory) {
          files[entry.entryName] = entry.getData().toString('utf8');
        }
      });

      console.log(`   Extracted ${Object.keys(files).length} files from zip`);
    }

    // Create or update files in GitHub
    const basePath = `apps/${appName}`;

    for (const [filePath, content] of Object.entries(files)) {
      const fullPath = `${basePath}/${filePath}`;

      try {
        // Try to get existing file
        const { data: existingFile } = await octokit.repos.getContent({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: fullPath,
          ref: branch,
        });

        // Update existing file
        await octokit.repos.createOrUpdateFileContents({
          owner: REPO_OWNER,
          repo: REPO_NAME,
          path: fullPath,
          message: commitMessage || `Update ${appName} from Manus`,
          content: Buffer.from(content).toString('base64'),
          sha: existingFile.sha,
          branch,
        });

        console.log(`   ✅ Updated: ${fullPath}`);
      } catch (error) {
        if (error.status === 404) {
          // Create new file
          await octokit.repos.createOrUpdateFileContents({
            owner: REPO_OWNER,
            repo: REPO_NAME,
            path: fullPath,
            message: commitMessage || `Add ${appName} from Manus`,
            content: Buffer.from(content).toString('base64'),
            branch,
          });

          console.log(`   ✅ Created: ${fullPath}`);
        } else {
          throw error;
        }
      }
    }

    // Create PR if on separate branch
    if (branch !== 'main') {
      await createPullRequest(appName, branch);
    }

    console.log(`   ✅ Build pushed to GitHub successfully`);
  } catch (error) {
    console.error(`   ❌ Error pushing to GitHub:`, error.message);
    throw error;
  }
}

/**
 * Create pull request
 */
async function createPullRequest(appName, branch) {
  try {
    const { data: pr } = await octokit.pulls.create({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      title: `🤖 Manus Build: ${appName}`,
      head: branch,
      base: 'main',
      body: `
## Manus Automated Build

**App**: ${appName}
**Generated**: ${new Date().toISOString()}

This PR contains the latest build from Manus.

### What to check:
- [ ] Code quality
- [ ] Security review
- [ ] Performance

**Auto-generated by Zentix MCP Server** 🤖
      `,
    });

    console.log(`   ✅ Created PR #${pr.number}: ${pr.html_url}`);
    return pr;
  } catch (error) {
    if (error.status === 422) {
      console.log(`   ℹ️  PR already exists for branch ${branch}`);
    } else {
      throw error;
    }
  }
}

/**
 * Handle deploy request
 */
async function handleDeployRequest(appName, buildUrl) {
  console.log(`\n🚀 Triggering deployment for ${appName}`);

  // Trigger GitHub Actions workflow
  try {
    await octokit.actions.createWorkflowDispatch({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      workflow_id: 'deploy-vercel.yml',
      ref: 'main',
      inputs: {
        app_name: appName,
        build_url: buildUrl || '',
      },
    });

    console.log(`   ✅ Deployment triggered via GitHub Actions`);
  } catch (error) {
    console.error(`   ❌ Deployment trigger failed:`, error.message);
  }
}

/**
 * Handle agent created event
 */
async function handleAgentCreated(data) {
  console.log(`\n🤖 New agent created: ${data.agent_name}`);

  // Log to analytics or trigger marketing automation
  // This could integrate with Supabase, analytics, etc.

  console.log(`   Agent ID: ${data.agent_id}`);
  console.log(`   User: ${data.user_email}`);
  console.log(`   Template: ${data.template_id}`);
}

/**
 * Trigger deployment manually
 */
app.post('/deploy/trigger', async (req, res) => {
  try {
    const { app_name, branch = 'main' } = req.body;

    if (!app_name) {
      return res.status(400).json({
        success: false,
        error: 'app_name is required',
      });
    }

    await handleDeployRequest(app_name, null);

    res.json({
      success: true,
      message: `Deployment triggered for ${app_name}`,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Get recent builds
 */
app.get('/builds/recent', async (req, res) => {
  try {
    const { data: commits } = await octokit.repos.listCommits({
      owner: REPO_OWNER,
      repo: REPO_NAME,
      per_page: 10,
    });

    const builds = commits
      .filter((c) => c.commit.message.includes('Manus'))
      .map((c) => ({
        sha: c.sha,
        message: c.commit.message,
        author: c.commit.author.name,
        date: c.commit.author.date,
        url: c.html_url,
      }));

    res.json({
      success: true,
      count: builds.length,
      builds,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
});

/**
 * Start server
 */
app.listen(PORT, () => {
  console.log('\n🌟 Zentix MCP Server Started');
  console.log('═'.repeat(50));
  console.log(`\n📡 Server running on port ${PORT}`);
  console.log(`   Health: http://localhost:${PORT}/health`);
  console.log(`   Webhook: http://localhost:${PORT}/manus/webhook`);
  console.log(`   Deploy: http://localhost:${PORT}/deploy/trigger`);
  console.log(`   Builds: http://localhost:${PORT}/builds/recent`);
  console.log(`\n🔗 GitHub: ${REPO_OWNER}/${REPO_NAME}`);
  console.log(`\n💡 Ready to receive Manus webhooks!\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n👋 Shutting down MCP server...');
  process.exit(0);
});

module.exports = app;
