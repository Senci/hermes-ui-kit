// A table on SDK primitives. The SDK ships no Table, so this is a plain semantic <table> styled
// only with theme tokens, plus the SDK EmptyState when there is nothing to show.
//
//   h(Table, {
//     columns: [{ label: 'Key' }, { label: 'Age', align: 'right' }],
//     rows, renderRow: row => [h('tr', { key: row.id }, h('td', { style: cell }, row.id))],
//     empty: { title: 'Nothing here', description: 'No row matches this filter.' }
//   })
//
// renderRow may return one row or an array of rows (a row plus its detail row).

import { EmptyState } from '@hermes/plugin-sdk'
import { createElement as h } from 'react'

import { muted } from './theme.js'

export const cell = { padding: '6px 8px', verticalAlign: 'top', borderTop: `1px solid var(--ui-stroke-tertiary, var(--border))` }

export function Table({ columns, rows, renderRow, empty, fontSize = 13 }) {
  if (!rows.length) return h(EmptyState, empty)
  return h('table', { style: { width: '100%', borderCollapse: 'collapse', fontSize } },
    h('thead', null, h('tr', { style: { ...muted, fontSize: 11, textAlign: 'left' } },
      columns.map((c, i) =>
        h('th', { key: i, style: { padding: '4px 8px', fontWeight: 500, textAlign: c.align === 'right' ? 'right' : 'left' } }, c.label)))),
    h('tbody', null, rows.flatMap(renderRow)))
}
