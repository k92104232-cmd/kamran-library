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
} from "lucide-react";

export default function Index() {
  const [isDark, setIsDark] = useState(true);
  const [codeInput, setCodeInput] = useState("");
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
    const separated = separateCode(codeInput);
    setCode(separated);
  }, [codeInput]);

  const handleSaveSnippet = () => {
    if (!codeInput.trim()) {
      alert("Please paste some code first");
      return;
    }

    const newSnippet = createSnippet(code, snippetTitle, selectedFolder);
    StorageManager.saveSnippet(newSnippet);
    setSnippets(StorageManager.getSnippets());

    // Reset form
    setCodeInput("");
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
    <div className={`min-h-screen transition-colors duration-300 ${
      isDark ? "dark bg-slate-950" : "bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50"
    }`}>
      {/* Header */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-white/30 dark:bg-slate-900/30 border-b border-white/20 dark:border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-20">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <code className="text-white font-bold text-lg">{"</>"}</code>
              </div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  CodeVault
                </h1>
                <p className="text-xs text-muted-foreground">
                  Save, Preview & Share Code
                </p>
              </div>
            </div>

            {/* Dark Mode Toggle */}
            <button
              onClick={() => setIsDark(!isDark)}
              className="p-3 rounded-xl glass-light hover:bg-white/20 dark:hover:bg-white/15 transition-colors"
              title="Toggle dark mode"
            >
              {isDark ? (
                <Sun className="w-5 h-5 text-primary" />
              ) : (
                <Moon className="w-5 h-5 text-primary" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sidebar */}
          <aside className="lg:col-span-1">
            {/* Search Bar */}
            <div className="glass-light p-6 rounded-2xl mb-6">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground pointer-events-none" />
                <input
                  type="text"
                  placeholder="Search snippets..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="glass-input pl-10"
                />
              </div>
            </div>

            {/* Folders Section */}
            <div className="glass-light p-6 rounded-2xl">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Folders</h2>
                <button
                  onClick={() => setShowNewFolderInput(!showNewFolderInput)}
                  className="p-2 rounded-lg hover:bg-white/10 dark:hover:bg-white/5 transition-colors"
                  title="Create new folder"
                >
                  <FolderPlus className="w-4 h-4" />
                </button>
              </div>

              {/* New Folder Input */}
              {showNewFolderInput && (
                <div className="mb-4 flex gap-2">
                  <input
                    type="text"
                    placeholder="Folder name..."
                    value={newFolderName}
                    onChange={(e) => setNewFolderName(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === "Enter") handleCreateFolder();
                    }}
                    className="flex-1 glass-input text-sm"
                    autoFocus
                  />
                  <button
                    onClick={handleCreateFolder}
                    className="px-3 py-2 rounded-lg bg-primary hover:bg-secondary text-primary-foreground transition-colors text-sm"
                  >
                    Create
                  </button>
                </div>
              )}

              {/* Folders List */}
              <div className="space-y-2 max-h-64 overflow-y-auto">
                {folders.map((folder) => (
                  <div
                    key={folder.id}
                    className={`p-3 rounded-lg cursor-pointer transition-all flex items-center justify-between ${
                      selectedFolder === folder.id
                        ? "bg-primary/20 border border-primary/50"
                        : "hover:bg-white/10 dark:hover:bg-white/5"
                    }`}
                    onClick={() => {
                      setSelectedFolder(folder.id);
                      setSearchQuery("");
                    }}
                  >
                    <span className="text-sm font-medium">{folder.name}</span>
                    {folder.id !== "default" && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteFolder(folder.id);
                        }}
                        className="p-1 hover:bg-red-500/20 rounded transition-colors"
                      >
                        <Trash2 className="w-3 h-3 text-red-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>

          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Editor Section */}
            <div className="glass-light p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Paste Your Code</h2>
              <p className="text-sm text-muted-foreground mb-4">
                Paste HTML, CSS, or JavaScript (or mix them all together)
              </p>

              <textarea
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value)}
                placeholder="Paste your HTML, CSS, or JavaScript code here..."
                className="w-full h-64 p-4 rounded-xl bg-slate-950/50 dark:bg-slate-950/80 text-slate-100 font-mono text-sm resize-none border border-white/10 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/50"
              />

              <div className="mt-6 flex flex-col sm:flex-row gap-4">
                <input
                  type="text"
                  value={snippetTitle}
                  onChange={(e) => setSnippetTitle(e.target.value)}
                  placeholder="Snippet title..."
                  className="flex-1 glass-input"
                />
                <button
                  onClick={handleSaveSnippet}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-primary to-secondary hover:opacity-90 text-primary-foreground font-semibold flex items-center gap-2 transition-all"
                >
                  <Save className="w-4 h-4" />
                  Save Snippet
                </button>
              </div>
            </div>

            {/* Preview and Code Sections Container */}
            <div className="glass-light p-8 rounded-2xl">
              <h2 className="text-2xl font-bold mb-4">Live Preview</h2>
              <div>
                <div className="flex gap-5 max-lg:flex-col">
                  {/* Code Display Column */}
                  <div className="flex flex-col w-1/2 max-lg:w-full">
                    <div className="rounded-xl overflow-hidden border border-white/20 h-96"></div>
                  </div>
                  {/* Preview Column */}
                  <div className="flex flex-col w-1/2 max-lg:w-full">
                    <LivePreview code={code} isDark={isDark} />
                  </div>
                </div>
              </div>
            </div>

            {/* Code Sections */}
            <div className="grid grid-cols-1 gap-6">
              {(code.html || code.css || code.js) && (
                <>
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
                </>
              )}
            </div>

            {/* Saved Snippets Section */}
            {filteredSnippets.length > 0 && (
              <div className="glass-light p-8 rounded-2xl">
                <h2 className="text-2xl font-bold mb-6">
                  {searchQuery ? "Search Results" : "Saved Snippets"}
                </h2>
                <div className="grid grid-cols-1 gap-4">
                  {filteredSnippets.map((snippet) => (
                    <div
                      key={snippet.id}
                      className="glass-dark p-4 rounded-xl flex items-center justify-between hover:bg-white/20 dark:hover:bg-white/10 transition-colors group"
                    >
                      <div className="flex-1 min-w-0">
                        <h3 className="font-semibold truncate">
                          {snippet.title}
                        </h3>
                        <p className="text-sm text-muted-foreground">
                          {StorageManager.getFolders().find(
                            (f) => f.id === snippet.folder
                          )?.name || snippet.folder}{" "}
                          • {new Date(snippet.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={() => {
                            setCodeInput(
                              `${snippet.html}\n<style>\n${snippet.css}\n</style>\n<script>\n${snippet.js}\n</script>`
                            );
                          }}
                          className="p-2 rounded-lg hover:bg-blue-500/20 transition-colors"
                          title="Load snippet"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteSnippet(snippet.id)}
                          className="p-2 rounded-lg hover:bg-red-500/20 transition-colors"
                          title="Delete snippet"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
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
