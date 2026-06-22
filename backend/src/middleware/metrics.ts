import { Request, Response, NextFunction } from 'express';
import { httpRequestsTotal, httpRequestDurationSeconds } from '../utils/metrics';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime();

  res.on('finish', () => {
    const diff = process.hrtime(start);
    const duration = diff[0] + diff[1] / 1e9;
    
    // Simplifie la route pour éviter le cardinalité excessive (ex: /api/room-service/orders/123 -> /api/room-service/orders/:id)
    let route = req.baseUrl + req.path;
    if (req.route && req.route.path) {
      route = req.baseUrl + req.route.path;
    }

    const labels = {
      method: req.method,
      route: route || req.path,
      status: res.statusCode.toString(),
    };

    httpRequestsTotal.inc(labels);
    httpRequestDurationSeconds.observe(labels, duration);
  });

  next();
}
