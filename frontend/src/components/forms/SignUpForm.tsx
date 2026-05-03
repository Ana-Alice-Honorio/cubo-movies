'use client';

import { useState } from 'react';
import { Button, Input } from '@/components/ui';

interface SignUpFormProps {
  onSubmit?: (data: SignUpData) => void;
}

export interface SignUpData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export function SignUpForm({ onSubmit }: SignUpFormProps) {
  const [formData, setFormData] = useState<SignUpData>({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState<Partial<SignUpData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<SignUpData> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Nome é obrigatório';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'E-mail é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'E-mail inválido';
    }

    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres';
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Confirmação de senha é obrigatória';
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'As senhas não coincidem';
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
    if (errors[name as keyof SignUpData]) {
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
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full space-y-6">
      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Nome</label>
        <Input
          type="text"
          name="name"
          placeholder="Digite seu nome"
          value={formData.name}
          onChange={handleChange}
          error={errors.name}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">E-mail</label>
        <Input
          type="email"
          name="email"
          placeholder="Digite seu e-mail"
          value={formData.email}
          onChange={handleChange}
          error={errors.email}
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

      <div className="space-y-2">
        <label className="block text-sm font-semibold text-white">Confirmação de senha</label>
        <Input
          type="password"
          name="confirmPassword"
          placeholder="Digite sua senha novamente"
          value={formData.confirmPassword}
          onChange={handleChange}
          error={errors.confirmPassword}
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          variant="primary"
        >
          Cadastrar
        </Button>
      </div>
    </form>
  );
}
