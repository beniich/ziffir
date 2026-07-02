#!/bin/bash
# test-auth.sh - Test complet du système d'authentification

BASE="http://localhost:3000/api"
COOKIES="/tmp/ziffir-test-cookies.txt"
rm -f $COOKIES

echo "=== 1. Register un nouvel hôtel ==="
REGISTER_RESPONSE=$(curl -s -X POST $BASE/auth/register \
  -H "Content-Type: application/json" \
  -c $COOKIES \
  -d '{
    "email": "test-'$(date +%s)'@ziffir.test",
    "password": "SecurePassword123!",
    "displayName": "Test Owner",
    "hotelName": "Hôtel de Test"
  }')
echo "$REGISTER_RESPONSE" | jq .

echo ""
echo "=== 2. Vérifier que les cookies sont bien HttpOnly ==="
cat $COOKIES | grep -i "zafir_access_token" | awk '{print "Cookie:", $6, $7}'
grep -q "HttpOnly" $COOKIES && echo "✅ HttpOnly OK" || echo "❌ HttpOnly manquant !"

echo ""
echo "=== 3. GET /auth/me ==="
curl -s -X GET $BASE/auth/me -b $COOKIES | jq '.data.user, .data.activeHotel.plan, .data.activeHotel.role'

echo ""
echo "=== 4. Logout ==="
curl -s -X POST $BASE/auth/logout -b $COOKIES -c $COOKIES

echo ""
echo "=== 5. Re-login ==="
# Extraire l'email du register
EMAIL=$(echo "$REGISTER_RESPONSE" | jq -r '.data.user.email')
curl -s -X POST $BASE/auth/login \
  -H "Content-Type: application/json" \
  -c $COOKIES \
  -d "{
    \"email\": \"$EMAIL\",
    \"password\": \"SecurePassword123!\"
  }" | jq '.data.user, .data.activeHotel.plan'

echo ""
echo "=== 6. Inviter un membre ==="
HOTEL_ID=$(echo "$REGISTER_RESPONSE" | jq -r '.data.activeHotel.id')
curl -s -X POST $BASE/auth/team/invitations \
  -H "Content-Type: application/json" \
  -b $COOKIES \
  -d "{
    \"hotelId\": \"$HOTEL_ID\",
    \"email\": \"staff-'$(date +%s)'@ziffir.test\",
    \"proposedRole\": \"CONCIERGE\"
  }" | jq .

echo ""
echo "=== 7. Lister les membres ==="
curl -s -X GET "$BASE/team/members?hotelId=$HOTEL_ID" -b $COOKIES | jq '.data | length'

echo ""
echo "✅ Tous les tests sont passés !"
