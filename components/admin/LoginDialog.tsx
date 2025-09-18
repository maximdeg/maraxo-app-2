"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react';

const loginSchema = z.object({
    email: z.string().email('Invalid email address'),
    password: z.string().min(1, 'Password is required'),
});

const forgotPasswordSchema = z.object({
    email: z.string().email('Invalid email address'),
});

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;
type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

interface LoginDialogProps {
    isOpen: boolean;
    onClose: () => void;
    onLoginSuccess: (userData: any, token: string) => void;
}

const LoginDialog: React.FC<LoginDialogProps> = ({ isOpen, onClose, onLoginSuccess }) => {
    const [showPassword, setShowPassword] = useState(false);
    const [rememberMe, setRememberMe] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [mode, setMode] = useState<'login' | 'forgot' | 'reset'>('login');
    const [resetToken, setResetToken] = useState<string>('');

    const loginForm = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema),
    });

    const forgotPasswordForm = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    const resetPasswordForm = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        if (isOpen) {
            // Check for saved email only (never save password)
            const savedEmail = localStorage.getItem('adminEmail');
            if (savedEmail) {
                loginForm.setValue('email', savedEmail);
                setRememberMe(true);
            }
        }
    }, [isOpen]);

    useEffect(() => {
        // Get reset token from URL if present
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        if (token) {
            setResetToken(token);
            setMode('reset');
        }
    }, []);

    const handleLogin = async (data: LoginFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                // Save email only if remember me is checked (never save password)
                if (rememberMe) {
                    localStorage.setItem('adminEmail', data.email);
                } else {
                    localStorage.removeItem('adminEmail');
                }

                toast.success('Login successful!');
                onLoginSuccess(result.user, 'authenticated');
                onClose();
            } else {
                toast.error(result.error || 'Login failed');
            }
        } catch (error) {
            console.error('Login error:', error);
            toast.error('An error occurred during login');
        } finally {
            setIsLoading(false);
        }
    };

    const handleForgotPassword = async (data: ForgotPasswordFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(data),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setMode('login');
            } else {
                toast.error(result.error || 'Failed to send reset email');
            }
        } catch (error) {
            console.error('Forgot password error:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    const handleResetPassword = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: resetToken,
                    newPassword: data.password,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setMode('login');
                setResetToken('');
                // Clear URL parameters
                window.history.replaceState({}, document.title, window.location.pathname);
            } else {
                toast.error(result.error || 'Failed to reset password');
            }
        } catch (error) {
            console.error('Reset password error:', error);
            toast.error('An error occurred');
        } finally {
            setIsLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                <div className="flex items-center justify-between mb-6">
                    <h2 className="text-2xl font-bold text-gray-900">
                        {mode === 'login' && 'Iniciar sesión'}
                        {mode === 'forgot' && 'Recuperar contraseña'}
                        {mode === 'reset' && 'Restablecer contraseña'}
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600"
                    >
                        ✕
                    </button>
                </div>

                {mode === 'login' && (
                    <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
                        <div>
                            <Label htmlFor="email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="Ingrese su email"
                                    className="pl-10 text-gray-600"
                                    {...loginForm.register('email')}
                                />
                            </div>
                            {loginForm.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {loginForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Ingrese su contraseña"
                                    className="pl-10 pr-10 text-gray-600"
                                    {...loginForm.register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {loginForm.formState.errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {loginForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div className="flex items-center space-x-2 text-gray-600">
                            <Switch
                                id="remember-me"
                                checked={rememberMe}
                                onCheckedChange={setRememberMe}
                            />
                            <Label htmlFor="remember-me">Recordarme</Label>
                        </div>

                        <Button
                            type="submit"
                            className="w-full"
                            disabled={isLoading}
                        >
                            {isLoading ? 'Iniciando sesión...' : 'Iniciar sesión'}
                        </Button>

                        <div className="text-center">
                            <button
                                type="button"
                                onClick={() => setMode('forgot')}
                                className="text-blue-600 hover:text-blue-800 text-sm"
                            >
                                Olvidaste tu contraseña?
                            </button>
                        </div>
                    </form>
                )}

                {mode === 'forgot' && (
                    <form onSubmit={forgotPasswordForm.handleSubmit(handleForgotPassword)} className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Ingrese su email y le enviaremos un enlace para restablecer su contraseña.
                        </p>

                        <div>
                            <Label htmlFor="forgot-email">Email</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="forgot-email"
                                    type="email"
                                    placeholder="Ingrese su email"
                                    className="pl-10"
                                    {...forgotPasswordForm.register('email')}
                                />
                            </div>
                            {forgotPasswordForm.formState.errors.email && (
                                <p className="text-red-500 text-sm mt-1">
                                    {forgotPasswordForm.formState.errors.email.message}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMode('login')}
                                className="flex-1"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Enviando...' : 'Enviar enlace para restablecer contraseña'}
                            </Button>
                        </div>
                    </form>
                )}

                {mode === 'reset' && (
                    <form onSubmit={resetPasswordForm.handleSubmit(handleResetPassword)} className="space-y-4">
                        <p className="text-gray-600 text-sm">
                            Ingrese su nueva contraseña a continuación.
                        </p>

                        <div>
                            <Label htmlFor="new-password">Nueva contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="new-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Ingrese su nueva contraseña"
                                    className="pl-10 pr-10"
                                    {...resetPasswordForm.register('password')}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                </button>
                            </div>
                            {resetPasswordForm.formState.errors.password && (
                                <p className="text-red-500 text-sm mt-1">
                                    {resetPasswordForm.formState.errors.password.message}
                                </p>
                            )}
                        </div>

                        <div>
                            <Label htmlFor="confirm-password">Confirmar contraseña</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                                <Input
                                    id="confirm-password"
                                    type={showPassword ? 'text' : 'password'}
                                    placeholder="Confirmar nueva contraseña"
                                    className="pl-10"
                                    {...resetPasswordForm.register('confirmPassword')}
                                />
                            </div>
                            {resetPasswordForm.formState.errors.confirmPassword && (
                                <p className="text-red-500 text-sm mt-1">
                                    {resetPasswordForm.formState.errors.confirmPassword.message}
                                </p>
                            )}
                        </div>

                        <div className="flex space-x-3">
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() => setMode('login')}
                                className="flex-1"
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Volver
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1"
                                disabled={isLoading}
                            >
                                {isLoading ? 'Restableciendo contraseña...' : 'Restablecer contraseña'}
                            </Button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
};

export default LoginDialog; 