import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '../../components/ui/card';
import { Badge } from '../../components/ui/badge';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { Loader2, MapPin, Building2, Calendar, ArrowRight, Clock } from 'lucide-react';

const statusColors = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  assigned: 'bg-blue-100 text-blue-700 border-blue-200',
  in_progress: 'bg-violet-100 text-violet-700 border-violet-200',
  completed: 'bg-green-100 text-green-700 border-green-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
};

const priorityDot = {
  low: 'bg-slate-400',
  medium: 'bg-blue-500',
  high: 'bg-orange-500',
  urgent: 'bg-red-500',
};

export default function MyTasksPage() {
  const { employee } = useOutletContext();
  const navigate = useNavigate();
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (employee?.employee_id) loadTasks();
  }, [employee]);

  const loadTasks = async () => {
    try {
      const data = await workspaceApi.getMyTasks(employee.employee_id);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  const activeTasks = tasks.filter(t => t.status !== 'completed' && t.status !== 'cancelled');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto" data-testid="my-tasks-page">
      <div>
        <h1 className="text-xl font-bold text-slate-800" data-testid="my-tasks-title">My Tasks</h1>
        <p className="text-slate-500 text-sm">{activeTasks.length} active, {completedTasks.length} completed</p>
      </div>

      {activeTasks.length === 0 && completedTasks.length === 0 ? (
        <Card className="border-slate-200">
          <CardContent className="py-12 text-center">
            <Clock className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-slate-500 text-sm" data-testid="no-mytasks-message">No tasks assigned to you yet.</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {activeTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Active</h2>
              {activeTasks.map((task) => (
                <Card
                  key={task.id}
                  className="border-slate-200 cursor-pointer hover:shadow-md transition-shadow active:scale-[0.99]"
                  onClick={() => navigate(`/workspace/servicebook/task/${task.id}`)}
                  data-testid={`my-task-${task.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <div className={`w-2 h-2 rounded-full ${priorityDot[task.priority]}`} />
                          <h3 className="font-semibold text-slate-800 text-sm truncate">{task.title}</h3>
                        </div>
                        <div className="mt-2 space-y-1 text-xs text-slate-500">
                          {task.client_name && (
                            <p className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {task.client_name}</p>
                          )}
                          {task.location_name && (
                            <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.location_name}</p>
                          )}
                          {task.due_date && (
                            <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {new Date(task.due_date).toLocaleDateString()}</p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2 ml-2">
                        <Badge className={`text-xs ${statusColors[task.status]}`}>
                          {task.status?.replace('_', ' ')}
                        </Badge>
                        <ArrowRight className="w-4 h-4 text-slate-400" />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {completedTasks.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wide">Completed</h2>
              {completedTasks.slice(0, 5).map((task) => (
                <Card key={task.id} className="border-slate-200 opacity-70" data-testid={`completed-task-${task.id}`}>
                  <CardContent className="p-3">
                    <div className="flex items-center justify-between">
                      <p className="text-sm text-slate-600 truncate">{task.title}</p>
                      <Badge className="bg-green-100 text-green-700 text-xs">Done</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </>
      )}
    </div>
  );
}
