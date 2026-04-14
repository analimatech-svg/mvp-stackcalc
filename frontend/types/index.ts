export type Phase = 'qualify' | 'estimate' | 'defend' | 'validate';

export type ComplexityLevel = 'BAIXA' | 'MEDIA' | 'ALTA' | 'MUITO_ALTA';

export interface Session {
  id: string;
  tenant_id: string;
  user_id: string;
  phase: Phase;
  title?: string;
  scope_data: Record<string, unknown>;
  estimate_data: Record<string, unknown>;
  defend_data: Record<string, unknown>;
  validate_data: Record<string, unknown>;
  complexity_pct?: number;
  complexity_lvl?: ComplexityLevel;
  messages: Message[];
  artifacts: ArtifactRef[];
  status: string;
  created_at: string;
  updated_at: string;
}

export interface Message {
  role: 'user' | 'assistant';
  content: string;
  phase?: Phase;
  ts: string;
}

export interface ArtifactRef {
  id: string;
  type: string;
}

export interface Artifact {
  id: string;
  type: ArtifactType;
  title: string;
  content: Record<string, unknown>;
  file_url?: string;
  created_at: string;
}

export type ArtifactType =
  | 'checklist'
  | 'scorecard'
  | 'calculator_ab'
  | 'rfc'
  | 'onepage'
  | 'email'
  | 'slack'
  | 'variance';

// SSE event types
export type SSEEvent =
  | { type: 'token'; content: string }
  | { type: 'phase_update'; phase: Phase; completeness: number }
  | { type: 'artifact_ready'; artifact_type: ArtifactType; artifact_id: string; artifact: Artifact }
  | { type: 'usage'; input_tokens: number; output_tokens: number; cost_usd: number; latency_ms: number; model: string }
  | { type: 'done'; session_state: Partial<Session>; usage?: unknown }
  | { type: 'error'; code: number; message: string };
