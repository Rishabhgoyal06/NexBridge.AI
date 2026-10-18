import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { usePageContext } from '@/context/PageContext';
import { ideaService } from '@/services/ideaService';
import { ValidationAgent } from '@/types';

export const NewIdeaPage: React.FC = () => {
  usePageContext({
    pageKey: 'new_idea',
    title: 'New Idea Submission & Parallel 5-Agent Validation',
    summary: 'Submit a new venture concept to trigger parallel multi-agent evaluation and team synthesis',
  });

  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [tagline, setTagline] = useState('');
  const [targetMarket, setTargetMarket] = useState('');
  const [description, setDescription] = useState('');

  const [isValidating, setIsValidating] = useState(false);
  const [agentProgress, setAgentProgress] = useState<
    { name: string; role: string; icon: string; status: 'pending' | 'running' | 'completed' | 'flagged'; verdict?: string }[]
  >([
    { name: 'Market Analyst', role: 'Demand & Willingness-To-Pay', icon: 'insights', status: 'pending' },
    { name: 'Competitor Researcher', role: 'Moat & Landscape Mapping', icon: 'radar', status: 'pending' },
    { name: 'Revenue Critic', role: 'Unit Economics & Margins', icon: 'payments', status: 'pending' },
    { name: 'Technical Architect', role: 'Feasibility & Stack Blueprint', icon: 'terminal', status: 'pending' },
    { name: 'Skeptic', role: 'Pre-Mortem & Threat Model', icon: 'warning', status: 'pending' },
  ]);

  const handlePrefillDemo = () => {
    setTitle('NutriFit AI');
    setTagline('AI meal planner for gym-goers with dynamic carb-cycling & 1-click cart prep');
    setTargetMarket('Strength athletes, bodybuilders, functional fitness enthusiasts');
    setDescription(
      'An intelligent nutrition platform engineered specifically for strength training and bodybuilding athletes. Combines real-time workout telemetry from Apple Watch & Whoop with computer vision plate-scanning to automatically adjust macro targets and dispatch exact grocery orders via Instacart.'
    );
  };

  const handleRunValidation = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsValidating(true);

    // Set agents to running
    setAgentProgress((prev) =>
      prev.map((a) => ({ ...a, status: 'running' }))
    );

    try {
      const generatedIdea = await ideaService.simulateParallelValidation(
        { title, description, targetMarket },
        (agent: ValidationAgent) => {
          setAgentProgress((prev) =>
            prev.map((a) =>
              a.name === agent.name
                ? { ...a, status: agent.status, verdict: agent.verdict }
                : a
            )
          );
        }
      );

      setTimeout(() => {
        navigate(`/ideas/${generatedIdea.id}/validation`);
      }, 800);
    } catch (err) {
      console.error(err);
      setIsValidating(false);
    }
  };

  return (
    <div className="max-w-[1000px] mx-auto p-8 w-full pb-20">
      <div className="flex flex-col mb-8">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-label-sm text-label-sm uppercase tracking-wider text-outline font-semibold">
            Venture Genesis
          </span>
          <span className="text-outline-variant">/</span>
          <span className="font-label-sm text-label-sm text-primary-container font-semibold">
            Autonomous 5-Agent Interrogation
          </span>
        </div>
        <h1 className="font-headline-xl text-headline-xl text-on-surface font-semibold tracking-tight">
          Submit Concept for AI Validation
        </h1>
        <p className="font-body-md text-body-md text-secondary mt-1">
          Provide your core proposition. Five autonomous agents will interrogate market demand, unit economics, tech stack feasibility, and generate your co-founder candidate matches.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Form Column */}
        <div className="lg:col-span-7 bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant/20 mb-5">
            <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
              Venture Parameters
            </span>
            <button
              type="button"
              onClick={handlePrefillDemo}
              className="text-xs font-label-md text-primary-container hover:underline font-medium flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[15px]">auto_awesome</span>
              Prefill Demo (NutriFit AI)
            </button>
          </div>

          <form onSubmit={handleRunValidation} className="space-y-4">
            <div>
              <label className="block font-label-md text-label-md font-medium text-on-surface mb-1">
                Startup Name
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. NutriFit AI"
                disabled={isValidating}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-medium text-on-surface mb-1">
                One-Line Tagline
              </label>
              <input
                type="text"
                required
                value={tagline}
                onChange={(e) => setTagline(e.target.value)}
                placeholder="e.g. AI meal planner for gym-goers with dynamic carb-cycling"
                disabled={isValidating}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-medium text-on-surface mb-1">
                Target Market / Ideal Customer Persona
              </label>
              <input
                type="text"
                required
                value={targetMarket}
                onChange={(e) => setTargetMarket(e.target.value)}
                placeholder="e.g. Dedicated strength athletes and CrossFitters"
                disabled={isValidating}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>

            <div>
              <label className="block font-label-md text-label-md font-medium text-on-surface mb-1">
                Core Problem &amp; AI Solution Mechanism
              </label>
              <textarea
                rows={4}
                required
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe why existing tools fail and how your software eliminates friction..."
                disabled={isValidating}
                className="w-full px-3.5 py-2.5 bg-surface-container-low border border-outline-variant/40 rounded-lg text-body-sm text-on-surface focus:outline-none focus:border-primary-container focus:ring-1 focus:ring-primary-container transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isValidating}
              className="w-full h-12 rounded-lg bg-primary-container hover:bg-primary text-on-primary font-label-md text-label-md font-medium shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60 mt-4"
            >
              {isValidating ? (
                <>
                  <span className="w-5 h-5 rounded-full border-2 border-on-primary border-t-transparent animate-spin"></span>
                  <span>AI Agents Analyzing... (~45s)</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-[20px]">neurology</span>
                  <span>Run 5-Agent Parallel Validation</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* Live Parallel Agents Feedback Column */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-surface-container-lowest rounded-xl p-6 border border-outline-variant/30 shadow-sm">
            <div className="flex items-center justify-between pb-3 border-b border-outline-variant/20 mb-4">
              <span className="font-headline-sm text-headline-sm font-semibold text-on-surface">
                Agent Pipeline Status
              </span>
              <span className="font-mono text-xs text-secondary">
                {isValidating ? 'Executing...' : 'Ready'}
              </span>
            </div>

            <div className="space-y-3">
              {agentProgress.map((agent) => (
                <div
                  key={agent.name}
                  className="p-3 rounded-lg bg-surface-container-low border border-outline-variant/20 flex flex-col gap-1 transition-all"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-md bg-surface-container flex items-center justify-center text-primary-container">
                        <span className="material-symbols-outlined text-[16px]">{agent.icon}</span>
                      </div>
                      <span className="font-headline-sm text-[13px] font-semibold text-on-surface">
                        {agent.name}
                      </span>
                    </div>

                    <span
                      className={`font-label-sm text-[10px] px-2 py-0.5 rounded-full font-medium ${
                        agent.status === 'completed'
                          ? 'bg-primary-fixed/40 text-primary-container'
                          : agent.status === 'flagged'
                          ? 'bg-amber-100 text-amber-800 font-semibold'
                          : agent.status === 'running'
                          ? 'bg-amber-100 text-amber-800 animate-pulse'
                          : 'bg-surface-container text-secondary'
                      }`}
                    >
                      {agent.status === 'completed'
                        ? 'Done'
                        : agent.status === 'flagged'
                        ? 'Threat Flagged'
                        : agent.status === 'running'
                        ? 'Analyzing...'
                        : 'Waiting'}
                    </span>
                  </div>

                  {agent.verdict && (
                    <p className="font-body-sm text-[11px] text-secondary mt-1 pl-9 truncate">
                      {agent.verdict}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-4 border-t border-outline-variant/20 text-xs text-secondary">
              Agents run independently in parallel. Synthesizer consolidates scores, moats, and required job specs.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
