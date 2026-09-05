/**
 * Phonological Rule Editor - Parser & Serializer
 * Parses rule text into an AST and serializes AST back to rule text.
 */

(function (window) {
  'use strict';

  /**
   * Represents an element inside a slot.
   * Can be of type:
   * - 'matrix': features array, e.g. ['+voice', '-cont']
   * - 'segment': phonetic symbol string, e.g. 'k', 'tʃ', 'ɾ'
   * - 'symbol': boundary or null, e.g. '∅', '#', '$'
   */

  /**
   * Normalizes full-width Japanese characters (zenkaku) to standard half-width (hankaku)
   * so that users typing in Japanese IME do not suffer from input mismatches.
   */
  function normalizeZenkaku(str) {
    if (!str) return '';
    return str
      // Full-width brackets & punctuation
      .replace(/［/g, '[').replace(/］/g, ']')
      .replace(/【/g, '[').replace(/】/g, ']')
      .replace(/／/g, '/')
      .replace(/＿/g, '_')
      .replace(/＋/g, '+')
      .replace(/[ー−―–]/g, '-')
      .replace(/[，、]/g, ',')
      .replace(/＞/g, '>')
      .replace(/＜/g, '<')
      .replace(/：/g, ':')
      // Full-width latin letters (a-z, A-Z)
      .replace(/[Ａ-Ｚａ-ｚ]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      // Full-width numbers (0-9)
      .replace(/[０-９]/g, s => String.fromCharCode(s.charCodeAt(0) - 0xFEE0))
      // Full-width spaces
      .replace(/　/g, ' ');
  }

  function cleanFeature(feat) {
    if (!feat) return '';
    feat = normalizeZenkaku(feat).trim();
    // Normalize plus/minus
    if (feat.startsWith('+') || feat.startsWith('-') || feat.startsWith('±') || feat.startsWith('∓') || feat.startsWith('α') || feat.startsWith('β') || feat.startsWith('γ')) {
      return feat;
    }
    return '+' + feat;
  }

  function parseElements(str) {
    if (!str || !str.trim()) return [];
    str = normalizeZenkaku(str).trim();

    const elements = [];
    // Regex to match bracketed matrices [...], or individual tokens
    let pos = 0;

    while (pos < str.length) {
      // Skip whitespace
      while (pos < str.length && /\s/.test(str[pos])) {
        pos++;
      }
      if (pos >= str.length) break;

      if (str[pos] === '[') {
        // Find matching closing bracket
        const endBracket = str.indexOf(']', pos);
        if (endBracket !== -1) {
          const inner = str.slice(pos + 1, endBracket).trim();
          // Check if it's a matrix with +/- or features
          if (inner.includes('+') || inner.includes('-') || inner.includes('±') || inner.includes('α') || inner.includes('β')) {
            // Split by comma or whitespace or newline
            const rawFeatures = inner.split(/[,;\n\r]+|\s+(?=[+\-±∓αβ])/).map(f => f.trim()).filter(Boolean);
            const features = rawFeatures.map(cleanFeature);
            elements.push({
              type: 'matrix',
              features: features.length > 0 ? features : ['+feature']
            });
          } else {
            // It might be a phonetic transcript like [k]
            const val = inner.trim();
            if (val === '0' || val.toLowerCase() === 'null' || val.toLowerCase() === 'empty') {
              elements.push({ type: 'symbol', value: '∅' });
            } else {
              elements.push({ type: 'segment', value: val });
            }
          }
          pos = endBracket + 1;
          continue;
        }
      }

      // If it's a slash-enclosed phoneme /k/
      if (str[pos] === '/') {
        const nextSlash = str.indexOf('/', pos + 1);
        if (nextSlash !== -1) {
          const val = str.slice(pos + 1, nextSlash).trim();
          elements.push({ type: 'segment', value: val });
          pos = nextSlash + 1;
          continue;
        }
      }

      // Otherwise read token until next space or bracket
      let tokenEnd = pos;
      while (tokenEnd < str.length && !/\s/.test(str[tokenEnd]) && str[tokenEnd] !== '[' && str[tokenEnd] !== ']') {
        tokenEnd++;
      }
      let token = str.slice(pos, tokenEnd).trim();
      pos = tokenEnd;

      if (!token) continue;

      // Special symbols
      if (token === '0' || token.toLowerCase() === 'null' || token.toLowerCase() === 'empty' || token === '∅' || token === 'Ø') {
        elements.push({ type: 'symbol', value: '∅' });
      } else if (token === '#' || token === '$' || token === '+' || token === '~' || token === '*') {
        elements.push({ type: 'symbol', value: token });
      } else {
        elements.push({ type: 'segment', value: token });
      }
    }

    return elements;
  }

  function parseRule(ruleText) {
    const defaultAst = {
      operator: 'arrow', // 'arrow' (→) or 'greater' (>)
      target: [],
      change: [],
      contextLeft: [],
      contextRight: []
    };

    if (!ruleText || typeof ruleText !== 'string' || !ruleText.trim()) {
      return defaultAst;
    }

    let text = normalizeZenkaku(ruleText).trim();

    // 1. Separate environment if '/' exists
    let mainPart = text;
    let envPart = '';
    const slashIdx = text.indexOf('/');
    if (slashIdx !== -1) {
      mainPart = text.slice(0, slashIdx).trim();
      envPart = text.slice(slashIdx + 1).trim();
    }

    // 2. Identify Operator in mainPart
    let operator = 'arrow';
    let arrowMatch = null;

    // Check for > (greater) as operator: either surrounded by space or between tokens
    // Avoid confusing with diacritics
    const greaterRegex = /(^|\s|>|\])\s*>\s*([^\s\[]|\[|$)/;
    const arrowRegex = /(-->|->|→|\\longrightarrow|\\to|\bto\b)/;

    if (arrowRegex.test(mainPart)) {
      operator = 'arrow';
      arrowMatch = arrowRegex.exec(mainPart);
    } else if (mainPart.includes('>')) {
      operator = 'greater';
      arrowMatch = />/.exec(mainPart);
    }

    let targetStr = '';
    let changeStr = '';

    if (arrowMatch) {
      targetStr = mainPart.slice(0, arrowMatch.index).trim();
      changeStr = mainPart.slice(arrowMatch.index + arrowMatch[0].length).trim();
    } else {
      // Fallback: if no operator found, treat entire mainPart as target
      targetStr = mainPart;
    }

    // 3. Parse Context (envPart) around underline '_' or '__'
    let contextLeftStr = '';
    let contextRightStr = '';

    if (envPart) {
      const underIdx = envPart.search(/_+/);
      if (underIdx !== -1) {
        contextLeftStr = envPart.slice(0, underIdx).trim();
        const underMatch = envPart.match(/_+/);
        const underLen = underMatch ? underMatch[0].length : 1;
        contextRightStr = envPart.slice(underIdx + underLen).trim();
      } else {
        // No underline found, default to context right
        contextRightStr = envPart;
      }
    }

    return {
      operator: operator,
      target: parseElements(targetStr),
      change: parseElements(changeStr),
      contextLeft: parseElements(contextLeftStr),
      contextRight: parseElements(contextRightStr)
    };
  }

  function serializeElements(elements) {
    if (!elements || elements.length === 0) return '';
    return elements.map(el => {
      if (el.type === 'matrix') {
        return `[${el.features.join(', ')}]`;
      }
      return el.value;
    }).join(' ');
  }

  function serializeRule(ast, forcedOperator) {
    if (!ast) return '';
    const opType = forcedOperator || ast.operator || 'arrow';
    const opSymbol = opType === 'greater' ? '>' : '->';

    const target = serializeElements(ast.target);
    const change = serializeElements(ast.change);
    const left = serializeElements(ast.contextLeft);
    const right = serializeElements(ast.contextRight);

    let res = `${target || ''} ${opSymbol} ${change || ''}`.trim();

    if (left || right) {
      res += ` / ${left ? left + ' ' : ''}_${right ? ' ' + right : ''}`;
    }

    return res.trim();
  }

  window.PhonologyParser = {
    parseRule,
    serializeRule,
    parseElements,
    serializeElements,
    cleanFeature
  };

})(window);
