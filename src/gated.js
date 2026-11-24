// Gated action button: a button whose click never runs the action itself. It opens the SDK
// ConfirmDialog with the plan, and only the dialog's confirm runs `onConfirm`. The backend still
// owns the real gate (a server-issued dry-run token, the group check, the audit row); this is the
// human beat in front of it. Nothing here submits a chat message: data-sourced text must never
// reach a chat submit, so a plugin that wants a prompt drafts it into the composer instead.
//
//   h(GatedActionButton, {
//     label: 'Silence alert', icon: 'bell-slash',
//     title: 'Silence this alert for 2 hours?', description: planSummary,
//     confirmLabel: 'Silence', destructive: false,
//     onConfirm: async () => { await api.rest('/silence', { method: 'POST', body }) }
//   })
//
// `onConfirm` may throw: ConfirmDialog shows the message inline and stays open.

import { Button, Codicon, ConfirmDialog } from '@hermes/plugin-sdk'
import { createElement as h, Fragment, useState } from 'react'

export function GatedActionButton({
  label, icon, title, description, confirmLabel, busyLabel, doneLabel, cancelLabel,
  destructive = false, disabled = false, size = 'xs', variant = 'outline', onConfirm
}) {
  const [open, setOpen] = useState(false)
  return h(Fragment, null,
    h(Button, { size, variant: destructive ? 'destructive' : variant, disabled, onClick: () => setOpen(true) },
      icon ? h(Codicon, { name: icon }) : null, label),
    h(ConfirmDialog, {
      open, onClose: () => setOpen(false), onConfirm, title, description, confirmLabel, busyLabel, doneLabel, cancelLabel, destructive
    }))
}
