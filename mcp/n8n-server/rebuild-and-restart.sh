#!/bin/bash
cd /opt/Prolex/mcp/n8n-server
git pull origin main
npm ci --only=production
npm run build
pm2 restart mcp-n8n-server --update-env
pm2 save
curl -f http://localhost:5678/health && echo "MCP OK" || echo "MCP down"
echo "Rebuild réussi le $(date) par Opex autonome" > LAST_SUCCESSFUL_REBUILD.txt
