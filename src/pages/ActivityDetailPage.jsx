import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { useActivity } from '../hooks/useActivity'
import { updateActivity, deleteActivity } from '../services/activityService'

const ACTIVITY_TYPES = [
  { value: 'exam', label: 'Examen' },
  { value: 'quiz', label: 'Quiz' },
  { value: 'project', label: 'Proyecto' },
  { value: 'homework', label: 'Tarea' },
  { value: 'presentation', label: 'Presentación' },
]

function ActivityDetailPage() {
  const { id } = useParams() // Obtiene el :id de la URL
  const navigate = useNavigate()
  const { activity, viewState, reload } = useActivity(id)

  const [form, setForm] = useState({
    title: '',
    type: '',
    course: '',
    due_date: '',
    weight: '',
  })
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  // Cuando carga la actividad, llena el formulario con sus datos
  useEffect(() => {
    if (activity) {
      setForm({
        title: activity.title || '',
        type: activity.type || '',
        course: activity.course || '',
        due_date: activity.due_date || '',
        weight: activity.weight ?? '',
      })
    }
  }, [activity])

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
  }

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      await updateActivity(id, {
        ...form,
        weight: form.weight !== '' ? parseFloat(form.weight) : null,
      })
      setSuccess(true)
      reload() // Recarga la actividad desde el backend
    } catch (err) {
      setError('Ocurrió un error al guardar los cambios. Intenta de nuevo.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!window.confirm('¿Estás seguro de que deseas eliminar esta actividad?')) return
    setDeleting(true)
    try {
      await deleteActivity(id)
      navigate('/hoy')
    } catch (err) {
      setError('Ocurrió un error al eliminar la actividad.')
      setDeleting(false)
    }
  }

  // Estados de carga
  if (viewState === 'loading') {
    return <p className="text-gray-500 text-sm">Cargando actividad...</p>
  }

  if (viewState === 'error') {
    return <p className="text-red-500 text-sm">No se pudo cargar la actividad.</p>
  }

  return (
    <div className="w-full mx-auto">

      {/* Volver */}
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 text-sm text-gray-500 hover:text-gray-800 transition-colors mb-6"
      >
        <ArrowLeft size={16} />
        Volver a actividades
      </button>

      {/* Formulario editar */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-5">Editar Actividad</h2>

        <form onSubmit={handleSave} className="flex flex-col gap-5">

          {/* Título */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">Título *</label>
            <input
              type="text"
              name="title"
              value={form.title}
              onChange={handleChange}
              required
              className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Tipo y Curso */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Tipo *</label>
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              >
                <option value="">Selecciona un tipo</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Curso *</label>
              <input
                type="text"
                name="course"
                value={form.course}
                onChange={handleChange}
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Fecha y Peso */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Fecha límite *</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                required
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              />
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
                className="bg-gray-50 text-gray-900 rounded-lg px-4 py-2 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
              />
            </div>
          </div>

          {/* Mensajes */}
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">¡Cambios guardados correctamente!</p>}

          {/* Botones */}
          <div className="flex gap-3 mt-2">
            <button
              type="submit"
              disabled={saving}
              className="bg-blue-600 text-white font-semibold rounded-lg py-2 px-6 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {saving ? 'Guardando...' : 'Guardar cambios'}
            </button>

            <button
              type="button"
              onClick={() => navigate(-1)}
              className="bg-white text-gray-700 font-semibold rounded-lg py-2 px-6 text-sm border border-gray-200 hover:bg-gray-50 transition-colors"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleDelete}
              disabled={deleting}
              className="ml-auto text-red-500 font-semibold rounded-lg py-2 px-6 text-sm border border-red-200 hover:bg-red-50 transition-colors disabled:opacity-50"
            >
              {deleting ? 'Eliminando...' : 'Eliminar actividad'}
            </button>
          </div>

        </form>
      </div>

      {/* Subtareas — próximamente */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Subtareas</h2>
          <button className="bg-blue-600 text-white text-sm font-medium px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors">
            + Agregar subtarea
          </button>
        </div>
        <p className="text-gray-400 text-sm">Las subtareas se agregarán próximamente.</p>
      </div>

    </div>
  )
}

export default ActivityDetailPage