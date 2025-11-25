"use client"

import { useCallback, useMemo } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  MarkerType,
  Node,
  Edge,
  Position,
  Handle,
  NodeProps
} from 'reactflow';
import 'reactflow/dist/style.css';
import dagre from 'dagre';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Eye } from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

// Interfaces copiées pour l'autonomie du composant
interface AssetHolder {
  id: string;
  owner: string;
  jobTitle: string;
  percentage: number;
}

interface ProfessionalAsset {
  id: string;
  companyName: string;
  activity: string;
  willToTransfer: string;
  valuation: number;
  holders: AssetHolder[];
}

const nodeWidth = 200;
const nodeHeight = 80;

const getLayoutedElements = (nodes: Node[], edges: Edge[]) => {
  const dagreGraph = new dagre.graphlib.Graph();
  dagreGraph.setDefaultEdgeLabel(() => ({}));

  dagreGraph.setGraph({ rankdir: 'TB' }); // Top to Bottom

  nodes.forEach((node) => {
    dagreGraph.setNode(node.id, { width: nodeWidth, height: nodeHeight });
  });

  edges.forEach((edge) => {
    dagreGraph.setEdge(edge.source, edge.target);
  });

  dagre.layout(dagreGraph);

  const layoutedNodes = nodes.map((node) => {
    const nodeWithPosition = dagreGraph.node(node.id);
    // Centrage du graphe si besoin, dagre donne le centre du noeud
    return {
      ...node,
      targetPosition: Position.Top,
      sourcePosition: Position.Bottom,
      position: {
        x: nodeWithPosition.x - nodeWidth / 2,
        y: nodeWithPosition.y - nodeHeight / 2,
      },
    };
  });

  return { nodes: layoutedNodes, edges };
};

// Custom Node pour les Sociétés (avec Tooltip)
const CompanyNode = ({ data }: NodeProps) => {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="px-4 py-2 shadow-md rounded-md bg-white border-2 border-blue-500 w-[180px] text-center cursor-help">
            <Handle type="target" position={Position.Top} className="w-16 !bg-teal-500" />
            <div className="font-bold text-sm truncate">{data.label}</div>
            <div className="text-xs text-muted-foreground">{Number(data.valuation).toLocaleString()} €</div>
            <Handle type="source" position={Position.Bottom} className="w-16 !bg-teal-500" />
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-sm">
            <p><strong>{data.label}</strong></p>
            <p>Activité : {data.activity}</p>
            <p>Valo : {Number(data.valuation).toLocaleString()} €</p>
            <p>Transmission : {data.willToTransfer}</p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

// Custom Node pour les Personnes
const PersonNode = ({ data }: NodeProps) => {
  return (
    <div className="px-4 py-2 shadow-md rounded-full bg-green-50 border border-green-500 min-w-[120px] text-center">
      <div className="font-bold text-sm text-green-900">{data.label}</div>
      <Handle type="source" position={Position.Bottom} className="!bg-green-500" />
    </div>
  );
};

const nodeTypes = {
  company: CompanyNode,
  person: PersonNode,
};

export function OwnershipChartDialog({ assets, identity }: { assets: ProfessionalAsset[], identity: any }) {
  const { nodes: initialNodes, edges: initialEdges } = useMemo(() => {
    const nodes: Node[] = [];
    const edges: Edge[] = [];
    const peopleSet = new Set<string>();
    const companySet = new Set<string>();

    // 1. Identifier tous les nœuds (Sociétés et Personnes)
    assets.forEach(asset => {
      // Noeud Société
      if (!companySet.has(asset.companyName)) {
        nodes.push({
          id: asset.companyName,
          type: 'company',
          data: { 
            label: asset.companyName, 
            valuation: asset.valuation, 
            activity: asset.activity, 
            willToTransfer: asset.willToTransfer 
          },
          position: { x: 0, y: 0 }, // Sera calculé par dagre
        });
        companySet.add(asset.companyName);
      }

      // Parcourir les holders pour trouver les personnes et les liens
      asset.holders.forEach(holder => {
        const ownerName = holder.owner;
        
        // Mapping pour affichage joli des personnes
        let displayLabel = ownerName;
        if (ownerName === "Vous" && identity?.firstName) displayLabel = identity.firstName;
        else if (ownerName === "Conjoint" && identity?.spouseFirstName) displayLabel = identity.spouseFirstName;
        // Si ownerName est une société déjà dans la liste des assets, c'est une société, pas une personne.
        // Mais ici on traite tout ce qui n'est PAS une société connue comme une "Personne" (ou Tiers) pour le type de nœud.
        
        const isOwnerCompany = assets.some(a => a.companyName === ownerName);

        if (!isOwnerCompany) {
          if (!peopleSet.has(ownerName)) {
            nodes.push({
              id: ownerName,
              type: 'person',
              data: { label: displayLabel },
              position: { x: 0, y: 0 },
            });
            peopleSet.add(ownerName);
          }
        }
        
        // Lien Owner -> Asset
        edges.push({
          id: `${ownerName}-${asset.companyName}`,
          source: ownerName,
          target: asset.companyName,
          label: `${holder.percentage}%`,
          type: 'smoothstep',
          markerEnd: {
            type: MarkerType.ArrowClosed,
          },
          style: { strokeWidth: 2 },
          labelStyle: { fill: '#888', fontWeight: 700 },
        });
      });
    });

    return getLayoutedElements(nodes, edges);
  }, [assets, identity]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Recalculer si les props changent (useEffect ou key sur le composant parent)
  // Ici on utilise useMemo + key pour forcer le re-render propre ou useEffect
  // Le plus simple est de passer initialNodes au hook, mais le hook ne se met pas à jour si initial change.
  // On peut utiliser un useEffect pour mettre à jour.

  useMemo(() => { // Hack: mise à jour quand initial change
     setNodes(initialNodes);
     setEdges(initialEdges);
  }, [initialNodes, initialEdges, setNodes, setEdges]);


  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="gap-2">
          <Eye className="h-4 w-4" />
          Organigramme
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-5xl h-[80vh] flex flex-col p-0">
        <DialogHeader className="p-6 pb-0">
          <DialogTitle>Organigramme des détentions</DialogTitle>
        </DialogHeader>
        <div className="flex-1 w-full h-full min-h-0 p-4">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              nodeTypes={nodeTypes}
              fitView
              attributionPosition="bottom-right"
            >
              <Controls />
              <MiniMap />
              <Background color="#aaa" gap={16} />
            </ReactFlow>
        </div>
      </DialogContent>
    </Dialog>
  );
}
