/**
 * Phonological Rule Editor - KaTeX Generator
 * Converts AST into clean, standard LaTeX / KaTeX math mode string.
 */

(function (window) {
  'use strict';

  function formatFeature(feat) {
    if (!feat) return '';
    feat = feat.trim();

    let prefix = '';
    let name = feat;

    if (feat.startsWith('±') || feat.startsWith('+/-')) {
      prefix = '\\pm ';
      name = feat.replace(/^[±\+\/\-]+/, '').trim();
    } else if (feat.startsWith('∓') || feat.startsWith('-/+')) {
      prefix = '\\mp ';
      name = feat.replace(/^[∓\-\/\+]+/, '').trim();
    } else if (feat.startsWith('+')) {
      prefix = '+ ';
      name = feat.slice(1).trim();
    } else if (feat.startsWith('-')) {
      prefix = '- ';
      name = feat.slice(1).trim();
    } else if (feat.startsWith('α') || feat.startsWith('\\alpha')) {
      prefix = '\\alpha ';
      name = feat.replace(/^(α|\\alpha)/, '').trim();
    } else if (feat.startsWith('β') || feat.startsWith('\\beta')) {
      prefix = '\\beta ';
      name = feat.replace(/^(β|\\beta)/, '').trim();
    } else if (feat.startsWith('γ') || feat.startsWith('\\gamma')) {
      prefix = '\\gamma ';
      name = feat.replace(/^(γ|\\gamma)/, '').trim();
    }

    // Escape LaTeX special chars in feature name if any
    name = name.replace(/([_%&#$])/g, '\\$1');

    return `${prefix}\\text{${name}}`;
  }

  function formatElementToLatex(el) {
    if (!el) return '';

    if (el.type === 'matrix') {
      if (!el.features || el.features.length === 0) {
        return '\\left[ \\; \\right]';
      }
      const rows = el.features.map(f => formatFeature(f)).join(' \\\\ \n    ');
      return `\\begin{bmatrix}\n    ${rows}\n  \\end{bmatrix}`;
    }

    if (el.type === 'symbol') {
      const val = el.value;
      if (val === '∅' || val === '0') return '\\varnothing';
      if (val === '#') return '\\#';
      if (val === '$') return '\\$';
      if (val === '~') return '\\sim';
      if (val === '*') return '^{\\ast}';
      return `\\text{${val}}`;
    }

    // Segment
    const seg = el.value || '';
    if (seg === '∅') return '\\varnothing';
    if (seg === '#') return '\\#';
    if (seg === '$') return '\\$';

    // Check if segment has leading asterisk for diachronic reconstruction (e.g. *p)
    if (seg.startsWith('*')) {
      const rest = seg.slice(1);
      return `\\ast\\text{${rest}}`;
    }

    // Check if segment has subscript (e.g. C_0)
    if (seg.includes('_')) {
      const parts = seg.split('_');
      return `\\text{${parts[0]}}_{${parts[1]}}`;
    }

    return `\\text{${seg}}`;
  }

  function generateKatex(ast, operatorOverride) {
    if (!ast) return '';

    const opType = operatorOverride || ast.operator || 'arrow';
    const operatorLatex = opType === 'greater' ? '\\mathrel{>}' : '\\longrightarrow';

    const targetLatex = (ast.target && ast.target.length > 0)
      ? ast.target.map(formatElementToLatex).join('\\;')
      : '\\underline{\\text{?}}';

    const changeLatex = (ast.change && ast.change.length > 0)
      ? ast.change.map(formatElementToLatex).join('\\;')
      : '\\underline{\\text{?}}';

    let ruleLatex = `${targetLatex} \\; ${operatorLatex} \\; ${changeLatex}`;

    const hasLeft = ast.contextLeft && ast.contextLeft.length > 0;
    const hasRight = ast.contextRight && ast.contextRight.length > 0;

    if (hasLeft || hasRight) {
      const leftLatex = hasLeft ? ast.contextLeft.map(formatElementToLatex).join('\\;') + '\\;' : '';
      const focusLatex = '\\underline{\\hspace{1.3em}}';
      const rightLatex = hasRight ? '\\;' + ast.contextRight.map(formatElementToLatex).join('\\;') : '';

      ruleLatex += ` \\;\\Big/\\; ${leftLatex}${focusLatex}${rightLatex}`;
    }

    return ruleLatex.trim();
  }

  window.PhonologyKatex = {
    generateKatex,
    formatFeature,
    formatElementToLatex
  };

})(window);
