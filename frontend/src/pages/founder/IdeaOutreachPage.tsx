import React, { useEffect, useState } from 'react';
import { usePageContext } from '@/context/PageContext';
import { outreachService } from '@/services/outreachService';
import { OutreachMessage } from '@/types';

export const IdeaOutreachPage: React.FC = () => {
  const [pipeline, setPipeline] = useState<OutreachMessage[]>([]);
  const [selectedMessage, setSelectedMessage] = useState<OutreachMessage | null>(null);

  usePageContext({
    pageKey: 'outreach_pipeline',
    title: 'Candidate Outreach Pipeline Kanban',
    summary: 'Candidate relationship management: active outreach messages across Drafts, Sent, In Conversation, and Offer stages.',
    data: { pipelineCount: pipeline.length },
  });

  useEffect(() => {
    async function load() {
      const msgs = await outreachService.getPipeline();
      setPipeline(msgs);
    }
    load();
  }, []);

  const stages: ('Drafts' | 'Sent' | 'In Conversation' | 'Offer / Hired')[] = [
    'Drafts',
    'Sent',
    'In Conversation',
    'Offer / Hired',
  ];

  const handleMoveStage = async (
    msgId: string,
    newStage: 'Drafts' | 'Sent' | 'In Conversation' | 'Offer / Hired'
  ) => {
    const updated = await outreachService.updateStage(msgId, newStage);
    setPipeline([...updated]);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h3 className="font-headline-sm text-headline-sm font-semibold text-on-surface">
            Candidate Outreach Pipeline
          </h3>
          <p className="font-body-sm text-body-sm text-secondary">
            Manage your initial founder outreach, interview stages, and co-founder offers.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <span className="font-mono text-xs px-2.5 py-1 rounded bg-surface-container text-secondary font-medium">
            {pipeline.length} Active Conversations
          </span>
        </div>
      </div>

      {/* Kanban Board Columns */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5 items-start">
        {stages.map((stage) => {
          const stageMessages = pipeline.filter((m) => m.stage === stage);

          return (
            <div
              key={stage}
              className="bg-surface-container-low/60 rounded-xl p-4 border border-outline-variant/30 flex flex-col min-h-[500px]"
            >
              {/* Column Header */}
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-3">
                <div className="flex items-center gap-2">
                  <span
                    className={`w-2 h-2 rounded-full ${
                      stage === 'Drafts'
                        ? 'bg-secondary'
                        : stage === 'Sent'
                        ? 'bg-blue-600'
                        : stage === 'In Conversation'
                        ? 'bg-primary-container'
                        : 'bg-emerald-600'
                    }`}
                  />
                  <h4 className="font-headline-sm text-xs font-semibold uppercase tracking-wider text-on-surface">
                    {stage}
                  </h4>
                </div>
                <span className="font-label-sm text-xs px-2 py-0.5 rounded-full bg-surface-container text-secondary font-mono">
                  {stageMessages.length}
                </span>
              </div>

              {/* Cards in Column */}
              <div className="space-y-3 flex-1 overflow-y-auto">
                {stageMessages.map((msg) => (
                  <div
                    key={msg.id}
                    onClick={() => setSelectedMessage(msg)}
                    className="p-4 bg-surface-container-lowest rounded-lg border border-outline-variant/30 shadow-xs hover:shadow-md transition-all cursor-pointer space-y-2 group"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-headline-sm text-sm font-semibold text-on-surface group-hover:text-primary-container transition-colors">
                        {msg.candidateName}
                      </span>
                      <span className="font-label-sm text-[10px] px-1.5 py-0.2 rounded bg-surface-container text-secondary font-medium">
                        {msg.status}
                      </span>
                    </div>

                    <div className="font-body-sm text-xs text-secondary">
                      {msg.candidateRole}
                    </div>

                    <p className="font-body-sm text-xs text-on-surface-variant line-clamp-2">
                      {msg.body}
                    </p>

                    {/* Stage Transition Select */}
                    <div className="pt-2 border-t border-outline-variant/10 flex items-center justify-between">
                      <span className="text-[10px] text-secondary font-mono">
                        {new Date(msg.sentAt).toLocaleDateString()}
                      </span>

                      <select
                        value={msg.stage}
                        onClick={(e) => e.stopPropagation()}
                        onChange={(e) =>
                          handleMoveStage(
                            msg.id,
                            e.target.value as 'Drafts' | 'Sent' | 'In Conversation' | 'Offer / Hired'
                          )
                        }
                        className="text-[11px] font-label-sm text-primary-container bg-surface-container px-2 py-0.5 rounded focus:outline-none cursor-pointer"
                      >
                        {stages.map((s) => (
                          <option key={s} value={s}>
                            → {s}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                ))}

                {stageMessages.length === 0 && (
                  <div className="h-32 border-2 border-dashed border-outline-variant/30 rounded-lg flex items-center justify-center text-xs text-secondary">
                    No candidates in {stage}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Message Detail Modal */}
      {selectedMessage && (
        <div className="fixed inset-0 z-50 overflow-hidden flex items-center justify-center p-4 bg-[#111111]/40 backdrop-blur-sm">
          <div className="bg-surface-container-lowest rounded-2xl max-w-lg w-full p-6 border border-outline-variant/30 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20">
              <div>
                <h4 className="font-headline-sm text-base font-semibold text-on-surface">
                  {selectedMessage.candidateName}
                </h4>
                <div className="font-body-sm text-xs text-secondary">
                  {selectedMessage.candidateRole} • Stage: {selectedMessage.stage}
                </div>
              </div>
              <button
                onClick={() => setSelectedMessage(null)}
                className="p-1.5 rounded-lg text-secondary hover:text-on-surface"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </div>

            <div>
              <span className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Subject
              </span>
              <div className="font-headline-sm text-sm font-medium text-on-surface bg-surface-container-low p-2.5 rounded-lg border border-outline-variant/20">
                {selectedMessage.subject}
              </div>
            </div>

            <div>
              <span className="font-label-sm text-xs font-semibold text-secondary uppercase tracking-wider block mb-1">
                Message Body
              </span>
              <div className="font-body-sm text-xs text-on-surface whitespace-pre-wrap bg-surface-container-low p-3.5 rounded-lg border border-outline-variant/20 leading-relaxed max-h-60 overflow-y-auto">
                {selectedMessage.body}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedMessage(null)}
                className="px-4 py-2 rounded-lg bg-primary-container text-on-primary font-label-md text-xs font-medium hover:bg-primary transition-colors"
              >
                Close Message
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
