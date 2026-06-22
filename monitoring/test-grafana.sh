#!/bin/bash
set -e

echo "🧪 Test de l'infrastructure Grafana..."

# 1. Vérifier que Prometheus fonctionne
echo "1. Test Prometheus..."
curl -sf http://localhost:9090/-/healthy > /dev/null && echo "   ✅ Prometheus UP" || echo "   ❌ Prometheus DOWN"

# 2. Vérifier que Grafana fonctionne
echo "2. Test Grafana..."
curl -sf http://localhost:3001/api/health > /dev/null && echo "   ✅ Grafana UP" || echo "   ❌ Grafana DOWN"

# 3. Vérifier les datasources
echo "3. Test datasources..."
DATASOURCES=$(curl -sf -u admin:zaphir2024 http://localhost:3001/api/datasources | jq length)
echo "   Datasources configurés: $DATASOURCES"

# 4. Vérifier les dashboards
echo "4. Test dashboards..."
DASHBOARDS=$(curl -sf -u admin:zaphir2024 "http://localhost:3001/api/search?query=" | jq length)
echo "   Dashboards disponibles: $DASHBOARDS"

# 5. Vérifier qu'il y a des métriques
echo "5. Test métriques..."
METRICS=$(curl -sf http://localhost:9090/api/v1/query?query=up | jq '.data.result | length')
echo "   Targets actifs: $METRICS"

echo ""
echo "🌐 URLs importantes :"
echo "   - Grafana:    http://localhost:3001 (admin/zaphir2024)"
echo "   - Prometheus: http://localhost:9090"
echo "   - Tempo:      http://localhost:3200"
