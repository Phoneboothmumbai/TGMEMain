import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Users, Shield, Briefcase, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  return (
    <div className="max-w-4xl space-y-6" data-testid="admin-dashboard">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Command Centre</h1>
        <p className="text-slate-500 text-sm mt-1">Manage users, permissions, and app access</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link to="/workspace/admin/employees">
          <Card className="hover:shadow-md hover:border-amber-200 transition-all cursor-pointer h-full">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="w-14 h-14 bg-amber-50 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-amber-600" />
              </div>
              <div>
                <div className="font-semibold text-slate-800 text-lg">Employee Management</div>
                <div className="text-sm text-slate-500">Add, edit, and manage employee access</div>
              </div>
            </CardContent>
          </Card>
        </Link>
        <Card className="border-dashed opacity-60">
          <CardContent className="p-6 flex items-center gap-4">
            <div className="w-14 h-14 bg-slate-50 rounded-xl flex items-center justify-center">
              <Shield className="w-7 h-7 text-slate-400" />
            </div>
            <div>
              <div className="font-semibold text-slate-600 text-lg">App Settings</div>
              <div className="text-sm text-slate-400">Coming soon</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <Link to="/workspace/servicebook">
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <Briefcase className="w-5 h-5 text-emerald-500" />
              <span className="text-sm font-medium text-slate-700">Open ServiceBook</span>
            </CardContent>
          </Card>
        </Link>
        <Link to="/workspace/sales">
          <Card className="hover:shadow-md transition-all cursor-pointer">
            <CardContent className="p-4 flex items-center gap-3">
              <TrendingUp className="w-5 h-5 text-blue-500" />
              <span className="text-sm font-medium text-slate-700">Open Sales CRM</span>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
