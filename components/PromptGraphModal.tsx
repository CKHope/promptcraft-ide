
import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Modal from './Modal';
import { useAppContext } from '../contexts/AppContext';
import { Prompt } from '../types';
import { PROMPT_OUTPUT_REGEX, SparklesIcon, LinkIcon, ChevronRightIcon } from '../constants';

const COMMON_BUTTON_FOCUS_CLASSES = "focus:outline-none focus:ring-2 focus:ring-offset-1 dark:focus:ring-offset-slate-800 focus:ring-indigo-500";

interface GraphNode extends Prompt {
  x?: number;
  y?: number;
  isRoot?: boolean;
  level?: number;
}
interface GraphEdge {
  source: string;
  target: string;
}

const NODE_WIDTH = 180;
const NODE_HEIGHT = 80;
const HORIZONTAL_SPACING = 80;
const VERTICAL_SPACING = 40;
const CANVAS_PADDING = 50;

const PromptGraphModal: React.FC<{ isOpen: boolean; onClose: () => void }> = ({ isOpen, onClose }) => {
  const { prompts: allPrompts, setSelectedPrompt, onCloseModal } = useAppContext();
  const [nodes, setNodes] = useState<GraphNode[]>([]);
  const [edges, setEdges] = useState<GraphEdge[]>([]);
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null);
  const [canvasDimensions, setCanvasDimensions] = useState({ width: 800, height: 600 });
  
  const processGraphData = useCallback(() => {
    const newNodesMap: Map<string, GraphNode> = new Map(allPrompts.map(p => [p.id, { ...p }]));
    const newEdges: GraphEdge[] = [];
    const incomingEdges: Record<string, number> = {};
    const outgoingEdges: Record<string, number> = {};

    newNodesMap.forEach(node => {
        incomingEdges[node.id] = 0;
        outgoingEdges[node.id] = 0;
    });

    newNodesMap.forEach(node => {
      PROMPT_OUTPUT_REGEX.lastIndex = 0; 
      let match;
      while ((match = PROMPT_OUTPUT_REGEX.exec(node.content)) !== null) {
        const targetId = match[1];
        if (newNodesMap.has(targetId)) {
          newEdges.push({ source: node.id, target: targetId });
          incomingEdges[targetId] = (incomingEdges[targetId] || 0) + 1;
          outgoingEdges[node.id] = (outgoingEdges[node.id] || 0) + 1;
        }
      }
    });
    
    const levels: Record<number, string[]> = {};
    let currentLevelNodes: GraphNode[] = Array.from(newNodesMap.values()).filter(n => incomingEdges[n.id] === 0);
    let level = 0;
    const visitedInLayout = new Set<string>();

    while (currentLevelNodes.length > 0) {
        levels[level] = [];
        currentLevelNodes.forEach(n => {
            if (!visitedInLayout.has(n.id)) {
                levels[level].push(n.id);
                visitedInLayout.add(n.id);
            }
        });
        
        const nextLevelNodeIds = new Set<string>();
        currentLevelNodes.forEach(currentNode => {
            newEdges.filter(e => e.source === currentNode.id).forEach(edge => {
                if (!visitedInLayout.has(edge.target)) { // Only consider unvisited nodes for next level
                    nextLevelNodeIds.add(edge.target);
                }
            });
        });
        currentLevelNodes = Array.from(newNodesMap.values()).filter(n => nextLevelNodeIds.has(n.id) && !visitedInLayout.has(n.id));
        level++;
        if (level > newNodesMap.size) break; 
    }
    
    let maxNodesInLevel = 0;
    Object.values(levels).forEach(levelNodes => {
        if (levelNodes.length > maxNodesInLevel) {
            maxNodesInLevel = levelNodes.length;
        }
    });

    const laidOutNodes: GraphNode[] = [];
    Object.entries(levels).forEach(([lvlStr, nodeIds]) => {
        const currentLvl = parseInt(lvlStr);
        nodeIds.forEach((nodeId, index) => {
            const node = newNodesMap.get(nodeId);
            if (node) {
                laidOutNodes.push({
                    ...node,
                    x: currentLvl * (NODE_WIDTH + HORIZONTAL_SPACING) + CANVAS_PADDING,
                    y: index * (NODE_HEIGHT + VERTICAL_SPACING) + CANVAS_PADDING + 
                       (maxNodesInLevel > 0 ? (maxNodesInLevel - nodeIds.length) * (NODE_HEIGHT + VERTICAL_SPACING) / 2 : 0),
                    level: currentLvl,
                    isRoot: incomingEdges[node.id] === 0, // Corrected boolean assignment
                });
            }
        });
    });
    
    // Add any nodes not caught by leveling (e.g. part of cycles not starting from a root, or isolated)
    newNodesMap.forEach(node => {
        if (!laidOutNodes.find(ln => ln.id === node.id)) {
            laidOutNodes.push({
                ...node,
                x: CANVAS_PADDING + (level * (NODE_WIDTH + HORIZONTAL_SPACING)), // Place them in a subsequent 'unclassified' level
                y: CANVAS_PADDING + (laidOutNodes.filter(ln=>ln.level === level).length * (NODE_HEIGHT + VERTICAL_SPACING)),
                level: level,
                isRoot: incomingEdges[node.id] === 0,
            });
        }
    });

    setNodes(laidOutNodes);
    setEdges(newEdges);
  }, [allPrompts]);

  useEffect(() => {
    if (isOpen) {
      processGraphData();
      setSelectedNodeId(null);
    }
  }, [isOpen, processGraphData]);

  useEffect(() => {
    let maxX = 0;
    let maxY = 0;
    nodes.forEach(node => {
        if (node.x !== undefined && node.y !== undefined) {
            if (node.x + NODE_WIDTH > maxX) maxX = node.x + NODE_WIDTH;
            if (node.y + NODE_HEIGHT > maxY) maxY = node.y + NODE_HEIGHT;
        }
    });
    setCanvasDimensions({
        width: Math.max(800, maxX + CANVAS_PADDING),
        height: Math.max(600, maxY + CANVAS_PADDING)
    });
  }, [nodes]);

  const handleNodeClick = (nodeId: string) => {
    setSelectedNodeId(nodeId);
  };

  const handleNavigateToPrompt = () => {
    if (selectedNodeId) {
      const promptToSelect = allPrompts.find(p => p.id === selectedNodeId);
      if (promptToSelect) {
        setSelectedPrompt(promptToSelect);
        onCloseModal(); 
      }
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Prompt Relationship Graph" size="xl">
      <div className="flex flex-col md:flex-row gap-4" style={{ minHeight: '75vh', maxHeight: '75vh' }}>
        <div className="w-full md:w-1/3 p-3 border-r dark:border-slate-600 overflow-y-auto flex flex-col bg-slate-50 dark:bg-slate-800/30 rounded-l-md">
          <h3 className="text-md font-semibold mb-2 text-slate-800 dark:text-slate-100 sticky top-0 bg-slate-50 dark:bg-slate-800/30 py-2">Graph Legend & Info</h3>
          <div className="space-y-1 text-xs text-slate-600 dark:text-slate-300 mb-3">
            <p><span className="inline-block w-3 h-3 bg-green-300 dark:bg-green-700 border border-green-500 rounded-sm mr-1.5 align-middle"></span> Root Node (No incoming links)</p>
            <p><span className="inline-block w-3 h-3 bg-white dark:bg-slate-700 border border-slate-400 rounded-sm mr-1.5 align-middle"></span> Standard Node</p>
            <p><LinkIcon className="w-3 h-3 inline-block mr-1.5 align-middle text-indigo-500"/> Lines show dependencies (source uses target's output).</p>
          </div>
          
          {selectedNodeId && nodes.find(n => n.id === selectedNodeId) && (
            <div className="mt-auto pt-3 border-t dark:border-slate-600">
              <div className="p-3 bg-indigo-50 dark:bg-indigo-900/30 rounded-md">
                <h4 className="text-sm font-semibold text-indigo-700 dark:text-indigo-300 mb-1">
                  Selected: {nodes.find(n => n.id === selectedNodeId)?.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-3 mb-2">
                  {nodes.find(n => n.id === selectedNodeId)?.content}
                </p>
                <button
                  onClick={handleNavigateToPrompt}
                  className={`w-full text-xs px-3 py-1.5 bg-indigo-500 hover:bg-indigo-600 text-white rounded-md transition-colors ${COMMON_BUTTON_FOCUS_CLASSES} flex items-center justify-center gap-1.5`}
                >
                  <SparklesIcon className="w-3.5 h-3.5" /> Go to Prompt
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="w-full md:w-2/3 overflow-auto relative bg-slate-100 dark:bg-slate-800 rounded-r-md shadow-inner">
          <div style={{ width: canvasDimensions.width, height: canvasDimensions.height, position: 'relative' }}>
            <svg width={canvasDimensions.width} height={canvasDimensions.height} className="absolute top-0 left-0 pointer-events-none">
              <defs>
                <marker
                  id="graphArrowhead"
                  viewBox="0 0 10 10"
                  refX="8" 
                  refY="5"
                  markerWidth="5" 
                  markerHeight="5"
                  orient="auto-start-reverse"
                >
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#6366f1" />
                </marker>
              </defs>
              {edges.map((edge, index) => {
                const sourceNode = nodes.find(n => n.id === edge.source);
                const targetNode = nodes.find(n => n.id === edge.target);
                if (!sourceNode || !targetNode || sourceNode.x === undefined || sourceNode.y === undefined || targetNode.x === undefined || targetNode.y === undefined) return null;

                const sx = sourceNode.x + NODE_WIDTH; 
                const sy = sourceNode.y + NODE_HEIGHT / 2;
                const tx = targetNode.x; 
                const ty = targetNode.y + NODE_HEIGHT / 2;
                
                return (
                  <line
                    key={`edge-${edge.source}-${edge.target}-${index}`}
                    x1={sx}
                    y1={sy}
                    x2={tx}
                    y2={ty}
                    stroke={selectedNodeId === edge.source || selectedNodeId === edge.target ? "#f59e0b" : "#94a3b8"} 
                    strokeWidth="1.5"
                    markerEnd="url(#graphArrowhead)"
                  />
                );
              })}
            </svg>
            {nodes.map(node => (
              <div
                key={node.id}
                onClick={() => handleNodeClick(node.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') handleNodeClick(node.id);}}
                aria-label={`Prompt: ${node.title}`}
                className={`absolute p-2.5 border rounded-md shadow-lg cursor-pointer transition-all duration-200 ease-in-out flex flex-col justify-center items-center text-center
                            ${node.isRoot ? 'bg-green-100 dark:bg-green-800/70 border-green-400 dark:border-green-600 hover:bg-green-200 dark:hover:bg-green-700' 
                                          : 'bg-white dark:bg-slate-700 border-slate-300 dark:border-slate-500 hover:bg-slate-50 dark:hover:bg-slate-600'}
                            ${selectedNodeId === node.id ? 'ring-2 ring-indigo-500 scale-105 shadow-xl' : 'hover:shadow-xl hover:border-indigo-400 dark:hover:border-indigo-500'}`}
                style={{
                  width: NODE_WIDTH,
                  height: NODE_HEIGHT,
                  left: node.x ?? 0,
                  top: node.y ?? 0,
                  transform: selectedNodeId === node.id ? 'scale(1.05)' : 'scale(1)',
                  zIndex: selectedNodeId === node.id ? 20 : 10,
                }}
              >
                <h5 className="text-xs font-semibold truncate w-full text-slate-800 dark:text-slate-100 mb-1" title={node.title}>
                  {node.level !== undefined && !node.isRoot && <span className="text-[10px] text-indigo-500 dark:text-indigo-400 mr-0.5">(L{node.level})</span>}
                  {node.title}
                </h5>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2 w-full" title={node.content}>{node.content}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default PromptGraphModal;
