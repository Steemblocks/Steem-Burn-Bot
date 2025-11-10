/**
 * Steem Blockchain Burn Pool Posting Bot
 * Creates posts every 2 hours with beneficiary rewards going to null account for burning STEEM
 * Uses dsteem library for blockchain operations
 */

const dsteem = require('dsteem');
const fs = require('fs');

// Configure logging
class Logger {
    constructor() {}

    log(level, message) {
        const timestamp = new Date().toISOString().replace('T', ' ').substring(0, 19);
        const logMessage = `${timestamp} - ${level} - ${message}`;
        console.log(logMessage);
    }

    info(message) { this.log('INFO', message); }
    error(message) { this.log('ERROR', message); }
    warning(message) { this.log('WARNING', message); }
}

class SteemBurnBot {
    constructor(configFile = 'config.json') {
        this.logger = new Logger();
        this.config = this.loadConfig(configFile);
        this.client = null;
        this.privateKey = null;
        this.dryRun = this.config.dry_run || false;
        this.scheduledJob = null;
        this.currentNodeIndex = 0;
        
        if (this.dryRun) {
            this.logger.info('🧪 DRY RUN MODE - No posts will be created');
            this.setupDryRun();
        } else {
            this.connectToSteem();
        }
    }

    loadConfig(configFile) {
        try {
            const configData = fs.readFileSync(configFile, 'utf8');
            const config = JSON.parse(configData);
            this.logger.info('Configuration loaded successfully');
            
            // Check if still using template values
            if (config.username === 'your_steem_username' || config.posting_key === 'your_posting_key_here') {
                this.logger.warning('⚠️  Configuration still has template values!');
                this.logger.warning('You need to edit config.json with your actual Steem credentials');
                this.logger.warning('OR set "dry_run": true to test without credentials');
                if (!config.dry_run) {
                    throw new Error('Please update config.json with your Steem username and posting key, or enable dry_run mode for testing');
                }
            }
            
            return config;
        } catch (error) {
            this.logger.error(`Failed to load configuration: ${error.message}`);
            throw error;
        }
    }

    setupDryRun() {
        this.logger.info('Setting up dry run mode - bot will simulate posting without blockchain interaction');
        this.logger.info(`Account: ${this.config.username || 'TEST_USER'}`);
    }

    connectToSteem() {
        try {
            // Set up dsteem client with configured nodes
            const nodes = this.config.nodes || ['https://api.steemit.com'];
            this.nodes = nodes;
            
            // Try to connect to current node
            this.client = new dsteem.Client(nodes[this.currentNodeIndex], {
                timeout: 10000,
                failoverThreshold: 10,
                addressPrefix: 'STM',
                chainId: '0000000000000000000000000000000000000000000000000000000000000000'
            });

            // Validate posting key format
            const postingKey = this.config.posting_key ? this.config.posting_key.trim() : '';
            
            if (!postingKey || postingKey.length < 50) {
                throw new Error(`Invalid posting key: Key is too short (${postingKey.length} chars) or missing. Expected 51+ characters.`);
            }

            if (!postingKey.startsWith('5')) {
                throw new Error('Invalid posting key: Posting keys should start with "5"');
            }

            this.logger.info(`Posting key length: ${postingKey.length} characters`);

            // Check for invalid base58 characters (0, O, I, l)
            const invalidChars = postingKey.match(/[0OIl]/g);
            if (invalidChars && invalidChars.length > 0) {
                this.logger.warning(`Posting key contains invalid base58 characters: ${invalidChars.join(', ')}`);
                this.logger.warning('Base58 alphabet does NOT include: 0 (zero), O (capital o), I (capital i), l (lowercase L)');
                this.logger.warning('Please double-check your posting key from Steemit.com → Wallet → Permissions');
                throw new Error(`Invalid posting key: Contains non-base58 characters [${invalidChars.join(', ')}]. Please verify your key.`);
            }

            // Parse the private posting key
            try {
                this.privateKey = dsteem.PrivateKey.fromString(postingKey);
            } catch (keyError) {
                throw new Error(`Invalid posting key format: ${keyError.message}. Please verify your posting key from Steemit.com`);
            }

            this.logger.info(`Connected to Steem blockchain as @${this.config.username}`);
            this.logger.info(`Using node: ${nodes[this.currentNodeIndex]}`);
            
            // Verify account exists
            this.verifyAccount();
        } catch (error) {
            this.logger.error(`Failed to connect to Steem: ${error.message}`);
            
            // Try next node if available
            if (this.currentNodeIndex < this.nodes.length - 1) {
                this.currentNodeIndex++;
                this.logger.info(`Trying next node: ${this.nodes[this.currentNodeIndex]}`);
                return this.connectToSteem();
            }
            
            throw error;
        }
    }
    
