/**
 * Detects and separates HTML, CSS, and JavaScript from mixed code input
 */
export interface CodeSnippet {
  html: string;
  css: string;
  js: string;
}

export interface StoredSnippet extends CodeSnippet {
  id: string;
  title: string;
  folder: string;
  createdAt: number;
  shareLink: string;
}

export interface Folder {
  id: string;
  name: string;
  createdAt: number;
}

/**
 * Separates mixed code input into HTML, CSS, and JS sections
 */
export function separateCode(input: string): CodeSnippet {
  const html: string[] = [];
  const css: string[] = [];
  const js: string[] = [];

  // Match style tags and extract CSS
  const styleTagRegex = /<style[^>]*>([\s\S]*?)<\/style>/gi;
  let styleMatch;
  while ((styleMatch = styleTagRegex.exec(input)) !== null) {
    css.push(styleMatch[1].trim());
  }

  // Remove style tags for HTML extraction
  let htmlContent = input.replace(styleTagRegex, "");

  // Match script tags and extract JS
  const scriptTagRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let scriptMatch;
  while ((scriptMatch = scriptTagRegex.exec(htmlContent)) !== null) {
    js.push(scriptMatch[1].trim());
  }

  // Remove script tags for pure HTML
  htmlContent = htmlContent.replace(scriptTagRegex, "");

  // Try to detect standalone CSS (starts with . or # or @)
  const lines = input.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      (trimmed.startsWith(".") ||
        trimmed.startsWith("#") ||
        trimmed.startsWith("@")) &&
      !trimmed.startsWith("<")
    ) {
      css.push(trimmed);
    }
  }

  // Try to detect standalone JS (function, const, let, var, etc.)
  for (const line of lines) {
    const trimmed = line.trim();
    if (
      (trimmed.startsWith("function ") ||
        trimmed.startsWith("const ") ||
        trimmed.startsWith("let ") ||
        trimmed.startsWith("var ") ||
        trimmed.startsWith("class ") ||
        trimmed.startsWith("if ") ||
        trimmed.startsWith("for ")) &&
      !trimmed.startsWith("<")
    ) {
      js.push(trimmed);
    }
  }

  return {
    html: htmlContent.trim(),
    css: css.join("\n").trim(),
    js: js.join("\n").trim(),
  };
}

/**
 * Generates a unique ID for snippets and folders
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Generates a shareable link token
 */
export function generateShareLink(): string {
  return (
    Math.random().toString(36).substring(2, 15) +
    Math.random().toString(36).substring(2, 15)
  );
}

/**
 * Creates a new snippet object
 */
export function createSnippet(
  code: CodeSnippet,
  title: string = "Untitled Snippet",
  folder: string = "default",
): StoredSnippet {
  return {
    ...code,
    id: generateId(),
    title,
    folder,
    createdAt: Date.now(),
    shareLink: generateShareLink(),
  };
}

/**
 * Local storage management functions
 */
export const StorageManager = {
  getSnippets(): StoredSnippet[] {
    try {
      const data = localStorage.getItem("snippets");
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  saveSnippet(snippet: StoredSnippet): void {
    try {
      const snippets = this.getSnippets();
      const index = snippets.findIndex((s) => s.id === snippet.id);
      if (index >= 0) {
        snippets[index] = snippet;
      } else {
        snippets.push(snippet);
      }
      localStorage.setItem("snippets", JSON.stringify(snippets));
    } catch (error) {
      console.error("Failed to save snippet:", error);
    }
  },

  deleteSnippet(id: string): void {
    try {
      const snippets = this.getSnippets().filter((s) => s.id !== id);
      localStorage.setItem("snippets", JSON.stringify(snippets));
    } catch (error) {
      console.error("Failed to delete snippet:", error);
    }
  },

  getSnippetById(id: string): StoredSnippet | null {
    try {
      const snippets = this.getSnippets();
      return snippets.find((s) => s.id === id) || null;
    } catch {
      return null;
    }
  },

  getSnippetsByFolder(folder: string): StoredSnippet[] {
    try {
      return this.getSnippets().filter((s) => s.folder === folder);
    } catch {
      return [];
    }
  },

  searchSnippets(query: string): StoredSnippet[] {
    try {
      const lowerQuery = query.toLowerCase();
      return this.getSnippets().filter(
        (s) =>
          s.title.toLowerCase().includes(lowerQuery) ||
          s.folder.toLowerCase().includes(lowerQuery),
      );
    } catch {
      return [];
    }
  },

  getFolders(): Folder[] {
    try {
      const data = localStorage.getItem("folders");
      const folders = data ? JSON.parse(data) : [];
      // Always ensure default folder exists
      if (!folders.find((f: Folder) => f.id === "default")) {
        folders.unshift({ id: "default", name: "Default", createdAt: 0 });
      }
      return folders;
    } catch {
      return [{ id: "default", name: "Default", createdAt: 0 }];
    }
  },

  createFolder(name: string): Folder {
    try {
      const folder: Folder = {
        id: generateId(),
        name,
        createdAt: Date.now(),
      };
      const folders = this.getFolders();
      folders.push(folder);
      localStorage.setItem("folders", JSON.stringify(folders));
      return folder;
    } catch (error) {
      console.error("Failed to create folder:", error);
      return { id: "error", name, createdAt: 0 };
    }
  },

  deleteFolder(id: string): void {
    try {
      const folders = this.getFolders().filter((f) => f.id !== id);
      localStorage.setItem("folders", JSON.stringify(folders));
    } catch (error) {
      console.error("Failed to delete folder:", error);
    }
  },
};
