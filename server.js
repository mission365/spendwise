import express from 'express';
import cors from 'cors';
import mysql from 'mysql2/promise';

const app = express();
const PORT = process.env.PORT || 4000;

app.use(cors());
app.use(express.json());

// Update these values if your XAMPP MySQL setup uses a password or different port
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'spendwise',
  port: Number(process.env.DB_PORT) || 3306,
});

// Simple health check
app.get('/health', async (_req, res) => {
  try {
    const conn = await pool.getConnection();
    await conn.ping();
    conn.release();
    res.json({ status: 'ok' });
  } catch (err) {
    console.error('Health check failed:', err);
    res.status(500).json({ status: 'error' });
  }
});

// Get all expenses
app.get('/expenses', async (_req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT id, description, amount, category, date FROM expenses ORDER BY date DESC, created_at DESC'
    );
    res.json(rows);
  } catch (err) {
    console.error('Error fetching expenses:', err);
    res.status(500).json({ message: 'Failed to fetch expenses' });
  }
});

// Create expense
app.post('/expenses', async (req, res) => {
  const { description, amount, category, date } = req.body;

  if (!description || !amount || !category || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const id = crypto.randomUUID();
    await pool.query(
      'INSERT INTO expenses (id, description, amount, category, date) VALUES (?, ?, ?, ?, ?)',
      [id, description, amount, category, date]
    );

    res.status(201).json({ id, description, amount, category, date });
  } catch (err) {
    console.error('Error creating expense:', err);
    res.status(500).json({ message: 'Failed to create expense' });
  }
});

// Update expense
app.put('/expenses/:id', async (req, res) => {
  const { id } = req.params;
  const { description, amount, category, date } = req.body;

  if (!description || !amount || !category || !date) {
    return res.status(400).json({ message: 'Missing required fields' });
  }

  try {
    const [result] = await pool.query(
      'UPDATE expenses SET description = ?, amount = ?, category = ?, date = ? WHERE id = ?',
      [description, amount, category, date, id]
    );

    // @ts-ignore mysql2 returns RowDataPacket[] | OkPacket
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.json({ id, description, amount, category, date });
  } catch (err) {
    console.error('Error updating expense:', err);
    res.status(500).json({ message: 'Failed to update expense' });
  }
});

// Delete expense
app.delete('/expenses/:id', async (req, res) => {
  const { id } = req.params;

  try {
    const [result] = await pool.query('DELETE FROM expenses WHERE id = ?', [id]);

    // @ts-ignore mysql2 returns RowDataPacket[] | OkPacket
    if (result.affectedRows === 0) {
      return res.status(404).json({ message: 'Expense not found' });
    }

    res.status(204).send();
  } catch (err) {
    console.error('Error deleting expense:', err);
    res.status(500).json({ message: 'Failed to delete expense' });
  }
});

app.listen(PORT, () => {
  console.log(`API server listening on http://localhost:${PORT}`);
});


