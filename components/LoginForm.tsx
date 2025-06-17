
import React, { useState } from 'react';
import Input from './common/Input';
import Button from './common/Button';

interface LoginFormProps {
  onLogin: (id: string, pass: string) => Promise<boolean>; // Updated to expect a Promise
}

const LoginForm: React.FC<LoginFormProps> = ({ onLogin }) => {
  const [id, setId] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>(''); // For local validation errors
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(''); // Clear previous local errors

    if (!id.trim() || !password.trim()) {
      setError('IDとパスワードを入力してください。');
      return;
    }

    setIsSubmitting(true);
    try {
      // App.tsx's onLogin (handleLogin) will manage auth state and app-level errors.
      // We don't need to check the boolean result here to set local errors for auth failure.
      await onLogin(id, password);
    } catch (submissionError) {
      // This catch is for unexpected errors during the onLogin call itself,
      // though App.tsx's handleLogin should also catch errors from apiService.
      console.error("Login form submission error:", submissionError);
      setError('ログイン試行中に予期せぬエラーが発生しました。');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white p-8 rounded-lg shadow-xl w-full max-w-md">
      <h2 className="text-2xl font-semibold text-black mb-6 text-center">ログイン</h2>
      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="p-3 text-sm text-red-700 bg-red-100 rounded-lg" role="alert">
            {error}
          </div>
        )}
        <Input
          label="ID"
          type="text"
          id="loginId"
          name="loginId"
          value={id}
          onChange={(e) => setId(e.target.value)}
          required
          placeholder="IDを入力"
          autoComplete="username"
          disabled={isSubmitting}
        />
        <Input
          label="パスワード"
          type="password"
          id="loginPassword"
          name="loginPassword"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          placeholder="パスワードを入力"
          autoComplete="current-password"
          disabled={isSubmitting}
        />
        <Button 
          type="submit" 
          className="w-full !mt-8" 
          variant="primary" 
          disabled={isSubmitting}
        >
          {isSubmitting ? 'ログイン中...' : 'ログインする'}
        </Button>
      </form>
    </div>
  );
};

export default LoginForm;
