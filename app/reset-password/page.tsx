"use client";

import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Eye, EyeOff, Lock, CheckCircle, XCircle } from 'lucide-react';
import Link from 'next/link';

const resetPasswordSchema = z.object({
    password: z.string().min(6, 'Password must be at least 6 characters'),
    confirmPassword: z.string().min(6, 'Password must be at least 6 characters'),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
});

type ResetPasswordFormData = z.infer<typeof resetPasswordSchema>;

const ResetPasswordPage = () => {
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [token, setToken] = useState<string>('');
    const [isValidToken, setIsValidToken] = useState<boolean | null>(null);
    const [isSuccess, setIsSuccess] = useState(false);

    const form = useForm<ResetPasswordFormData>({
        resolver: zodResolver(resetPasswordSchema),
    });

    useEffect(() => {
        // Get token from URL
        const urlParams = new URLSearchParams(window.location.search);
        const tokenFromUrl = urlParams.get('token');
        
        if (tokenFromUrl) {
            setToken(tokenFromUrl);
            setIsValidToken(true);
        } else {
            setIsValidToken(false);
        }
    }, []);

    const handleResetPassword = async (data: ResetPasswordFormData) => {
        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/reset-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    token: token,
                    newPassword: data.password,
                }),
            });

            const result = await response.json();

            if (response.ok) {
                toast.success(result.message);
                setIsSuccess(true);
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

    if (isValidToken === false) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
                    <XCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Reset Link</h1>
                    <p className="text-gray-600 mb-6">
                        The password reset link is invalid or has expired. Please request a new one.
                    </p>
                    <Link href="/">
                        <Button className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
                <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8 text-center">
                    <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-bold text-gray-900 mb-4">Password Reset Successfully</h1>
                    <p className="text-gray-600 mb-6">
                        Your password has been reset successfully. You can now log in with your new password.
                    </p>
                    <Link href="/">
                        <Button className="w-full">
                            Return to Home
                        </Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-8">
                <div className="text-center mb-8">
                    <h1 className="text-2xl font-bold text-gray-900 mb-2">Reset Your Password</h1>
                    <p className="text-gray-600">
                        Enter your new password below.
                    </p>
                </div>

                <form onSubmit={form.handleSubmit(handleResetPassword)} className="space-y-6">
                    <div>
                        <Label htmlFor="password">New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="password"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Enter new password"
                                className="pl-10 pr-10"
                                {...form.register('password')}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <div>
                        <Label htmlFor="confirmPassword">Confirm New Password</Label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                            <Input
                                id="confirmPassword"
                                type={showPassword ? 'text' : 'password'}
                                placeholder="Confirm new password"
                                className="pl-10"
                                {...form.register('confirmPassword')}
                            />
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="text-red-500 text-sm mt-1">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <Button
                        type="submit"
                        className="w-full"
                        disabled={isLoading}
                    >
                        {isLoading ? 'Resetting Password...' : 'Reset Password'}
                    </Button>

                    <div className="text-center">
                        <Link href="/" className="text-blue-600 hover:text-blue-800 text-sm">
                            Return to Home
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default ResetPasswordPage; 