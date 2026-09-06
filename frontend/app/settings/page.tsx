'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Toast } from '@/components/ui/toast';
import { Modal } from '@/components/ui/modal';
import { Save, Mail, CheckCircle2, LogOut, AlertTriangle } from 'lucide-react';
import { useUserStore } from '@/store/userStore';
import AppShell from '@/components/layout/AppShell';
import { ContactModal } from '@/components/ui/contact-modal';

interface ToastState {
  message: string;
  type: 'success' | 'error';
}

export default function SettingsPage() {
  const router = useRouter();
  const { user, logout } = useUserStore();
  const [defaultTone, setDefaultTone] = useState<'formal' | 'friendly' | 'assertive' | 'short'>('friendly');
  const [signature, setSignature] = useState('');
  const [saving, setSaving] = useState(false);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const [showDisconnectModal, setShowDisconnectModal] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [showContactModal, setShowContactModal] = useState(false);
  const [disconnecting, setDisconnecting] = useState(false);
  const [toast, setToast] = useState<ToastState | null>(null);

  // Load saved preferences on mount
  useEffect(() => {
    const savedTone = localStorage.getItem('defaultTone');
    const savedSignature = localStorage.getItem('emailSignature');
    
    if (savedTone) {
      setDefaultTone(savedTone as any);
    }
    if (savedSignature) {
      setSignature(savedSignature);
    }
  }, []);

  const handleSaveClick = () => {
    setShowSaveModal(true);
  };

  const savePreferences = async () => {
    try {
      setSaving(true);
      
      // Save to localStorage
      localStorage.setItem('defaultTone', defaultTone);
      localStorage.setItem('emailSignature', signature);
      
      setShowSaveModal(false);
      setToast({ message: 'Settings saved successfully!', type: 'success' });
    } catch (error) {
      console.error('Error saving preferences:', error);
      setToast({ message: 'Failed to save settings', type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleDisconnectClick = () => {
    setShowDisconnectModal(true);
  };

  const disconnectGmail = async () => {
    try {
      setDisconnecting(true);
      
      // Clear all user data
      localStorage.removeItem('defaultTone');
      localStorage.removeItem('emailSignature');
      localStorage.removeItem('token');
      localStorage.removeItem('user-storage');
      
      // Logout the user
      logout();
      
      setShowDisconnectModal(false);
      
      // Redirect to login
      router.push('/login');
    } catch (error) {
      console.error('Error disconnecting Gmail:', error);
      setDisconnecting(false);
      setToast({ message: 'Failed to disconnect Gmail', type: 'error' });
    }
  };

  const handleLogoutClick = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    logout();
    router.push('/login');
  };

  return (
    <AppShell>
      <div className="mx-auto max-w-2xl px-4 py-8">
        <h1 className="mb-6 text-xl font-semibold text-slate-900">Settings</h1>

        <div className="space-y-6">
          {/* AI Preferences */}
          <Card className="glass-card border-indigo-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold text-slate-900">
                AI Preferences
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Configure AI behavior for email generation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div>
                <Label htmlFor="defaultTone" className="text-sm font-medium text-slate-700">
                  Default Tone
                </Label>
                <select
                  id="defaultTone"
                  value={defaultTone}
                  onChange={(e) => setDefaultTone(e.target.value as any)}
                  className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                >
                  <option value="formal">Formal - Professional</option>
                  <option value="friendly">Friendly - Warm</option>
                  <option value="assertive">Assertive - Direct</option>
                  <option value="short">Short - Concise</option>
                </select>
                <p className="mt-1.5 text-xs text-slate-500">
                  This tone will be used by default when generating AI replies
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Email Signature */}
          <Card className="glass-card border-indigo-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Mail className="h-4 w-4 text-indigo-600" />
                Email Signature
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Automatically appended to all outgoing emails
              </CardDescription>
            </CardHeader>
            <CardContent>
              <textarea
                id="signature"
                value={signature}
                onChange={(e) => setSignature(e.target.value)}
                className="min-h-[100px] w-full rounded-xl border border-slate-200 bg-white/90 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                placeholder="Best regards,&#10;Your Name&#10;your@email.com"
              />
              <p className="mt-1.5 text-xs text-slate-500">
                This signature will be added at the end of every email you send
              </p>
            </CardContent>
          </Card>

          {/* Connected Account */}
          <Card className="glass-card border-indigo-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                Connected Account
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-100">
                    <Mail className="h-4 w-4 text-indigo-700" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-slate-900">Gmail Connected</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                </div>
              </div>
              <div className="mt-4 flex flex-wrap gap-2">
                <Button
                  size="sm"
                  onClick={() => router.push('/inbox')}
                >
                  Open Inbox
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push('/compose')}
                >
                  Compose
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDisconnectClick}
                  className="border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Disconnect Gmail
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Contact Support */}
          <Card className="glass-card border-indigo-100/80">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-sm font-semibold text-slate-900">
                <Mail className="h-4 w-4 text-indigo-600" />
                Contact Support
              </CardTitle>
              <CardDescription className="text-sm text-slate-600">
                Need help? Reach out to us
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-3">
                <p className="mb-3 text-sm text-slate-600">
                  If you have any questions, issues, or feedback, feel free to contact us.
                </p>
                <button
                  onClick={() => setShowContactModal(true)}
                  className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-blue-600 px-4 py-2 text-sm font-medium text-white transition-all hover:from-indigo-500 hover:to-blue-500"
                >
                  <Mail className="h-4 w-4" />
                  Contact Support
                </button>
              </div>
            </CardContent>
          </Card>

          {/* Save Button */}
          <div className="flex justify-between items-center pt-2">
            <Button
              variant="outline"
              onClick={handleLogoutClick}
              className="text-red-600 border-red-200 hover:bg-red-50 hover:text-red-700"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
            <div className="flex justify-end gap-3">
              <Button 
                variant="outline" 
                onClick={() => router.push('/dashboard')}
              >
                Cancel
              </Button>
              <Button
                onClick={handleSaveClick}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Settings
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Save Confirmation Modal */}
      <Modal
        isOpen={showSaveModal}
        onClose={() => setShowSaveModal(false)}
        title="Save Settings"
        description="Are you sure you want to save these settings? Your preferences will be applied immediately."
        confirmText={saving ? 'Saving...' : 'Save'}
        cancelText="Cancel"
        onConfirm={savePreferences}
        loading={saving}
      />

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Logout"
        description="Are you sure you want to logout from your account?"
        confirmText="Logout"
        cancelText="Cancel"
        onConfirm={confirmLogout}
        confirmVariant="destructive"
      />

      {/* Disconnect Gmail Modal */}
      <Modal
        isOpen={showDisconnectModal}
        onClose={() => setShowDisconnectModal(false)}
        title="Disconnect Gmail"
        confirmText={disconnecting ? 'Disconnecting...' : 'Disconnect'}
        cancelText="Cancel"
        onConfirm={disconnectGmail}
        confirmVariant="destructive"
        loading={disconnecting}
      >
        <div className="flex items-start gap-3 p-3 bg-red-50 rounded-lg border border-red-100 mb-4">
          <AlertTriangle className="h-5 w-5 text-red-600 shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-red-800">Warning</p>
              <p className="mt-1 text-sm text-red-700">
              This will disconnect your Gmail account and log you out. You will need to sign in again to use SmartInboxAI.
            </p>
          </div>
        </div>
        <p className="text-sm text-slate-600">
          All your local settings and preferences will be cleared.
        </p>
      </Modal>

      {/* Toast Notification */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}

      {/* Contact Modal */}
      <ContactModal 
        isOpen={showContactModal} 
        onClose={() => setShowContactModal(false)} 
      />
    </AppShell>
  );
}
