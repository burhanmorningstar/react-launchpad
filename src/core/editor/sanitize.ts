/**
 * Lightweight and safe client-side HTML sanitizer using DOMParser.
 * Whitelists common formatting tags and safe attributes, removing script, iframe,
 * event handlers, and javascript: / data: / vbscript: URLs.
 */

const ALLOWED_TAGS = new Set([
  'p',
  'br',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'strike',
  'h1',
  'h2',
  'h3',
  'h4',
  'h5',
  'h6',
  'ul',
  'ol',
  'li',
  'blockquote',
  'code',
  'pre',
  'hr',
  'a',
  'span',
  'img',
])

const ALLOWED_ATTRS: Record<string, Set<string>> = {
  a: new Set(['href', 'title', 'target', 'rel']),
  img: new Set(['src', 'alt', 'title', 'width', 'height']),
}

const DISALLOWED_PROTOCOLS = ['javascript:', 'vbscript:', 'data:']

export function sanitizeHtml(html: string): string {
  if (!html) return ''

  if (typeof window === 'undefined' || typeof DOMParser === 'undefined') {
    return html.replace(/<[^>]*>?/gm, '')
  }

  const parser = new DOMParser()
  const doc = parser.parseFromString(html, 'text/html')

  function cleanNode(node: Node) {
    const children = Array.from(node.childNodes)
    for (const child of children) {
      if (child.nodeType === Node.ELEMENT_NODE) {
        const el = child as HTMLElement
        const tagName = el.tagName.toLowerCase()

        if (!ALLOWED_TAGS.has(tagName)) {
          // Remove disallowed elements completely
          el.remove()
          continue
        }

        // Remove dangerous attributes (on*, etc.)
        const allowed = ALLOWED_ATTRS[tagName] || new Set()
        const attrs = Array.from(el.attributes)
        for (const attr of attrs) {
          const attrName = attr.name.toLowerCase()
          if (attrName.startsWith('on') || !allowed.has(attrName)) {
            el.removeAttribute(attr.name)
            continue
          }

          // Check protocol for URLs
          if (attrName === 'href' || attrName === 'src') {
            const val = attr.value.trim().toLowerCase()
            if (DISALLOWED_PROTOCOLS.some((proto) => val.startsWith(proto))) {
              el.removeAttribute(attr.name)
            }
          }
        }

        cleanNode(el)
      } else if (
        child.nodeType !== Node.TEXT_NODE &&
        child.nodeType !== Node.COMMENT_NODE
      ) {
        child.remove()
      }
    }
  }

  cleanNode(doc.body)
  return doc.body.innerHTML
}
