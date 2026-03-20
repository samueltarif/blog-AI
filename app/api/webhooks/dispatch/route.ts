import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { post, integrations } = await req.json();

    if (!post || !integrations || !Array.isArray(integrations)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    const results = await Promise.allSettled(
      integrations.map(async (integration) => {
        if (!integration.url || !integration.isActive) return null;
        
        try {
          const response = await fetch(integration.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'User-Agent': 'AI-Studio-CMS-Webhook/1.0',
            },
            body: JSON.stringify({
              event: 'post.published',
              post: {
                id: post.id,
                title: post.title,
                excerpt: post.excerpt,
                body: post.body,
                coverImageUrl: post.coverImageUrl,
                publishedAt: post.publishedAt,
                authorId: post.authorId,
              }
            }),
          });
          
          return {
            integrationId: integration.id,
            name: integration.name,
            status: response.status,
            success: response.ok,
          };
        } catch (error: any) {
          return {
            integrationId: integration.id,
            name: integration.name,
            error: error.message,
            success: false,
          };
        }
      })
    );

    return NextResponse.json({ success: true, results });
  } catch (error: any) {
    console.error('Webhook dispatch error:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
