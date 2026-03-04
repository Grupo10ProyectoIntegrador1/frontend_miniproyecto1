import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ChevronDown } from 'lucide-react'
import { createActivity } from '../services/activityService'
import Modal from '../components/Modal' // ← agregar import

import { getLocalTodayStr } from '../utils/dateUtils'

const todayStr = getLocalTodayStr()
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

// Validaciones del frontend — retorna un objeto con los errores encontrados
const validateForm = (form) => {
  const errors = {}

  if (!form.title.trim()) {
    errors.title = 'El título es obligatorio.'
  }

  if (!form.type) {
    errors.type = 'Debes seleccionar un tipo de actividad.'
  }

  if (!form.due_date) {
    errors.due_date = 'La fecha límite es obligatoria.'
  } else if (form.due_date < todayStr) {
    errors.due_date = 'La fecha límite debe ser mayor o igual a hoy.'
  }

  if (form.weight !== '') {
    const w = parseFloat(form.weight)
    if (isNaN(w) || w < 0 || w > 100) {
      errors.weight = 'El peso debe ser un número entre 0 y 100.'
    }
  }

  return errors
}


function CreatePage() {
  const navigate = useNavigate()
  const [form, setForm] = useState(INITIAL_FORM)
  const [fieldErrors, setFieldErrors] = useState({})
  const [serverError, setServerError] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showSuccessModal, setShowSuccessModal] = useState(false) // ← agregar

  const handleChange = (e) => {
    const { name, value } = e.target
    setForm((prev) => ({ ...prev, [name]: value }))
    // Limpia el error del campo cuando el usuario empieza a corregirlo
    if (fieldErrors[name]) {
      setFieldErrors((prev) => ({ ...prev, [name]: null }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setServerError(null)

    const errors = validateForm(form)
    if (Object.keys(errors).length > 0) {
      setFieldErrors(errors)
      return // No manda nada al backend si hay errores
    }

    setLoading(true)
    try {
      const payload = {
        title: form.title.trim(),
        type: form.type,
        course: form.course.trim() || null,
        due_date: form.due_date,
        weight: form.weight !== '' ? parseFloat(form.weight) : null,
      }
      await createActivity(payload)
      setShowSuccessModal(true) // ← mostrar modal en lugar de navegar directo
    } catch (err) {
      // Intenta mostrar el mensaje específico que manda Django
      const data = err.response?.data
      if (data?.errors) {
        // El backend mandó errores por campo, los mapeamos
        setFieldErrors(data.errors)
      } else {
        setServerError('Ocurrió un error al crear la actividad. Intenta de nuevo.')
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto mt-10">

      {/* Modal éxito */}
      <Modal
        isOpen={showSuccessModal}
        onClose={() => navigate('/actividades')}
        onConfirm={() => navigate('/actividades')}
        title="¡Actividad creada!"
        message="La actividad fue creada correctamente."
        type="success"
        confirmText="Aceptar"
      />

      {/* Header centrado */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Crear nueva actividad</h1>
        <p className="text-gray-500 text-sm">Completa los datos de tu actividad evaluativa</p>
      </div>

      {/* Formulario */}
      <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-8">
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
              className={`bg-gray-50 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none border transition-colors
                ${fieldErrors.title ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
            />
            {fieldErrors.title && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.title}</p>
            )}
          </div>

          {/* Tipo */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">Tipo *</label>
            <div className="relative">
              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                className={`w-full bg-gray-50 text-gray-900 rounded-lg pl-4 pr-10 py-3 text-sm outline-none border transition-colors appearance-none cursor-pointer
                  ${fieldErrors.type ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
              >
                <option value="">Selecciona un tipo</option>
                {ACTIVITY_TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
              <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                <ChevronDown size={16} />
              </div>
            </div>
            {fieldErrors.type && (
              <p className="text-red-500 text-sm mt-1">{fieldErrors.type}</p>
            )}
          </div>

          {/* Curso */}
          <div className="flex flex-col gap-1">
            <label className="text-sm text-gray-700 font-medium">
              Curso <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="text"
              name="course"
              value={form.course}
              onChange={handleChange}
              placeholder="Ej: Cálculo III"
              className="bg-gray-50 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none border border-gray-200 focus:border-blue-400 transition-colors"
            />
          </div>

          {/* Separador */}
          <hr className="border-gray-100" />

          {/* Fecha y Peso en la misma fila */}
          <div className="flex gap-4">
            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">Fecha límite *</label>
              <input
                type="date"
                name="due_date"
                value={form.due_date}
                onChange={handleChange}
                className={`w-full bg-gray-50 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none border transition-colors cursor-pointer
                  ${fieldErrors.due_date ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
              />
              {fieldErrors.due_date && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.due_date}</p>
              )}
            </div>

            <div className="flex flex-col gap-1 flex-1">
              <label className="text-sm text-gray-700 font-medium">
                Peso <span className="text-gray-400 font-normal">(opcional)</span>
              </label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleChange}
                placeholder="Ej: 30"
                className={`bg-gray-50 text-gray-900 rounded-lg px-4 py-3 text-sm outline-none border transition-colors
                  ${fieldErrors.weight ? 'border-red-400' : 'border-gray-200 focus:border-blue-400'}`}
              />
              {fieldErrors.weight && (
                <p className="text-red-500 text-sm mt-1">{fieldErrors.weight}</p>
              )}
            </div>
          </div>

          {/* Error general del servidor */}
          {serverError && (
            <div className="bg-red-50 border border-red-200 rounded-lg px-4 py-3">
              <p className="text-red-500 text-sm">{serverError}</p>
            </div>
          )}

          {/* Botón */}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue-600 text-white font-semibold rounded-lg py-3 text-sm hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed mt-2"
          >
            {loading ? 'Creando...' : 'Crear actividad'}
          </button>

        </form>
      </div>
    </div>
  )
}

export default CreatePage






