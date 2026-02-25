import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown, Calendar } from 'lucide-react'
import { createActivity } from '../services/activityService'

const ACTIVITY_TYPES = [
  { value: 'exam', label: 'Examen' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'project', label: 'Proyecto' },
  { value: 'homework', label: 'Tarea' },
  { value: 'presentation', label: 'Presentación' },
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
    setForm((prev) => ({ ...prev, [name]: value }))
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
        user_id: 1,
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

      {/* Header */}
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Crear nueva actividad</h1>
      <p className="text-gray-500 text-sm mb-8">Completa los datos de tu actividad evaluativa</p>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">

          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">Título *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              placeholder="Ej: Parcial de Cálculo"
              required
              className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Tipo y Curso */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Tipo *</label>
              <div className="relative">
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 text-gray-900 rounded-lg pl-4 pr-10 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors appearance-none cursor-pointer"
                >
                  <option value="">Selecciona un tipo</option>
                  {ACTIVITY_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <ChevronDown size={16} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Curso <span className="text-gray-400">(opcional)</span> </label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                placeholder="Ej: Cálculo III"
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Fecha y Peso */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Fecha límite *</label>
              <div className="relative">
                <input
                  type="date"
                  name="due_date"
                  value={form.due_date}
                  onChange={handleChange}
                  required
                  className="w-full bg-gray-50 text-gray-900 rounded-lg pl-4 pr-10 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors cursor-pointer [&::-webkit-calendar-picker-indicator]:opacity-0"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                  <Calendar size={16} />
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">
                Peso <span className="text-gray-400">(opcional)</span>
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Ej: 30"
                min="0"
                max="100"
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Error */}
          {error && (
            <p className="text-red-500 text-sm">{error}</p>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-6 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creando...' : 'Crear actividad'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default CreatePage






