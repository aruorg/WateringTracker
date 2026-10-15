import { useEffect, useState } from 'react'
import { supabase } from './lib/supabase'

export default function PlantList() {
  const [plants, setPlants] = useState([])
  const [name, setName] = useState('')
  const [days, setDays] = useState(7)

  async function load() {
    const { data, error } = await supabase
      .from('plants_with_status')
      .select('*')
      .order('next_water_at')
    if (error) console.error(error)
    else setPlants(data)
  }

  useEffect(() => {
    async function init() {
      const { data } = await supabase.auth.getSession()
      if (!data.session) await supabase.auth.signInAnonymously()
      load()
    }
    init()
  }, [])

  async function addPlant(e) {
    e.preventDefault()
    const { error } = await supabase
      .from('plants')
      .insert({ plant: name, days_between_watering: Number(days) })
    if (error) return alert(error.message)
    setName('')
    load()
  }

  async function water(id) {
    await supabase.rpc('water_plant', { plant_id: id })
    load()
  }

  return (
    <div>
      <form onSubmit={addPlant}>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Plant name"
          maxLength={60}
          required
        />
        <input
          type="number"
          value={days}
          onChange={(e) => setDays(e.target.value)}
          min={1}
          max={30}
          required
        />
        <button type="submit">Add</button>
      </form>

      <ul>
        {plants.map((p) => (
          <li key={p.id}>
            {p.plant}: next water {new Date(p.next_water_at).toLocaleDateString()}
            {p.needs_water && ' 💧 needs water!'}
            <button onClick={() => water(p.id)}>Watered</button>
          </li>
        ))}
      </ul>
    </div>
  )
}