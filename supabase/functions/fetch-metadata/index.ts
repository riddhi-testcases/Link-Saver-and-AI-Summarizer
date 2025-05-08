import { DOMParser } from "npm:linkedom@0.16.8";
import { corsHeaders } from '../_shared/cors.ts';

const TIMEOUT = 10000; // 10 seconds timeout
const PROXY_URL = "https://api.allorigins.win/raw?url=";
const MAX_RETRIES = 2;
const RETRY_DELAY = 1000; // 1 second between retries

async function fetchWithRetry(url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response;
  } catch (error) {
    if (retries > 0) {
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      return fetchWithRetry(url, options, retries - 1);
    }
    throw error;
  }
}

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

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), TIMEOUT);

    try {
      // Use the proxy service to fetch the URL
      const proxiedUrl = `${PROXY_URL}${encodeURIComponent(normalizedUrl)}`;
      const response = await fetchWithRetry(proxiedUrl, { 
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        }
      });
      clearTimeout(timeoutId);

      const html = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract title with fallbacks
      let title = doc.querySelector('meta[property="og:title"]')?.getAttribute('content') ||
                 doc.querySelector('meta[name="twitter:title"]')?.getAttribute('content') ||
                 doc.querySelector('title')?.textContent?.trim() ||
                 new URL(normalizedUrl).hostname;

      // Clean up title
      title = title
        .replace(/\s+/g, ' ')
        .trim();

      // Extract favicon with proper URL resolution
      let favicon = doc.querySelector('link[rel="icon"][href]')?.getAttribute('href') ||
                   doc.querySelector('link[rel="shortcut icon"][href]')?.getAttribute('href') ||
                   doc.querySelector('link[rel="apple-touch-icon"][href]')?.getAttribute('href') ||
                   new URL('/favicon.ico', new URL(normalizedUrl).origin).href;

      // Resolve relative favicon URLs
      try {
        favicon = new URL(favicon, new URL(normalizedUrl).origin).href;
      } catch (e) {
        favicon = new URL('/favicon.ico', new URL(normalizedUrl).origin).href;
      }

      return new Response(
        JSON.stringify({ title, favicon }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    } catch (error) {
      clearTimeout(timeoutId);
      throw new Error(`Failed to fetch metadata for ${normalizedUrl}: ${error.message}`);
    }
  } catch (error) {
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'The metadata service failed to process your URL. Please verify the URL is accessible and try again.'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});