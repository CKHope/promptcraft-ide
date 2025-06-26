
import React, { useState, useEffect, useRef } from 'react';
import Modal from '../Modal';
import { useAppContext } from '../../contexts/AppContext';
import { INPUT_BASE_CLASSES, INPUT_FOCUS_CLASSES, COMMON_BUTTON_FOCUS_CLASSES, SparklesIcon } from '../../constants';
import { AuthError } from '@supabase/supabase-js';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialMode?: 'signIn' | 'signUp';
}

const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose, initialMode = 'signIn' }) => {
    const { supabase, showToast } = useAppContext();
    const [authMode, setAuthMode] = useState<'signIn' | 'signUp'>(initialMode);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const emailInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (isOpen) {
            setAuthMode(initialMode);
            setEmail('');
            setPassword('');
            setErrorMessage(null);
            setLoading(false);
            setTimeout(() => emailInputRef.current?.focus(), 0);
        }
    }, [isOpen, initialMode]);

    const handleAuthAction = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setErrorMessage(null);

        try {
            let error: AuthError | null = null;
            if (authMode === 'signUp') {
                const { error: signUpError } = await supabase.auth.signUp({ email, password });
                error = signUpError;
                if (!error) {
                    showToast('Sign up successful! Please check your email to confirm your account.', 'success');
                    onClose();
                }
            } else { // signIn
                const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
                error = signInError;
                if (!error) {
                    showToast('Sign in successful!', 'success');
                    onClose(); 
                }
            }

            if (error) {
                setErrorMessage(error.message);
                showToast(error.message, 'error');
            }
        } catch (catchError: any) {
            const defaultMessage = 'An unexpected error occurred.';
            setErrorMessage(catchError.message || defaultMessage);
            showToast(catchError.message || defaultMessage, 'error');
        } finally {
            setLoading(false);
        }
    };

    const toggleMode = () => {
        setAuthMode(prevMode => prevMode === 'signIn' ? 'signUp' : 'signIn');
        setErrorMessage(null);
        setEmail('');
        setPassword('');
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} title={authMode === 'signIn' ? 'Sign In' : 'Create Account'} size="sm">
            <form onSubmit={handleAuthAction} className="space-y-5">
                {errorMessage && (
                    <p role="alert" className="text-sm text-red-500 bg-red-100 dark:bg-red-900/30 p-2.5 rounded-md">{errorMessage}</p>
                )}
                <div>
                    <label htmlFor="authEmail" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Email</label>
                    <input
                        type="email"
                        id="authEmail"
                        ref={emailInputRef}
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`}
                        placeholder="you@example.com"
                    />
                </div>
                <div>
                    <label htmlFor="authPassword" className="block text-sm font-medium text-[var(--text-primary)] mb-1">Password</label>
                    <input
                        type="password"
                        id="authPassword"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        minLength={6}
                        className={`${INPUT_BASE_CLASSES} px-3 py-2 ${INPUT_FOCUS_CLASSES}`}
                        placeholder="••••••••"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading}
                    className={`w-full flex items-center justify-center gap-2 px-5 py-2.5 bg-[var(--button-primary-bg)] hover:bg-[var(--button-primary-bg-hover)] text-[var(--button-primary-text)] font-semibold rounded-lg shadow-sm transition-colors text-sm ${COMMON_BUTTON_FOCUS_CLASSES} disabled:opacity-70 disabled:cursor-not-allowed`}
                >
                    {loading ? (
                        <>
                            <SparklesIcon className="w-4 h-4 animate-spin" />
                            Processing...
                        </>
                    ) : (authMode === 'signIn' ? 'Sign In' : 'Create Account')}
                </button>
                <p className="text-center text-sm">
                    {authMode === 'signIn' ? "Don't have an account?" : "Already have an account?"}
                    <button
                        type="button"
                        onClick={toggleMode}
                        className={`ml-1.5 font-medium text-[var(--accent1)] hover:text-[var(--accent2)] hover:underline ${COMMON_BUTTON_FOCUS_CLASSES} rounded`}
                    >
                        {authMode === 'signIn' ? 'Sign Up' : 'Sign In'}
                    </button>
                </p>
            </form>
        </Modal>
    );
};

export default AuthModal;
