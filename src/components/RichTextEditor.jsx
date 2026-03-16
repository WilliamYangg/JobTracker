import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { useCallback, useEffect } from 'react'

export function RichTextEditor({ content, onChange, placeholder = 'Add notes...' }) {
  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: false,
        codeBlock: false,
        blockquote: false,
        horizontalRule: false,
      }),
      Placeholder.configure({ placeholder }),
    ],
    content: content || '',
    editorProps: {
      attributes: {
        class: 'rich-text-editor',
      },
    },
  })

  // Sync content when prop changes (e.g. switching to different application)
  useEffect(() => {
    if (editor && content !== undefined) {
      const current = editor.getHTML()
      const next = content || ''
      if (current !== next) {
        editor.commands.setContent(next, false)
      }
    }
  }, [editor, content])

  useEffect(() => {
    if (!editor) return
    const handleUpdate = () => onChange?.(editor.getHTML())
    editor.on('update', handleUpdate)
    return () => editor.off('update', handleUpdate)
  }, [editor, onChange])

  const setBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor])
  const setItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor])
  const setStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor])
  const setCode = useCallback(() => editor?.chain().focus().toggleCode().run(), [editor])
  const setBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor])
  const setOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor])

  if (!editor) return null

  return (
    <div className="rich-text-wrapper">
      <div className="rich-text-toolbar">
        <button
          type="button"
          onClick={setBold}
          className={editor.isActive('bold') ? 'active' : ''}
          title="Bold"
        >
          <b>B</b>
        </button>
        <button
          type="button"
          onClick={setItalic}
          className={editor.isActive('italic') ? 'active' : ''}
          title="Italic"
        >
          <i>I</i>
        </button>
        <button
          type="button"
          onClick={setStrike}
          className={editor.isActive('strike') ? 'active' : ''}
          title="Strikethrough"
        >
          <s>S</s>
        </button>
        <button
          type="button"
          onClick={setCode}
          className={editor.isActive('code') ? 'active' : ''}
          title="Code"
        >
          {'</>'}
        </button>
        <span className="toolbar-divider" />
        <button
          type="button"
          onClick={setBulletList}
          className={editor.isActive('bulletList') ? 'active' : ''}
          title="Bullet list"
        >
          •
        </button>
        <button
          type="button"
          onClick={setOrderedList}
          className={editor.isActive('orderedList') ? 'active' : ''}
          title="Numbered list"
        >
          1.
        </button>
      </div>
      <EditorContent editor={editor} />
    </div>
  )
}
