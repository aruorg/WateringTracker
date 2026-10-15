import { useEffect, useState } from 'react'
import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Container,
  IconButton,
  LinearProgress,
  Stack,
  SvgIcon,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material'
import { ensureGuestSession } from './supabase.js'
import { createPlant, deletePlant, getPlants, waterPlant } from './api.js'
import { PLANT_NAME_MAX, WATER_DAYS_MAX, WATER_DAYS_MIN, validatePlant } from './validation.js'

const emptyForm = { plant: '', days_between_watering: '' }
const DAY_MS = 86400000

function LeafIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66.95-2.3c.48.17.98.3 1.34.3C19 20 22 3 22 3c-1 2-8 2.25-13 3.25S2 11.5 2 13.5s1.75 3.75 1.75 3.75C7 8 17 8 17 8z" />
    </SvgIcon>
  )
}

function DropIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M12 2c-5.33 4.55-8 8.48-8 11.8 0 4.98 3.8 8.2 8 8.2s8-3.22 8-8.2c0-3.32-2.67-7.25-8-11.8z" />
    </SvgIcon>
  )
}

function DeleteIcon(props) {
  return (
    <SvgIcon {...props}>
      <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" />
    </SvgIcon>
  )
}

// Whole calendar days until the plant is due (negative = overdue).
function daysUntilDue(plant) {
  const due = new Date(plant.last_watered_at)
  due.setDate(due.getDate() + plant.days_between_watering)
  due.setHours(0, 0, 0, 0)

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return Math.round((due - today) / DAY_MS)
}

function dueStatus(plant) {
  const days = daysUntilDue(plant)
  if (days < 0) {
    const n = Math.abs(days)
    return { text: `Overdue by ${n} ${n === 1 ? 'day' : 'days'}`, color: 'error' }
  }
  if (days === 0) return { text: 'Water today', color: 'warning' }
  if (days === 1) return { text: 'Water tomorrow', color: 'success' }
  return { text: `Water in ${days} days`, color: 'success' }
}

// How much of the watering interval is left, as a 0–100 "water level".
function waterLevel(plant) {
  const elapsed = (Date.now() - new Date(plant.last_watered_at)) / (plant.days_between_watering * DAY_MS)
  return Math.round(Math.min(Math.max(1 - elapsed, 0), 1) * 100)
}

function Header({ plants }) {
  const thirsty = plants.filter((plant) => daysUntilDue(plant) <= 0).length

  let summary = 'Add your first plant to get started.'
  if (plants.length > 0) {
    const count = `${plants.length} ${plants.length === 1 ? 'plant' : 'plants'}`
    summary = thirsty > 0 ? `${count} · ${thirsty} thirsty today` : `${count} · all happily watered`
  }

  return (
    <Box
      component="header"
      sx={{
        color: 'primary.contrastText',
        background: 'linear-gradient(135deg, #1b5e36 0%, #2e7d4f 55%, #5fae7c 100%)',
        borderBottomLeftRadius: { xs: 24, sm: 40 },
        borderBottomRightRadius: { xs: 24, sm: 40 },
        pt: { xs: 4, sm: 6 },
        pb: { xs: 9, sm: 10 },
      }}
    >
      <Container maxWidth="sm">
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: 'rgba(255,255,255,0.18)', width: 56, height: 56 }}>
            <LeafIcon sx={{ fontSize: 32, color: '#d9f2c4' }} />
          </Avatar>
          <Box>
            <Typography variant="h4" component="h1">
              Watering Tracker
            </Typography>
            <Typography sx={{ opacity: 0.85 }}>{summary}</Typography>
          </Box>
        </Stack>
      </Container>
    </Box>
  )
}