    async switchNode() {
        if (!this.nodes || this.nodes.length <= 1) return false;
        
        this.currentNodeIndex = (this.currentNodeIndex + 1) % this.nodes.length;
        const newNode = this.nodes[this.currentNodeIndex];
        
        this.logger.info(`Switching to node: ${newNode}`);
        this.client = new dsteem.Client(newNode, {
            timeout: 10000,
            failoverThreshold: 10,
            addressPrefix: 'STM',
            chainId: '0000000000000000000000000000000000000000000000000000000000000000'
        });
        
        return true;
    }

    async verifyAccount() {
        try {
            const accounts = await this.client.database.getAccounts([this.config.username]);
            if (accounts && accounts.length > 0) {
                const account = accounts[0];
                this.logger.info(`Account verified - Reputation: ${account.reputation}`);
            } else {
                throw new Error(`Account @${this.config.username} not found`);
            }
        } catch (error) {
            this.logger.error(`Account verification failed: ${error.message}`);
        }
    }

    generatePostContent() {
        const now = new Date();
        const dateString = now.toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        });
        const timestamp = now.toLocaleString('en-US', {
            year: 'numeric',
            month: '2-digit',
            day: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        });

        const title = `Burn Pool Contribution - ${dateString}`;
        
        const body = `<center>

![fire](https://upload.wikimedia.org/wikipedia/commons/2/22/Animated_fire_by_nevit.gif)

# 🔥 Steem Burn Pool Contribution 🔥

</center>

This post is part of an automated burn pool initiative to reduce STEEM supply.

**Post Details:**
Date/Time: ${timestamp}
100% of post rewards are sent to @null (burned)
This helps reduce inflation and benefits all STEEM holders

---

## What is STEEM Burning?

When rewards are sent to the @null account, those STEEM tokens are permanently removed from circulation. This deflationary mechanism helps:

Reduce overall STEEM supply
Increase scarcity
Potentially support token value
Benefit the entire Steem community

---

## Automated Contribution

This post is created automatically every 2 hours as part of a continuous burn pool initiative.

*Together, we make STEEM stronger! 💪*

---

*Posted via Steem Burn Pool Bot*`;

        const tags = this.config.tags || ['burnpost', 'steem', 'burn', 'null', 'steemit'];
        
        return { title, body, tags };
    }

    async createBurnPost() {
        try {
            this.logger.info('Generating new burn post...');

            const { title, body, tags } = this.generatePostContent();

            // Create unique permlink
            const permlink = `burn-pool-${Date.now()}`;

            if (this.dryRun) {
                // Simulate posting in dry run mode
                this.logger.info('📝 DRY RUN - Would create post with:');
                this.logger.info(`   Title: ${title}`);
                this.logger.info(`   Permlink: ${permlink}`);
                this.logger.info(`   Tags: ${tags.join(', ')}`);
                this.logger.info(`   Beneficiary: @null (100%)`);
                this.logger.info(`   Body length: ${body.length} characters`);
                
                const postUrl = `https://steemit.com/@${this.config.username || 'TEST_USER'}/${permlink}`;
                this.logger.info(`✅ DRY RUN - Post would appear at: ${postUrl}`);
                this.logger.info(`✅ DRY RUN - Transaction would be broadcast to blockchain`);
                return true;
            }

            // Prepare beneficiaries extension
            // 100% to null account (weight 10000 = 100%)
            const beneficiaries = [
                { account: 'null', weight: 10000 }
            ];

            // Create comment options for beneficiaries
            const commentOptions = {
                author: this.config.username,
                permlink: permlink,
                max_accepted_payout: '1000000.000 SBD',
                percent_steem_dollars: 10000,
                allow_votes: true,
                allow_curation_rewards: true,
                extensions: [
                    [0, {
                        beneficiaries: beneficiaries
                    }]
                ]
            };

            // Prepare the comment operation
            const commentOp = {
                parent_author: '',
                parent_permlink: tags[0],
                author: this.config.username,
                permlink: permlink,
                title: title,
                body: body,
                json_metadata: JSON.stringify({
                    tags: tags,
                    app: 'steem-burn-bot/1.0'
                })
            };

            // Broadcast operations
            const operations = [
                ['comment', commentOp],
                ['comment_options', commentOptions]
            ];

            // Add self-vote if configured
            if (this.config.self_vote) {
                const voteOp = {
                    voter: this.config.username,
                    author: this.config.username,
                    permlink: permlink,
                    weight: 10000
                };
                operations.push(['vote', voteOp]);
            }

            // Broadcast the transaction with retry logic
            let retries = 0;
            const maxRetries = 3;
            
            while (retries < maxRetries) {
                try {
                    const result = await this.client.broadcast.sendOperations(
                        operations,
                        this.privateKey
                    );

                    const postUrl = `https://steemit.com/@${this.config.username}/${permlink}`;
                    this.logger.info(`✅ Successfully created burn post: ${postUrl}`);
                    this.logger.info(`Transaction ID: ${result.id}`);

                    return true;
                } catch (broadcastError) {
                    retries++;
                    this.logger.warning(`Broadcast attempt ${retries}/${maxRetries} failed: ${broadcastError.message}`);
                    
                    if (retries < maxRetries) {
                        // Try switching node
                        const switched = await this.switchNode();
                        if (switched) {
                            this.logger.info(`Retrying with different node...`);
                            await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds
                        } else {
                            throw broadcastError;
                        }
                    } else {
                        throw broadcastError;
                    }
                }
            }

            return false;

        } catch (error) {
            this.logger.error(`❌ Failed to create burn post: ${error.message}`);
            if (error.stack) {
                this.logger.error(`Stack trace: ${error.stack}`);
            }
            return false;
        }
    }

    async job() {
        this.logger.info('='.repeat(60));
        this.logger.info('Starting scheduled burn post creation...');
        const success = await this.createBurnPost();
        if (success) {
            this.logger.info('Burn post job completed successfully');
        } else {
            this.logger.info('Burn post job failed');
        }
        this.logger.info('='.repeat(60));
    }

    async run() {
        this.logger.info('🚀 Steem Burn Pool Bot started!');
        
        // Validate interval
        const intervalHours = this.config.interval_hours || 2;
        if (intervalHours <= 0 || intervalHours > 24) {
            throw new Error(`Invalid interval_hours: ${intervalHours}. Must be between 0 and 24.`);
        }
        
        this.logger.info(`Posting interval: Every ${intervalHours} hours`);
        this.logger.info(`Account: @${this.config.username}`);
        this.logger.info(`Beneficiary: @null (100% burn)`);

        // Create first post immediately if configured
        if (this.config.post_immediately !== false) {
            this.logger.info('Creating initial burn post...');
            await this.job();
        }

        // Schedule posts using setInterval instead of cron for more accurate timing
        const intervalMs = intervalHours * 60 * 60 * 1000;
        
        this.scheduledJob = setInterval(async () => {
            await this.job();
        }, intervalMs);

        this.logger.info(`⏰ Scheduled to post every ${intervalHours} hours`);
        this.logger.info('Bot is now running. Press Ctrl+C to stop.');
        
        // Graceful shutdown handling
        const shutdown = async () => {
            this.logger.info('\n🛑 Shutting down gracefully...');
            
            if (this.scheduledJob) {
                clearInterval(this.scheduledJob);
                this.logger.info('Stopped scheduled jobs');
            }
            
            this.logger.info('Bot stopped');
            
            // Give time for final logs to write
            setTimeout(() => {
                process.exit(0);
            }, 500);
        };
        
        process.on('SIGINT', shutdown);
        process.on('SIGTERM', shutdown);
    }
}

// Main entry point
async function main() {
    try {
        const bot = new SteemBurnBot('config.json');
        await bot.run();
    } catch (error) {
        console.error(`Failed to start bot: ${error.message}`);
        process.exit(1);
    }
}

// Run the bot
main();
