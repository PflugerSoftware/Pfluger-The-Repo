/**
 * Pitch Agent Service
 *
 * AI-powered assistant that helps users develop research pitches.
 * Guides them from initial idea → scope selection → methodology → complete pitch.
 */

// Project type for context
export interface ProjectContext {
  id: string;
  title: string;
  researcher: string;
  category: string;
  phase: string;
  description: string;
}

// Conversation message type
export interface PitchMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Extracted pitch data from conversation
export interface ExtractedPitch {
  researchIdea: string | null;
  scope: 'simple' | 'medium' | 'complex' | null;
  methodology: string | null;
  projectConnection: string | null;
  projectName: string | null;
  buildingOff: string | null;
  partner: string | null;
  successMetrics: string | null;
  timeline: string | null;
  isComplete: boolean;
}

// Agent response
export interface PitchAgentResponse {
  message: string;
  extractedPitch: ExtractedPitch;
}

// System prompt with embedded knowledge
const SYSTEM_PROMPT = `You are Ezra, Pfluger Architects' Research & Benchmarking pitch assistant. Your job is to help users develop a solid research pitch through natural conversation.

## YOUR APPROACH
1. Listen to their idea first - don't rush to categorize
2. Ask clarifying questions to understand WHAT they really want to do
3. Guide them toward an appropriate scope and methodology based on their answers
4. Help them solidify their pitch - don't let them spin endlessly on the idea

## RESEARCH SCOPES (you must guide them to one of these)

**Simple (20-60 hours)** - Quick wins, good for first-time researchers
- Infographic Creation: Visual summary of key facts about a topic
- Expert Interview: Short interview with someone knowledgeable, summarize insights
- Literature Review: Brief review of 3+ academic articles on a topic

**Medium (60-120 hours)** - More substantial investigation
- Survey/Post-Occupancy: Design a survey to gather data, analyze results
- Annotated Bibliography: Compile and summarize relevant sources in depth

**Complex (120+ hours)** - Deep research, multiple phases
- Case Study Analysis: Detailed analysis of specific examples
- Experimental Design: Test a hypothesis with measurable outcomes
- Long-form Whitepaper: Comprehensive essay for publication

## HOW TO GUIDE SCOPE SELECTION

Based on what they want to DO, recommend a scope:
- "I want to understand X" → depends on depth: Literature Review (simple) or Survey (medium)
- "I want to create a resource" → Infographic (simple) or Annotated Bibliography (medium)
- "I want to test/measure something" → Experimental Design (complex)
- "I want to analyze examples" → Case Study (medium or complex)
- "I want to publish/write" → Whitepaper (complex) or Literature Review (simple)
- "I want to talk to experts" → Expert Interview (simple)

## CONVERSATION FLOW

1. **Understand the idea** (1-2 exchanges max)
   - What's the topic/question?
   - Why does it matter to them?

2. **Clarify the goal** (1-2 exchanges)
   - What do they want to END UP with? (a resource, insights, data, publication?)
   - Who would use it?

3. **Recommend scope & methodology** (be direct)
   - "Based on what you're describing, this sounds like a [scope] project using [methodology]"
   - Explain briefly why this fits

4. **Fill in details**
   - Project connection: Is this for a **current project**, **prospected project** (future/potential project), or **thought leadership** (general knowledge building)?
   - If project-related (current or prospected), ask for the **project name or number**
   - **Building off prior research**: Is this building on or continuing from another R&B project? (e.g., "X25-RB01") (Optional)
   - **Partners/Organizations**: Are there any external organizations or partners involved? (Optional)
   - **Expected deliverable/impact**: What will this research PRODUCE? (Be specific: "An infographic", "A whitepaper", "Survey data analysis", etc.)
   - Rough timeline

5. **Summarize the pitch**
   - Provide a clear summary they can submit

## CONNECTING TO EXISTING RESEARCH

You have access to Pfluger's existing research projects. When someone proposes an idea:
1. Check if it relates to existing work - mention relevant projects they could BUILD ON
2. If it overlaps too much, help them find a NEW ANGLE or GAP to explore
3. Suggest potential collaborations with researchers who've done related work

When referencing existing projects, mention the project ID (e.g., X25-RB05) and researcher name.

## IMPORTANT BEHAVIORS

- Be conversational but efficient - don't drag things out
- If they're vague, ask ONE specific clarifying question
- After 2-3 exchanges on the idea, actively guide them: "Let me help you solidify this..."
- Make scope recommendations confidently - you're the expert
- If they want something that doesn't fit, gently redirect toward what's achievable
- Keep responses concise (2-4 sentences usually)
- Reference existing projects when relevant to help users build on prior work

## RESPONSE FORMAT

Always respond naturally in conversation.

**IMPORTANT: When a decision is locked in, include a status tag at the END of your response to update the UI:**

When research idea is clear, add: [PITCH_UPDATE: idea="their research question here"]
When scope is determined, add: [PITCH_UPDATE: scope="simple|medium|complex"]
When methodology is chosen, add: [PITCH_UPDATE: methodology="the method"]
When project connection is known, add: [PITCH_UPDATE: alignment="current-project|prospected-project|thought-leadership"]
When project name mentioned (if project-related), add: [PITCH_UPDATE: projectName="project name or number"]
When building off prior research, add: [PITCH_UPDATE: buildingOff="X25-RB01" or other project ID]
When partner/organization mentioned, add: [PITCH_UPDATE: partner="organization or partner name"]
When deliverable/impact is clear, add: [PITCH_UPDATE: impact="what this will produce"]
When timeline discussed, add: [PITCH_UPDATE: timeline="the timeline"]

You can include multiple updates in one response, e.g.:
[PITCH_UPDATE: scope="medium"]
[PITCH_UPDATE: methodology="Survey/Post-Occupancy"]
[PITCH_UPDATE: impact="Survey data analysis and recommendations report"]

When you've gathered enough info, include a brief pitch summary like:

---
**Pitch Summary**
- **Research Question**: [their question/topic]
- **Scope**: [Simple/Medium/Complex] ([X] hours)
- **Methodology**: [specific method]
- **Deliverable**: [what they'll produce]
- **Project Connection**: [current project or thought leadership]
---

And mark it complete: [PITCH_UPDATE: complete="true"]

Start by warmly greeting them and asking what research idea they're interested in exploring.`;

