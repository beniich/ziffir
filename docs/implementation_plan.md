# POS Tactile Frontend & Advanced Analytics Implementation Plan

## Goal Description
Create a mobile‑friendly POS (Point‑of‑Sale) interface for restaurant staff, enable real‑time order submission to the kitchen, support split‑bill/payment features, and build advanced analytics dashboards for stock forecasting and dish profitability. The solution will integrate with the existing backend services (order, inventory, suite) already implemented in the `backend` folder.

## User Review Required
> [!IMPORTANT]
> The POS will be built using **React** and **Mantine UI** library. Confirm that these technologies are acceptable, or specify an alternative framework.
>
> The analytics dashboards will be added under `frontend/src/pages/analytics`. Confirm the desired placement and any branding guidelines (colors, fonts, logo).

## Open Questions
> [!WARNING]
> - Should the POS support **offline mode** with local storage sync when connectivity is restored?
> - What **payment providers** should be integrated (Stripe, PayPal, custom)? Provide API keys or mock details.
> - Do you require **role‑based access** (server, manager, admin) on the POS UI?
>
> (Recommended) Use role‑based access to hide admin features.

## Proposed Changes
### Frontend Structure
- **[NEW]** `frontend/src/components/pos/OrderForm.tsx`
  - Mobile‑optimized form to create an order (select table, items, quantities).
  - Uses Mantine `MultiSelect` for menu items fetched from `/api/restaurant/menu`.
  - Emits order via WebSocket to backend for real‑time kitchen updates.
- **[NEW]** `frontend/src/components/pos/OrderList.tsx`
  - Live list of pending orders with status (preparing, ready).
  - Subscribes to WebSocket `orderUpdates` channel.
- **[NEW]** `frontend/src/components/pos/SplitBillModal.tsx`
  - UI to split an order among guests, select payment method per split.
  - Calculates proportional totals, taxes, and service fees.
- **[NEW]** `frontend/src/pages/pos.tsx`
  - Page that assembles the above components into the main POS screen.
  - Includes navigation drawer to switch between POS, Dashboard, Settings.
- **[NEW]** `frontend/src/hooks/useWebSocket.ts`
  - Custom hook wrapping native WebSocket with reconnection logic.
- **[NEW]** `frontend/src/pages/analytics/StockForecast.tsx`
  - Dashboard visualising moving‑average forecast of inventory items.
  - Pulls data from new backend endpoint `/api/inventory/forecast`.
- **[NEW]** `frontend/src/pages/analytics/Profitability.tsx`
  - Shows top‑selling dishes, gross margin per dish, and trends.
  - Data sourced from `/api/analytics/dish-profitability`.

### Backend Additions
- **[NEW]** `backend/src/routes/websocket.ts`
  - Sets up a WebSocket server using the `ws` library.
  - Broadcasts order creation events to connected POS clients.
- **[MODIFY]** `backend/src/app.ts`
  - Register the WebSocket route and enable CORS for the POS origin.
- **[NEW]** `backend/src/controllers/analytics.controller.ts`
  - `GET /api/analytics/dish-profitability` – aggregates order data, calculates revenue, cost (from inventory deductions), and margin.
  - `GET /api/inventory/forecast` – computes simple moving average (last 7 days) for each SKU.
- **[NEW]** `backend/src/services/analytics.service.ts`
  - Implements the aggregation logic using Prisma queries and raw SQL for performance.
- **[NEW]** `backend/src/services/websocket.service.ts`
  - Helper to emit events to all connected clients.
- **[MODIFY]** `backend/src/services/order.service.ts`
  - After successful transaction, call `WebSocketService.emit('orderCreated', order)`.

## Verification Plan
### Automated Tests
- `npm run test` (Jest) will execute existing backend tests plus new:
  - `analytics.service.test.ts` – unit tests for aggregation and forecast calculations.
  - `websocket.service.test.ts` – integration test for broadcast via WebSocket.
- Frontend component tests with React Testing Library for `OrderForm` and `SplitBillModal`.

### Manual Verification
1. Run the app locally (`npm run dev` in both `frontend` and `backend`).
2. Open the POS page on a mobile device, place an order, verify the kitchen view (console log or simple UI) receives the order instantly.
3. Use the split‑bill UI to divide a $120 order among 3 guests; ensure totals sum correctly and payment methods appear.
4. Navigate to **Analytics > Stock Forecast**; confirm the chart displays recent data.
5. Verify **Profitability** chart lists dishes with correct margins.

All file paths are relative to the repository root (`c:/Users/pc gold/projet dash/motelix`).
