import { useState } from "react";
import { Check, Copy, Share2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CodeSnippetProps {
  language: "html" | "css" | "js";
  code: string;
  shareLink?: string;
  onCopy?: () => void;
}

export default function CodeSnippet({
  language,
  code,
  shareLink,
  onCopy,
}: CodeSnippetProps) {
  const [copied, setCopied] = useState(false);
  const [shareCopied, setShareCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      onCopy?.();
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  const handleCopyShareLink = async () => {
    if (!shareLink) return;
    try {
      const fullLink = `${window.location.origin}?share=${shareLink}`;
      await navigator.clipboard.writeText(fullLink);
      setShareCopied(true);
      setTimeout(() => setShareCopied(false), 2000);
    } catch (error) {
      console.error("Failed to copy share link:", error);
    }
  };

  const languageLabels = {
    html: "HTML",
    css: "CSS",
    js: "JavaScript",
  };

  const languageColors = {
    html: "from-orange-500 to-red-500",
    css: "from-blue-500 to-cyan-500",
    js: "from-yellow-400 to-orange-500",
  };

  return (
    <div className="glass-light w-full flex flex-col rounded-2xl overflow-hidden">
      {/* Header */}
      <div
        className={`bg-gradient-to-r ${languageColors[language]} px-6 py-3 flex items-center justify-between`}
      >
        <span className="font-semibold text-white text-sm">
          {languageLabels[language]}
        </span>
        <div className="flex items-center gap-2">
          {shareLink && (
            <button
              onClick={handleCopyShareLink}
              className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
              title="Copy share link"
            >
              {shareCopied ? (
                <Check className="w-4 h-4 text-white" />
              ) : (
                <Share2 className="w-4 h-4 text-white" />
              )}
            </button>
          )}
          <button
            onClick={handleCopy}
            className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors"
            title="Copy code"
          >
            {copied ? (
              <Check className="w-4 h-4 text-white" />
            ) : (
              <Copy className="w-4 h-4 text-white" />
            )}
          </button>
        </div>
      </div>

      {/* Code Content */}
      <div className="flex-1 overflow-auto bg-slate-950/50 dark:bg-slate-950/80">
        <pre className="p-6 text-sm text-slate-100 font-mono whitespace-pre-wrap break-words">
          <code>{code || "// No code yet"}</code>
        </pre>
      </div>
    </div>
  );
}