// Call Claude via Supabase Edge Function (matches rag.ts pattern)
async function callClaude(prompt: string): Promise<string> {
  const modelMap = {
    haiku: 'claude-haiku-4-5-20251001',
    sonnet: 'claude-sonnet-4-5-20250929',
    opus: 'claude-opus-4-5-20251101',
  };

  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiEndpoint = `${supabaseUrl}/functions/v1/claude`;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({
        model: modelMap.sonnet,
        prompt,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API error: ${response.status} - ${errorText}`);
    }

    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Claude API error:', error);
    return 'Sorry, I encountered an error processing your request. Could you try rephrasing that?';
  }
}

// Build prompt from system context, projects, and conversation history
function buildPrompt(messages: PitchMessage[], systemPrompt: string, projects?: ProjectContext[]): string {
  let prompt = systemPrompt;

  // Add existing projects context if available
  if (projects && projects.length > 0) {
    prompt += '\n\n---\n\n## EXISTING PFLUGER RESEARCH PROJECTS\n\n';
    for (const p of projects) {
      prompt += `- **${p.id}: ${p.title}** (${p.phase})\n`;
      prompt += `  Researcher: ${p.researcher} | Category: ${p.category}\n`;
      prompt += `  ${p.description}\n\n`;
    }
  }

  prompt += '\n---\n\nConversation so far:\n';

  for (const msg of messages) {
    const role = msg.role === 'user' ? 'User' : 'Assistant';
    prompt += `\n${role}: ${msg.content}\n`;
  }

  prompt += '\nAssistant:';
  return prompt;
}

// Parse PITCH_UPDATE tags from response
function parsePitchUpdates(response: string): Partial<ExtractedPitch> {
  const updates: Partial<ExtractedPitch> = {};

  // Match all [PITCH_UPDATE: key="value"] patterns
  const updateRegex = /\[PITCH_UPDATE:\s*(\w+)="([^"]+)"\]/g;
  let match;

  while ((match = updateRegex.exec(response)) !== null) {
    const [, key, value] = match;
    switch (key) {
      case 'idea':
        updates.researchIdea = value;
        break;
      case 'scope':
        if (['simple', 'medium', 'complex'].includes(value.toLowerCase())) {
          updates.scope = value.toLowerCase() as 'simple' | 'medium' | 'complex';
        }
        break;
      case 'methodology':
        updates.methodology = value;
        break;
      case 'alignment':
        updates.projectConnection = value;
        break;
      case 'projectName':
        updates.projectName = value;
        break;
      case 'buildingOff':
        updates.buildingOff = value;
        break;
      case 'partner':
        updates.partner = value;
        break;
      case 'impact':
        updates.successMetrics = value;
        break;
      case 'timeline':
        updates.timeline = value;
        break;
      case 'complete':
        updates.isComplete = value === 'true';
        break;
    }
  }

  return updates;
}

// Strip markdown formatting from text
export function stripMarkdown(text: string): string {
  return text
    // Remove bold (**text** or __text__)
    .replace(/\*\*(.+?)\*\*/g, '$1')
    .replace(/__(.+?)__/g, '$1')
    // Remove italic (*text* or _text_)
    .replace(/\*(.+?)\*/g, '$1')
    .replace(/_(.+?)_/g, '$1')
    // Remove headers (# or ##, etc)
    .replace(/^#{1,6}\s+/gm, '')
    // Remove bullet points (- or * at start of line)
    .replace(/^[\s]*[-*]\s+/gm, '')
    // Remove inline code (`text`)
    .replace(/`([^`]+)`/g, '$1')
    // Remove links but keep text [text](url)
    .replace(/\[([^\]]+)\]\([^\)]+\)/g, '$1')
    // Remove blockquotes (>)
    .replace(/^>\s+/gm, '')
    // Remove horizontal rules (---, ***, ___)
    .replace(/^[\s]*[-*_]{3,}[\s]*$/gm, '')
    // Remove em dashes (—) and en dashes (–)
    .replace(/—/g, ' ')
    .replace(/–/g, ' ')
    // Clean up multiple spaces
    .replace(/\s+/g, ' ')
    .trim();
}

// Strip PITCH_UPDATE tags from response for display
export function stripPitchTags(response: string): string {
  return response.replace(/\[PITCH_UPDATE:\s*\w+="[^"]+"\]\s*/g, '').trim();
}

// Extract pitch data from the latest response
function extractPitchData(messages: PitchMessage[]): ExtractedPitch {
  // Start with empty state
  const extracted: ExtractedPitch = {
    researchIdea: null,
    scope: null,
    methodology: null,
    projectConnection: null,
    projectName: null,
    buildingOff: null,
    partner: null,
    successMetrics: null,
    timeline: null,
    isComplete: false
  };

  // Parse all assistant messages to accumulate updates
  for (const msg of messages) {
    if (msg.role === 'assistant') {
      const updates = parsePitchUpdates(msg.content);
      Object.assign(extracted, updates);
    }
  }

  return extracted;
}

/**
 * Send a message to the pitch agent and get a response
 */
export async function sendPitchMessage(
  userMessage: string,
  conversationHistory: PitchMessage[],
  projects?: ProjectContext[]
): Promise<PitchAgentResponse> {
  // Add the new user message to history
  const messages: PitchMessage[] = [
    ...conversationHistory,
    { role: 'user', content: userMessage }
  ];

  // Build prompt and get response from Claude
  const prompt = buildPrompt(messages, SYSTEM_PROMPT, projects);
  const response = await callClaude(prompt);

  // Extract any pitch data from the conversation
  const allMessages = [...messages, { role: 'assistant' as const, content: response }];
  const extractedPitch = extractPitchData(allMessages);

  return {
    message: response,
    extractedPitch
  };
}

/**
 * Get the initial greeting message
 */
export async function getInitialMessage(): Promise<string> {
  // Return a static greeting to avoid an API call
  return "Hey! I'm Ezra, your research pitch assistant. I'm here to help you turn your idea into a solid research pitch.\n\nWhat's on your mind? Tell me about a topic or question you're interested in exploring.";
}
