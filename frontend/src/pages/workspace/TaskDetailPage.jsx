import React, { useState, useEffect, useRef } from 'react';
import { useParams, useOutletContext, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Label } from '../../components/ui/label';
import { Textarea } from '../../components/ui/textarea';
import { Badge } from '../../components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { workspaceApi } from '../../contexts/WorkspaceAuthContext';
import { toast } from 'sonner';
import SignatureCanvas from 'react-signature-canvas';
import {
  Loader2, MapPin, Building2, Calendar, Camera, Pen,
  Navigation, Play, CheckCircle2, X, Plus, Minus, ArrowLeft
} from 'lucide-react';

export default function TaskDetailPage() {
  const { taskId } = useParams();
  const { employee } = useOutletContext();
  const navigate = useNavigate();
  const sigRef = useRef(null);
  const photoInputBefore = useRef(null);
  const photoInputAfter = useRef(null);

  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [parts, setParts] = useState([]);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [gpsLoading, setGpsLoading] = useState(false);
  const [showServiceForm, setShowServiceForm] = useState(false);

  const [form, setForm] = useState({
    work_performed: '',
    remarks: '',
    issues_found: '',
    customer_name: '',
  });

  const [photosBefore, setPhotosBefore] = useState([]);
  const [photosAfter, setPhotosAfter] = useState([]);
  const [partsUsed, setPartsUsed] = useState([]);
  const [availableParts, setAvailableParts] = useState([]);

  useEffect(() => { loadTask(); }, [taskId]);

  const loadTask = async () => {
    try {
      const [taskData, partsData] = await Promise.all([
        workspaceApi.getTask(taskId),
        workspaceApi.getParts()
      ]);
      setTask(taskData);
      setAvailableParts(partsData);
    } catch (error) {
      toast.error('Failed to load task');
    } finally {
      setLoading(false);
    }
  };

  const getGPS = () => {
    setGpsLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setGpsLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
          setGpsLoading(false);
          toast.success('Location captured');
        },
        (err) => {
          toast.error('Could not get location. Please enable GPS.');
          setGpsLoading(false);
        },
        { enableHighAccuracy: true, timeout: 10000 }
      );
    } else {
      toast.error('Geolocation not supported');
      setGpsLoading(false);
    }
  };

  const handleStartTask = async () => {
    try {
      await workspaceApi.changeTaskStatus(taskId, {
        status: 'in_progress',
        by: employee.employee_id,
        gps_lat: gpsLocation?.lat || null,
        gps_lng: gpsLocation?.lng || null
      });
      toast.success('Task started');
      getGPS();
      loadTask();
    } catch (error) {
      toast.error(error.message);
    }
  };

  const handlePhotoCapture = (e, type) => {
    const files = Array.from(e.target.files);
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = (ev) => {
        const base64 = ev.target.result;
        if (type === 'before') {
          setPhotosBefore(prev => [...prev, base64]);
        } else {
          setPhotosAfter(prev => [...prev, base64]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (type, index) => {
    if (type === 'before') {
      setPhotosBefore(prev => prev.filter((_, i) => i !== index));
    } else {
      setPhotosAfter(prev => prev.filter((_, i) => i !== index));
    }
  };

  const addPart = () => {
    setPartsUsed(prev => [...prev, { part_id: '', part_name: '', quantity: 1, serial_number: '' }]);
  };

  const updatePart = (index, field, value) => {
    setPartsUsed(prev => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      if (field === 'part_id') {
        const part = availableParts.find(p => p.id === value);
        if (part) updated[index].part_name = part.name;
      }
      return updated;
    });
  };

  const removePart = (index) => {
    setPartsUsed(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmitEntry = async (e) => {
    e.preventDefault();
    if (!form.work_performed.trim()) {
      toast.error('Please describe the work performed');
      return;
    }

    setSubmitting(true);
    try {
      let endGps = null;
      if (navigator.geolocation) {
        try {
          const pos = await new Promise((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject, { enableHighAccuracy: true, timeout: 5000 })
          );
          endGps = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        } catch (e) { /* skip */ }
      }

      const signature = sigRef.current && !sigRef.current.isEmpty()
        ? sigRef.current.toDataURL()
        : null;

      const entryData = {
        task_id: taskId,
        client_id: task.client_id,
        location_id: task.location_id,
        employee_id: employee.employee_id,
        service_type: task.service_type,
        work_performed: form.work_performed,
        remarks: form.remarks || null,
        issues_found: form.issues_found || null,
        customer_name: form.customer_name || null,
        customer_signature: signature,
        photos_before: photosBefore,
        photos_after: photosAfter,
        parts_used: partsUsed.filter(p => p.part_id),
        start_gps_lat: gpsLocation?.lat || null,
        start_gps_lng: gpsLocation?.lng || null,
        end_gps_lat: endGps?.lat || null,
        end_gps_lng: endGps?.lng || null,
        start_time: task.started_at || new Date().toISOString(),
        end_time: new Date().toISOString(),
        contacts_notified: [],
      };

      await workspaceApi.createServiceEntry(entryData);
      toast.success('Service entry submitted! Task marked as completed.');
      navigate('/workspace/servicebook');
    } catch (error) {
      toast.error(error.message || 'Failed to submit');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-amber-500" />
      </div>
    );
  }

  if (!task) {
    return (
      <div className="p-4 text-center">
        <p className="text-slate-500">Task not found</p>
        <Button variant="outline" onClick={() => navigate('/workspace/servicebook')} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-700',
    assigned: 'bg-blue-100 text-blue-700',
    in_progress: 'bg-violet-100 text-violet-700',
    completed: 'bg-green-100 text-green-700',
  };

  return (
    <div className="p-4 space-y-4 max-w-lg mx-auto pb-24" data-testid="task-detail-page">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/workspace/servicebook')} data-testid="back-btn">
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div className="flex-1">
          <h1 className="text-lg font-bold text-slate-800">{task.title}</h1>
          <Badge className={`text-xs mt-1 ${statusColors[task.status]}`}>{task.status?.replace('_', ' ')}</Badge>
        </div>
      </div>

      {/* Task Info */}
      <Card className="border-slate-200">
        <CardContent className="p-4 space-y-2 text-sm">
          {task.description && <p className="text-slate-600">{task.description}</p>}
          <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
            {task.client_name && (
              <p className="flex items-center gap-1"><Building2 className="w-3 h-3" /> {task.client_name}</p>
            )}
            {task.location_name && (
              <p className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {task.location_name}</p>
            )}
            {task.due_date && (
              <p className="flex items-center gap-1"><Calendar className="w-3 h-3" /> Due: {new Date(task.due_date).toLocaleDateString()}</p>
            )}
            <p className="capitalize">{task.service_type?.replace('_', ' ')}</p>
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      {task.status === 'assigned' && (
        <Button onClick={handleStartTask} className="w-full bg-amber-500 hover:bg-amber-600" data-testid="start-task-btn">
          <Play className="w-4 h-4 mr-2" /> Start Task
        </Button>
      )}

      {task.status === 'in_progress' && !showServiceForm && (
        <Button onClick={() => { setShowServiceForm(true); getGPS(); }} className="w-full bg-green-600 hover:bg-green-700" data-testid="complete-task-btn">
          <CheckCircle2 className="w-4 h-4 mr-2" /> Complete & Submit Entry
        </Button>
      )}

      {task.status === 'pending' && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-center">
          <p className="text-sm text-yellow-700">This task is pending assignment. Contact your supervisor.</p>
        </div>
      )}

      {task.status === 'completed' && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
          <CheckCircle2 className="w-6 h-6 text-green-600 mx-auto mb-1" />
          <p className="text-sm text-green-700 font-medium">This task has been completed.</p>
        </div>
      )}

      {/* Service Entry Form */}
      {showServiceForm && (
        <form onSubmit={handleSubmitEntry} className="space-y-4" data-testid="service-entry-form">
          {/* GPS */}
          <Card className="border-slate-200">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-slate-700">GPS Location</p>
                  {gpsLocation ? (
                    <p className="text-xs text-green-600 mt-0.5">{gpsLocation.lat.toFixed(6)}, {gpsLocation.lng.toFixed(6)}</p>
                  ) : (
                    <p className="text-xs text-slate-400 mt-0.5">Not captured yet</p>
                  )}
                </div>
                <Button type="button" variant="outline" size="sm" onClick={getGPS} disabled={gpsLoading} data-testid="capture-gps-btn">
                  {gpsLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Navigation className="w-4 h-4" />}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Work Performed */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Work Performed *</Label>
            <Textarea
              value={form.work_performed}
              onChange={(e) => setForm({ ...form, work_performed: e.target.value })}
              rows={3}
              placeholder="Describe what was done..."
              required
              data-testid="work-performed-input"
            />
          </div>

          {/* Issues Found */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Issues Found</Label>
            <Textarea
              value={form.issues_found}
              onChange={(e) => setForm({ ...form, issues_found: e.target.value })}
              rows={2}
              placeholder="Any issues discovered..."
              data-testid="issues-found-input"
            />
          </div>

          {/* Remarks */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Remarks</Label>
            <Input
              value={form.remarks}
              onChange={(e) => setForm({ ...form, remarks: e.target.value })}
              placeholder="Additional notes..."
              data-testid="remarks-input"
            />
          </div>

          {/* Photos Before */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" /> Photos - Before
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex gap-2 flex-wrap">
                {photosBefore.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto('before', i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInputBefore.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                  data-testid="photo-before-btn"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <input ref={photoInputBefore} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture(e, 'before')} multiple />
            </CardContent>
          </Card>

          {/* Photos After */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Camera className="w-4 h-4" /> Photos - After
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="flex gap-2 flex-wrap">
                {photosAfter.map((photo, i) => (
                  <div key={i} className="relative w-20 h-20 rounded-lg overflow-hidden border">
                    <img src={photo} alt="" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => removePhoto('after', i)} className="absolute top-0 right-0 bg-red-500 text-white rounded-bl p-0.5">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                ))}
                <button
                  type="button"
                  onClick={() => photoInputAfter.current?.click()}
                  className="w-20 h-20 border-2 border-dashed border-slate-300 rounded-lg flex items-center justify-center text-slate-400 hover:border-amber-400 hover:text-amber-500 transition-colors"
                  data-testid="photo-after-btn"
                >
                  <Camera className="w-6 h-6" />
                </button>
              </div>
              <input ref={photoInputAfter} type="file" accept="image/*" capture="environment" className="hidden" onChange={(e) => handlePhotoCapture(e, 'after')} multiple />
            </CardContent>
          </Card>

          {/* Parts Used */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Parts Used</CardTitle>
                <Button type="button" variant="outline" size="sm" onClick={addPart} data-testid="add-part-used-btn">
                  <Plus className="w-3 h-3 mr-1" /> Add
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              {partsUsed.length === 0 && (
                <p className="text-xs text-slate-400 text-center py-2">No parts used</p>
              )}
              {partsUsed.map((pu, i) => (
                <div key={i} className="flex gap-2 items-end">
                  <div className="flex-1">
                    <Select value={pu.part_id} onValueChange={(val) => updatePart(i, 'part_id', val)}>
                      <SelectTrigger className="h-9 text-xs">
                        <SelectValue placeholder="Select part" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableParts.map(p => (
                          <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <Input
                    type="number"
                    min="1"
                    value={pu.quantity}
                    onChange={(e) => updatePart(i, 'quantity', parseFloat(e.target.value) || 1)}
                    className="w-16 h-9 text-xs"
                    placeholder="Qty"
                  />
                  <Button type="button" variant="ghost" size="sm" onClick={() => removePart(i)} className="h-9 px-2 text-red-500">
                    <Minus className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Customer Signature */}
          <Card className="border-slate-200">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Pen className="w-4 h-4" /> Customer Signature
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 pt-0 space-y-3">
              <div className="space-y-2">
                <Label className="text-xs">Customer Name</Label>
                <Input
                  value={form.customer_name}
                  onChange={(e) => setForm({ ...form, customer_name: e.target.value })}
                  placeholder="Name of person signing"
                  className="h-9 text-sm"
                  data-testid="customer-name-input"
                />
              </div>
              <div className="border-2 border-slate-200 rounded-lg overflow-hidden bg-white" data-testid="signature-pad">
                <SignatureCanvas
                  ref={sigRef}
                  canvasProps={{
                    className: 'w-full',
                    style: { width: '100%', height: '150px' }
                  }}
                  backgroundColor="white"
                />
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => sigRef.current?.clear()}
                className="text-xs"
                data-testid="clear-signature-btn"
              >
                Clear Signature
              </Button>
            </CardContent>
          </Card>

          {/* Submit */}
          <Button
            type="submit"
            className="w-full bg-green-600 hover:bg-green-700 h-12 text-base"
            disabled={submitting}
            data-testid="submit-entry-btn"
          >
            {submitting ? (
              <><Loader2 className="w-5 h-5 animate-spin mr-2" /> Submitting...</>
            ) : (
              <><CheckCircle2 className="w-5 h-5 mr-2" /> Submit Service Entry</>
            )}
          </Button>
        </form>
      )}
    </div>
  );
}
