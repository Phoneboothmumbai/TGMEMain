import React, { useState, useEffect } from 'react';
import { usePortalAuth, portalApi } from '../../contexts/PortalAuthContext';
import { Card, CardContent } from '../../components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '../../components/ui/table';
import { Loader2, Users, Phone, Mail } from 'lucide-react';

export default function PortalContactsPage() {
  const { token } = usePortalAuth();
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    portalApi.getEmployees(token).then(setContacts).catch(console.error).finally(() => setLoading(false));
  }, [token]);

  if (loading) return <div className="flex items-center justify-center h-64"><Loader2 className="w-8 h-8 animate-spin text-amber-500" /></div>;

  return (
    <div className="space-y-4 max-w-4xl" data-testid="portal-contacts-page">
      <h1 className="text-xl font-bold text-slate-800 flex items-center gap-2"><Users className="w-5 h-5" /> Our Contacts</h1>

      <Card><CardContent className="p-0">
        <Table>
          <TableHeader><TableRow>
            <TableHead>Name</TableHead><TableHead>Designation</TableHead><TableHead>Phone</TableHead><TableHead>Email</TableHead>
          </TableRow></TableHeader>
          <TableBody>
            {contacts.length === 0 && <TableRow><TableCell colSpan={4} className="text-center py-12 text-slate-400">No contacts on file.</TableCell></TableRow>}
            {contacts.map(c => (
              <TableRow key={c.id} data-testid={`portal-contact-${c.id}`}>
                <TableCell className="font-medium text-sm">{c.name}</TableCell>
                <TableCell className="text-sm text-slate-500">{c.designation || '—'}</TableCell>
                <TableCell className="text-sm">
                  {c.phone ? <a href={`tel:${c.phone}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Phone className="w-3 h-3" />{c.phone}</a> : '—'}
                </TableCell>
                <TableCell className="text-sm">
                  {c.email ? <a href={`mailto:${c.email}`} className="flex items-center gap-1 text-blue-600 hover:underline"><Mail className="w-3 h-3" />{c.email}</a> : '—'}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent></Card>
    </div>
  );
}
