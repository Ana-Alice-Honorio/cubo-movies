'use client';

import { useState } from 'react';
import { SignUpForm, SignInForm, type SignUpData, type SignInData } from '@/components/forms';

export function AuthContainer() {
  const [currentForm, setCurrentForm] = useState<'signin' | 'signup'>('signin');

  const handleSignUpSubmit = (data: SignUpData) => {
    console.log('Sign Up Data:', data);
    // TODO: Implementar chamada de API
  };

  const handleSignInSubmit = (data: SignInData) => {
    console.log('Sign In Data:', data);
    // TODO: Implementar chamada de API
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

        {/* Forms */}
        {currentForm === 'signin' ? (
          <SignInForm
            onSubmit={handleSignInSubmit}
            onForgotPassword={handleForgotPassword}
          />
        ) : (
          <SignUpForm onSubmit={handleSignUpSubmit} />
        )}
      </div>
    </div>
  );
}
