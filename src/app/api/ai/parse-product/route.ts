import { NextRequest, NextResponse } from 'next/server';
import https from 'https';
import http from 'http';
import * as cheerio from 'cheerio';
import { GeminiService } from '@/lib/ai/gemini-service';

// Fonction robuste de scraping avec contournement des erreurs de certificats intermédiaires
function fetchPageHtml(targetUrl: string): Promise<string> {
  return new Promise((resolve) => {
    try {
      const parsedUrl = new URL(targetUrl);
      const isHttps = parsedUrl.protocol === 'https:';
      const client = isHttps ? https : http;
      const agent = isHttps ? new https.Agent({ rejectUnauthorized: false }) : undefined;

      const req = client.get(
        targetUrl,
        {
          agent,
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
            'Accept-Language': 'fr-FR,fr;q=0.9,en-US;q=0.8,en;q=0.7,ru;q=0.6',
            Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
            Referer: 'https://www.google.com/'
          },
          timeout: 8000
        },
        (res) => {
          // Gestion des redirections (301, 302, 307)
          if (
            (res.statusCode === 301 || res.statusCode === 302 || res.statusCode === 307) &&
            res.headers.location
          ) {
            const redirectUrl = new URL(res.headers.location, targetUrl).href;
            fetchPageHtml(redirectUrl).then(resolve);
            return;
          }

          let data = '';
          res.setEncoding('utf8');
          res.on('data', (chunk) => {
            data += chunk;
            // Limiter à 500 Ko pour la vitesse
            if (data.length > 500000) {
              res.destroy();
              resolve(data);
            }
          });
          res.on('end', () => resolve(data));
          res.on('error', () => resolve(''));
        }
      );

      req.on('error', () => resolve(''));
      req.on('timeout', () => {
        req.destroy();
        resolve('');
      });
    } catch {
      resolve('');
    }
  });
}

export async function POST(req: NextRequest) {
  try {
    const { url, customApiKey } = await req.json();

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Une URL de produit valide est requise' },
        { status: 400 }
      );
    }

    let pageText = '';

    // 1. Récupération réelle du code HTML de la page
    const html = await fetchPageHtml(url);

    if (html && html.length > 200) {
      const $ = cheerio.load(html);

      // Suppression des balises non pertinentes
      $('script, style, noscript, nav, footer, svg, header').remove();

      const title = $('title').text() || $('h1').text();
      const metaDesc = $('meta[name="description"]').attr('content') || '';
      
      // Extraction ciblée du descriptif du vendeur (Plati, G2A, Z2U)
      const descContent = $('.goods-info-desc, .goods_desc, .content_goods, #goods_desc, .description, .product-description').text() || $('body').text();
      const cleanedDesc = descContent.replace(/\s+/g, ' ').trim();

      // Extraction du prix fournisseur réel depuis le texte ou les balises de devises
      let priceHint = '';
      const fullText = `${title} ${metaDesc} ${cleanedDesc.slice(0, 3000)}`;

      // Détection de roubles (₽ / RUB)
      const rubMatch = fullText.match(/([0-9]+[.,]?[0-9]*)\s*(?:₽|RUB|руб)/i);
      if (rubMatch) {
        const rubVal = parseFloat(rubMatch[1].replace(',', '.'));
        const eurVal = (rubVal * 0.0105).toFixed(2);
        priceHint = `Prix détecté : ${rubVal} RUB (~${eurVal} EUR)`;
      }

      // Détection de dollars ($ / USD)
      const usdMatch = fullText.match(/\$\s*([0-9]+[.,]?[0-9]*)|([0-9]+[.,]?[0-9]*)\s*USD/i);
      if (!priceHint && usdMatch) {
        const usdVal = parseFloat((usdMatch[1] || usdMatch[2]).replace(',', '.'));
        const eurVal = (usdVal * 0.95).toFixed(2);
        priceHint = `Prix détecté : ${usdVal} USD (~${eurVal} EUR)`;
      }

      // Détection d'euros (€ / EUR)
      const eurMatch = fullText.match(/([0-9]+[.,]?[0-9]*)\s*(?:€|EUR)/i);
      if (!priceHint && eurMatch) {
        const eurVal = parseFloat(eurMatch[1].replace(',', '.')).toFixed(2);
        priceHint = `Prix détecté : ${eurVal} EUR`;
      }

      pageText = `Titre exact de la page source: ${title}\nDescription meta: ${metaDesc}\n${priceHint}\nContenu du vendeur:\n${cleanedDesc.slice(0, 6000)}`;
    }

    // 2. Traitement par le moteur IA (Gemini ou parseur sémantique d'élite)
    const result = await GeminiService.parseProductPage(url, pageText, customApiKey);

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    console.error('Erreur API parse-product:', error);
    return NextResponse.json(
      { error: error?.message || 'Erreur lors de l\'analyse du produit par l\'IA' },
      { status: 500 }
    );
  }
}
