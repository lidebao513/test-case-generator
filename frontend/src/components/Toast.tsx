/**
 * Toast组件
 * 功能：显示用户提示消息，支持不同类型的提示（成功、错误、警告、信息）
 */
import { useState, useEffect } from 'react'

interface ToastProps {
  message: string
  type: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  onClose: () => void
}

const Toast: React.FC<ToastProps> = ({ message, type, duration = 3000, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  const getTypeStyles = () => {
    switch (type) {
      case 'success':
        return {
          backgroundColor: 'bg-green-500',
          borderColor: 'border-green-600',
          textColor: 'text-green-100'
        }
      case 'error':
        return {
          backgroundColor: 'bg-red-500',
          borderColor: 'border-red-600',
          textColor: 'text-red-100'
        }
      case 'warning':
        return {
          backgroundColor: 'bg-yellow-500',
          borderColor: 'border-yellow-600',
          textColor: 'text-yellow-100'
        }
      case 'info':
        return {
          backgroundColor: 'bg-blue-500',
          borderColor: 'border-blue-600',
          textColor: 'text-blue-100'
        }
      default:
        return {
          backgroundColor: 'bg-gray-500',
          borderColor: 'border-gray-600',
          textColor: 'text-gray-100'
        }
    }
  }

  const styles = getTypeStyles()

  return (
    <div className={`fixed top-4 right-4 ${styles.backgroundColor} ${styles.borderColor} border-l-4 px-4 py-3 rounded shadow-lg z-50 flex items-center`}>
      <div className={`mr-3 ${styles.textColor}`}>
        {type === 'success' && '✅'}
        {type === 'error' && '❌'}
        {type === 'warning' && '⚠️'}
        {type === 'info' && 'ℹ️'}
      </div>
      <div className={`${styles.textColor}`}>
        <p className="text-sm font-medium">{message}</p>
      </div>
      <button
        onClick={onClose}
        className={`ml-4 ${styles.textColor} hover:opacity-75`}
      >
        ×
      </button>
    </div>
  )
}

// Toast上下文
interface ToastContextType {
  showToast: (_message: string, _type: 'success' | 'error' | 'warning' | 'info', _duration?: number) => void
}

import { createContext, useContext } from 'react'

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export const useToast = () => {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider')
  }
  return context
}

// Toast提供者组件
interface ToastProviderProps {
  children: React.ReactNode
}

export const ToastProvider: React.FC<ToastProviderProps> = ({ children }) => {
  const [toasts, setToasts] = useState<Array<{ id: string; message: string; type: 'success' | 'error' | 'warning' | 'info'; duration: number }>>([])

  const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info', duration = 3000) => {
    const id = Date.now().toString()
    setToasts(prev => [...prev, { id, message, type, duration }])
  }

  const removeToast = (id: string) => {
    setToasts(prev => prev.filter(toast => toast.id !== id))
  }

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      {toasts.map(toast => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  )
}

export default Toast