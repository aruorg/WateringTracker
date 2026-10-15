import { Router } from 'express';
import { requireGuest } from './requireGuest.js';
import { isUuid, validatePlant } from './validation.js';

const COLUMNS = 'id, user_id, plant, days_between_watering, last_watered_at, created_at';

const router = Router();

router.use(requireGuest);

router.get('/', async (req, res) => {
  const { data, error } = await req.db
    .from('plants')
    .select(COLUMNS)
    .eq('user_id', req.user.id)
    .order('created_at', { ascending: false });

  if (error) throw error;

  res.status(200).json(data);
});

router.post('/', async (req, res) => {
  const { values, error: validationError } = validatePlant(req.body);

  if (validationError) {
    return res.status(400).json({ error: validationError });
  }

  // Build the row explicitly; never spread req.body into the database.
  const row = {
    plant: values.plant,
    days_between_watering: values.days_between_watering,
    last_watered_at: new Date().toISOString(),
    user_id: req.user.id,
  };

  const { data, error } = await req.db.from('plants').insert(row).select(COLUMNS).single();

  if (error) throw error;

  res.status(201).json(data);
});

// Mark a plant as watered right now.
router.patch('/:id/water', async (req, res) => {
  const { id } = req.params;

  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  const { data, error } = await req.db
    .from('plants')
    .update({ last_watered_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select(COLUMNS);

  if (error) throw error;

  if (data.length === 0) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  res.status(200).json(data[0]);
});

router.delete('/:id', async (req, res) => {
  const { id } = req.params;

  // A malformed id can't match any row, so treat it the same as a missing one.
  if (!isUuid(id)) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  const { data, error } = await req.db
    .from('plants')
    .delete()
    .eq('id', id)
    .eq('user_id', req.user.id)
    .select('id');

  if (error) throw error;

  if (data.length === 0) {
    return res.status(404).json({ error: 'Plant not found' });
  }

  res.status(204).end();
});

export default router;