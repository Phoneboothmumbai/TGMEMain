import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePortalAuth } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { toast } from 'sonner';
import { Shield, Loader2, Mail, Lock } from 'lucide-react';

export default function PortalLoginPage() {
  const { login, isAuthenticated } = usePortalAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) { navigate('/portal/dashboard'); return null; }

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) { toast.error('Enter email and password'); return; }
    setLoading(true);
    try {
      await login(email, password);
      toast.success('Welcome to your portal');
      navigate('/portal/dashboard');
    } catch (err) { toast.error(err.message); }
    finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4" data-testid="portal-login-page">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-amber-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">Client Portal</h1>
          <p className="text-slate-400 text-sm mt-1">The Good Men Enterprise</p>
        </div>
        <Card className="border-slate-700 bg-slate-800">
          <CardContent className="p-6">
            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <Label className="text-slate-300">Email</Label>
                <div className="relative mt-1">
                  <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input value={email} onChange={e => setEmail(e.target.value)} type="email" placeholder="your@email.com"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" data-testid="portal-email" />
                </div>
              </div>
              <div>
                <Label className="text-slate-300">Password</Label>
                <div className="relative mt-1">
                  <Lock className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <Input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Enter password"
                    className="pl-10 bg-slate-700 border-slate-600 text-white placeholder:text-slate-500" data-testid="portal-password" />
                </div>
              </div>
              <Button type="submit" disabled={loading} className="w-full bg-amber-500 hover:bg-amber-600 text-white h-11" data-testid="portal-login-btn">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Sign In'}
              </Button>
            </form>
            <p className="text-xs text-slate-500 text-center mt-4">Contact TGME to get portal access</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
