"use client";

import React, { useState, useMemo } from 'react';
import { 
  Folder, 
  File, 
  ChevronRight, 
  ChevronDown, 
  Search, 
  FileCode, 
  FileJson, 
  FileType,
  Hash,
  Terminal,
  FolderOpen,
  Layout,
  Code2,
  Settings2,
  Boxes
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/lib/utils';

export type FileNode = {
  name: string;
  path: string;
  kind: 'file' | 'folder';
  children?: FileNode[];
};

interface FileExplorerProps {
  files: { path: string; content: string }[];
  activeFile: string | null;
  onFileSelect: (path: string) => void;
  className?: string;
}

const getFileIcon = (fileName: string, isFolder: boolean, isOpen: boolean) => {
  if (isFolder) {
    if (fileName === 'src') return <Terminal className="h-4 w-4 text-emerald-400" />;
    if (fileName === 'components') return <Boxes className="h-4 w-4 text-orange-400" />;
    if (fileName === 'pages' || fileName === 'app') return <Layout className="h-4 w-4 text-blue-400" />;
    if (fileName === 'hooks') return <Settings2 className="h-4 w-4 text-yellow-400" />;
    if (fileName === 'lib') return <Code2 className="h-4 w-4 text-purple-400" />;
    if (fileName === 'public') return <FolderOpen className="h-4 w-4 text-slate-400" />;
    return isOpen 
      ? <FolderOpen className="h-4 w-4 text-indigo-400" /> 
      : <Folder className="h-4 w-4 text-indigo-400" />;
  }

  if (fileName.endsWith('.tsx') || fileName.endsWith('.jsx')) return <FileCode className="h-4 w-4 text-blue-400" />;
  if (fileName.endsWith('.ts') || fileName.endsWith('.js')) return <FileType className="h-4 w-4 text-blue-500" />;
  if (fileName.endsWith('.json')) return <FileJson className="h-4 w-4 text-yellow-500" />;
  if (fileName.endsWith('.css')) return <Hash className="h-4 w-4 text-pink-400" />;
  
  return <File className="h-4 w-4 text-slate-400" />;
};

const FileItem = ({ 
  node, 
  depth, 
  activeFile, 
  onFileSelect, 
  expandedFolders, 
  toggleFolder 
}: { 
  node: FileNode; 
  depth: number; 
  activeFile: string | null; 
  onFileSelect: (path: string) => void;
  expandedFolders: Set<string>;
  toggleFolder: (path: string) => void;
}) => {
  const isExpanded = expandedFolders.has(node.path);
  const isActive = activeFile === node.path;
  const isFolder = node.kind === 'folder';

  const handleClick = () => {
    if (isFolder) {
      toggleFolder(node.path);
    } else {
      onFileSelect(node.path);
    }
  };

  return (
    <div className="flex flex-col">
      <motion.div
        initial={false}
        whileHover={{ backgroundColor: 'rgba(255,255,255,0.04)' }}
        className={cn(
          "group flex cursor-pointer items-center gap-2 rounded-md px-2 py-1 text-[13px] transition-all duration-200",
          isActive ? "bg-white/[0.08] text-white shadow-sm ring-1 ring-white/10" : "text-slate-400 hover:text-slate-200"
        )}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        onClick={handleClick}
      >
        <span className="flex h-4 w-4 items-center justify-center">
          {isFolder && (
            <motion.div
              animate={{ rotate: isExpanded ? 90 : 0 }}
              transition={{ duration: 0.2 }}
            >
              <ChevronRight className="h-3 w-3 text-slate-500 group-hover:text-slate-300" />
            </motion.div>
          )}
        </span>
        
        <span className="flex h-4 w-4 items-center justify-center shrink-0">
          {getFileIcon(node.name, isFolder, isExpanded)}
        </span>
        
        <span className="truncate font-medium">{node.name}</span>
      </motion.div>

      <AnimatePresence initial={false}>
        {isFolder && isExpanded && node.children && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeInOut" }}
            className="overflow-hidden"
          >
            {node.children.map((child) => (
              <FileItem
                key={child.path}
                node={child}
                depth={depth + 1}
                activeFile={activeFile}
                onFileSelect={onFileSelect}
                expandedFolders={expandedFolders}
                toggleFolder={toggleFolder}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function FileExplorer({ files, activeFile, onFileSelect, className }: FileExplorerProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src', 'src/components']));

  const fileTree = useMemo(() => {
    const root: FileNode[] = [];
    
    // Sort files to ensure folders come first
    const sortedFiles = [...files].sort((a, b) => a.path.localeCompare(b.path));

    sortedFiles.forEach((file) => {
      // Skip hidden files and virtual preview blob
      if (file.path.startsWith('.') || file.path === 'preview.html') return;

      const parts = file.path.split('/');
      let currentLevel = root;
      
      parts.forEach((part, i) => {
        let node = currentLevel.find((n) => n.name === part);
        if (!node) {
          node = {
            name: part,
            path: parts.slice(0, i + 1).join('/'),
            kind: i === parts.length - 1 ? 'file' : 'folder',
            children: i === parts.length - 1 ? undefined : [],
          };
          currentLevel.push(node);
          
          // Auto-expand if search query matches
          if (searchQuery && node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
             setExpandedFolders(prev => {
               const next = new Set(prev);
               next.add(node!.path);
               return next;
             });
          }
        }
        if (node.children) {
          currentLevel = node.children;
        }
      });
    });

    // Final sort: folders first, then files
    const sortNodes = (nodes: FileNode[]) => {
      nodes.sort((a, b) => {
        if (a.kind === b.kind) return a.name.localeCompare(b.name);
        return a.kind === 'folder' ? -1 : 1;
      });
      nodes.forEach(n => {
        if (n.children) sortNodes(n.children);
      });
    };
    sortNodes(root);

    return root;
  }, [files, searchQuery]);

  const toggleFolder = (path: string) => {
    setExpandedFolders((prev) => {
      const next = new Set(prev);
      if (next.has(path)) {
        next.delete(path);
      } else {
        next.add(path);
      }
      return next;
    });
  };

  const filteredTree = useMemo(() => {
    if (!searchQuery) return fileTree;

    const filterNodes = (nodes: FileNode[]): FileNode[] => {
      return nodes
        .map(node => {
          if (node.kind === 'file') {
            return node.name.toLowerCase().includes(searchQuery.toLowerCase()) ? node : null;
          }
          const filteredChildren = node.children ? filterNodes(node.children) : [];
          if (filteredChildren.length > 0 || node.name.toLowerCase().includes(searchQuery.toLowerCase())) {
            return { ...node, children: filteredChildren };
          }
          return null;
        })
        .filter((n): n is FileNode => n !== null);
    };

    return filterNodes(fileTree);
  }, [fileTree, searchQuery]);

  return (
    <div className={cn("flex flex-col bg-slate-950/40 backdrop-blur-xl border-r border-white/5", className)}>
      <div className="p-4 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Explorer</h2>
          <div className="flex items-center gap-1">
            <button className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-colors">
              <Plus className="h-3.5 w-3.5" />
            </button>
            <button className="p-1 hover:bg-white/5 rounded text-slate-500 hover:text-slate-300 transition-colors">
              <RefreshCcw className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
        
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500 group-focus-within:text-indigo-400 transition-colors" />
          <input
            type="text"
            placeholder="Search code"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-lg border border-white/5 bg-white/[0.03] py-2 pl-9 pr-3 text-xs text-white placeholder-slate-600 outline-none transition-all focus:bg-white/[0.05] focus:ring-1 focus:ring-indigo-500/50 shadow-inner"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-2 pb-4 custom-scrollbar">
        {filteredTree.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-600 italic">
            No files found
          </div>
        ) : (
          filteredTree.map((node) => (
            <FileItem
              key={node.path}
              node={node}
              depth={0}
              activeFile={activeFile}
              onFileSelect={onFileSelect}
              expandedFolders={expandedFolders}
              toggleFolder={toggleFolder}
            />
          ))
        )}
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.1);
        }
      `}</style>
    </div>
  );
}
