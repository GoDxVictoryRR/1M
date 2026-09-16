/**
 * ChatPanel — Institutional-grade conversational assistant interface.
 * Features:
 *   - Sandboxed read-only tools inspection
 *   - Quick prompt pills with micro-interaction hover
 *   - Structured response rendering with tool execution telemetry
 *   - Authoritative citation cards with metadata breakdown
 */
import React from 'react';
import { SendIcon, RobotIcon, ActivityIcon, CheckIcon } from './icons';
import { ChatResponse, AgentTool } from '../api';
import { Chip, InfoBlock } from './primitives';

const QUICK_PROMPTS = [
  'What should we fix first to reduce our footprint?',
  'What would happen if we reduced compute runtime by 15%?',
  'What does GHG Protocol Scope 2 guidance say?',
  'Did we detect any unusual power consumption spikes?',
] as const;

export interface ChatPanelProps {
  readonly chatInput: string;
  readonly onInputChange: (v: string) => void;
  readonly onSubmit: () => void;
  readonly isLoading: boolean;
  readonly chatResponse: ChatResponse | null;
  readonly agentTools: AgentTool[];
  readonly aiProvider: string;
  readonly rateLimit?: number | null;
  readonly rateLimitEnabled?: boolean;
}

export const ChatPanel: React.FC<ChatPanelProps> = ({
  chatInput, onInputChange, onSubmit, isLoading,
  chatResponse, agentTools, aiProvider,
  rateLimit, rateLimitEnabled,
}) => {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (chatInput.trim()) onSubmit();
  };

  return (
    <div className="chat-panel-root">
      {/* Capability & Sandbox Header */}
      <div className="chat-status-bar">
        <div className="chat-capabilities">
          <Chip variant="green">{agentTools.length || 6} Sandboxed Tools</Chip>
          <Chip variant="blue">Engine: {aiProvider}</Chip>
          {rateLimitEnabled && rateLimit && (
            <Chip variant="amber">Rate Limit: {rateLimit} req/min</Chip>
          )}
          <span className="chat-sandbox-note text-xs text-muted">
            Strictly read-only evaluation sandbox
          </span>
        </div>

        {/* Allowlisted tools */}
        {agentTools.length > 0 && (
          <div className="chat-tools-strip">
            <span className="text-xs text-muted font-bold">Tools:</span>
            {agentTools.map(t => (
              <span key={t.name} className="tool-pill" title={t.description}>
                {t.name}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Quick Prompts Carousel/Pills */}
      <div className="chat-prompts-section">
        <span className="text-xs text-muted mb-2 block font-semibold">Suggested Operational Queries:</span>
        <div className="chat-prompts-grid">
          {QUICK_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              className="prompt-pill"
              onClick={() => onInputChange(p)}
              aria-label={`Use prompt: ${p}`}
            >
              <span>{p}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Input Form */}
      <form className="chat-input-form" onSubmit={handleSubmit}>
        <div className="chat-input-wrap">
          <input
            id="chat-input"
            className="input chat-input-field"
            type="text"
            value={chatInput}
            onChange={e => onInputChange(e.target.value)}
            placeholder="Ask the sustainability assistant about telemetry, reductions, or GHG protocols…"
            disabled={isLoading}
          />
          <button
            type="submit"
            className="btn btn-primary chat-send-btn"
            disabled={isLoading || !chatInput.trim()}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <span className="btn-spinner-label">Analyzing…</span>
            ) : (
              <>
                <SendIcon />
                <span>Ask Assistant</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Response Box */}
      {chatResponse && (
        <div className="chat-response-card" role="region" aria-label="Assistant response">
          {/* Response Meta Header */}
          <div className="chat-response-header">
            <div className="chat-assistant-badge">
              <div className="chat-assistant-avatar">
                <RobotIcon />
              </div>
              <div className="chat-assistant-info">
                <span className="chat-assistant-title">Decision Assistant</span>
                <span className="chat-assistant-sub">Grounded with active telemetry</span>
              </div>
            </div>

            <div className="chat-header-tags">
              {chatResponse.fallback_mode ? (
                <Chip variant="amber">Deterministic Fallback</Chip>
              ) : (
                <Chip variant="green">Model: {chatResponse.model_used}</Chip>
              )}
              <span className="text-xs text-muted font-mono">
                {chatResponse.tools_used.length} tool invocation{chatResponse.tools_used.length !== 1 ? 's' : ''}
              </span>
            </div>
          </div>

          {/* Tool Execution Telemetry Trace */}
          {chatResponse.tools_used.length > 0 && (
            <div className="chat-tools-trace" aria-label="Tool execution traces">
              <div className="chat-trace-label">
                <ActivityIcon />
                <span>Tool Execution Trace:</span>
              </div>
              <div className="chat-trace-pills">
                {chatResponse.tools_used.map((t, i) => (
                  <span key={i} className="tool-trace-pill">
                    <strong className="font-mono">{t.tool_name}</strong>
                    <span className="trace-duration font-mono">{t.execution_time_ms}ms</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Assistant Answer Body */}
          <div className="chat-answer-body">
            {chatResponse.answer.split('\n\n').map((para, i) => (
              <p key={i} className="chat-para">{para}</p>
            ))}
          </div>

          {/* Authoritative Citations */}
          {chatResponse.citations && chatResponse.citations.length > 0 && (
            <div className="chat-citations-section">
              <div className="chat-citations-title">
                <CheckIcon />
                <span>Authoritative Standards Citations ({chatResponse.citations.length}):</span>
              </div>
              <div className="chat-citations-list">
                {chatResponse.citations.map((c, i) => (
                  <div key={i} className="chat-citation-item">
                    <div className="chat-citation-header">
                      <strong>{c.title}</strong>
                      {c.publisher && <span className="citation-publisher">· {c.publisher}</span>}
                    </div>
                    <p className="citation-snippet">{c.content.slice(0, 160)}…</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Assumptions */}
          {chatResponse.assumptions && chatResponse.assumptions.length > 0 && (
            <div className="chat-assumptions-section">
              <span className="assumptions-label">Accounting Assumptions:</span>
              <span className="assumptions-text">{chatResponse.assumptions.join(' ')}</span>
            </div>
          )}
        </div>
      )}

      {/* Empty State Prompt */}
      {!chatResponse && !isLoading && (
        <InfoBlock variant="info">
          Select a quick prompt above or type your own question. The assistant uses read-only allowlisted tools to evaluate live telemetry and provide grounded carbon reduction advice.
        </InfoBlock>
      )}
    </div>
  );
};
