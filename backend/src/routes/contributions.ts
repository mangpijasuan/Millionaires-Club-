import { Router } from 'express';
import pool from '../config/database';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
router.use(authenticate);

// Get all contributions
router.get('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const result = await pool.query(`
      SELECT c.*, m.name as member_name
      FROM yearly_contributions c
      LEFT JOIN members m ON c.member_id = m.id
      ORDER BY c.year DESC, m.name
    `);
    res.json({ contributions: result.rows });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to get contributions' });
  }
});

// Create/Update contribution
router.post('/', requireAdmin, async (req: AuthRequest, res) => {
  try {
    const { member_id, year, amount, paid, paid_date } = req.body;
    
    const result = await pool.query(
      `INSERT INTO yearly_contributions (member_id, year, amount, paid, paid_date)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (member_id, year) 
       DO UPDATE SET amount = $3, paid = $4, paid_date = $5
       RETURNING *`,
      [member_id, year, amount, paid || false, paid_date]
    );

    res.status(201).json({ contribution: result.rows[0] });
  } catch (error: any) {
    res.status(500).json({ error: 'Failed to save contribution' });
  }
});

export default router;
