import { runQuery, getDatabase } from '../models/database.js';

export const auditMiddleware = async (req, res, next) => {
  // Log successful requests after they complete
  const originalSend = res.send;
  res.send = function(data) {
    // Only log mutations (POST, PUT, DELETE)
    if (['POST', 'PUT', 'DELETE'].includes(req.method) && req.user && res.statusCode < 400) {
      logAuditAction(req, res, data);
    }
    originalSend.call(this, data);
  };

  next();
};

const logAuditAction = async (req, res, responseData) => {
  try {
    const { method, path, user, body } = req;
    const entityType = path.split('/')[2]; // Extract entity type from URL
    const entityId = path.split('/')[3] || null;

    let action = 'view';
    if (method === 'POST') action = 'create';
    if (method === 'PUT') action = 'update';
    if (method === 'DELETE') action = 'delete';

    await runQuery(
      `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, new_value, description, ip_address, user_agent)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        user?.id || null,
        action,
        entityType,
        entityId,
        JSON.stringify(body),
        `${method} ${path}`,
        req.ip || req.connection.remoteAddress,
        req.get('user-agent')
      ]
    );
  } catch (error) {
    console.error('Audit log error:', error);
    // Don't throw - audit failure shouldn't break the request
  }
};
