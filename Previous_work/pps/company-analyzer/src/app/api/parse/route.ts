import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export async function POST(request: Request) {
  try {
    const { url } = await request.json();

    if (!url) {
      return NextResponse.json({ error: 'URL is required' }, { status: 400 });
    }

    try {
      new URL(url);
    } catch {
      return NextResponse.json({ error: 'Invalid URL format' }, { status: 400 });
    }

    const response = await fetch(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });

    if (!response.ok) {
      return NextResponse.json({ error: `Failed to fetch URL: ${response.statusText}` }, { status: response.status });
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // Remove scripts, styles, etc.
    $('script, style, noscript, iframe, link, meta').remove();
    
    let textContent = $('body').text();
    textContent = textContent.replace(/\s+/g, ' ').trim();

    // Limit text to a reasonable size for LLMs (e.g., first 10,000 characters)
    textContent = textContent.substring(0, 10000);
    const title = $('title').text();
    const description = $('meta[name="description"]').attr('content') || '';

    return NextResponse.json({ 
      data: {
        title,
        description,
        content: textContent,
        url
      } 
    });

  } catch (error: any) {
    console.error('Scraping error:', error);
    return NextResponse.json({ error: 'Internal server error while parsing the URL.' }, { status: 500 });
  }
}
