import { useEffect, useRef } from "react";
import { CodeSnippet } from "@/lib/code-utils";

interface LivePreviewProps {
  code: CodeSnippet;
  isDark?: boolean;
}

export default function LivePreview({
  code,
  isDark = false,
}: LivePreviewProps) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (!iframeRef.current) return;

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Live Preview</title>
          <style>
            ${code.css}
            body {
              margin: 0;
              padding: 20px;
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
                'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
                sans-serif;
              -webkit-font-smoothing: antialiased;
              -moz-osx-font-smoothing: grayscale;
              background-color: ${isDark ? "#1a1a1a" : "#ffffff"};
              color: ${isDark ? "#ffffff" : "#000000"};
            }
          </style>
        </head>
        <body>
          ${code.html}
          <script>
            ${code.js}
          </script>
        </body>
      </html>
    `;

    try {
      const iframe = iframeRef.current;
      iframe.srcdoc = htmlContent;
    } catch (error) {
      console.error("Failed to update iframe:", error);
    }
  }, [code, isDark]);

  return (
    <div className="relative w-full h-full bg-white dark:bg-slate-900 rounded-2xl overflow-hidden shadow-lg">
      <iframe
        ref={iframeRef}
        className="w-full h-full border-0"
        title="Live Preview"
        sandbox="allow-scripts allow-same-origin"
      />
    </div>
  );
}