function PlantCard({ plant, watering, deleting, onWater, onDelete }) {
  const status = dueStatus(plant)
  const busy = watering || deleting

  return (
    <Card
      sx={{
        transition: 'box-shadow 0.2s, transform 0.2s',
        '&:hover': { boxShadow: '0 6px 20px rgba(27, 94, 54, 0.12)', transform: 'translateY(-1px)' },
      }}
    >
      <CardContent sx={{ '&:last-child': { pb: 2 } }}>
        <Stack direction="row" spacing={2} sx={{ alignItems: 'center' }}>
          <Avatar sx={{ bgcolor: '#e3f1dc', color: 'primary.dark', fontWeight: 800 }}>
            {plant.plant.charAt(0).toUpperCase()}
          </Avatar>
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <Typography variant="h6" noWrap>
              {plant.plant}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Every {plant.days_between_watering} {plant.days_between_watering === 1 ? 'day' : 'days'} ·
              last watered {new Date(plant.last_watered_at).toLocaleDateString()}
            </Typography>
          </Box>
          <Chip label={status.text} color={status.color} size="small" variant={status.color === 'success' ? 'outlined' : 'filled'} />
        </Stack>

        <Stack direction="row" spacing={1.5} sx={{ alignItems: 'center', mt: 2 }}>
          <DropIcon fontSize="small" sx={{ color: `${status.color}.main` }} />
          <LinearProgress
            variant="determinate"
            value={waterLevel(plant)}
            color={status.color}
            sx={{ flexGrow: 1 }}
            aria-label={`Water level for ${plant.plant}`}
          />
          <Button
            variant="contained"
            size="small"
            startIcon={<DropIcon />}
            onClick={onWater}
            disabled={busy}
          >
            {watering ? 'Saving…' : 'Watered'}
          </Button>
          <Tooltip title="Delete plant">
            <span>
              <IconButton
                aria-label={`Delete ${plant.plant}`}
                onClick={onDelete}
                disabled={busy}
                size="small"
                sx={{ color: 'text.secondary', '&:hover': { color: 'error.main' } }}
              >
                {deleting ? <CircularProgress size={18} /> : <DeleteIcon fontSize="small" />}
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </CardContent>
    </Card>
  )
}

