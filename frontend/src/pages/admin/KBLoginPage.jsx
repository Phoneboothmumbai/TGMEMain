import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

const KBLoginPage = () => {
  const { token, login } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [isSetup, setIsSetup] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  useEffect(() => {
    if (token) {
      navigate('/kb/admin');
    }
  }, [token, navigate]);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await login(username, password);
      toast.success('Login successful!');
      navigate('/kb/admin');
    } catch (error) {
      if (error.response?.status === 401) {
        toast.error('Invalid credentials');
      } else if (error.response?.data?.detail?.includes('Admin already exists')) {
        toast.error('Please login with your credentials');
      } else {
        // Maybe no admin exists yet, show setup
        setIsSetup(true);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSetup = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }
    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    setLoading(true);
    try {
      await kbApi.setup(username, password);
      toast.success('Admin account created! Please login.');
      setIsSetup(false);
    } catch (error) {
      if (error.response?.data?.detail?.includes('Admin already exists')) {
        toast.error('Admin already exists. Please login.');
        setIsSetup(false);
      } else {
        toast.error('Setup failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 flex items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center mx-auto mb-4">
            <span className="text-white font-bold text-xl">KB</span>
          </div>
          <CardTitle className="text-2xl">
            {isSetup ? 'Setup Admin Account' : 'KB Admin Login'}
          </CardTitle>
          <p className="text-slate-500 text-sm mt-2">
            {isSetup 
              ? 'Create your admin account to get started' 
              : 'Sign in to manage Knowledge Base'}
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={isSetup ? handleSetup : handleLogin} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Username
              </label>
              <Input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="admin"
                required
                className="w-full"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Password
              </label>
              <Input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                className="w-full"
              />
            </div>
            {isSetup && (
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Confirm Password
                </label>
                <Input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full"
                />
              </div>
            )}
            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-amber-500 hover:bg-amber-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
              ) : null}
              {isSetup ? 'Create Account' : 'Sign In'}
            </Button>
          </form>

          {!isSetup && (
            <p className="text-center text-sm text-slate-500 mt-4">
              First time?{' '}
              <button
                onClick={() => setIsSetup(true)}
                className="text-amber-600 hover:underline"
              >
                Create admin account
              </button>
            </p>
          )}
          {isSetup && (
            <p className="text-center text-sm text-slate-500 mt-4">
              Already have an account?{' '}
              <button
                onClick={() => setIsSetup(false)}
                className="text-amber-600 hover:underline"
              >
                Sign in
              </button>
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default KBLoginPage;
