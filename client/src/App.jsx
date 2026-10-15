import { useEffect, useState } from 'react'
import {
  Alert,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CircularProgress,
  Container,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { ensureGuestSession } from './supabase.js'
import { createPlant, deletePlant, getPlants } from './api.js'
import { PLANT_NAME_MAX, WATER_DAYS_MAX, WATER_DAYS_MIN, validatePlant } from './validation.js'

const emptyForm = { plant_name: '', water_every_days: '' }

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
      <Container maxWidth="sm" sx={{ py: 4, textAlign: 'center' }}>
        <CircularProgress />
        <Typography sx={{ mt: 2 }}>Starting guest session…</Typography>
      </Container>
    )
  }

  return (
    <Container maxWidth="sm" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Watering Tracker
      </Typography>

      <Card component="form" onSubmit={handleSubmit} noValidate sx={{ mb: 4 }}>
        <CardContent>
          <Stack spacing={2}>
            <TextField
              label="Plant name"
              name="plant_name"
              value={form.plant_name}
              onChange={handleChange}
              error={Boolean(fieldErrors.plant_name)}
              helperText={fieldErrors.plant_name}
              slotProps={{ htmlInput: { maxLength: PLANT_NAME_MAX } }}
              required
              fullWidth
            />
            <TextField
              label="Water every (days)"
              name="water_every_days"
              type="number"
              value={form.water_every_days}
              onChange={handleChange}
              error={Boolean(fieldErrors.water_every_days)}
              helperText={fieldErrors.water_every_days}
              slotProps={{ htmlInput: { min: WATER_DAYS_MIN, max: WATER_DAYS_MAX, step: 1 } }}
              required
              fullWidth
            />
            {submitError && <Alert severity="error">{submitError}</Alert>}
          </Stack>
        </CardContent>
        <CardActions sx={{ px: 2, pb: 2 }}>
          <Button type="submit" variant="contained" disabled={submitting}>
            {submitting ? 'Adding…' : 'Add plant'}
          </Button>
        </CardActions>
      </Card>

      <Typography variant="h5" component="h2" gutterBottom>
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
        <Box sx={{ textAlign: 'center', py: 2 }}>
          <CircularProgress />
        </Box>
      ) : plants.length === 0 && !listError ? (
        <Typography color="text.secondary">No plants yet. Add your first one above.</Typography>
      ) : (
        <Stack spacing={2}>
          {plants.map((plant) => (
            <Card key={plant.id} variant="outlined">
              <CardContent>
                <Typography variant="h6">{plant.plant_name}</Typography>
                <Typography color="text.secondary">
                  Water every {plant.water_every_days} {plant.water_every_days === 1 ? 'day' : 'days'}
                </Typography>
              </CardContent>
              <CardActions>
                <Button
                  color="error"
                  onClick={() => handleDelete(plant.id)}
                  disabled={deletingId === plant.id}
                >
                  {deletingId === plant.id ? 'Deleting…' : 'Delete'}
                </Button>
              </CardActions>
            </Card>
          ))}
        </Stack>
      )}
    </Container>
  )
}

export default App
