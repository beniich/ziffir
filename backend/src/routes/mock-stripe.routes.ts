import { Router } from 'express';

const router = Router();

// Page HTML qui simule un checkout Stripe réussi
router.get('/checkout', (req, res) => {
  const { session_id, success_url, amount } = req.query;
  res.send(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Sapphire — Paiement test</title>
      <style>
        body { 
          font-family: system-ui, sans-serif; 
          background: #0A0E27; 
          color: #F5E8B8; 
          display: flex; 
          align-items: center; 
          justify-content: center; 
          min-height: 100vh; 
          margin: 0;
        }
        .card {
          background: rgba(255,255,255,0.05);
          backdrop-filter: blur(20px);
          border: 1px solid rgba(212,175,55,0.3);
          border-radius: 16px;
          padding: 40px;
          max-width: 400px;
          text-align: center;
        }
        h1 { color: #D4AF37; margin-bottom: 8px; }
        .amount { font-size: 48px; font-weight: bold; margin: 24px 0; }
        button {
          background: linear-gradient(135deg, #D4AF37, #F5E8B8);
          color: #0A0E27;
          border: none;
          padding: 12px 32px;
          border-radius: 8px;
          font-weight: bold;
          font-size: 16px;
          cursor: pointer;
          margin: 8px;
        }
        button.secondary {
          background: transparent;
          color: #8E96BD;
          border: 1px solid rgba(255,255,255,0.2);
        }
      </style>
    </head>
    <body>
      <div class="card">
        <h1>💳 Paiement test</h1>
        <p style="color: #8E96BD;">Mode MOCK — aucun vrai paiement</p>
        <div class="amount">${(Number(amount) / 100).toFixed(2)}€</div>
        <p style="font-size: 12px; color: #8E96BD;">Session: ${session_id}</p>
        <div>
          <button onclick="window.location.href='${success_url}&payment_status=paid'">
            ✓ Simuler paiement réussi
          </button>
          <br>
          <button class="secondary" onclick="window.location.href='${success_url}&payment_status=failed'">
            ✗ Simuler échec
          </button>
        </div>
      </div>
    </body>
    </html>
  `);
});

export default router;