function App() {
  const [sessionReady, setSessionReady] = useState(false)
  const [sessionError, setSessionError] = useState('')

  const [plants, setPlants] = useState([])
  const [loadingPlants, setLoadingPlants] = useState(false)
  const [listError, setListError] = useState('')

  const [form, setForm] = useState(emptyForm)
  const [fieldErrors, setFieldErrors] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState('')

  const [deletingId, setDeletingId] = useState(null)
  const [wateringId, setWateringId] = useState(null)

  useEffect(() => {
    ensureGuestSession()
      .then(() => setSessionReady(true))
      .catch((error) => setSessionError(error.message || 'Could not start guest session'))
  }, [])

  useEffect(() => {
    if (sessionReady) loadPlants()
  }, [sessionReady])

  async function loadPlants() {
    setLoadingPlants(true)
    setListError('')
    try {
      setPlants(await getPlants())
    } catch (error) {
      setListError(error.message)
    } finally {
      setLoadingPlants(false)
    }
  }

  function handleChange(event) {
    const { name, value } = event.target
    setForm((prev) => ({ ...prev, [name]: value }))
    setFieldErrors((prev) => ({ ...prev, [name]: undefined }))
  }

  async function handleSubmit(event) {
    event.preventDefault()
    setSubmitError('')

    const { values, errors } = validatePlant(form)
    setFieldErrors(errors)
    if (Object.keys(errors).length > 0) return

    setSubmitting(true)
    try {
      const created = await createPlant(values)
      setPlants((prev) => [created, ...prev])
      setForm(emptyForm)
    } catch (error) {
      setSubmitError(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleWater(id) {
    setWateringId(id)
    setListError('')
    try {
      const updated = await waterPlant(id)
      setPlants((prev) => prev.map((plant) => (plant.id === id ? updated : plant)))
    } catch (error) {
      setListError(error.message)
    } finally {
      setWateringId(null)
    }
  }

  async function handleDelete(id) {
    setDeletingId(id)
    setListError('')
    try {
      await deletePlant(id)
      setPlants((prev) => prev.filter((plant) => plant.id !== id))
    } catch (error) {
      setListError(error.message)
    } finally {
      setDeletingId(null)
    }
  }

  if (sessionError) {
    return (
      <Container maxWidth="sm" sx={{ py: 4 }}>
        <Alert severity="error">Could not start guest session: {sessionError}</Alert>
      </Container>
    )
  }

  if (!sessionReady) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
        <Stack spacing={2} sx={{ alignItems: 'center' }}>
          <CircularProgress />
          <Typography color="text.secondary">Starting guest session…</Typography>
        </Stack>
      </Box>
    )
  }

  return (
    <Box sx={{ minHeight: '100vh', pb: 6 }}>
      <Header plants={plants} />

      <Container maxWidth="sm" sx={{ mt: { xs: -6, sm: -7 } }}>
        <Card
          component="form"
          onSubmit={handleSubmit}
          noValidate
          sx={{ mb: 4, boxShadow: '0 10px 30px rgba(27, 94, 54, 0.15)', border: 'none' }}
        >
          <CardContent sx={{ p: 3, '&:last-child': { pb: 3 } }}>
            <Typography variant="h6" gutterBottom>
              Add a plant
            </Typography>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} sx={{ alignItems: { sm: 'flex-start' } }}>
              <TextField
                label="Plant name"
                name="plant"
                value={form.plant}
                onChange={handleChange}
                error={Boolean(fieldErrors.plant)}
                helperText={fieldErrors.plant}
                slotProps={{ htmlInput: { maxLength: PLANT_NAME_MAX } }}
                required
                fullWidth
              />
              <TextField
                label="Every (days)"
                name="days_between_watering"
                type="number"
                value={form.days_between_watering}
                onChange={handleChange}
                error={Boolean(fieldErrors.days_between_watering)}
                helperText={fieldErrors.days_between_watering}
                slotProps={{ htmlInput: { min: WATER_DAYS_MIN, max: WATER_DAYS_MAX, step: 1 } }}
                required
                sx={{ width: { xs: '100%', sm: 160 }, flexShrink: 0 }}
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={submitting}
                startIcon={<LeafIcon />}
                sx={{ flexShrink: 0, height: 56 }}
              >
                {submitting ? 'Adding…' : 'Add'}
              </Button>
            </Stack>
            {submitError && (
              <Alert severity="error" sx={{ mt: 2 }}>
                {submitError}
              </Alert>
            )}
          </CardContent>
        </Card>

        <Typography variant="h5" component="h2" sx={{ mb: 2 }}>
          My plants
        </Typography>

        {listError && (
          <Alert
            severity="error"
            sx={{ mb: 2 }}
            action={<Button color="inherit" size="small" onClick={loadPlants}>Retry</Button>}
          >
            {listError}
          </Alert>
        )}

        {loadingPlants ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : plants.length === 0 && !listError ? (
          <Card sx={{ textAlign: 'center', py: 5, px: 3, borderStyle: 'dashed', bgcolor: 'transparent' }}>
            <LeafIcon sx={{ fontSize: 48, color: 'primary.light' }} />
            <Typography variant="h6" sx={{ mt: 1 }}>
              No plants yet
            </Typography>
            <Typography color="text.secondary">Add your first one above and we'll keep track of watering.</Typography>
          </Card>
        ) : (
          <Stack spacing={2}>
            {plants.map((plant) => (
              <PlantCard
                key={plant.id}
                plant={plant}
                watering={wateringId === plant.id}
                deleting={deletingId === plant.id}
                onWater={() => handleWater(plant.id)}
                onDelete={() => handleDelete(plant.id)}
              />
            ))}
          </Stack>
        )}
      </Container>
    </Box>
  )
}

export default App
