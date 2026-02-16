import React from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Link from '@tiptap/extension-link';
import Image from '@tiptap/extension-image';
import Table from '@tiptap/extension-table';
import TableRow from '@tiptap/extension-table-row';
import TableCell from '@tiptap/extension-table-cell';
import TableHeader from '@tiptap/extension-table-header';
import Placeholder from '@tiptap/extension-placeholder';
import { Button } from '../ui/button';
import {
  Bold, Italic, Underline, Strikethrough, Code,
  Heading1, Heading2, Heading3, List, ListOrdered,
  Quote, Minus, Link as LinkIcon, Image as ImageIcon,
  Table as TableIcon, Undo, Redo, AlignLeft
} from 'lucide-react';
import { useAuth, kbApi } from '../../contexts/KBAuthContext';
import { toast } from 'sonner';

const MenuButton = ({ onClick, active, disabled, children, title }) => (
  <button
    onClick={onClick}
    disabled={disabled}
    title={title}
    className={`p-2 rounded hover:bg-slate-100 transition-colors ${
      active ? 'bg-amber-100 text-amber-700' : 'text-slate-600'
    } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
  >
    {children}
  </button>
);

const RichTextEditor = ({ content, onChange, placeholder = 'Write something...' }) => {
  const { token } = useAuth();

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3]
        }
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-amber-600 underline'
        }
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'max-w-full rounded-lg my-4'
        }
      }),
      Table.configure({
        resizable: true,
        HTMLAttributes: {
          class: 'border-collapse border border-slate-300 w-full my-4'
        }
      }),
      TableRow,
      TableCell.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2'
        }
      }),
      TableHeader.configure({
        HTMLAttributes: {
          class: 'border border-slate-300 p-2 bg-slate-100 font-semibold'
        }
      }),
      Placeholder.configure({
        placeholder
      })
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    }
  });

  if (!editor) {
    return null;
  }

  const addLink = () => {
    const url = window.prompt('Enter URL:');
    if (url) {
      editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
    }
  };

  const addImage = async () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const response = await kbApi.uploadImage(token, file);
          const url = `${process.env.REACT_APP_BACKEND_URL}${response.data.url}`;
          editor.chain().focus().setImage({ src: url }).run();
          toast.success('Image uploaded!');
        } catch (error) {
          toast.error('Failed to upload image');
        }
      }
    };
    input.click();
  };

  const addImageFromUrl = () => {
    const url = window.prompt('Enter image URL:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addTable = () => {
    editor.chain().focus().insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run();
  };

  return (
    <div className="border border-slate-300 rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-slate-200 bg-slate-50">
        {/* Text Formatting */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBold().run()}
          active={editor.isActive('bold')}
          title="Bold"
        >
          <Bold size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleItalic().run()}
          active={editor.isActive('italic')}
          title="Italic"
        >
          <Italic size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleStrike().run()}
          active={editor.isActive('strike')}
          title="Strikethrough"
        >
          <Strikethrough size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleCode().run()}
          active={editor.isActive('code')}
          title="Inline Code"
        >
          <Code size={18} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Headings */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
          active={editor.isActive('heading', { level: 1 })}
          title="Heading 1"
        >
          <Heading1 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
          active={editor.isActive('heading', { level: 2 })}
          title="Heading 2"
        >
          <Heading2 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
          active={editor.isActive('heading', { level: 3 })}
          title="Heading 3"
        >
          <Heading3 size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setParagraph().run()}
          active={editor.isActive('paragraph')}
          title="Paragraph"
        >
          <AlignLeft size={18} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Lists */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleBulletList().run()}
          active={editor.isActive('bulletList')}
          title="Bullet List"
        >
          <List size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
          active={editor.isActive('orderedList')}
          title="Numbered List"
        >
          <ListOrdered size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
          active={editor.isActive('blockquote')}
          title="Quote"
        >
          <Quote size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
          title="Horizontal Rule"
        >
          <Minus size={18} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Media & Links */}
        <MenuButton onClick={addLink} active={editor.isActive('link')} title="Add Link">
          <LinkIcon size={18} />
        </MenuButton>
        <MenuButton onClick={addImage} title="Upload Image">
          <ImageIcon size={18} />
        </MenuButton>
        <MenuButton onClick={addTable} title="Insert Table">
          <TableIcon size={18} />
        </MenuButton>

        <div className="w-px h-6 bg-slate-300 mx-1" />

        {/* Code Block */}
        <MenuButton
          onClick={() => editor.chain().focus().toggleCodeBlock().run()}
          active={editor.isActive('codeBlock')}
          title="Code Block"
        >
          <Code size={18} className="text-purple-600" />
        </MenuButton>

        <div className="flex-1" />

        {/* Undo/Redo */}
        <MenuButton
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
          title="Undo"
        >
          <Undo size={18} />
        </MenuButton>
        <MenuButton
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
          title="Redo"
        >
          <Redo size={18} />
        </MenuButton>
      </div>

      {/* Editor Content */}
      <EditorContent 
        editor={editor} 
        className="prose prose-slate max-w-none p-4 min-h-[300px] focus:outline-none"
      />

      <style>{`
        .ProseMirror {
          min-height: 300px;
          outline: none;
        }
        .ProseMirror p.is-editor-empty:first-child::before {
          color: #94a3b8;
          content: attr(data-placeholder);
          float: left;
          height: 0;
          pointer-events: none;
        }
        .ProseMirror h1 { font-size: 2em; font-weight: bold; margin: 1em 0 0.5em; }
        .ProseMirror h2 { font-size: 1.5em; font-weight: bold; margin: 1em 0 0.5em; }
        .ProseMirror h3 { font-size: 1.25em; font-weight: bold; margin: 1em 0 0.5em; }
        .ProseMirror ul { list-style-type: disc; padding-left: 1.5em; }
        .ProseMirror ol { list-style-type: decimal; padding-left: 1.5em; }
        .ProseMirror blockquote { border-left: 3px solid #e2e8f0; padding-left: 1em; margin: 1em 0; color: #64748b; }
        .ProseMirror pre { background: #1e293b; color: #e2e8f0; padding: 1em; border-radius: 0.5em; overflow-x: auto; }
        .ProseMirror code { background: #f1f5f9; padding: 0.2em 0.4em; border-radius: 0.25em; font-size: 0.9em; }
        .ProseMirror pre code { background: transparent; padding: 0; }
        .ProseMirror hr { border: none; border-top: 1px solid #e2e8f0; margin: 1.5em 0; }
        .ProseMirror img { max-width: 100%; border-radius: 0.5em; }
        .ProseMirror table { border-collapse: collapse; width: 100%; margin: 1em 0; }
        .ProseMirror th, .ProseMirror td { border: 1px solid #e2e8f0; padding: 0.5em; }
        .ProseMirror th { background: #f8fafc; font-weight: 600; }
      `}</style>
    </div>
  );
};

export default RichTextEditor;
