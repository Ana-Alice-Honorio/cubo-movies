'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface SignInFormProps {
  onSubmit?: (data: SignInData) => void;
  onForgotPassword?: () => void;
}

export interface SignInData {
  emailOrName: string;
  password: string;
}

export function SignInForm({ onSubmit, onForgotPassword }: SignInFormProps) {
  const [formData, setFormData] = useState<SignInData>({
    emailOrName: '',
    password: '',
  });

  const [errors, setErrors] = useState<Partial<SignInData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignInData> = {};

    if (!formData.emailOrName.trim()) {
      newErrors.emailOrName = 'Nome ou e-mail é obrigatório';
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

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (validateForm()) {
      onSubmit?.(formData);
      // Reset form
      setFormData({
        emailOrName: '',
        password: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Nome/E-mail</label>
        <Input
          type="text"
          name="emailOrName"
          placeholder="Digite seu nome/E-mail"
          value={formData.emailOrName}
          onChange={handleChange}
          error={errors.emailOrName}
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
        />
      </div>

      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onForgotPassword}
          className="text-sm text-accent hover:text-accent-hover underline underline-offset-2 transition-colors"
        >
          Esqueci minha senha
        </button>

        <Button
          type="submit"
          variant="primary"
        >
          Entrar
        </Button>
      </div>
    </form>
  );
}
