import { getSnapshot, loadSnapshot, useEditor, type TLEditorSnapshot } from '@tldraw/editor'
import { useRef } from 'react'
import { TldrawUiButton, TldrawUiButtonLabel, useToasts } from 'tldraw'

function downloadBlob(blob: Blob, filename: string) {
  const link = document.createElement('a')
  link.href = URL.createObjectURL(blob)
  link.download = filename
  link.click()
  URL.revokeObjectURL(link.href)
}

function isEditorSnapshot(value: unknown): value is TLEditorSnapshot {
  return typeof value === 'object' && value !== null && 'document' in value && 'session' in value
}

export default function ExportPanel() {
  const editor = useEditor()
  const { addToast } = useToasts()
  const fileInputRef = useRef<HTMLInputElement>(null)

  const exportPng = async () => {
    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) {
      addToast({
        title: 'Nothing to export',
        description: 'Add something to the page first.',
        severity: 'info',
      })
      return
    }

    try {
      const { blob } = await editor.toImage(shapeIds, { format: 'png', background: true })
      downloadBlob(blob, 'whiteboard.png')
    } catch {
      addToast({
        title: 'Could not export PNG',
        severity: 'error',
      })
    }
  }

  const downloadJson = () => {
    const snapshot = getSnapshot(editor.store)
    const blob = new Blob([JSON.stringify(snapshot)], { type: 'application/json' })
    downloadBlob(blob, 'whiteboard.json')
  }

  const openJson = async (file: File) => {
    let parsed: unknown
    try {
      parsed = JSON.parse(await file.text())
    } catch {
      addToast({
        title: 'That file is not valid JSON',
        severity: 'error',
      })
      return
    }

    if (!isEditorSnapshot(parsed)) {
      addToast({
        title: 'That file is not a whiteboard snapshot',
        severity: 'error',
      })
      return
    }

    if (editor.getCurrentPageShapeIds().size > 0) {
      const replace = window.confirm('Replace the current board with this file?')
      if (!replace) return
    }

    try {
      loadSnapshot(editor.store, parsed)
    } catch {
      addToast({
        title: 'Could not open that whiteboard file',
        severity: 'error',
      })
    }
  }

  return (
    <div className="export-panel">
      <TldrawUiButton type="normal" onClick={() => void exportPng()}>
        <TldrawUiButtonLabel>Export PNG</TldrawUiButtonLabel>
      </TldrawUiButton>
      <TldrawUiButton type="normal" onClick={downloadJson}>
        <TldrawUiButtonLabel>Download JSON</TldrawUiButtonLabel>
      </TldrawUiButton>
      <TldrawUiButton type="normal" onClick={() => fileInputRef.current?.click()}>
        <TldrawUiButtonLabel>Open JSON</TldrawUiButtonLabel>
      </TldrawUiButton>
      <input
        ref={fileInputRef}
        className="export-panel-file"
        type="file"
        accept="application/json,.json"
        onChange={(event) => {
          const file = event.target.files?.[0]
          event.target.value = ''
          if (file) void openJson(file)
        }}
      />
    </div>
  )
}
