import React, {
  useState,
  useRef,
  useCallback,
  forwardRef,
  useImperativeHandle,
  useEffect,
} from 'react';
import { Tooltip, Switch } from 'antd';
import {
  BoldOutlined,
  ItalicOutlined,
  UnderlineOutlined,
  CodeOutlined,
  LinkOutlined,
  OrderedListOutlined,
  UnorderedListOutlined,
  StrikethroughOutlined,
  FontSizeOutlined,
  FunctionOutlined,
  CalculatorOutlined,
  EyeOutlined,
  EditOutlined,
  UndoOutlined,
  FullscreenOutlined,
  FullscreenExitOutlined,
} from '@ant-design/icons';
import TextArea from 'antd/lib/input/TextArea';
import katex from 'katex';
import 'katex/dist/katex.min.css';
import './solution-editor.component.scss';

export interface SolutionEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  readonly?: boolean;
  showToolbar?: boolean;
  className?: string;
  minHeight?: number;
}

export interface SolutionEditorRef {
  focus: () => void;
  blur: () => void;
  insertText: (before: string, after?: string) => void;
  getSelection: () => { start: number; end: number; text: string };
  undo: () => void;
  toggleFullscreen: () => void;
}

export const SolutionEditor = forwardRef<
  SolutionEditorRef,
  SolutionEditorProps
