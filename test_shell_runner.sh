#!/bin/bash

echo "=== Test 1 : Commande simple ==="
echo '{"cmd":"echo Hello from shell"}' | python3 claude_runner.py

echo ""
echo "=== Test 2 : Commande avec informations système ==="
echo '{"cmd":"uname -a"}' | python3 claude_runner.py

echo ""
echo "=== Test 3 : Liste fichiers ==="
echo '{"cmd":"ls -la /home/user/prolex-core | head -5"}' | python3 claude_runner.py

echo ""
echo "=== Test 4 : Commande avec timeout court ==="
echo '{"cmd":"sleep 1 && echo Completed", "timeout_seconds":2}' | python3 claude_runner.py

echo ""
echo "=== Test 5 : Timeout dépassé ==="
echo '{"cmd":"sleep 5", "timeout_seconds":1}' | python3 claude_runner.py

echo ""
echo "=== Test 6 : Commande qui échoue ==="
echo '{"cmd":"commandeinexistante"}' | python3 claude_runner.py

echo ""
echo "=== Test 7 : Pipeline complexe ==="
echo '{"cmd":"echo -e \"line1\\nline2\\nline3\" | grep line2"}' | python3 claude_runner.py
