import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import TiptapImage from "@tiptap/extension-image";
import { TextStyle } from "@tiptap/extension-text-style";
import Color from "@tiptap/extension-color";
import TextAlign from "@tiptap/extension-text-align";
import FontFamily from "@tiptap/extension-font-family";
import TiptapLink from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/shared/ui/button";
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Link as LinkIcon,
  Image as ImageIcon,
  List,
  ListOrdered,
  Quote,
  Minus,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Pilcrow,
} from "lucide-react";

const CustomTextStyle = TextStyle.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      fontSize: {
        default: null,
        parseHTML: (el: HTMLElement) => el.style.fontSize || null,
        renderHTML: (attrs: Record<string, unknown>) => {
          if (!attrs.fontSize) return {};
          return { style: `font-size: ${attrs.fontSize}` };
        },
      },
    };
  },
});

interface Props {
  value: string;
  onChange: (html: string) => void;
  placeholder?: string;
  className?: string;
}

const TBtn = ({
  active,
  onClick,
  title,
  children,
}: {
  active?: boolean;
  onClick: () => void;
  title: string;
  children: React.ReactNode;
}) => (
  <button
    type="button"
    title={title}
    onClick={onClick}
    className={cn(
      "p-1.5 rounded text-sm transition-colors hover:bg-muted",
      active ? "bg-muted text-foreground" : "text-muted-foreground"
    )}
  >
    {children}
  </button>
);

const Sep = () => (
  <div className="w-px h-5 bg-border mx-0.5 self-center shrink-0" />
);

const FONT_SIZES = ["12px", "14px", "16px", "18px", "20px", "24px", "32px", "48px"];

