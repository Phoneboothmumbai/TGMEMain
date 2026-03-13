import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { useWorkspaceAuth, workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { Briefcase, User, Lock, ChevronDown, AlertCircle, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const apps = [
  { id: 'servicebook', name: 'ServiceBook', description: 'Digital Service Book & Field Service' },
  // Future apps can be added here
  // { id: 'inventory', name: 'Inventory', description: 'Stock & Inventory Management' },
];

export default function WorkspaceLoginPage() {
  const navigate = useNavigate();
  const { login } = useWorkspaceAuth();
  
  const [employeeId, setEmployeeId] = useState('');
  const [password, setPassword] = useState('');
  const [selectedApp, setSelectedApp] = useState('servicebook');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(employeeId, password, selectedApp);
    
    if (result.success) {
      toast.success('Login successful!');
      navigate(`/workspace/${selectedApp}`);
    } else {
      setError(result.error);
      toast.error(result.error);
    }
    
    setLoading(false);
  };

  const handleSetup = async () => {
    try {
      setLoading(true);
      const result = await workspaceApi.setup();
      toast.success('Setup completed! Default login: ADMIN001 / admin123');
      setEmployeeId('ADMIN001');
      setPassword('admin123');
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
      {/* Background Pattern */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl"></div>
      </div>

      <div className="relative w-full max-w-md">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-amber-500 rounded-2xl mb-4">
            <Briefcase className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-white">TGME Workspace</h1>
          <p className="text-slate-400 mt-1">Employee Portal</p>
        </div>

        <Card className="border-slate-700 bg-slate-800/50 backdrop-blur">
          <CardHeader>
            <CardTitle className="text-white">Sign In</CardTitle>
            <CardDescription className="text-slate-400">
              Enter your credentials to access the workspace
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              {/* Employee ID */}
              <div className="space-y-2">
                <Label htmlFor="employeeId" className="text-slate-300">Employee ID</Label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="employeeId"
                    type="text"
                    placeholder="e.g., EMP001"
                    value={employeeId}
                    onChange={(e) => setEmployeeId(e.target.value.toUpperCase())}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* Password */}
              <div className="space-y-2">
                <Label htmlFor="password" className="text-slate-300">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-500"
                    required
                  />
                </div>
              </div>

              {/* App Selection */}
              <div className="space-y-2">
                <Label className="text-slate-300">Select App</Label>
                <div className="grid gap-2">
                  {apps.map((app) => (
                    <div
                      key={app.id}
                      onClick={() => setSelectedApp(app.id)}
                      className={`p-3 rounded-lg border cursor-pointer transition-all ${
                        selectedApp === app.id
                          ? 'border-amber-500 bg-amber-500/10'
                          : 'border-slate-600 bg-slate-900/30 hover:border-slate-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <p className={`font-medium ${selectedApp === app.id ? 'text-amber-400' : 'text-white'}`}>
                            {app.name}
                          </p>
                          <p className="text-xs text-slate-500">{app.description}</p>
                        </div>
                        <div className={`w-4 h-4 rounded-full border-2 ${
                          selectedApp === app.id
                            ? 'border-amber-500 bg-amber-500'
                            : 'border-slate-500'
                        }`}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Error Message */}
              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              {/* Submit Button */}
              <Button
                type="submit"
                className="w-full bg-amber-500 hover:bg-amber-600 text-white"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>

            {/* Setup Link (for first time) */}
            <div className="mt-6 pt-4 border-t border-slate-700">
              <p className="text-slate-500 text-xs text-center mb-2">First time setup?</p>
              <Button
                variant="outline"
                size="sm"
                onClick={handleSetup}
                className="w-full border-slate-600 text-slate-400 hover:text-white hover:bg-slate-700"
                disabled={loading}
              >
                Initialize Workspace
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Back to main site */}
        <p className="text-center mt-6">
          <a href="/" className="text-slate-500 hover:text-amber-400 text-sm transition-colors">
            ← Back to main website
          </a>
        </p>
      </div>
    </div>
  );
}
