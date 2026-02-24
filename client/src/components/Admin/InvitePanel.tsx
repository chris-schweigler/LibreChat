import React, { useState } from 'react';
import { useLocalize } from '~/hooks';
import { useAdminUsers, useInviteUser } from '~/data-provider';
import type { TAdminUser } from 'librechat-data-provider';

const roleLabel = (role: string) =>
  role === 'ADMIN' ? (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ background: 'rgba(201,168,124,0.18)', color: '#c9a87c' }}
    >
      ADMIN
    </span>
  ) : (
    <span
      className="rounded px-2 py-0.5 text-xs font-semibold"
      style={{ background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.45)' }}
    >
      USER
    </span>
  );

const UserRow = ({ user }: { user: TAdminUser }) => (
  <div
    className="flex items-center justify-between rounded-lg px-4 py-3"
    style={{ background: 'rgba(255,255,255,0.03)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}
  >
    <div className="min-w-0">
      <p className="truncate text-sm font-medium" style={{ color: 'rgba(255,255,255,0.9)' }}>
        {user.name || '—'}
      </p>
      <p className="truncate text-xs" style={{ color: 'rgba(255,255,255,0.45)' }}>
        {user.email}
      </p>
    </div>
    <div className="ml-4 shrink-0">{roleLabel(user.role)}</div>
  </div>
);

export default function InvitePanel() {
  const localize = useLocalize();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const { data: users, isLoading: loadingUsers } = useAdminUsers();
  const inviteMutation = useInviteUser();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSuccessMsg('');
    setErrorMsg('');

    inviteMutation.mutate(
      { name, email },
      {
        onSuccess: () => {
          setSuccessMsg(localize('com_ui_admin_invite_success'));
          setName('');
          setEmail('');
        },
        onError: (err: unknown) => {
          const msg =
            err &&
            typeof err === 'object' &&
            'response' in err &&
            (err as { response?: { data?: { message?: string } } }).response?.data?.message;
          setErrorMsg(msg || localize('com_ui_admin_invite_error'));
        },
      },
    );
  };

  const inputStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.05)',
    border: '1px solid rgba(255,255,255,0.12)',
    borderRadius: '0.5rem',
    color: 'rgba(255,255,255,0.9)',
    padding: '0.6rem 0.875rem',
    width: '100%',
    fontSize: '0.875rem',
    outline: 'none',
  };

  return (
    <div className="mx-auto max-w-2xl px-4 py-8">
      <h1
        className="mb-6 text-2xl font-bold"
        style={{ color: '#c9a87c' }}
      >
        {localize('com_ui_admin_users_title')}
      </h1>

      {/* Invite form */}
      <div
        className="mb-8 rounded-xl p-6"
        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,124,0.2)' }}
      >
        <h2 className="mb-4 text-base font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {localize('com_ui_admin_invite_title')}
        </h2>
        <form onSubmit={handleSubmit} className="space-y-3">
          <div>
            <label
              htmlFor="invite-name"
              className="mb-1 block text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {localize('com_ui_name')}
            </label>
            <input
              id="invite-name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Max Mustermann"
              style={inputStyle}
              autoComplete="off"
            />
          </div>
          <div>
            <label
              htmlFor="invite-email"
              className="mb-1 block text-xs font-medium"
              style={{ color: 'rgba(255,255,255,0.5)' }}
            >
              {localize('com_auth_email')}
            </label>
            <input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="max@karrieremum.at"
              required
              style={inputStyle}
              autoComplete="off"
            />
          </div>

          {successMsg && (
            <p className="text-sm" style={{ color: '#6ee7b7' }}>
              {successMsg}
            </p>
          )}
          {errorMsg && (
            <p className="text-sm" style={{ color: '#f87171' }}>
              {errorMsg}
            </p>
          )}

          <button
            type="submit"
            disabled={inviteMutation.isLoading || !email}
            className="w-full rounded-lg py-2.5 text-sm font-semibold text-white transition-colors"
            style={{
              background: inviteMutation.isLoading || !email ? 'rgba(168,26,73,0.4)' : '#A81A49',
              cursor: inviteMutation.isLoading || !email ? 'not-allowed' : 'pointer',
            }}
          >
            {inviteMutation.isLoading
              ? localize('com_ui_admin_invite_sending')
              : localize('com_ui_admin_invite_send')}
          </button>
        </form>
      </div>

      {/* User list */}
      <div>
        <h2 className="mb-3 text-base font-semibold" style={{ color: 'rgba(255,255,255,0.85)' }}>
          {localize('com_ui_admin_users_list')}
        </h2>
        {loadingUsers && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {localize('com_ui_loading')}
          </p>
        )}
        {!loadingUsers && (!users || users.length === 0) && (
          <p className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>
            {localize('com_ui_admin_no_users')}
          </p>
        )}
        <div className="overflow-hidden rounded-xl" style={{ border: '1px solid rgba(255,255,255,0.08)' }}>
          {users?.map((u) => <UserRow key={u._id} user={u} />)}
        </div>
      </div>
    </div>
  );
}
