'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface SignInFormProps {
  onSubmit?: (data: SignInData) => Promise<boolean> | boolean;
  onForgotPassword?: () => void;
  isSubmitting?: boolean;
}

export interface SignInData {
  email: string;
  password: string;
}

export function SignInForm({ onSubmit, onForgotPassword, isSubmitting = false }: SignInFormProps) {
  const [formData, setFormData] = useState<SignInData>({
    email: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<SignInData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInData> = {};

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Limpar erro do campo ao começar a digitar
    if (errors[name as keyof SignInData]) {
      setErrors((prev) => ({
        ...prev,
        [name]: undefined,
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      const shouldReset = await onSubmit?.(formData);
      if (shouldReset !== false) {
        setFormData({
          email: '',
          password: '',
        });
      }
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">E-mail</label>
        <Input
          type="email"
          name="email"
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
          disabled={isSubmitting}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Senha</label>
        <Input
          type="password"
          name="password"
          placeholder="Digite sua senha"
          value={formData.password}
          onChange={handleChange}
          error={errors.password}
          disabled={isSubmitting}
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onForgotPassword}
          disabled={isSubmitting}
          className="text-sm text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          Esqueci minha senha
        </button>

        <Button
          type="submit"
          variant="primary"
          isDisabled={isSubmitting}
        >
          {isSubmitting ? 'Entrando...' : 'Entrar'}
        </Button>
      </div>
    </form>
  );
}
