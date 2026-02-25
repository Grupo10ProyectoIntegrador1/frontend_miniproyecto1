import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { createActivity } from '../services/activityService'

const ACTIVITY_TYPES = [
    {value: 'exam', label: 'Examen' },
    {value: 'quiz', label: 'Quiz' },
    {value: 'project', label: 'Proyecto' },
    {value: 'homework', label: 'Tarea' },
    {value: 'presentation', label: 'Presentación' },
]

const INITIAL_FORM = {
    title: '',
    type: '',
    course: '',
    due_date: '',
    weight: '',
}

function CreatePage() {
    const navigate = useNavigate()
    const [form, setForm] = useState(INITIAL_FORM)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    const handleChange = (e) => {
        const { name, value } = e.target
        setForm((prev) => ({...prev, [name]:value}))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError(null)
    
        try {
            const payload = {
                title: form.title,
                type: form.type,
                course: form.course,
                due_date: form.due_date,
                weight: form.weight !== '' ? parseFloat(form.weight) : null,
                user_id: null // por el momento no autenticamos
            }

            await createActivity(payload)
            navigate('/hoy')
        } catch (err) {
            setError('Ocurrió un error al crear la actividad. Intenta de nuevo.')
        } finally {
            setLoading(false)
        }
    }

     return (
    <div className="max-w-lg mx-auto mt-10">
      <h1 className="text-2xl font-bold text-white mb-2">Crear nueva actividad</h1>
      <p className="text-zinc-400 text-sm mb-8">Completa los datos de tu actividad evaluativa</p>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">

        {/* Título */}
        <div className="flex flex-col gap-1">
          <label className="text-sm text-zinc-300 font-medium">Título *</label>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            placeholder="Ej: Parcial de Cálculo"
            required
            className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-zinc-400 transition-colors"
          />
        </div>

        {/* Tipo y Curso en la misma fila */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-zinc-300 font-medium">Tipo *</label>
            <select
              name="type"
              value={form.type}
              onChange={handleChange}
              required
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-zinc-400 transition-colors"
            >
              <option value="">Selecciona un tipo</option>
              {ACTIVITY_TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-zinc-300 font-medium">Curso <span className="text-zinc-500">(opcional)</span></label>
            <input
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Ej: Cálculo III"
              required
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Fecha límite y Peso en la misma fila */}
        <div className="flex gap-4">
          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-zinc-300 font-medium">Fecha límite *</label>
            <input
              type="date"
              name="due_date"
              value={form.due_date}
              onChange={handleChange}
              required
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-zinc-400 transition-colors"
            />
          </div>

          <div className="flex flex-col gap-1 flex-1">
            <label className="text-sm text-zinc-300 font-medium">
              Peso <span className="text-zinc-500">(opcional)</span>
            </label>
            <input
              type="number"
              name="weight"
              value={form.weight}
              onChange={handleChange}
              placeholder="Ej: 30% de la nota"
              min="0"
              max="100"
              className="bg-zinc-800 text-white rounded-lg px-4 py-2 text-sm outline-none border border-zinc-700 focus:border-zinc-400 transition-colors"
            />
          </div>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-400 text-sm">{error}</p>
        )}

        {/* Botón */}
        <button
          type="submit"
          disabled={loading}
          className="bg-white text-zinc-900 font-semibold rounded-lg py-2 px-6 text-sm hover:bg-zinc-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? 'Creando...' : 'Crear actividad'}
        </button>

      </form>
    </div>
  )
}

export default CreatePage






