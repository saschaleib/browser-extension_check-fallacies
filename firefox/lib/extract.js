// extract.js: injected on demand after lib/Readability.js.
// The value of the last expression (the IIFE below) is what
// scripting.executeScript returns to the caller.
//
// Wrapped in an IIFE on purpose: top-level const/let would throw
// "already declared" when the script is injected a second time into the same page.
(() => {
  const MIN_ARTICLE_CHARS = 500;   // below this, Readability's result is probably wrong
  const MAX_FALLBACK_CHARS = 200000;

  const BLOCK = new Set([
    'P', 'DIV', 'SECTION', 'ARTICLE', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'PRE',
    'TABLE', 'TR', 'FIGURE', 'FIGCAPTION', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6',
  ]);

  // Turn Readability's cleaned HTML into plain text that keeps paragraph breaks,
  // headings ("## ...") and list items ("- ..."). Much better LLM input than textContent.
	function htmlToText(html) {
		//console.info("htmlToText", html);
    const root = new DOMParser().parseFromString(html, 'text/html').body;
    const out = [];
    let buf = '';
    let pending = '';   // prefix for the next non-empty block ("## ", "- ")

    const flush = () => {
      const t = buf.replace(/\s+/g, ' ').trim();
      if (t) {
        out.push(pending + t);
        pending = '';
      }
      buf = '';
    };

    const walk = (node) => {
      for (const child of node.childNodes) {
        if (child.nodeType === Node.TEXT_NODE) {
          buf += child.nodeValue;
        } else if (child.nodeType === Node.ELEMENT_NODE) {
          const tag = child.tagName;
          if (tag === 'BR') { buf += ' '; continue; }
          if (BLOCK.has(tag)) {
            flush();
            if (/^H[1-6]$/.test(tag)) pending = '#'.repeat(Number(tag[1])) + ' ';
            else if (tag === 'LI') pending = '- ';
            walk(child);
            flush();
            pending = '';
          } else {
            walk(child);
          }
        }
      }
    };

    walk(root);
		flush();
		//console.log(out);
    return out.join('\n\n');
  }

  const meta = {
    url: location.href,
    title: document.title,
    lang: document.documentElement.lang || null,
  };

  // 1. An explicit user selection always wins.
  const selection = String(getSelection() || '').trim();
  if (selection) {
    return { ...meta, source: 'selection', text: selection, length: selection.length };
  }

  // 2. Readability. It mutates the DOM it is given, so always hand it a clone.

	try {
		const article = new Readability(document.cloneNode(true)).parse();
    if (article && article.content) {
      const text = htmlToText(article.content);

     	if (text.length >= MIN_ARTICLE_CHARS) {
        return {
          ...meta,
          source: 'readability',
          title: article.title || meta.title,
          byline: article.byline || null,
          siteName: article.siteName || null,
          lang: article.lang || meta.lang,
          text,
          length: text.length,
        };
      }
    }
  } catch (err) {
    console.warn('Readability failed, using fallback:', err);
  }

  // 3. Last resort: everything visible on the page. Let the UI warn the user.
  const text = document.body.innerText.trim().slice(0, MAX_FALLBACK_CHARS);
  return { ...meta, source: 'fallback', text, length: text.length };
})();