export const RichTextEditor = ({
  value,
  onChange,
  placeholder,
  className,
}: Props) => {
  const [linkOpen, setLinkOpen] = useState(false);
  const [linkUrl, setLinkUrl] = useState("");
  const [imgOpen, setImgOpen] = useState(false);
  const [imgUrl, setImgUrl] = useState("");

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: { levels: [1, 2, 3] } }),
      Underline,
      CustomTextStyle,
      Color,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      FontFamily,
      TiptapLink.configure({
        openOnClick: false,
        HTMLAttributes: { class: "text-primary underline cursor-pointer" },
      }),
      TiptapImage.configure({
        HTMLAttributes: { class: "max-w-full rounded-lg my-3" },
      }),
      Placeholder.configure({ placeholder: placeholder ?? "Начните писать..." }),
    ],
    content: value || "",
    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class:
          "focus:outline-none min-h-[220px] px-4 py-3 prose prose-sm dark:prose-invert max-w-none",
      },
    },
  });

  useEffect(() => {
    if (editor && value !== undefined && value !== editor.getHTML()) {
      editor.commands.setContent(value || "", { emitUpdate: false });
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value]);

  if (!editor) return null;

  const applyLink = () => {
    const u = linkUrl.trim();
    if (u) editor.chain().focus().setLink({ href: u }).run();
    else editor.chain().focus().unsetLink().run();
    setLinkUrl("");
    setLinkOpen(false);
  };

  const applyImage = () => {
    const u = imgUrl.trim();
    if (u) editor.chain().focus().setImage({ src: u }).run();
    setImgUrl("");
    setImgOpen(false);
  };

  return (
    <div className={cn("border rounded-md overflow-hidden bg-background", className)}>
      {/* Toolbar */}
      <div className="border-b bg-muted/30 px-2 py-1.5 flex flex-wrap items-center gap-0.5">
        <TBtn title="Отменить" onClick={() => editor.chain().focus().undo().run()}>
          <Undo className="w-4 h-4" />
        </TBtn>
        <TBtn title="Повторить" onClick={() => editor.chain().focus().redo().run()}>
          <Redo className="w-4 h-4" />
        </TBtn>
        <Sep />
        <TBtn
          title="H1"
          active={editor.isActive("heading", { level: 1 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="H2"
          active={editor.isActive("heading", { level: 2 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="H3"
          active={editor.isActive("heading", { level: 3 })}
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Обычный текст"
          active={editor.isActive("paragraph")}
          onClick={() => editor.chain().focus().setParagraph().run()}
        >
          <Pilcrow className="w-4 h-4" />
        </TBtn>
        <Sep />
        <TBtn
          title="Жирный (Ctrl+B)"
          active={editor.isActive("bold")}
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Курсив (Ctrl+I)"
          active={editor.isActive("italic")}
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Подчёркнутый"
          active={editor.isActive("underline")}
          onClick={() => editor.chain().focus().toggleUnderline().run()}
        >
          <UnderlineIcon className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Зачёркнутый"
          active={editor.isActive("strike")}
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="w-4 h-4" />
        </TBtn>
        <Sep />
        {/* Font size */}
        <select
          title="Размер шрифта"
          className="text-xs border rounded px-1 h-7 bg-background text-muted-foreground cursor-pointer"
          defaultValue=""
          onChange={(e) => {
            const size = e.target.value;
            if (size) {
              editor.chain().focus().setMark("textStyle", { fontSize: size }).run();
            }
            e.target.value = "";
          }}
        >
          <option value="" disabled>
            Размер
          </option>
          {FONT_SIZES.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        {/* Color */}
        <label
          title="Цвет текста"
          className="cursor-pointer relative p-1.5 rounded hover:bg-muted flex items-center"
        >
          <span
            className="text-sm font-bold select-none"
            style={{
              color: editor.getAttributes("textStyle").color || "currentColor",
              textDecoration: "underline",
            }}
          >
            A
          </span>
          <input
            type="color"
            className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            onChange={(e) =>
              editor.chain().focus().setColor(e.target.value).run()
            }
          />
        </label>
        <Sep />
        <TBtn
          title="По левому краю"
          active={editor.isActive({ textAlign: "left" })}
          onClick={() => editor.chain().focus().setTextAlign("left").run()}
        >
          <AlignLeft className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="По центру"
          active={editor.isActive({ textAlign: "center" })}
          onClick={() => editor.chain().focus().setTextAlign("center").run()}
        >
          <AlignCenter className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="По правому краю"
          active={editor.isActive({ textAlign: "right" })}
          onClick={() => editor.chain().focus().setTextAlign("right").run()}
        >
          <AlignRight className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="По ширине"
          active={editor.isActive({ textAlign: "justify" })}
          onClick={() => editor.chain().focus().setTextAlign("justify").run()}
        >
          <AlignJustify className="w-4 h-4" />
        </TBtn>
        <Sep />
        <TBtn
          title="Маркированный список"
          active={editor.isActive("bulletList")}
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Нумерованный список"
          active={editor.isActive("orderedList")}
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Цитата"
          active={editor.isActive("blockquote")}
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="w-4 h-4" />
        </TBtn>
        <TBtn
          title="Горизонтальная линия"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="w-4 h-4" />
        </TBtn>
        <Sep />
        {/* Link popover */}
        <div className="relative">
          <TBtn
            title="Ссылка"
            active={editor.isActive("link")}
            onClick={() => {
              setLinkUrl(editor.getAttributes("link").href || "");
              setLinkOpen((v) => !v);
              setImgOpen(false);
            }}
          >
            <LinkIcon className="w-4 h-4" />
          </TBtn>
          {linkOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-md shadow-lg p-2 flex gap-1 min-w-64">
              <input
                autoFocus
                className="flex-1 text-xs border rounded px-2 py-1 bg-background"
                placeholder="https://example.com"
                value={linkUrl}
                onChange={(e) => setLinkUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyLink();
                  if (e.key === "Escape") setLinkOpen(false);
                }}
              />
              <Button
                size="sm"
                type="button"
                onClick={applyLink}
                className="h-6 text-xs px-2"
              >
                OK
              </Button>
            </div>
          )}
        </div>
        {/* Image popover */}
        <div className="relative">
          <TBtn
            title="Вставить изображение"
            onClick={() => {
              setImgUrl("");
              setImgOpen((v) => !v);
              setLinkOpen(false);
            }}
          >
            <ImageIcon className="w-4 h-4" />
          </TBtn>
          {imgOpen && (
            <div className="absolute top-full left-0 mt-1 z-50 bg-background border rounded-md shadow-lg p-2 flex gap-1 min-w-72">
              <input
                autoFocus
                className="flex-1 text-xs border rounded px-2 py-1 bg-background"
                placeholder="URL изображения..."
                value={imgUrl}
                onChange={(e) => setImgUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") applyImage();
                  if (e.key === "Escape") setImgOpen(false);
                }}
              />
              <Button
                size="sm"
                type="button"
                onClick={applyImage}
                className="h-6 text-xs px-2"
              >
                OK
              </Button>
            </div>
          )}
        </div>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
};
