# NexBridge.ai — Backend API Contract

This document defines the 1:1 mapping between the frontend service calls and the FastAPI backend endpoints. All request and response bodies use JSON with camelCase naming convention matching frontend TypeScript interfaces.

| Method | Endpoint | Frontend Service | Request Body / Query Params | Response Type | Description |
|---|---|---|---|---|---|
| `GET` | `/api/auth/me` | `authService.getCurrentUser` | None (Bearer token in header) | `User` | Returns the currently authenticated user's profile and active workspace role |
| `POST` | `/api/auth/login` | `authService.login`, `authService.switchRole` | `{ email: string, role: string }` | `User` | Logs in or switches active workspace role (founder, talent, mentor) |
| `GET` | `/api/ideas` | `ideaService.getIdeas` | None | `Idea[]` | Lists all ventures and validation summaries |
| `GET` | `/api/ideas/{id}` | `ideaService.getIdeaById` | Path: `id` | `Idea` | Returns full idea workspace (agents, competitors, unit economics, execution plan, job roles) |
| `POST` | `/api/ideas/validate` | `ideaService.createIdea`, `ideaService.simulateParallelValidation` | `{ title: string, tagline?: string, description: string, category?: string, targetMarket?: string }` | `Idea` | Initiates parallel 5-agent stress-test pipeline and returns synthesized venture |
| `GET` | `/api/ideas/{id}/validation` | `ideaService` polling | Path: `id` | `ValidationRunStatus` | Polls real-time progress and per-agent completion status for an active validation run |
| `GET` | `/api/candidates` | `outreachService.getCandidates` | Query: `?roleId=string` (optional) | `Candidate[]` | Retrieves synthesized candidates matching venture job roles |
| `GET` | `/api/candidates/{id}` | `outreachService.getCandidateById` | Path: `id` | `Candidate` | Returns detailed candidate profile, skills, experience, and outreach status |
| `POST` | `/api/outreach` | `outreachService.sendOutreach` | `{ candidateId: string, candidateName: string, candidateRole: string, subject: string, body: string }` | `OutreachMessage` | Dispatches founder outreach message and transitions candidate to contacted |
| `GET` | `/api/outreach/pipeline` | `outreachService.getPipeline` | None | `OutreachMessage[]` | Returns all outreach messages across Kanban stages (Drafts, Sent, In Conversation, Offer / Hired) |
| `PATCH` | `/api/outreach/{id}/stage` | `outreachService.updateStage` | Path: `id`, Body: `{ stage: string }` | `OutreachMessage[]` | Updates message Kanban stage in the founder outreach pipeline |
| `GET` | `/api/talent/profile` | `talentService.getProfile` | None | `TalentProfile` | Returns active talent profile with extracted skills and parsed resume metadata |
| `POST` | `/api/talent/resume` | `talentService.uploadResume` | Multipart form: `resume` (PDF/DOCX file) | `TalentProfile` | Uploads resume to private Supabase bucket, extracts text, generates vector embedding, updates profile |
| `GET` | `/api/talent/matches` | `talentService.getStartupMatches` | None | `StartupMatch[]` | Computes 60/40 weighted skill overlap and vector similarity to venture roles |
| `GET` | `/api/talent/applications` | `talentService.getApplications` | None | `Application[]` | Tracks status of submitted applications (Under Review, Interviewing, Offer, Rejected) |
| `GET` | `/api/talent/applications/{id}/report` | `talentService.getRejectionReport` | Path: `id` | `RejectionReport` | Returns structured rejection growth report with severity, missing skills, and week-by-week timeline |
| `GET` | `/api/mentors` | `mentorService.getMentors` | Query: `?query=string&domain=string` (optional) | `Mentor[]` | Searches mentors and advisors filtered by domain or keywords |
| `GET` | `/api/mentors/{id}` | `mentorService.getMentorById` | Path: `id` | `Mentor` | Returns detailed mentor profile, past exits, hourly rate, and booking availability |
| `POST` | `/api/mentors/request` | `mentorService.requestSession` | `{ mentorId: string, topic: string, message: string, proposedTime: string, founderName?: string, startupName?: string }` | `MentorRequest` | Submits advisory session booking request to mentor |
| `GET` | `/api/mentors/requests/all` | `mentorService.getRequests` | None | `MentorRequest[]` | Lists all advisory consultation requests |
| `PATCH` | `/api/mentors/requests/{id}/status` | `mentorService.updateRequestStatus` | Path: `id`, Body: `{ status: string }` | `MentorRequest[]` | Updates advisory request status (`accepted`, `declined`, `completed`) |
| `POST` | `/api/chat` | `chatService.sendMessage` | `{ message: string, context: PageContext, history: ChatMessage[] }` | `ChatMessage` | Executive co-pilot chat taking current page route, active data, and conversational history |
