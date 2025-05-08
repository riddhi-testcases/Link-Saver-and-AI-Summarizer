import { corsHeaders } from '../_shared/cors.ts';

const MAX_SUMMARY_LENGTH = 2000; // Maximum length for the summary
const MIN_PARAGRAPH_LENGTH = 50; // Minimum length for a paragraph to be considered valid

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and normalize the URL
    let normalizedUrl: string;
    try {
      const urlObj = new URL(url);
      normalizedUrl = urlObj.toString();
    } catch (e) {
      throw new Error('Invalid URL format');
    }

    // Properly encode the URL for Jina AI
    const encodedUrl = encodeURIComponent(normalizedUrl.trim());
    const jinaUrl = `https://r.jina.ai/${encodedUrl}`;
    
    const response = await fetch(jinaUrl);
    
    // Log response status and URL for debugging
    console.log(`Jina AI request status: ${response.status} for URL: ${normalizedUrl}`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Jina AI error:', errorText);
      
      return new Response(
        JSON.stringify({ 
          error: 'Unable to generate summary',
          details: `Service returned status ${response.status}`,
          fallback: true
        }),
        { 
          status: 200, // Send 200 to allow graceful degradation
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    let summary = await response.text();

    if (!summary || summary.trim().length === 0) {
      return new Response(
        JSON.stringify({ 
          error: 'No summary content received',
          fallback: true 
        }),
        { 
          status: 200,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
        }
      );
    }

    // Clean and format the summary
    summary = summary
      .trim()
      // Remove navigation prompts and accessibility text
      .replace(/Skip to (?:main |)content.*?[\n\.]/, '')
      .replace(/When autocomplete results are available.*?select\./g, '')
      .replace(/Touch device users,.*?gestures\./g, '')
      .replace(/Press Enter to search\./g, '')
      // Remove image tags and descriptions
      .replace(/!\[.*?\]\(.*?\)/g, '')
      .replace(/\[.*?\]\(.*?\)/g, '')
      // Remove common UI elements and boilerplate
      .replace(/(?:Log[- ]?in|Sign[- ]?up|Register|Subscribe)(?:\snow|\stoday)?/gi, '')
      .replace(/Accept (?:all |)cookies/gi, '')
      .replace(/We value your privacy/gi, '')
      .replace(/Stay up to date/gi, '')
      // Clean up markdown and HTML
      .replace(/[#*`]/g, '')
      .replace(/<[^>]+>/g, '')
      // Normalize whitespace
      .replace(/\r\n/g, '\n')
      .replace(/\n{3,}/g, '\n\n')
      .replace(/\s{2,}/g, ' ')
      // Format paragraphs and sections
      .split('\n\n')
      .map(paragraph => {
        // Skip short or unwanted paragraphs
        if (paragraph.length < MIN_PARAGRAPH_LENGTH) {
          return '';
        }

        // Identify and format section headings
        if (paragraph.length < 100 && /^[A-Z].*[.!?:]$/.test(paragraph)) {
          return `## ${paragraph}`;
        }

        // Clean up paragraphs
        return paragraph
          .trim()
          .replace(/([.!?])\s+/g, '$1\n')
          .split('\n')
          .filter(line => {
            // Filter out common unwanted elements
            const unwanted = [
              'cookie',
              'privacy policy',
              'terms of service',
              'newsletter',
              'subscribe',
              'advertisement',
              'sign up',
              'log in',
              'create account'
            ];
            return !unwanted.some(term => 
              line.toLowerCase().includes(term)
            );
          })
          .join('\n');
      })
      .filter(Boolean) // Remove empty paragraphs
      .join('\n\n')
      // Trim to max length while keeping whole sentences
      .split('.')
      .reduce((acc, sentence) => {
        if (!sentence.trim()) return acc;
        const nextPart = acc + (acc ? '.' : '') + sentence;
        if (nextPart.length <= MAX_SUMMARY_LENGTH) {
          return nextPart;
        }
        return acc;
      }, '')
      // Ensure proper ending
      .replace(/[^.!?]$/, '.');

    // Add ellipsis if truncated
    if (summary.length >= MAX_SUMMARY_LENGTH) {
      summary += '...';
    }

    return new Response(
      JSON.stringify({ summary }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Summary generation error:', error);
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to generate summary',
        details: error.message,
        fallback: true
      }),
      { 
        status: 200, // Send 200 to allow graceful degradation
        headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
      }
    );
  }
});