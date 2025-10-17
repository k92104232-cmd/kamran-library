import { useEffect, useState } from "react";
import {
  separateCode,
  CodeSnippet,
  StoredSnippet,
  StorageManager,
  createSnippet,
  Folder,
} from "@/lib/code-utils";
import LivePreview from "@/components/LivePreview";
import CodeSnippetDisplay from "@/components/CodeSnippet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sun,
  Moon,
  Search,
  Save,
  FolderPlus,
  Trash2,
  Copy,
  Code2,
  Zap,
  ChevronDown,
  Plus,
} from "lucide-react";

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [htmlInput, setHtmlInput] = useState("");
  const [cssInput, setCssInput] = useState("");
  const [jsInput, setJsInput] = useState("");
  const [code, setCode] = useState<CodeSnippet>({
    html: "",
    css: "",
    js: "",
  });
  const [snippets, setSnippets] = useState<StoredSnippet[]>([]);
  const [folders, setFolders] = useState<Folder[]>([]);
  const [selectedFolder, setSelectedFolder] = useState("default");
  const [searchQuery, setSearchQuery] = useState("");
  const [snippetTitle, setSnippetTitle] = useState("Untitled Snippet");
  const [newFolderName, setNewFolderName] = useState("");
  const [showNewFolderInput, setShowNewFolderInput] = useState(false);
  const [activeTab, setActiveTab] = useState<"html" | "css" | "js" | "all">("all");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    default: true,
  });

  // Initialize dark mode from system preference
  useEffect(() => {
    document.documentElement.classList.add("dark");
  }, []);

  // Load snippets and folders on mount
  useEffect(() => {
    setSnippets(StorageManager.getSnippets());
    setFolders(StorageManager.getFolders());
  }, []);

  const toggleFolder = (folderId: string) => {
    setExpandedFolders((prev) => ({
      ...prev,
      [folderId]: !prev[folderId],
    }));
  };

  // Update code preview in real-time
  useEffect(() => {
    setCode({
      html: htmlInput,
      css: cssInput,
      js: jsInput,
    });
  }, [htmlInput, cssInput, jsInput]);

  const handleSaveSnippet = () => {
    if (!htmlInput.trim() && !cssInput.trim() && !jsInput.trim()) {
      alert("Please paste some code first");
      return;
    }

    const newSnippet = createSnippet(code, snippetTitle, selectedFolder);
    StorageManager.saveSnippet(newSnippet);
    setSnippets(StorageManager.getSnippets());

    // Reset form
    setHtmlInput("");
    setCssInput("");
    setJsInput("");
    setSnippetTitle("Untitled Snippet");
    alert(`Snippet "${snippetTitle}" saved successfully!`);
  };

  const handleDeleteSnippet = (id: string) => {
    if (confirm("Are you sure you want to delete this snippet?")) {
      StorageManager.deleteSnippet(id);
      setSnippets(StorageManager.getSnippets());
    }
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;

    StorageManager.createFolder(newFolderName);
    setFolders(StorageManager.getFolders());
    setNewFolderName("");
    setShowNewFolderInput(false);
  };

  const handleDeleteFolder = (id: string) => {
    if (id === "default") {
      alert("Cannot delete the default folder");
      return;
    }
    if (confirm("Are you sure you want to delete this folder?")) {
      StorageManager.deleteFolder(id);
      setFolders(StorageManager.getFolders());
    }
  };

  // Filter snippets based on search and folder
  const filteredSnippets =
    searchQuery.length > 0
      ? StorageManager.searchSnippets(searchQuery)
      : StorageManager.getSnippetsByFolder(selectedFolder);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-slate-100">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-xl border-b border-slate-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shadow-lg shadow-blue-500/50">
                <Code2 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-white">CodeVault</h1>
                <p className="text-xs text-slate-400">Save & Share Code</p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex-1 max-w-xs mx-8">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                />
              </div>
            </div>

            {/* Theme Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-100 transition-colors"
              title="Toggle theme"
            >
              {isDark ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Left Sidebar - Folders */}
          <aside className="lg:col-span-1">
            <div className="sticky top-20 space-y-4">
              {/* New Folder Button */}
              <button
                onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 rounded-lg text-white font-medium hover:from-blue-700 hover:to-cyan-700 transition-all shadow-lg shadow-blue-500/30"
              >
                <Plus className="w-4 h-4" />
                New Folder
              </button>

              {/* New Folder Input */}
              {showNewFolderInput && (
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                    }}
                    className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                  >
                    Create
                  </button>
                </div>
              )}

              {/* Folders List */}
              <div className="space-y-2">
                <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wide px-2">
                  Collections
                </h3>
                {folders.map((folder) => (
                  <div key={folder.id}>
                    <div
                      className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                        selectedFolder === folder.id
                          ? "bg-blue-600/20 border border-blue-500/50 text-blue-300"
                          : "hover:bg-slate-800 text-slate-300"
                      }`}
                      onClick={() => {
                        setSelectedFolder(folder.id);
                        setSearchQuery("");
                        toggleFolder(folder.id);
                      }}
                    >
                      <span className="text-sm font-medium">{folder.name}</span>
                      <div className="flex items-center gap-1">
                        <span className="text-xs text-slate-500 font-medium">
                          {snippets.filter((s) => s.folder === folder.id).length}
                        </span>
                        {folder.id !== "default" && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDeleteFolder(folder.id);
                            }}
                            className="p-1 hover:bg-red-600/20 rounded transition-colors"
                          >
                            <Trash2 className="w-3 h-3 text-red-400" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Snippet items in folder */}
                    {expandedFolders[folder.id] && (
                      <div className="ml-2 space-y-1 border-l border-slate-700 pl-2">
                        {snippets
                          .filter((s) => s.folder === folder.id)
                          .map((snippet) => (
                            <div
                              key={snippet.id}
                              className="p-2 text-xs text-slate-400 hover:text-slate-100 cursor-pointer rounded hover:bg-slate-800/50 truncate"
                              onClick={() => {
                                setHtmlInput(snippet.html);
                                setCssInput(snippet.css);
                                setJsInput(snippet.js);
                              }}
                            >
                              {snippet.title}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content Area */}
          <div className="lg:col-span-3 space-y-6">
            {/* Editor Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
              {/* Editor Header */}
              <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-bold text-white">Code Editor</h2>
                  <div className="flex gap-2">
                    {(["all", "html", "css", "js"] as const).map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                          activeTab === tab
                            ? "bg-blue-600 text-white"
                            : "bg-slate-700 text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-400">
                  Paste your HTML, CSS, or JavaScript code
                </p>
              </div>

              {/* Textarea */}
              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste your code here..."
                className="w-full h-80 p-6 bg-slate-950 text-slate-100 font-mono text-sm resize-none border-0 focus:outline-none focus:ring-0"
              />

              {/* Footer Actions */}
              <div className="border-t border-slate-700/50 bg-slate-800/80 px-6 py-4 flex gap-4">
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Snippet title..."
                  className="flex-1 px-4 py-2 bg-slate-700 border border-slate-600 rounded-lg text-white placeholder-slate-500 text-sm focus:outline-none focus:border-blue-500 transition-colors"
                />
                <button
                  onClick={handleSaveSnippet}
                  className="px-6 py-2 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-medium rounded-lg flex items-center gap-2 transition-all shadow-lg shadow-blue-500/30"
                >
                  <Save className="w-4 h-4" />
                  Save
                </button>
              </div>
            </div>

            {/* Preview Section */}
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
              <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4">
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Live Preview
                </h2>
              </div>
              <div className="h-96 bg-slate-950 border-0">
                <LivePreview code={code} isDark={true} />
              </div>
            </div>

            {/* Code Display Tabs */}
            {(code.html || code.css || code.js) && (
              <div className="grid grid-cols-1 gap-6">
                {code.html && (
                  <CodeSnippetDisplay
                    language="html"
                    code={code.html}
                    shareLink="temp"
                  />
                )}
                {code.css && (
                  <CodeSnippetDisplay
                    language="css"
                    code={code.css}
                    shareLink="temp"
                  />
                )}
                {code.js && (
                  <CodeSnippetDisplay
                    language="js"
                    code={code.js}
                    shareLink="temp"
                  />
                )}
              </div>
            )}

            {/* Saved Snippets Grid */}
            {filteredSnippets.length > 0 && (
              <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl overflow-hidden backdrop-blur-sm">
                <div className="border-b border-slate-700/50 bg-slate-800/80 px-6 py-4">
                  <h2 className="text-lg font-bold text-white">
                    {searchQuery ? "Search Results" : "Saved Snippets"}
                  </h2>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-4">
                  {filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="group bg-slate-700/50 border border-slate-600/50 rounded-lg p-4 hover:border-blue-500/50 hover:bg-slate-700/80 transition-all cursor-pointer"
                      onClick={() => {
                        setCodeInput(
                          `${snippet.html}\n<style>\n${snippet.css}\n</style>\n<script>\n${snippet.js}\n</script>`
                        );
                      }}
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold text-white truncate text-sm">
                            {snippet.title}
                          </h3>
                          <p className="text-xs text-slate-400 mt-1">
                            {StorageManager.getFolders().find(
                              (f) => f.id === snippet.folder
                            )?.name || snippet.folder}{" "}
                            • {new Date(snippet.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>

                      {/* Code Preview */}
                      <div className="bg-slate-800/50 rounded p-2 mb-3 border border-slate-600/30 max-h-20 overflow-hidden">
                        <code className="text-xs text-slate-300 font-mono line-clamp-3">
                          {snippet.html.substring(0, 100)}
                          {snippet.html.length > 100 ? "..." : ""}
                        </code>
                      </div>

                      {/* Actions */}
                      <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCodeInput(
                              `${snippet.html}\n<style>\n${snippet.css}\n</style>\n<script>\n${snippet.js}\n</script>`
                            );
                          }}
                          className="flex-1 px-3 py-1 bg-blue-600/20 text-blue-300 rounded text-xs hover:bg-blue-600/40 transition-colors"
                        >
                          <Copy className="w-3 h-3 inline mr-1" />
                          Load
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteSnippet(snippet.id);
                          }}
                          className="px-3 py-1 bg-red-600/20 text-red-300 rounded text-xs hover:bg-red-600/40 transition-colors"
                        >
                          <Trash2 className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
