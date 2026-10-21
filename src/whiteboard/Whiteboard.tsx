import { Tldraw, type TLComponents } from 'tldraw'
import 'tldraw/tldraw.css'
import ExportPanel from './ExportPanel'

const components: TLComponents = {
  SharePanel: ExportPanel,
}

export default function Whiteboard() {
  return (
    <div className="whiteboard">
      <Tldraw components={components} persistenceKey='gg-whiteboard' />
    </div>
  )
}
