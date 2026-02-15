
import { EditorContent, useEditor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, List, ListOrdered, Heading1, Heading2, Quote, Undo, Redo, Paperclip } from 'lucide-react'
import { Button } from '@/shared/ui/button'

interface RichTextEditorProps {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    disabled?: boolean
}

const MenuBar = ({ editor }: { editor: any }) => {
    if (!editor) {
        return null
    }

    return (
        <div className="flex flex-wrap gap-1 p-2 border-b border-gray-200 bg-gray-50 rounded-t-lg">
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBold().run()}
                className={editor.isActive('bold') ? 'is-active bg-gray-200' : ''}
                title="Bold"
            >
                <Bold className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleItalic().run()}
                className={editor.isActive('italic') ? 'is-active bg-gray-200' : ''}
                title="Italic"
            >
                <Italic className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBulletList().run()}
                className={editor.isActive('bulletList') ? 'is-active bg-gray-200' : ''}
                title="Bullet List"
            >
                <List className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleOrderedList().run()}
                className={editor.isActive('orderedList') ? 'is-active bg-gray-200' : ''}
                title="Ordered List"
            >
                <ListOrdered className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
                className={editor.isActive('heading', { level: 1 }) ? 'is-active bg-gray-200' : ''}
                title="Heading 1"
            >
                <Heading1 className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
                className={editor.isActive('heading', { level: 2 }) ? 'is-active bg-gray-200' : ''}
                title="Heading 2"
            >
                <Heading2 className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().toggleBlockquote().run()}
                className={editor.isActive('blockquote') ? 'is-active bg-gray-200' : ''}
                title="Quote"
            >
                <Quote className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    // Placeholder for attachment logic
                    alert("Tính năng đính kèm đang được phát triển")
                }}
                title="Attach File"
            >
                <Paperclip className="w-4 h-4" />
            </Button>
            <div className="w-px h-6 bg-gray-300 mx-1 self-center" />
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().undo().run()}
                disabled={!editor.can().chain().focus().undo().run()}
                title="Undo"
            >
                <Undo className="w-4 h-4" />
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => editor.chain().focus().redo().run()}
                disabled={!editor.can().chain().focus().redo().run()}
                title="Redo"
            >
                <Redo className="w-4 h-4" />
            </Button>
        </div>
    )
}

export const RichTextEditor = ({ value, onChange, placeholder, disabled }: RichTextEditorProps) => {
    const editor = useEditor({
        extensions: [
            StarterKit,
            Placeholder.configure({
                placeholder: placeholder || 'Write something...',
            }),
        ],
        content: value,
        editable: !disabled,
        onUpdate: ({ editor }) => {
            onChange(editor.getHTML())
        },
        editorProps: {
            attributes: {
                class: 'prose prose-sm p-3 focus:outline-none min-h-[80px]',
            },
        },
    })

    // Sync content if value changes externally (and editor content is different)
    // This part can be tricky with RTEs to avoid cursor jumping, usually check if content is same
    // For now simple implementation

    return (
        <div className="border border-gray-200 rounded-lg overflow-hidden bg-white shadow-sm focus-within:ring-2 focus-within:ring-offset-2 ring-primary">
            <MenuBar editor={editor} />
            <EditorContent editor={editor} />
        </div>
    )
}
