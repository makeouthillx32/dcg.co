// app/dashboard/[id]/calendar/_components/ExportMessage.tsx
'use client';

interface ExportMessageProps {
  message: string | null;
}

const ExportMessage = ({ message }: ExportMessageProps) => {
  if (!message) return null;

  const isError = message.includes('failed') || message.includes('error');

  return (
    <div className={`mb-4 p-3 rounded-lg border ${
      isError
        ? 'bg-red-50 border-red-200 text-red-800'
        : 'bg-green-50 border-green-200 text-green-800'
    }`}>
      <div className="flex items-center gap-2">
        {isError ? (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="12" r="10"></circle>
            <line x1="15" y1="9" x2="9" y2="15"></line>
            <line x1="9" y1="9" x2="15" y2="15"></line>
          </svg>
        ) : (
          <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4"></path>
            <circle cx="12" cy="12" r="10"></circle>
          </svg>
        )}
        <span className="text-sm font-medium">{message}</span>
      </div>
    </div>
  );
};

export default ExportMessage;