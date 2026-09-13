import React, { useMemo } from 'react';
import katex from 'katex';

interface MathViewProps {
  math: string;
  block?: boolean;
  className?: string;
}

export const MathView: React.FC<MathViewProps> = ({ math, block = false, className = '' }) => {
  const html = useMemo(() => {
    try {
      // Clean leading/trailing delimiters if present
      let cleanMath = math.trim();
      if (cleanMath.startsWith('$$') && cleanMath.endsWith('$$')) {
        cleanMath = cleanMath.slice(2, -2);
      } else if (cleanMath.startsWith('$') && cleanMath.endsWith('$')) {
        cleanMath = cleanMath.slice(1, -1);
      } else if (cleanMath.startsWith('\\[') && cleanMath.endsWith('\\]')) {
        cleanMath = cleanMath.slice(2, -2);
      } else if (cleanMath.startsWith('\\(') && cleanMath.endsWith('\\)')) {
        cleanMath = cleanMath.slice(2, -2);
      }

      return katex.renderToString(cleanMath, {
        displayMode: block,
        throwOnError: false,
        output: 'html',
      });
    } catch (e) {
      return `<span class="text-rose-400 font-mono text-sm">${math}</span>`;
    }
  }, [math, block]);

  return (
    <span
      className={`inline-math ${block ? 'block my-2 overflow-x-auto py-1' : 'inline'} ${className}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
};
