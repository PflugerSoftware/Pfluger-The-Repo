import { supabase } from '../config/supabase';

// Types
export interface BlockMatch {
  id: string;
  project_id: string;
  block_type: string;
  summary: string;
  conclusions: string[];
  source_ids: number[];
  searchable_text: string;
  relevance_rank: number;
}

export interface Source {
  id: number;
  project_id: string;
  title: string;
  author: string;
  url: string | null;
}

export interface RAGResponse {
  answer: string;
  sources: Source[];
  blocks_used: string[];
  model_used: 'haiku' | 'sonnet' | 'opus';
}

// Search for relevant blocks using full-text search
export async function searchBlocks(
  query: string,
  projectId?: string,
  limit: number = 25
): Promise<BlockMatch[]> {
  console.log('Searching for:', query);

  // Try full-text search first (Postgres websearch handles natural language)
  let queryBuilder = supabase
    .from('project_blocks')
    .select('id, project_id, block_type, summary, conclusions, source_ids, searchable_text')
    .textSearch('searchable_text', query, { type: 'websearch', config: 'english' })
    .limit(limit);

  if (projectId) {
    queryBuilder = queryBuilder.eq('project_id', projectId);
  }

  let { data, error } = await queryBuilder;

  console.log('Full-text search result:', { count: data?.length, error });

  // If full-text search fails, try searching with OR on multiple terms
  if (error || !data || data.length === 0) {
    console.log('Full-text failed, trying multi-term OR search');

    // Get all words longer than 4 chars as potential search terms
    const terms = query
      .toLowerCase()
      .split(/\s+/)
      .filter(word => word.length > 4);

    // Search each term and collect unique results
    const allResults: Map<string, BlockMatch> = new Map();

    for (const term of terms.slice(0, 8)) { // Search up to 8 terms
      const { data: termData, error: termError } = await supabase
        .from('project_blocks')
        .select('id, project_id, block_type, summary, conclusions, source_ids, searchable_text')
        .ilike('searchable_text', `%${term}%`)
        .limit(10);

      if (!termError && termData) {
        console.log(`Term "${term}" found ${termData.length} results`);
        for (const block of termData) {
          if (!allResults.has(block.id)) {
            allResults.set(block.id, block as BlockMatch);
          }
        }
      }
    }

    data = Array.from(allResults.values()).slice(0, limit);
    error = null;
    console.log('Multi-term search found:', data.length, 'unique blocks');
  }

  if (error) {
    console.error('Search error:', error);
    return [];
  }

  return (data || []).map((block: Omit<BlockMatch, 'relevance_rank'>, index: number) => ({
    ...block,
    conclusions: block.conclusions || [],
    source_ids: block.source_ids || [],
    relevance_rank: index + 1,
  }));
}

// Get sources by IDs - looks up from the sources block, not a separate table
export async function getSources(sourceIds: number[], projectId: string): Promise<Source[]> {
  if (!sourceIds.length) return [];

  // Get the sources block for this project
  const { data: sourcesBlock, error } = await supabase
    .from('project_blocks')
    .select('data')
    .eq('project_id', projectId)
    .eq('block_type', 'sources')
    .single();

  if (error || !sourcesBlock?.data?.sources) {
    console.error('Sources block error:', error);
    return [];
  }

  // Filter to requested source IDs
  const allSources = sourcesBlock.data.sources as Array<{
    id: number;
    title: string;
    author: string;
    url: string | null;
  }>;

  return allSources
    .filter(s => sourceIds.includes(s.id))
    .map(s => ({
      id: s.id,
      project_id: projectId,
      title: s.title,
      author: s.author,
      url: s.url,
    }));
}

// Format sources for citation
export function formatCitation(source: Source): string {
  let citation = '';
  if (source.author) citation += source.author;
  if (source.title) citation += citation ? `. ${source.title}` : source.title;
  if (source.url) citation += ` ${source.url}`;
  return citation || 'Unknown source';
}

