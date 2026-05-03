'use client';

import { useState } from 'react';
import { SignUpForm, SignInForm, type SignUpData, type SignInData } from '@/components/forms';
import { buildApiUrl, parseApiError } from '@/lib/api';

export function AuthContainer() {
  const [currentForm, setCurrentForm] = useState<'signin' | 'signup'>('signin');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const handleSignUpSubmit = async (data: SignUpData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const response = await fetch(buildApiUrl('/auth/register'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: data.name,
          email: data.email,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const message = await parseApiError(response);
        setErrorMessage(message);
        return false;
      }

      setSuccessMessage('Cadastro realizado com sucesso. Você já está autenticada.');
      setCurrentForm('signin');
      return true;
    } catch {
      setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSignInSubmit = async (data: SignInData) => {
    setIsSubmitting(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const loginResponse = await fetch(buildApiUrl('/auth/login'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          email: data.email,
          password: data.password,
        }),
      });

      if (!loginResponse.ok) {
        const message = await parseApiError(loginResponse);
        setErrorMessage(message);
        return false;
      }

      const meResponse = await fetch(buildApiUrl('/auth/me'), {
        method: 'GET',
        credentials: 'include',
      });

      if (!meResponse.ok) {
        const message = await parseApiError(meResponse);
        setErrorMessage(message);
        return false;
      }

      setSuccessMessage('Login realizado com sucesso.');
      return true;
    } catch {
      setErrorMessage('Não foi possível conectar ao servidor. Verifique se o backend está rodando.');
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleForgotPassword = () => {
    console.log('Forgot Password clicked');
    // TODO: Implementar lógica de recuperação de senha
  };

  return (
    <div className="flex w-full flex-1 flex-col items-center justify-center px-4">
      <div className="surface-card w-full max-w-[424px] p-8 rounded-lg">
        {/* Tabs */}
        <div className="flex gap-4 mb-8  border-border">
          <button
            onClick={() => setCurrentForm('signin')}
            className={`pb-4 px-2 text-sm font-semibold transition-colors ${
              currentForm === 'signin'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Entrar
          </button>
          <button
            onClick={() => setCurrentForm('signup')}
            className={`pb-4 px-2 text-sm font-semibold transition-colors ${
              currentForm === 'signup'
                ? 'text-accent border-b-2 border-accent'
                : 'text-muted hover:text-foreground'
            }`}
          >
            Cadastro
          </button>
        </div>

        {errorMessage && (
          <p className="mb-4 rounded border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-300">
            {errorMessage}
          </p>
        )}

        {successMessage && (
          <p className="mb-4 rounded border border-emerald-500/40 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-300">
            {successMessage}
          </p>
        )}

        {/* Forms */}
        {currentForm === 'signin' ? (
          <SignInForm
            onSubmit={handleSignInSubmit}
            onForgotPassword={handleForgotPassword}
            isSubmitting={isSubmitting}
          />
        ) : (
          <SignUpForm
            onSubmit={handleSignUpSubmit}
            isSubmitting={isSubmitting}
          />
        )}
      </div>
    </div>
  );
}
