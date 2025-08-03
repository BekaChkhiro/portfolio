import React, { useState } from 'react';
import { 
  FaBold, 
  FaItalic, 
  FaUnderline, 
  FaAlignLeft, 
  FaAlignCenter, 
  FaAlignRight,
  FaUndo,
  FaRedo,
  FaSave,
  FaFolder
} from 'react-icons/fa';
import './TextEditor.css';

interface TextEditorProps {
  initialContent?: string;
  readOnly?: boolean;
  title?: string;
}

export const TextEditor: React.FC<TextEditorProps> = ({ 
  initialContent = '', 
  readOnly = false,
  title = 'Text Editor'
}) => {
  const [content, setContent] = useState(initialContent);
  const [fontSize, setFontSize] = useState(14);

  const formatText = (command: string, value?: string) => {
    document.execCommand(command, false, value);
  };

  const handleContentChange = (e: React.FormEvent<HTMLDivElement>) => {
    setContent(e.currentTarget.innerHTML);
  };

  return (
    <div className="text-editor" style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      background: '#ffffff',
      color: '#000000'
    }}>
      {/* Toolbar */}
      {!readOnly && (
        <div className="editor-toolbar" style={{
          display: 'flex',
          alignItems: 'center',
          gap: '6px',
          padding: '6px 8px',
          borderBottom: '1px solid #e0e0e0',
          background: '#f8f9fa',
          flexWrap: 'wrap',
          fontSize: '12px'
        }}>
          <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => formatText('undo')}
              style={toolbarButtonStyle}
              title="Undo"
            >
              <FaUndo size={12} />
            </button>
            <button 
              onClick={() => formatText('redo')}
              style={toolbarButtonStyle}
              title="Redo"
            >
              <FaRedo size={12} />
            </button>
          </div>

          <div className="toolbar-separator" style={separatorStyle} />

          <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => formatText('bold')}
              style={toolbarButtonStyle}
              title="Bold"
            >
              <FaBold size={12} />
            </button>
            <button 
              onClick={() => formatText('italic')}
              style={toolbarButtonStyle}
              title="Italic"
            >
              <FaItalic size={12} />
            </button>
            <button 
              onClick={() => formatText('underline')}
              style={toolbarButtonStyle}
              title="Underline"
            >
              <FaUnderline size={12} />
            </button>
          </div>

          <div className="toolbar-separator" style={separatorStyle} />

          <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => formatText('justifyLeft')}
              style={toolbarButtonStyle}
              title="Align Left"
            >
              <FaAlignLeft size={12} />
            </button>
            <button 
              onClick={() => formatText('justifyCenter')}
              style={toolbarButtonStyle}
              title="Align Center"
            >
              <FaAlignCenter size={12} />
            </button>
            <button 
              onClick={() => formatText('justifyRight')}
              style={toolbarButtonStyle}
              title="Align Right"
            >
              <FaAlignRight size={12} />
            </button>
          </div>

          <div className="toolbar-separator" style={separatorStyle} />

          <div className="toolbar-group" style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
            <label style={{ fontSize: '12px', color: '#666' }}>Size:</label>
            <select 
              value={fontSize}
              onChange={(e) => {
                setFontSize(Number(e.target.value));
                formatText('fontSize', '3');
                const selection = window.getSelection();
                if (selection && selection.rangeCount > 0) {
                  const range = selection.getRangeAt(0);
                  const span = document.createElement('span');
                  span.style.fontSize = e.target.value + 'px';
                  try {
                    range.surroundContents(span);
                  } catch (e) {
                    // Handle cases where selection crosses element boundaries
                  }
                }
              }}
              style={{
                padding: '2px 6px',
                fontSize: '12px',
                border: '1px solid #ccc',
                borderRadius: '4px'
              }}
            >
              <option value={10}>10</option>
              <option value={12}>12</option>
              <option value={14}>14</option>
              <option value={16}>16</option>
              <option value={18}>18</option>
              <option value={20}>20</option>
              <option value={24}>24</option>
            </select>
          </div>

          <div className="toolbar-separator" style={separatorStyle} />

          <div className="toolbar-group" style={{ display: 'flex', gap: '4px' }}>
            <button 
              onClick={() => alert('Save functionality not implemented')}
              style={toolbarButtonStyle}
              title="Save"
            >
              <FaSave size={12} />
            </button>
            <button 
              onClick={() => alert('Open functionality not implemented')}
              style={toolbarButtonStyle}
              title="Open"
            >
              <FaFolder size={12} />
            </button>
          </div>
        </div>
      )}

      {/* Editor Content */}
      <div 
        className="editor-content"
        contentEditable={!readOnly}
        onInput={handleContentChange}
        dangerouslySetInnerHTML={{ __html: content }}
        style={{
          flex: 1,
          padding: '20px',
          fontSize: `${fontSize}px`,
          lineHeight: 1.6,
          outline: 'none',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          background: '#ffffff',
          color: '#000000',
          overflow: 'auto'
        }}
      />
    </div>
  );
};

const toolbarButtonStyle: React.CSSProperties = {
  padding: '4px 6px',
  border: '1px solid #d0d0d0',
  background: '#ffffff',
  borderRadius: '3px',
  cursor: 'pointer',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  transition: 'all 0.2s',
  color: '#333',
  fontSize: '11px',
  minWidth: '24px',
  height: '24px'
};

const separatorStyle: React.CSSProperties = {
  width: '1px',
  height: '20px',
  background: '#d0d0d0',
  margin: '0 4px'
};