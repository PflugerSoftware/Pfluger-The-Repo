import React from 'react';

interface MessageContentProps {
  content: string;
  onProjectClick?: (projectId: string) => void;
  className?: string;
}

/**
 * Renders message content with linkified project IDs and URLs
 *
 * Project IDs (X25-RB01, X26-RB02, etc.) become clickable and navigate to project dashboard
 * URLs (http://, https://) become clickable external links
 */
export const MessageContent: React.FC<MessageContentProps> = ({
  content,
  onProjectClick,
  className = ''
}) => {
  // Regex patterns
  const projectIdPattern = /\b(X\d{2}-RB\d{2})\b/g; // Matches X25-RB01, X26-RB02, etc.
  const urlPattern = /(https?:\/\/[^\s]+)/g; // Matches http:// and https:// URLs

  const renderContent = () => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    // Combine all matches (project IDs and URLs) with their positions
    const matches: Array<{ index: number; length: number; text: string; type: 'project' | 'url' }> = [];

    // Find project ID matches
    let projectMatch;
    while ((projectMatch = projectIdPattern.exec(content)) !== null) {
      matches.push({
        index: projectMatch.index,
        length: projectMatch[0].length,
        text: projectMatch[0],
        type: 'project'
      });
    }

    // Find URL matches
    let urlMatch;
    while ((urlMatch = urlPattern.exec(content)) !== null) {
      matches.push({
        index: urlMatch.index,
        length: urlMatch[0].length,
        text: urlMatch[0],
        type: 'url'
      });
    }

    // Sort matches by index
    matches.sort((a, b) => a.index - b.index);

    // Build the parts array
    matches.forEach((match, idx) => {
      // Add text before this match
      if (match.index > lastIndex) {
        parts.push(
          <span key={`text-${idx}`}>
            {content.substring(lastIndex, match.index)}
          </span>
        );
      }

      // Add the match as a link
      if (match.type === 'project') {
        parts.push(
          <button
            key={`link-${idx}`}
            onClick={() => onProjectClick?.(match.text)}
            className="text-blue-400 hover:text-blue-300 underline cursor-pointer transition-colors"
          >
            {match.text}
          </button>
        );
      } else {
        parts.push(
          <a
            key={`link-${idx}`}
            href={match.text}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-400 hover:text-blue-300 underline transition-colors"
          >
            {match.text}
          </a>
        );
      }

      lastIndex = match.index + match.length;
    });

    // Add any remaining text
    if (lastIndex < content.length) {
      parts.push(
        <span key="text-end">
          {content.substring(lastIndex)}
        </span>
      );
    }

    return parts.length > 0 ? parts : content;
  };

  return (
    <p className={`text-sm whitespace-pre-wrap ${className}`}>
      {renderContent()}
    </p>
  );
};