// Available research topics (for routing)
const RESEARCH_TOPICS = [
  'acoustics',
  'lighting',
  'daylight',
  'color',
  'biophilic design',
  'nature',
  'emotional regulation',
  'sanctuary spaces',
  'child development',
  'learning environments',
  'materials',
  'sensory design',
];

// Conversation message type
export interface ConversationMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Phase 0: Haiku intent analysis and routing
export async function analyzeIntent(
  query: string,
  conversationHistory: ConversationMessage[] = []
): Promise<{
  topic: string;
  intent: 'research_query' | 'conversational' | 'general_design';
  searchTerms: string[];
  relatedTopics: string[];
  contextSummary: string;
}> {
  const historyContext = conversationHistory.length > 0
    ? `Recent conversation:\n${conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
    : '';

  const prompt = `Analyze this conversation in the context of architectural design research.

${historyContext}Current message: "${query}"

Our research covers: ${RESEARCH_TOPICS.join(', ')}

Respond ONLY with valid JSON:
{
  "topic": "main topic based on full conversation context",
  "intent": "research_query" | "conversational" | "general_design",
  "searchTerms": ["terms", "to", "search", "based on conversation"],
  "relatedTopics": ["related topics from our list above"],
  "contextSummary": "brief summary of what user is exploring/working on"
}

Intent types:
- research_query: question about design, OR user sharing project context
- conversational: greetings, thanks, or very short replies needing clarification
- general_design: design question likely outside our specific research`;

  const response = await callClaude(prompt, 'haiku');

  try {
    let jsonStr = response;
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) jsonStr = jsonMatch[1].trim();
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) jsonStr = objectMatch[0];

    return JSON.parse(jsonStr);
  } catch {
    return {
      topic: query,
      intent: query.split(/\s+/).length <= 3 ? 'conversational' : 'research_query',
      searchTerms: query.toLowerCase().split(/\s+/).filter(w => w.length > 3),
      relatedTopics: [],
      contextSummary: '',
    };
  }
}

// Generate a conversational response when we need clarification or don't have research
async function generateConversationalResponse(
  query: string,
  context: {
    intent: string;
    topic: string;
    relatedTopics: string[];
    contextSummary: string;
    hasResearch: boolean;
    conversationHistory: ConversationMessage[];
  }
): Promise<string> {
  const historyContext = context.conversationHistory.length > 0
    ? `Recent conversation:\n${context.conversationHistory.slice(-4).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
    : '';

  const prompt = `You're a research assistant at Pfluger Architects chatting with someone exploring design ideas. Respond naturally and helpfully.

${historyContext}Their latest message: "${query}"

Context:
- They seem interested in: ${context.topic}
- ${context.contextSummary || 'No specific project context yet'}
- Our research covers: ${RESEARCH_TOPICS.join(', ')}
${context.relatedTopics.length > 0 ? `- Related topics we have: ${context.relatedTopics.join(', ')}` : ''}
${context.hasResearch ? '' : '- We don\'t have specific research on their exact question'}

Respond conversationally (1-3 sentences). ${context.hasResearch ? 'Help them clarify what they\'re looking for.' : 'Acknowledge their interest and gently steer toward topics we can help with, or offer general thoughts.'}`;

  return callClaude(prompt, 'haiku');
}

// Phase 1: Haiku relevance check
export async function checkRelevance(
  query: string,
  blocks: BlockMatch[]
): Promise<{ relevant: boolean; relevantBlockIds: string[]; reasoning: string }> {
  const blocksContext = blocks.map(b => ({
    id: b.id,
    block_type: b.block_type,
    summary: b.summary,
    conclusions: b.conclusions,
  }));

  console.log('Blocks sent to Haiku for relevance:', blocksContext.map(b => `${b.id} (${b.block_type}): ${b.summary?.slice(0, 50) || 'no summary'}`));

  const prompt = `You are a research relevance checker. Given a user question and research block summaries, determine which blocks are relevant.

User Question: "${query}"

Research Blocks:
${JSON.stringify(blocksContext, null, 2)}

Respond ONLY with valid JSON (no markdown, no explanation):
{"relevant": true, "relevantBlockIds": ["id1", "id2"], "reasoning": "Brief explanation"}

Only include blocks that directly help answer the question.`;

  const response = await callClaude(prompt, 'haiku');

  console.log('Haiku relevance response:', response);

  try {
    // Try to extract JSON from response (handle markdown code blocks)
    let jsonStr = response;

    // Remove markdown code blocks if present
    const jsonMatch = response.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    // Try to find JSON object in response
    const objectMatch = jsonStr.match(/\{[\s\S]*\}/);
    if (objectMatch) {
      jsonStr = objectMatch[0];
    }

    const parsed = JSON.parse(jsonStr);
    return {
      relevant: parsed.relevant ?? false,
      relevantBlockIds: parsed.relevantBlockIds ?? [],
      reasoning: parsed.reasoning ?? 'No reasoning provided'
    };
  } catch (e) {
    console.error('Failed to parse Haiku response:', e, response);
    // If parsing fails but we have blocks, assume they're relevant
    if (blocks.length > 0) {
      return {
        relevant: true,
        relevantBlockIds: blocks.slice(0, 3).map(b => b.id),
        reasoning: 'Fallback: assuming top results are relevant'
      };
    }
    return { relevant: false, relevantBlockIds: [], reasoning: 'Failed to parse response' };
  }
}

// Extract cited source numbers from response text
function extractCitedNumbers(text: string): number[] {
  const matches = text.matchAll(/\[(\d+(?:,\s*\d+)*)\]/g);
  const numbers = new Set<number>();
  for (const match of matches) {
    const nums = match[1].split(',').map(n => parseInt(n.trim(), 10));
    nums.forEach(n => numbers.add(n));
  }
  return Array.from(numbers).sort((a, b) => a - b);
}

// Phase 2: Sonnet synthesis
export async function synthesizeAnswer(
  query: string,
  blocks: BlockMatch[],
  sources: Source[],
  conversationHistory: ConversationMessage[] = []
): Promise<string> {
  const context = blocks.map(b => ({
    id: b.id,
    project_id: b.project_id,
    content: b.searchable_text,
    conclusions: b.conclusions,
    source_ids: b.source_ids,
  }));

  // Create source map using actual IDs (to match project page)
  const sourceMap = sources.map(s => ({
    id: s.id,
    citation: formatCitation(s)
  }));

  // Get unique project IDs from blocks
  const projectIds = [...new Set(blocks.map(b => b.project_id))];

  // Build conversation context
  const historyContext = conversationHistory.length > 0
    ? `Conversation so far:\n${conversationHistory.slice(-6).map(m => `${m.role}: ${m.content}`).join('\n')}\n\n`
    : '';

  const prompt = `You're chatting with someone exploring design research at Pfluger Architects. Be genuinely curious and helpful - like a knowledgeable colleague, not a search engine.

${historyContext}Their current question: "${query}"

VOICE:
- Natural, warm, curious
- Share what's interesting about what you found
- Make connections they might not have considered
- Reference earlier parts of the conversation if relevant

STRUCTURE (flexible, not rigid):
- Share one compelling insight from the research (cite using the source ID like [12], [13])
- Reference projects by their ID when mentioning them (e.g., "X25-RB01 explores..." or "In project X26-RB02...")
- Available projects: ${projectIds.join(', ')}
- Connect to what they've shared about their project/interests
- Keep it conversational - 2-4 sentences total

AVOID:
- Bullet points, headers, lists
- "Based on research..." or "According to..."
- Ignoring context from the conversation
- Sounding like a report

Research Content:
${JSON.stringify(context, null, 2)}

Available Sources (use these exact IDs when citing):
${sourceMap.map(s => `[${s.id}] ${s.citation}`).join('\n')}`;

  return callClaude(prompt, 'sonnet');
}

// Phase 3: Opus deep analysis (for complex queries)
export async function deepAnalysis(
  query: string,
  blocks: BlockMatch[],
  sources: Source[],
  previousAnswer: string
): Promise<string> {
  const sourcesContext = sources.map(s => `[${s.id}] ${s.author}. ${s.title}`).join('\n');

  const prompt = `You are a senior research analyst at Pfluger Architects. The user needs a deeper analysis of their question. Review the previous answer and provide additional insights, connections, or considerations.

User Question: "${query}"

Previous Answer: ${previousAnswer}

Full Research Context:
${blocks.map(b => b.searchable_text).join('\n\n')}

Available Sources:
${sourcesContext}

Provide deeper analysis, identify patterns, suggest implications for design practice, or note areas needing further research. Cite sources where applicable.`;

  return callClaude(prompt, 'opus');
}

// Expand section blocks to include their child content blocks
async function expandSectionBlocks(
  blocks: BlockMatch[]
): Promise<BlockMatch[]> {
  const expandedBlocks: BlockMatch[] = [];
  const seenIds = new Set<string>();

  for (const block of blocks) {
    // Skip if we've already added this block
    if (seenIds.has(block.id)) continue;

    // If it's a section block, fetch its child blocks
    if (block.block_type === 'section') {
      console.log(`Expanding section block: ${block.id}`);

      // Get all blocks for this project ordered by block_order
      const { data: allBlocks, error } = await supabase
        .from('project_blocks')
        .select('id, project_id, block_type, block_order, summary, conclusions, source_ids, searchable_text')
        .eq('project_id', block.project_id)
        .order('block_order', { ascending: true });

      if (error || !allBlocks) {
        console.error('Error fetching blocks for section expansion:', error);
        continue;
      }

      // Find the section's block_order
      const sectionBlock = allBlocks.find(b => b.id === block.id);
      if (!sectionBlock) continue;

      const sectionOrder = sectionBlock.block_order;

      // Find the next section's block_order (or end of list)
      const nextSection = allBlocks.find(
        b => b.block_type === 'section' && b.block_order > sectionOrder
      );
      const nextSectionOrder = nextSection?.block_order ?? Infinity;

      // Get all content blocks between this section and the next
      const childBlocks = allBlocks.filter(
        b => b.block_order > sectionOrder &&
             b.block_order < nextSectionOrder &&
             b.block_type !== 'section' &&
             b.block_type !== 'sources' // Exclude sources blocks from synthesis
      );

      console.log(`Found ${childBlocks.length} child blocks for section ${block.id}`);

      // Add child blocks (not the section itself)
      for (const child of childBlocks) {
        if (!seenIds.has(child.id)) {
          seenIds.add(child.id);
          expandedBlocks.push({
            ...child,
            conclusions: child.conclusions || [],
            source_ids: child.source_ids || [],
            relevance_rank: expandedBlocks.length + 1,
          });
        }
      }
    } else {
      // Not a section - add the block directly
      seenIds.add(block.id);
      expandedBlocks.push(block);
    }
  }

  return expandedBlocks;
}

// Main RAG function - smart routing approach
export async function queryRAG(
  query: string,
  projectId?: string,
  conversationHistory: ConversationMessage[] = []
): Promise<RAGResponse> {
  console.log('QueryRAG starting for:', query);

  // Step 1: Analyze intent with conversation context
  const intent = await analyzeIntent(query, conversationHistory);
  console.log('Intent analysis:', intent);

  // Route: Conversational - let model generate response
  if (intent.intent === 'conversational') {
    const answer = await generateConversationalResponse(query, {
      intent: intent.intent,
      topic: intent.topic,
      relatedTopics: intent.relatedTopics,
      contextSummary: intent.contextSummary,
      hasResearch: true,
      conversationHistory,
    });

    return {
      answer,
      sources: [],
      blocks_used: [],
      model_used: 'haiku',
    };
  }

  // Step 2: Search for relevant blocks (use searchTerms from intent)
  const searchQuery = intent.searchTerms.length > 0
    ? intent.searchTerms.join(' ')
    : query;
  const blocks = await searchBlocks(searchQuery, projectId);

  // Route: No blocks found - try web search or generate helpful response
  if (!blocks.length) {
    // Try web search for general knowledge
    const webResult = await webSearch(query, intent.contextSummary);

    if (webResult) {
      // Let model weave in what we do have
      const answer = await generateConversationalResponse(query, {
        intent: intent.intent,
        topic: intent.topic,
        relatedTopics: intent.relatedTopics,
        contextSummary: `${intent.contextSummary}. General info: ${webResult}`,
        hasResearch: false,
        conversationHistory,
      });

      return {
        answer,
        sources: [],
        blocks_used: [],
        model_used: 'haiku',
      };
    }

    // No web result either - generate helpful response
    const answer = await generateConversationalResponse(query, {
      intent: intent.intent,
      topic: intent.topic,
      relatedTopics: intent.relatedTopics,
      contextSummary: intent.contextSummary,
      hasResearch: false,
      conversationHistory,
    });

    return {
      answer,
      sources: [],
      blocks_used: [],
      model_used: 'haiku',
    };
  }

  // Step 3: Haiku checks relevance
  const relevanceCheck = await checkRelevance(query, blocks);

  if (!relevanceCheck.relevant || !relevanceCheck.relevantBlockIds.length) {
    // Blocks found but not relevant - ask for clarification
    const answer = await generateConversationalResponse(query, {
      intent: intent.intent,
      topic: intent.topic,
      relatedTopics: intent.relatedTopics,
      contextSummary: intent.contextSummary,
      hasResearch: true,
      conversationHistory,
    });

    return {
      answer,
      sources: [],
      blocks_used: [],
      model_used: 'haiku',
    };
  }

  // Filter to relevant blocks
  const relevantBlocks = blocks.filter(b => relevanceCheck.relevantBlockIds.includes(b.id));

  // Expand section blocks to include their child content blocks
  const expandedBlocks = await expandSectionBlocks(relevantBlocks);

  // Gather all source IDs
  const allSourceIds = [...new Set(expandedBlocks.flatMap(b => b.source_ids))];
  const projectIdForSources = projectId || expandedBlocks[0]?.project_id;
  const sources = await getSources(allSourceIds, projectIdForSources);

  // Step 4: Sonnet synthesizes answer
  const rawAnswer = await synthesizeAnswer(query, expandedBlocks, sources, conversationHistory);

  // Step 5: Extract cited source IDs from response (these are actual source IDs now)
  const citedIds = extractCitedNumbers(rawAnswer);

  // Filter to only sources that were actually cited
  const citedSources = sources.filter(s => citedIds.includes(s.id));

  return {
    answer: rawAnswer,
    sources: citedSources,
    blocks_used: expandedBlocks.map(b => b.id),
    model_used: 'sonnet',
  };
}

// Web search for general design questions
async function webSearch(query: string, context?: string): Promise<string> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const apiEndpoint = `${supabaseUrl}/functions/v1/web-search`;

  try {
    const response = await fetch(apiEndpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify({ query, context }),
    });

    if (!response.ok) {
      throw new Error(`Web search error: ${response.status}`);
    }

    const data = await response.json();
    return data.content || '';
  } catch (error) {
    console.error('Web search error:', error);
    return '';
  }
}

// Claude API call via Supabase Edge Function
async function callClaude(prompt: string, model: 'haiku' | 'sonnet' | 'opus'): Promise<string> {
  const modelMap = {
    haiku: 'claude-haiku-4-5-20251001',
    sonnet: 'claude-sonnet-4-5-20250929',
    opus: 'claude-opus-4-5-20251101',
  };

  // Supabase Edge Function endpoint
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
        model: modelMap[model],
        prompt,
        max_tokens: model === 'haiku' ? 500 : 2000,
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
    return 'Sorry, I encountered an error processing your request.';
  }
}
