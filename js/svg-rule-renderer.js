/**
 * Phonological Rule Editor - Pure SVG Rule Renderer
 * Renders AST directly into pure SVG elements (<text>, <path>, <line>, <rect>).
 * Supports:
 * - Font style switching: Serif (明朝体・TeXローマン) vs Sans-serif (ゴシック体)
 * - Diachronic reconstructed forms with asterisk (*p)
 * - Zero canvas tainting in Chrome / Edge / Safari (reliable PNG & clipboard export)
 */

(function (window) {
  'use strict';

  const SERIF_FONT = "'KaTeX_Main', 'Times New Roman', 'Cambria', 'Hiragino Mincho ProN', 'Yu Mincho', serif";
  const SANS_FONT = "Inter, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', 'Hiragino Sans', sans-serif";

  const SERIF_MONO = "'KaTeX_Main', 'Times New Roman', serif";
  const SANS_MONO = "'JetBrains Mono', 'Menlo', 'Consolas', monospace";

  function escapeXml(unsafe) {
    return String(unsafe)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  class SvgRuleRenderer {
    /**
     * Measures and renders an AST into a clean, standalone SVG string.
     */
    static render(ast, operatorOverride = 'arrow', options = {}) {
      const op = operatorOverride || ast.operator || 'arrow';
      const opSymbol = op === 'greater' ? '>' : '→';

      const isSerif = options.fontStyle === 'serif';
      const fontFamily = isSerif ? SERIF_FONT : SANS_FONT;
      const fontMono = isSerif ? SERIF_MONO : SANS_MONO;

      const fontSize = options.fontSize || 28;
      const featureFontSize = Math.round(fontSize * 0.60); // ~17px
      const paddingX = 42;
      const paddingY = 32;

      // Measurement factors
      const charWidth = fontSize * (isSerif ? 0.55 : 0.58);
      const featCharWidth = featureFontSize * (isSerif ? 0.55 : 0.58);
      const rowHeight = featureFontSize * 1.45;

      function measureElement(el) {
        if (!el) return { width: 0, height: fontSize };
        if (el.type === 'matrix') {
          const feats = el.features || [];
          let maxLen = 4;
          feats.forEach(f => {
            if (f.length > maxLen) maxLen = f.length;
          });
          const contentW = maxLen * featCharWidth;
          const w = contentW + 20; // bracket margins
          const h = Math.max(feats.length * rowHeight + 12, fontSize + 8);
          return { type: 'matrix', width: w, height: h, features: feats, contentW };
        }
        // Segment or Symbol
        const text = el.value || '';
        const w = Math.max(text.length * charWidth, 18);
        return { type: 'segment', width: w, height: fontSize, value: text };
      }

      function measureGroup(elements) {
        if (!elements || elements.length === 0) return { items: [], totalWidth: 0, maxHeight: fontSize };
        const items = elements.map(measureElement);
        let totalW = 0;
        let maxH = fontSize;
        items.forEach((item, idx) => {
          totalW += item.width;
          if (idx > 0) totalW += 8;
          if (item.height > maxH) maxH = item.height;
        });
        return { items, totalWidth: totalW, maxHeight: maxH };
      }

      const targetGroup = measureGroup(ast.target);
      const changeGroup = measureGroup(ast.change);
      const leftGroup = measureGroup(ast.contextLeft);
      const rightGroup = measureGroup(ast.contextRight);

      const opWidth = fontSize * 1.3;
      const slashWidth = fontSize * 0.8;
      const underlineWidth = fontSize * 1.25;
      const spacing = 16;

      const hasEnv = (ast.contextLeft && ast.contextLeft.length > 0) || (ast.contextRight && ast.contextRight.length > 0);

      let totalContentWidth = targetGroup.totalWidth + spacing + opWidth + spacing + changeGroup.totalWidth;
      if (hasEnv) {
        totalContentWidth += spacing * 1.5 + slashWidth + spacing * 1.5;
        if (leftGroup.totalWidth > 0) totalContentWidth += leftGroup.totalWidth + spacing;
        totalContentWidth += underlineWidth;
        if (rightGroup.totalWidth > 0) totalContentWidth += spacing + rightGroup.totalWidth;
      }

      const maxContentHeight = Math.max(
        targetGroup.maxHeight,
        changeGroup.maxHeight,
        leftGroup.maxHeight,
        rightGroup.maxHeight,
        fontSize + 12
      );

      const width = Math.ceil(totalContentWidth + paddingX * 2);
      const height = Math.ceil(maxContentHeight + paddingY * 2);
      const baselineY = Math.round(paddingY + maxContentHeight / 2);

      let svgParts = [];
      svgParts.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`);
      svgParts.push(`<defs><style>
        .rule-text { font-family: ${fontFamily}; font-size: ${fontSize}px; fill: #111111; font-weight: ${isSerif ? 'normal' : '500'}; dominant-baseline: central; }
        .rule-operator { font-family: ${fontFamily}; font-size: ${Math.round(fontSize * 1.1)}px; fill: #111111; font-weight: 700; dominant-baseline: central; text-anchor: middle; }
        .rule-slash { font-family: ${fontFamily}; font-size: ${Math.round(fontSize * 1.25)}px; fill: #666666; font-weight: 300; dominant-baseline: central; text-anchor: middle; }
        .rule-feature { font-family: ${fontMono}; font-size: ${featureFontSize}px; fill: #111111; font-weight: ${isSerif ? 'normal' : '500'}; dominant-baseline: central; }
        .rule-bracket { stroke: #111111; stroke-width: 1.8; fill: none; stroke-linecap: square; }
        .rule-underline { stroke: #111111; stroke-width: 2.2; stroke-linecap: round; }
      </style></defs>`);
      svgParts.push(`<rect width="100%" height="100%" fill="#ffffff" />`);

      let curX = paddingX;

      function renderGroup(group) {
        group.items.forEach((item, idx) => {
          if (idx > 0) curX += 8;

          if (item.type === 'matrix') {
            const mHeight = item.height;
            const topY = baselineY - mHeight / 2;
            const botY = baselineY + mHeight / 2;
            const tickW = 5;

            // Left bracket [
            svgParts.push(`<path class="rule-bracket" d="M ${curX + tickW} ${topY} L ${curX} ${topY} L ${curX} ${botY} L ${curX + tickW} ${botY}" />`);
            // Right bracket ]
            const rx = curX + item.width;
            svgParts.push(`<path class="rule-bracket" d="M ${rx - tickW} ${topY} L ${rx} ${topY} L ${rx} ${botY} L ${rx - tickW} ${botY}" />`);

            // Rows of features
            const startY = topY + 7 + rowHeight / 2;
            item.features.forEach((feat, fIdx) => {
              const fy = startY + fIdx * rowHeight;
              svgParts.push(`<text class="rule-feature" x="${curX + 9}" y="${fy}">${escapeXml(feat)}</text>`);
            });

            curX += item.width;
          } else {
            // Segment (supports *p, ɾ, ∅, etc.)
            svgParts.push(`<text class="rule-text" x="${curX + item.width / 2}" y="${baselineY}" text-anchor="middle">${escapeXml(item.value)}</text>`);
            curX += item.width;
          }
        });
      }

      // Render Target
      renderGroup(targetGroup);
      curX += spacing;

      // Render Operator (→ or >)
      svgParts.push(`<text class="rule-operator" x="${curX + opWidth / 2}" y="${baselineY}">${escapeXml(opSymbol)}</text>`);
      curX += opWidth + spacing;

      // Render Change
      renderGroup(changeGroup);

      // Render Environment if any
      if (hasEnv) {
        curX += spacing * 1.5;
        // Slash /
        svgParts.push(`<text class="rule-slash" x="${curX + slashWidth / 2}" y="${baselineY}">/</text>`);
        curX += slashWidth + spacing * 1.5;

        // Left context
        if (leftGroup.totalWidth > 0) {
          renderGroup(leftGroup);
          curX += spacing;
        }

        // Underline __
        const lineY = baselineY + fontSize * 0.35;
        svgParts.push(`<line class="rule-underline" x1="${curX}" y1="${lineY}" x2="${curX + underlineWidth}" y2="${lineY}" />`);
        curX += underlineWidth;

        // Right context
        if (rightGroup.totalWidth > 0) {
          curX += spacing;
          renderGroup(rightGroup);
        }
      }

      svgParts.push('</svg>');
      return {
        svg: svgParts.join('\n'),
        width,
        height
      };
    }
  }

  window.SvgRuleRenderer = SvgRuleRenderer;

})(window);
