# 🔥 Steem Burn Pool Posting Bot

An automated Node.js bot that creates posts on the Steem blockchain every 2 hours with 100% of rewards directed to the `@null` account, effectively burning STEEM to reduce supply and combat inflation.

Built with **dsteem** library for reliable blockchain operations.

## Features

- Automated posting every 2 hours (configurable)
- 100% beneficiary rewards to @null account (burn mechanism)
- Comprehensive logging to file and console
- Customizable post content and tags
- Multiple Steem node support for reliability
- Easy configuration via JSON file
- Error handling and recovery
- Uses dsteem for efficient blockchain operations

## Requirements

- Node.js 14.0 or higher
- npm (Node Package Manager)
- Steem account with posting key
- Internet connection

## Installation

### Option 1: Docker (Recommended for Production)

The easiest way to run the bot is using Docker:

```bash
# 1. Build the image
docker build -t steem-burn-bot .

# 2. Run the container
docker run -d --name steem-burn-bot --restart unless-stopped \
  -v "$(pwd)/config.json:/app/config.json:ro" \
  -v "$(pwd)/logs:/app" \
  steem-burn-bot

# 3. View logs
docker logs -f steem-burn-bot
```

**Windows PowerShell:**
```powershell
docker run -d --name steem-burn-bot --restart unless-stopped `
  -v "${PWD}/config.json:/app/config.json:ro" `
  -v "${PWD}/logs:/app" `
  steem-burn-bot
```

See [DOCKER.md](DOCKER.md) for complete Docker deployment guide.

### Option 2: Direct Node.js Installation

### 1. Clone or Download

Download this bot to your local machine.

### 2. Install Node.js

If you don't have Node.js installed:
- Download from [nodejs.org](https://nodejs.org/)
- Install version 14.0 or higher

### 3. Install Dependencies

```bash
npm install
```

This will install:
- `dsteem` - JavaScript library for Steem blockchain interaction
- `node-schedule` - Job scheduling library

### 4. Configure the Bot

Edit the `config.json` file with your details:

```json
{
  "username": "your_steem_username",
  "posting_key": "your_posting_key_here",
  "interval_hours": 2,
  "post_immediately": true,
  "self_vote": false,
  "tags": ["burnpost", "steem", "burn", "null", "steemit"],
  "nodes": [
    "https://api.steemit.com",
    "https://api.steem.fans",
    "https://api.steemitdev.com"
  ]
}
```

#### Configuration Options:

| Option | Description | Default |
|--------|-------------|---------|
| `username` | Your Steem account username | **Required** |
| `posting_key` | Your posting private key (starts with 5...) | **Required** |
| `interval_hours` | Hours between posts | `2` |
| `post_immediately` | Create first post on startup | `true` |
| `self_vote` | Upvote your own posts | `false` |
| `tags` | Array of tags for posts | `["burnpost", "steem", "burn", "null", "steemit"]` |
| `nodes` | List of Steem API nodes | Default nodes provided |

### 5. Get Your Posting Key

**IMPORTANT**: Never share your private keys with anyone!

To get your posting key:
1. Log into your Steem account on Steemit.com
2. Go to Wallet → Permissions
3. Click "Show Private Key" next to Posting
4. Enter your password
5. Copy the private posting key (starts with `5...`)

## Running the Bot

### Start the Bot

```bash
node steem_burn_bot.js
```

Or using npm:

```bash
npm start
```

### What Happens:

1. Bot connects to Steem blockchain
2. Creates initial post (if `post_immediately` is true)
3. Schedules posts every 2 hours (or your configured interval)
4. Runs continuously until stopped

### Stop the Bot

Press `Ctrl+C` to stop the bot gracefully.

## Logging

All activity is logged to:
- **Console** - Real-time output
- **steem_burn_bot.log** - Persistent log file

Example log output:
```
2025-11-05 10:00:00 - INFO - Connected to Steem blockchain as username
2025-11-05 10:00:05 - INFO - ✅ Successfully created burn post: https://steemit.com/@username/burn-pool-1234567890
2025-11-05 10:00:05 - INFO - ⏰ Scheduled to post every 2 hours
```

## How Burning Works

When you set the beneficiary to `@null`:
- The @null account is a special account on Steem
- Any rewards sent to @null are **permanently removed** from circulation
- This reduces the overall STEEM supply
- Benefits all STEEM holders by reducing inflation

The bot sets 100% of post rewards as beneficiary to @null (weight: 10000 = 100%).

## Customizing Post Content

To customize what your bot posts, edit the `generatePostContent()` method in `steem_burn_bot.js`:

```javascript
generatePostContent() {
    const title = "Your Custom Title";
    const body = `
    Your custom post content here...
    `;
    const tags = ["tag1", "tag2", "tag3"];
    return { title, body, tags };
}
```

## Troubleshooting

### "Failed to connect to Steem"
- Check your internet connection
- Try different nodes in the config
- Verify your posting key is correct

### "Invalid posting key"
- Make sure you're using the **posting** key, not master/active key
- Key should start with `5`
- No spaces before/after the key

### "Account not found"
- Verify your username is correct
- Username is case-sensitive

### Posts not appearing
- Wait a few minutes for blockchain confirmation
- Check your account on steemit.com
- Review logs for error messages

## Advanced Usage

### Running as a Background Service (Windows)

Create a batch file `start_bot.bat`:
```batch
@echo off
node steem_burn_bot.js
pause
```

### Running on Linux/Mac with PM2 (Recommended)

```bash
# Install PM2
npm install -g pm2

# Start bot with PM2
pm2 start steem_burn_bot.js --name steem-burn-bot

# View logs
pm2 logs steem-burn-bot

# Stop bot
pm2 stop steem-burn-bot
```

### Using nohup (Linux/Mac)

```bash
nohup node steem_burn_bot.js &
```

## File Structure

```
Burn Pool Posting Bot/
├── steem_burn_bot.js          # Main bot script (Node.js)
├── package.json               # Node.js project configuration
├── package-lock.json          # Dependency lock file
├── node_modules/              # Installed dependencies
├── config.json                # Your configuration (keep private!)
├── config.example.json        # Example configuration
├── README.md                  # This file
└── steem_burn_bot.log         # Log file (created when bot runs)
```

## Security Notes

- **Never commit `config.json` with real credentials to version control**
- Keep your posting key private
- Use only the posting key, never your master or active key
- The posting key can only create posts/comments, not transfer funds

## Contributing to the Burn Pool

By running this bot, you're contributing to:
- Reducing STEEM inflation
- Decreasing circulating supply
- Supporting the STEEM ecosystem
- Setting an example for deflationary initiatives

## License

This project is open source and available for anyone to use or modify.

## Support

If you encounter issues:
1. Check the log file for detailed error messages
2. Verify your configuration
3. Ensure you have the latest version of dependencies
4. Test your posting key manually on steemit.com

## Credits

Built with:
- [dsteem](https://github.com/steemit/dsteem) - JavaScript Steem library
- [node-schedule](https://github.com/node-schedule/node-schedule) - Node.js job scheduling

---

**Happy Burning! 🔥**

*Remember: Every burn makes STEEM more scarce!*
# Steem-Burn-Bot
