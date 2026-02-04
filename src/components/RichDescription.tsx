import React from 'react';

interface RichDescriptionProps {
  content: string;
  className?: string;
}

// Function to convert URLs in text to clickable links
const linkifyText = (text: string): React.ReactNode[] => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  const parts = text.split(urlRegex);
  
  return parts.map((part, index) => {
    if (urlRegex.test(part)) {
      return (
        <a
          key={index}
          href={part}
          target="_blank"
          rel="noopener noreferrer"
          className="text-primary hover:underline break-all"
        >
          {part}
        </a>
      );
    }
    return part;
  });
};

// Parse text into structured content with bullets, numbered lists, and paragraphs
const parseContent = (content: string): React.ReactNode[] => {
  const lines = content.split('\n');
  const result: React.ReactNode[] = [];
  let currentList: { type: 'bullet' | 'number'; items: string[] } | null = null;
  let currentParagraph: string[] = [];

  const flushParagraph = () => {
    if (currentParagraph.length > 0) {
      const text = currentParagraph.join(' ').trim();
      if (text) {
        result.push(
          <p key={`p-${result.length}`} className="mb-4 leading-relaxed">
            {linkifyText(text)}
          </p>
        );
      }
      currentParagraph = [];
    }
  };

  const flushList = () => {
    if (currentList) {
      if (currentList.type === 'bullet') {
        result.push(
          <ul key={`ul-${result.length}`} className="list-disc list-inside space-y-2 mb-4 pl-2">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {linkifyText(item)}
              </li>
            ))}
          </ul>
        );
      } else {
        result.push(
          <ol key={`ol-${result.length}`} className="list-decimal list-inside space-y-2 mb-4 pl-2">
            {currentList.items.map((item, idx) => (
              <li key={idx} className="leading-relaxed">
                {linkifyText(item)}
              </li>
            ))}
          </ol>
        );
      }
      currentList = null;
    }
  };

  lines.forEach((line) => {
    const trimmedLine = line.trim();
    
    // Check for bullet points (-, *, •)
    const bulletMatch = trimmedLine.match(/^[-*•]\s+(.+)/);
    // Check for numbered list (1., 2., etc.)
    const numberMatch = trimmedLine.match(/^\d+[.)]\s+(.+)/);
    
    if (bulletMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'bullet') {
        flushList();
        currentList = { type: 'bullet', items: [] };
      }
      currentList.items.push(bulletMatch[1]);
    } else if (numberMatch) {
      flushParagraph();
      if (!currentList || currentList.type !== 'number') {
        flushList();
        currentList = { type: 'number', items: [] };
      }
      currentList.items.push(numberMatch[1]);
    } else if (trimmedLine === '') {
      flushList();
      flushParagraph();
    } else {
      flushList();
      currentParagraph.push(trimmedLine);
    }
  });

  flushList();
  flushParagraph();

  return result;
};

export const RichDescription: React.FC<RichDescriptionProps> = ({ content, className = '' }) => {
  if (!content) return null;

  return (
    <div className={`rich-description text-muted-foreground ${className}`} style={{ lineHeight: '1.6' }}>
      {parseContent(content)}
    </div>
  );
};

// LinkifyText component for simple text with auto-links (e.g., for instructions)
export const LinkifyText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  if (!text) return null;
  
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  
  // Check if text contains a URL
  if (!urlRegex.test(text)) {
    return <span className={className}>{text}</span>;
  }
  
  const parts = text.split(/(https?:\/\/[^\s]+)/g);
  
  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (part.match(/^https?:\/\//)) {
          return (
            <a
              key={index}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all font-medium"
            >
              {part}
            </a>
          );
        }
        return part;
      })}
    </span>
  );
};

export default RichDescription;
