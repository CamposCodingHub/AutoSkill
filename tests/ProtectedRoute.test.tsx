import { describe, it, expect, beforeEach } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MemoryRouter } from 'react-router-dom'
import ProtectedRoute from '../src/components/ProtectedRoute'

describe('ProtectedRoute', () => {
  beforeEach(() => {
    // Limpar localStorage antes de cada teste
    localStorage.clear()
  })

  it('deve retornar null quando não há token', () => {
    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve retornar null quando token está expirado', () => {
    // Criar um token expirado
    const expiredToken = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) - 3600,
      userId: '123',
      email: 'test@example.com'
    }))
    localStorage.setItem('autoskill_token', expiredToken)

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve retornar null quando token é inválido', () => {
    localStorage.setItem('autoskill_token', 'invalid-token')

    const { container } = render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(container.firstChild).toBeNull()
  })

  it('deve renderizar children quando token existe e é válido', () => {
    // Criar um token JWT válido (header.payload.signature)
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }))
    const payload = btoa(JSON.stringify({
      exp: Math.floor(Date.now() / 1000) + 3600,
      userId: '123',
      email: 'test@example.com'
    }))
    const signature = 'signature' // Assinatura fake (em produção seria real)
    const validToken = `${header}.${payload}.${signature}`
    localStorage.setItem('autoskill_token', validToken)

    render(
      <MemoryRouter>
        <ProtectedRoute><div>Protected Content</div></ProtectedRoute>
      </MemoryRouter>
    )
    expect(screen.getByText('Protected Content')).toBeInTheDocument()
  })
})
