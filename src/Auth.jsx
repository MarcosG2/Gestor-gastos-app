import { useState } from 'react'
import { supabase } from './supabaseClient'
import { Loader } from 'lucide-react'
import { useToast } from './context/ToastContext'

export default function Auth() {
  const { showToast } = useToast()
  const [loading, setLoading] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [isRegistering, setIsRegistering] = useState(false)
  const [isForgotPassword, setIsForgotPassword] = useState(false)

  const resetView = () => {
    setIsRegistering(false)
    setIsForgotPassword(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (isForgotPassword) {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: `${window.location.origin}/`,
        })
        if (error) throw error
        showToast('Te enviamos un enlace para restablecer la contraseña.', 'info')
        setIsForgotPassword(false)
      } else if (isRegistering) {
        const { data, error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: {
              full_name: fullName,
            },
          },
        })

        if (error) throw error

        if (data?.user && !data.session) {
          showToast('Revisá tu correo para confirmar la cuenta.', 'info')
        } else if (data?.session) {
          showToast('Cuenta creada correctamente.', 'success')
        }
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
      }
    } catch (error) {
      showToast(error.message, 'error')
    } finally {
      setLoading(false)
    }
  }

  const title = isForgotPassword ? 'Recuperar contraseña' : isRegistering ? 'Crear Cuenta' : 'Bienvenido'
  const subtitle = isForgotPassword
    ? 'Te enviaremos un enlace a tu correo'
    : isRegistering
      ? 'Únete para controlar tus finanzas'
      : 'Ingresa para continuar'

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-300 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <h2 className="text-3xl font-bold text-center text-gray-800 mb-2">{title}</h2>
        <p className="text-gray-500 text-center mb-8">{subtitle}</p>

        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && !isForgotPassword && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Completo</label>
              <input
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                type="text"
                placeholder="Ej: Marcos Guerrero"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Contraseña</label>
              <input
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${loading ? 'bg-indigo-400 cursor-not-allowed shadow-none' : 'bg-indigo-600 hover:bg-indigo-700 hover:shadow-indigo-200 active:scale-95'}`}
          >
            {loading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                {isForgotPassword ? 'Enviando…' : isRegistering ? 'Creando cuenta...' : 'Iniciando sesión...'}
              </>
            ) : isForgotPassword ? (
              'Enviar enlace'
            ) : isRegistering ? (
              'Registrarse'
            ) : (
              'Iniciar Sesión'
            )}
          </button>
        </form>

        <div className="mt-6 text-center space-y-3">
          {!isForgotPassword && !isRegistering && (
            <button
              type="button"
              onClick={() => setIsForgotPassword(true)}
              className="text-sm text-gray-500 hover:text-indigo-600"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <p className="text-gray-500">
            {isForgotPassword ? (
              <>
                <button type="button" onClick={resetView} className="text-indigo-600 font-bold hover:underline">
                  Volver al inicio de sesión
                </button>
              </>
            ) : isRegistering ? (
              <>
                ¿Ya tienes cuenta?
                <button type="button" onClick={resetView} className="ml-2 text-indigo-600 font-bold hover:underline">
                  Inicia Sesión
                </button>
              </>
            ) : (
              <>
                ¿No tienes cuenta?
                <button
                  type="button"
                  onClick={() => {
                    setIsRegistering(true)
                    setIsForgotPassword(false)
                  }}
                  className="ml-2 text-indigo-600 font-bold hover:underline"
                >
                  Regístrate aquí
                </button>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}