>(
  (
    {
      value = '',
      onChange,
      placeholder = 'Начните писать ваше решение...',
      disabled = false,
      readonly = false,
      showToolbar = true,
      className = '',
      minHeight = 300,
    },
    ref
  ) => {
    const [focused, setFocused] = useState(false);
    const [previewMode, setPreviewMode] = useState(readonly);
    const [isFullscreen, setIsFullscreen] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [history, setHistory] = useState<string[]>([]);
    const [hasSelection, setHasSelection] = useState(false);
    const [currentSelection, setCurrentSelection] = useState<{
      start: number;
      end: number;
    } | null>(null);
    const textareaRef = useRef<HTMLTextAreaElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const checkMobile = () => setIsMobile(window.innerWidth <= 768);
      checkMobile();
      window.addEventListener('resize', checkMobile);
      return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Обработка полноэкранного режима
    useEffect(() => {
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isFullscreen) {
          setIsFullscreen(false);
        }
      };

      if (isFullscreen) {
        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }

      return () => {
        document.removeEventListener('keydown', handleEscape);
        document.body.style.overflow = '';
      };
    }, [isFullscreen]);

    const saveToHistory = useCallback((currentValue: string) => {
      setHistory((prev) => {
        const newHistory = [...prev, currentValue];
        return newHistory.length > 50 ? newHistory.slice(-50) : newHistory;
      });
    }, []);

    const undo = useCallback(() => {
      if (history.length > 0 && onChange) {
        const lastValue = history[history.length - 1];
        setHistory((prev) => prev.slice(0, -1));
        onChange(lastValue);
      }
    }, [history, onChange]);

    const toggleFullscreen = useCallback(() => {
      setIsFullscreen(!isFullscreen);
    }, [isFullscreen]);

    const handleFocus = () => {
      setFocused(true);
    };

    const handleBlur = () => {
      setFocused(false);
    };

    const handleSelectionChange = useCallback((e: React.SyntheticEvent) => {
      const textarea = e.target as HTMLTextAreaElement;
      if (textarea) {
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;

        if (start !== end) {
          setCurrentSelection({ start, end });
          setHasSelection(true);
        } else {
          setCurrentSelection(null);
          setHasSelection(false);
        }
      }
    }, []);

    const insertText = useCallback(
      (before: string, after: string = '', replaceText?: string) => {
        if (disabled || readonly || !onChange) return;

        saveToHistory(value);
        const selection = currentSelection || { start: 0, end: 0 };
        const selectedText =
          replaceText || value.slice(selection.start, selection.end);
        const beforeText = value.slice(0, selection.start);
        const afterText = value.slice(selection.end);
        const newText = beforeText + before + selectedText + after + afterText;

        onChange(newText);
        setCurrentSelection(null);
        setHasSelection(false);

        requestAnimationFrame(() => {
          const textarea = textareaRef.current;
          if (textarea && typeof textarea.setSelectionRange === 'function') {
            textarea.focus();
            if (selectedText) {
              const newStart = selection.start + before.length;
              const newEnd = newStart + selectedText.length;
              textarea.setSelectionRange(newStart, newEnd);
            } else {
              const cursorPos = selection.start + before.length;
              textarea.setSelectionRange(cursorPos, cursorPos);
            }
          }
        });
      },
      [value, disabled, readonly, onChange, currentSelection, saveToHistory]
    );

    const getSelection = useCallback(() => {
      const textarea = textareaRef.current;
      if (!textarea) return { start: 0, end: 0, text: '' };
      const start = textarea.selectionStart || 0;
      const end = textarea.selectionEnd || 0;
      const text = value.slice(start, end);
      return { start, end, text };
    }, [value]);

    useImperativeHandle(
      ref,
      () => ({
        focus: () => textareaRef.current?.focus(),
        blur: () => textareaRef.current?.blur(),
        insertText,
        getSelection,
        undo,
        toggleFullscreen,
      }),
      [insertText, getSelection, undo, toggleFullscreen]
    );

    const renderMath = useCallback(
      (text: string, displayMode: boolean = false) => {
        try {
          return katex.renderToString(text.trim(), {
            throwOnError: false,
            displayMode,
            output: 'html',
            trust: false,
            strict: false,
          });
        } catch (error) {
          return `<span class="math-error" title="Ошибка LaTeX: ${error}">${text}</span>`;
        }
      },
      []
    );

    const renderPreview = useCallback(
      (text: string) => {
        return text
          .replace(
            /\$\$([\s\S]*?)\$\$/g,
            (_, formula) =>
              `<div class="math-block">${renderMath(formula, true)}</div>`
          )
          .replace(
            /\$([^$\n]*?)\$/g,
            (_, formula) =>
              `<span class="math-inline">${renderMath(formula, false)}</span>`
          )
          .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
          .replace(/(?<!\*)\*([^*\n]+?)\*(?!\*)/g, '<em>$1</em>')
          .replace(/`([^`]+?)`/g, '<code>$1</code>')
          .replace(/~~(.*?)~~/g, '<del>$1</del>')
          .replace(/^## (.+)$/gm, '<h3>$1</h3>')
          .replace(/^# (.+)$/gm, '<h2>$1</h2>')
          .replace(/\n/g, '<br>');
      },
      [renderMath]
    );

    const handleTextAreaChange = useCallback(
      (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        onChange?.(e.target.value);
      },
      [onChange]
    );

    const createListAction = useCallback(
      (listType: 'ordered' | 'unordered') => {
        return () => {
          const { text } = getSelection();
          if (text.includes('\n')) {
            const lines = text.split('\n');
            let counter = 1;
            const formattedLines = lines.map((line) => {
              if (line.trim()) {
                return listType === 'ordered'
                  ? `${counter++}. ${line}`
                  : `- ${line}`;
              }
              return line;
            });
            insertText('', '', formattedLines.join('\n'));
          } else {
            insertText(listType === 'ordered' ? '1. ' : '- ');
          }
        };
      },
      [getSelection, insertText]
    );

    const toolbarButtons = [
      {
        icon: UndoOutlined,
        action: undo,
        title: 'Отменить',
        disabled: history.length === 0,
        requiresSelection: false,
      },
      { divider: true },
      {
        icon: BoldOutlined,
        action: () => insertText('**', '**'),
        title: 'Жирный',
        requiresSelection: true,
      },
      {
        icon: ItalicOutlined,
        action: () => insertText('*', '*'),
        title: 'Курсив',
        requiresSelection: true,
      },
      {
        icon: UnderlineOutlined,
        action: () => insertText('<u>', '</u>'),
        title: 'Подчеркнутый',
        requiresSelection: true,
      },
      {
        icon: StrikethroughOutlined,
        action: () => insertText('~~', '~~'),
        title: 'Зачеркнутый',
        requiresSelection: true,
      },
      { divider: true },
      {
        icon: CodeOutlined,
        action: () => {
          const { text } = getSelection();
          insertText(
            text.includes('\n') ? '```\n' : '`',
            text.includes('\n') ? '\n```' : '`'
          );
        },
        title: 'Код',
        requiresSelection: true,
      },
      {
        icon: LinkOutlined,
        action: () => insertText('[', '](url)'),
        title: 'Ссылка',
        requiresSelection: true,
      },
      { divider: true },
      {
        icon: FunctionOutlined,
        action: () => insertText('$$\n', '\n$$'),
        title: 'Блочная формула',
        requiresSelection: true,
      },
      {
        icon: CalculatorOutlined,
        action: () => insertText('$', '$'),
        title: 'Inline формула',
        requiresSelection: true,
      },
      { divider: true },
      {
        icon: FontSizeOutlined,
        action: () => insertText('## ', ''),
        title: 'Заголовок',
        requiresSelection: true,
      },
      {
        icon: UnorderedListOutlined,
        action: createListAction('unordered'),
        title: 'Маркированный список',
        requiresSelection: true,
      },
      {
        icon: OrderedListOutlined,
        action: createListAction('ordered'),
        title: 'Нумерованный список',
        requiresSelection: true,
      },
    ];

    const mobileButtons = [
      {
        text: '↶',
        action: undo,
        title: 'Отменить',
        disabled: history.length === 0,
        requiresSelection: false,
      },
      {
        text: '**',
        action: () => insertText('**', '**'),
        title: 'Жирный',
        requiresSelection: true,
      },
      {
        text: '*',
        action: () => insertText('*', '*'),
        title: 'Курсив',
        requiresSelection: true,
      },
      {
        text: '`',
        action: () => insertText('`', '`'),
        title: 'Код',
        requiresSelection: true,
      },
      {
        text: '$',
        action: () => insertText('$', '$'),
        title: 'Формула',
        requiresSelection: true,
      },
    ];

    const charCount = value.length;
    const maxLength = 3000;
    const isOverLimit = charCount > maxLength;
    const isNearLimit = charCount > maxLength * 0.8;

    return (
      <div
        ref={containerRef}
        className={`solution-editor ${focused ? 'focused' : ''} ${
          disabled ? 'disabled' : ''
        } ${isFullscreen ? 'fullscreen' : ''} ${className}`}
      >
        {showToolbar && !disabled && !readonly && (
          <div className="editor-toolbar">
            <div className="toolbar-left">
              <div className="preview-toggle">
                <Tooltip
                  title={previewMode ? 'Режим редактирования' : 'Режим превью'}
                >
                  <Switch
                    size="small"
                    checked={previewMode}
                    onChange={setPreviewMode}
                    checkedChildren={<EyeOutlined />}
                    unCheckedChildren={<EditOutlined />}
                  />
                </Tooltip>
              </div>
              <div className="toolbar-separator" />

              {isMobile
                ? mobileButtons.map((button, index) => (
                    <Tooltip key={index} title={button.title}>
                      <button
                        type="button"
                        className="toolbar-button mobile-quick-button"
                        onClick={button.action}
                        tabIndex={-1}
                        disabled={
                          previewMode ||
                          button.disabled ||
                          (button.requiresSelection && !hasSelection)
                        }
                      >
                        {button.text}
                      </button>
                    </Tooltip>
                  ))
                : toolbarButtons.map((button, index) =>
                    'divider' in button ? (
                      <div key={index} className="toolbar-separator" />
                    ) : (
                      <Tooltip key={index} title={button.title}>
                        <button
                          type="button"
                          className="toolbar-button"
                          onClick={button.action}
                          tabIndex={-1}
                          disabled={
                            previewMode ||
                            button.disabled ||
                            (button.requiresSelection && !hasSelection)
                          }
                        >
                          {React.createElement(button.icon)}
                        </button>
                      </Tooltip>
                    )
                  )}
            </div>

            <div className="toolbar-right">
              <Tooltip
                title={
                  isFullscreen
                    ? 'Выйти из полноэкранного режима'
                    : 'Полноэкранный режим'
                }
              >
                <button
                  type="button"
                  className="toolbar-button fullscreen-button"
                  onClick={toggleFullscreen}
                  tabIndex={-1}
                >
                  {isFullscreen ? (
                    <FullscreenExitOutlined />
                  ) : (
                    <FullscreenOutlined />
                  )}
                </button>
              </Tooltip>
            </div>
          </div>
        )}

        <div className="editor-content">
          {previewMode || readonly ? (
            <div
              className="editor-preview"
              style={{ minHeight }}
              dangerouslySetInnerHTML={{ __html: renderPreview(value) }}
            />
          ) : (
            <TextArea
              ref={textareaRef}
              value={value}
              onChange={handleTextAreaChange}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onSelect={handleSelectionChange}
              placeholder={placeholder}
              disabled={disabled}
              style={{ minHeight }}
              maxLength={maxLength}
              autoSize={{ minRows: 8, maxRows: isFullscreen ? 30 : 20 }}
            />
          )}
        </div>

        <div className="editor-footer">
          <span className="editor-hint">
            {isMobile
              ? 'Markdown + LaTeX'
              : 'Поддерживается Markdown разметка и LaTeX формулы ($...$, $$...$$)'}
          </span>
          <span
            className={`char-count ${isOverLimit ? 'error' : isNearLimit ? 'warning' : ''}`}
          >
            {charCount}/{maxLength}
          </span>
        </div>

        {isFullscreen && (
          <div
            className="fullscreen-overlay"
            onClick={() => setIsFullscreen(false)}
          />
        )}
      </div>
    );
  }
);

SolutionEditor.displayName = 'SolutionEditor';
