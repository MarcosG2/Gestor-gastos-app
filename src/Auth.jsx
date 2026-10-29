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
    <div className="min-h-screen grid md:grid-cols-[280px_1fr] bg-ground">
      <div className="bg-band text-on-band px-8 py-12 flex flex-col justify-start">
        <p className="text-sm text-on-band/80">Gestor de Gastos</p>
        <h2 className="text-4xl font-bold mt-2 leading-none">{title}</h2>
        <p className="text-on-band/80 mt-4 max-w-[16rem]">{subtitle}</p>
      </div>
      <div className="flex items-center justify-center px-6 py-12">
      <div className="max-w-md w-full">
        <form onSubmit={handleSubmit} className="space-y-5">
          {isRegistering && !isForgotPassword && (
            <div className="animate-fade-in-down">
              <label className="block text-sm font-medium text-ink mb-1">Nombre Completo</label>
              <input
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-link outline-none transition-all"
                type="text"
                placeholder="Ej: Marcos Guerrero"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required={isRegistering}
              />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-ink mb-1">Email</label>
            <input
              className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-link outline-none transition-all"
              type="email"
              placeholder="tu@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {!isForgotPassword && (
            <div>
              <label className="block text-sm font-medium text-ink mb-1">Contraseña</label>
              <input
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-link outline-none transition-all"
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
            className={`w-full py-3 rounded-xl font-bold text-white flex justify-center items-center gap-2 transition-all shadow-lg ${loading ? 'bg-band/70 cursor-not-allowed shadow-none' : 'bg-band hover:bg-band hover:shadow-none active:scale-95'}`}
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
              className="text-sm text-muted hover:text-link"
            >
              ¿Olvidaste tu contraseña?
            </button>
          )}

          <p className="text-muted">
            {isForgotPassword ? (
              <>
                <button type="button" onClick={resetView} className="text-link font-bold hover:underline">
                  Volver al inicio de sesión
                </button>
              </>
            ) : isRegistering ? (
              <>
                ¿Ya tienes cuenta?
                <button type="button" onClick={resetView} className="ml-2 text-link font-bold hover:underline">
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
                  className="ml-2 text-link font-bold hover:underline"
                >
                  Regístrate aquí
                </button>
              </>
            )}
          </p>
        </div>
      </div>
      </div>
    </div>
  )
}
