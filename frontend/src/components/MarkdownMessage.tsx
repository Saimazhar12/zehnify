import ReactMarkdown from 'react-markdown';

interface MarkdownMessageProps {
  content: string;
  variant: 'user' | 'ai';
}

export default function MarkdownMessage({ content, variant }: MarkdownMessageProps) {
  const isUser = variant === 'user';

  return (
    <div className="break-words [overflow-wrap:anywhere]">
    <ReactMarkdown
      components={{
        p: ({ children }) => (
          <p className={`mb-2 last:mb-0 leading-relaxed ${isUser ? 'text-white' : 'text-gray-700'}`}>
            {children}
          </p>
        ),
        strong: ({ children }) => (
          <strong className={`font-bold ${isUser ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </strong>
        ),
        em: ({ children }) => (
          <em className={`italic ${isUser ? 'text-blue-100' : 'text-gray-600'}`}>
            {children}
          </em>
        ),
        ul: ({ children }) => (
          <ul className={`list-disc pl-5 mb-2 space-y-1 ${isUser ? 'text-white' : 'text-gray-700'}`}>
            {children}
          </ul>
        ),
        ol: ({ children }) => (
          <ol className={`list-decimal pl-5 mb-2 space-y-1 ${isUser ? 'text-white' : 'text-gray-700'}`}>
            {children}
          </ol>
        ),
        li: ({ children }) => <li className="leading-relaxed">{children}</li>,
        h1: ({ children }) => (
          <h1 className={`text-base font-bold mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </h1>
        ),
        h2: ({ children }) => (
          <h2 className={`text-sm font-bold mb-2 ${isUser ? 'text-white' : 'text-gray-900'}`}>
            {children}
          </h2>
        ),
        h3: ({ children }) => (
          <h3 className={`text-sm font-semibold mb-1 ${isUser ? 'text-white' : 'text-gray-800'}`}>
            {children}
          </h3>
        ),
        code: ({ children }) => (
          <code
            className={`px-1.5 py-0.5 rounded text-xs font-mono ${
              isUser ? 'bg-blue-500/40 text-white' : 'bg-gray-100 text-gray-800'
            }`}
          >
            {children}
          </code>
        ),
        blockquote: ({ children }) => (
          <blockquote
            className={`border-l-2 pl-3 my-2 italic ${
              isUser ? 'border-blue-300 text-blue-100' : 'border-gray-300 text-gray-600'
            }`}
          >
            {children}
          </blockquote>
        ),
        a: ({ href, children }) => (
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            className={`underline underline-offset-2 ${
              isUser ? 'text-blue-100 hover:text-white' : 'text-blue-600 hover:text-blue-800'
            }`}
          >
            {children}
          </a>
        ),
      }}
    >
      {content}
    </ReactMarkdown>
    </div>
  );
}
