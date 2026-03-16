import { useState, useCallback, useEffect } from 'react'

export function LogoDropzone({ value, currentUrl, onChange, onRemove, id = 'logo-input' }) {
  const [dragOver, setDragOver] = useState(false)
  const [dropHint, setDropHint] = useState(null)
  const [dropLoading, setDropLoading] = useState(false)
  const [blobUrl, setBlobUrl] = useState(null)

  useEffect(() => {
    if (value) {
      const url = URL.createObjectURL(value)
      setBlobUrl(url)
      return () => URL.revokeObjectURL(url)
    }
    setBlobUrl(null)
  }, [value])

  const previewUrl = blobUrl || currentUrl

  const handleDrop = useCallback((e) => {
    const dt = e.dataTransfer
    e.preventDefault()
    e.stopPropagation()
    setDragOver(false)
    setDropHint(null)

    let file = dt?.files?.[0]
    if (!file && dt?.items?.length) {
      const items = Array.from(dt.items)
      for (const item of items) {
        if (item.kind === 'file') {
          const f = item.getAsFile()
          if (f && (f.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(f.name))) {
            file = f
            break
          }
          if (f && !file) file = f
        }
      }
    }

    if (file && (file.type.startsWith('image/') || /\.(jpe?g|png|gif|webp|svg)$/i.test(file.name))) {
      onChange(file)
      return
    }

    const uriItem = dt?.items && Array.from(dt.items).find((i) => i.kind === 'string' && i.type === 'text/uri-list')
    if (uriItem) {
      uriItem.getAsString(async (url) => {
        url = url.trim().split(/[\r\n]+/)[0]
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          setDropHint('Drag from Finder not supported — use "Click to upload" instead.')
          return
        }
        if (url.includes('google.com/imgres') && url.includes('imgurl=')) {
          const m = url.match(/imgurl=([^&]+)/)
          if (m) url = decodeURIComponent(m[1])
        }
        const looksLikeImage = /\.(jpe?g|png|gif|webp|svg|bmp)(\?|$)/i.test(url) || /\/[^/]*\.(jpe?g|png|gif|webp)(\?|$)/i.test(url)
        if (!looksLikeImage && (url.endsWith('.html') || url.includes('/news/') || url.includes('/article'))) {
          setDropHint('That\'s a webpage link, not an image. Right‑click the image → "Copy image address" or "Save image as", then upload.')
          return
        }
        setDropLoading(true)
        try {
          const res = await fetch(url, { mode: 'cors' })
          if (!res.ok) throw new Error(res.status)
          const blob = await res.blob()
          if (!blob.type.startsWith('image/')) throw new Error('Not an image')
          const ext = blob.type.split('/')[1] || 'png'
          onChange(new File([blob], `logo.${ext}`, { type: blob.type }))
        } catch {
          setDropHint('Couldn\'t load image — the site may block linking. Right‑click the image → "Save image as", then upload.')
        } finally {
          setDropLoading(false)
        }
      })
    }
  }, [onChange])

  const handleFileInput = (e) => {
    const file = e.target.files[0]
    if (file) {
      onChange(file)
      setDropHint(null)
    }
  }

  const removeLogo = () => {
    onChange(null)
  }

  useEffect(() => {
    if (!dropHint) return
    const t = setTimeout(() => setDropHint(null), 5000)
    return () => clearTimeout(t)
  }, [dropHint])

  return (
    <label
      htmlFor={id}
      className={`logo-dropzone ${dragOver ? 'drag-over' : ''} ${previewUrl ? 'has-preview' : ''} ${dropLoading ? 'drop-loading' : ''}`}
      onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true) }}
      onDragEnter={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; setDragOver(true); setDropHint(null) }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
    >
      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={handleFileInput}
        className="logo-input-hidden"
      />
      {previewUrl ? (
        <div className="logo-preview" onClick={(e) => e.preventDefault()}>
          <img src={previewUrl} alt="Logo preview" />
          <div className="logo-preview-actions">
            <button type="button" className="remove-logo" onClick={(e) => { e.preventDefault(); e.stopPropagation(); removeLogo() }}>
              Change
            </button>
            {currentUrl && onRemove && (
              <button type="button" className="remove-logo remove-logo-danger" onClick={(e) => { e.preventDefault(); e.stopPropagation(); onRemove() }}>
                Remove
              </button>
            )}
          </div>
        </div>
      ) : (
        <>
          <span>{dropLoading ? 'Loading image...' : 'Drag & drop or click to upload'}</span>
          {dropHint && <span className="logo-dropzone-hint">{dropHint}</span>}
        </>
      )}
    </label>
  )
}
