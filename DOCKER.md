# 🐳 Docker Deployment Guide

This guide explains how to run the Steem Burn Pool Bot using Docker.

## Prerequisites

- Docker installed on your system

## Quick Start

### 1. Configure the Bot

Edit `config.json` with your Steem credentials:
```json
{
  "username": "your_steem_username",
  "posting_key": "your_posting_key_here",
  "interval_hours": 2,
  ...
}
```

## Docker Commands

## Docker Commands

### 2. Build the Image

```bash
docker build -t steem-burn-bot .
```

### 3. Run the Container

**Windows PowerShell:**
```powershell
docker run -d `
  --name steem-burn-bot `
  --restart unless-stopped `
  -v "${PWD}/config.json:/app/config.json:ro" `
  -v "${PWD}/logs:/app" `
  steem-burn-bot
```

**Linux/Mac:**
```bash
docker run -d \
  --name steem-burn-bot \
  --restart unless-stopped \
  -v "$(pwd)/config.json:/app/config.json:ro" \
  -v "$(pwd)/logs:/app" \
  steem-burn-bot
```

This will:
- Run the container in detached mode (`-d`)
- Name the container `steem-burn-bot`
- Automatically restart if it crashes (`--restart unless-stopped`)
- Mount your config file as read-only
- Store logs in the `./logs` directory on your host

### 4. View Logs

### 4. View Logs

```bash
docker logs -f steem-burn-bot
```

Press `Ctrl+C` to stop viewing logs (container keeps running).

### 5. Stop the Container

```bash
docker stop steem-burn-bot
```

### 6. Start the Container Again

```bash
docker start steem-burn-bot
```

### 7. Restart the Container (after config changes)

```bash
docker restart steem-burn-bot
```

### 8. Remove the Container

```bash
docker stop steem-burn-bot
docker rm steem-burn-bot
```

## Docker Commands Reference

| Command | Description |
|---------|-------------|
| `docker build -t steem-burn-bot .` | Build the Docker image |
| `docker run -d --name steem-burn-bot ...` | Start bot in background |
| `docker start steem-burn-bot` | Start stopped container |
| `docker stop steem-burn-bot` | Stop running container |
| `docker restart steem-burn-bot` | Restart container |
| `docker logs -f steem-burn-bot` | View live logs |
| `docker ps` | List running containers |
| `docker ps -a` | List all containers |
| `docker rm steem-burn-bot` | Remove stopped container |
| `docker rmi steem-burn-bot` | Remove image |

## Volume Mounts

The docker run command mounts two volumes:

1. **config.json** - Read-only mount of your configuration
   - Path: `./config.json:/app/config.json:ro`
   - You can edit this file on the host
   - Restart container to apply changes: `docker restart steem-burn-bot`

2. **logs/** - Directory for log files
   - Path: `./logs:/app`
   - Logs persist even if container is removed
   - Easy access to logs from host system
   - Log file: `./logs/steem_burn_bot.log`

## Environment Variables

You can override settings using environment variables:

```yaml
environment:
  - NODE_ENV=production
  - TZ=America/New_York  # Set your timezone
```

## Updating the Bot

### Rebuild and Restart

```bash
# Stop and remove the old container
docker stop steem-burn-bot
docker rm steem-burn-bot

# Rebuild the image
docker build -t steem-burn-bot .

# Run the new container (use the same run command from step 3)
docker run -d --name steem-burn-bot --restart unless-stopped ...
```

## Troubleshooting

### Check if container is running

```bash
docker ps
```

### View container logs

```bash
docker logs steem-burn-bot
```

### Access container shell

```bash
docker exec -it steem-burn-bot sh
```

### Check container resource usage

```bash
docker stats steem-burn-bot
```

### Container won't start

1. Check logs: `docker logs steem-burn-bot`
2. Verify config.json is valid JSON
3. Ensure posting key is correct
4. Check Docker has internet access

## Production Deployment

### Best Practices

The Docker run command already includes:
- ✅ Automatic restart on failure (`--restart unless-stopped`)
- ✅ Volume mounts for persistence
- ✅ Read-only config for security
- ✅ Proper isolation

### Additional Production Tips

1. **Monitor the container**:
   ```bash
   docker stats steem-burn-bot
   ```

2. **Check container status**:
   ```bash
   docker ps
   ```

3. **Backup your config**:
   ```bash
   cp config.json config.backup.json
   ```

4. **View resource usage**:
   ```bash
   docker inspect steem-burn-bot
   ```

## Security Notes

- ⚠️ Never commit `config.json` with real credentials
- ⚠️ The config file is mounted read-only for security
- ✅ Container runs with minimal privileges
- ✅ Alpine Linux base image for smaller attack surface

## Resources

- Docker Documentation: https://docs.docker.com/
- Alpine Linux: https://alpinelinux.org/

---

**Need Help?** Check the logs first:
```bash
docker logs -f steem-burn-bot
```
