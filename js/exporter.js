/**
 * Phonological Rule Editor - Exporter
 * Handles:
 * 1. KaTeX LaTeX code copying
 * 2. High-resolution PNG generation & clipboard copy (via Pure SVG -> Canvas)
 * 3. Vector SVG export (Pure SVG)
 */

(function (window) {
  'use strict';

  /**
   * Renders the rule to an HTML5 Canvas with 2x Retina resolution
   */
  async function renderToCanvas(ast, operatorMode, scale = 2, options = {}) {
    if (!window.SvgRuleRenderer) {
      throw new Error('SvgRuleRenderer not loaded');
    }

    const { svg, width, height } = window.SvgRuleRenderer.render(ast, operatorMode, options);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(blob);

    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.ceil(width * scale);
          canvas.height = Math.ceil(height * scale);
          const ctx = canvas.getContext('2d');

          // Pure white background
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);

          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          URL.revokeObjectURL(url);
          resolve(canvas);
        } catch (err) {
          URL.revokeObjectURL(url);
          reject(err);
        }
      };
      img.onerror = (err) => {
        URL.revokeObjectURL(url);
        reject(new Error('Failed to load SVG into image: ' + err));
      };
      img.src = url;
    });
  }

  /**
   * Triggers a browser file download
   */
  function triggerDownload(blob, filename) {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }

  /**
   * Download high-resolution PNG
   */
  async function downloadPng(ast, operatorMode, filename = 'phonological-rule.png', options = {}) {
    const canvas = await renderToCanvas(ast, operatorMode, 2, options);
    canvas.toBlob((blob) => {
      if (blob) {
        triggerDownload(blob, filename);
      } else {
        throw new Error('Failed to create PNG blob');
      }
    }, 'image/png');
  }

  /**
   * Download vector SVG
   */
  async function downloadSvg(ast, operatorMode, filename = 'phonological-rule.svg', options = {}) {
    if (!window.SvgRuleRenderer) return;
    const { svg } = window.SvgRuleRenderer.render(ast, operatorMode, options);
    const blob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerDownload(blob, filename);
  }

  /**
   * Copy PNG image directly to clipboard
   */
  async function copyPngToClipboard(ast, operatorMode, options = {}) {
    if (!navigator.clipboard || !navigator.clipboard.write) {
      throw new Error('お使いのブラウザはクリップボード画像書き込みに対応していません');
    }

    const canvas = await renderToCanvas(ast, operatorMode, 2, options);

    return new Promise((resolve, reject) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          reject(new Error('Failed to create PNG blob'));
          return;
        }
        try {
          const item = new ClipboardItem({ 'image/png': blob });
          await navigator.clipboard.write([item]);
          resolve(true);
        } catch (err) {
          reject(err);
        }
      }, 'image/png');
    });
  }

  /**
   * Copy KaTeX string to clipboard
   */
  async function copyKatexCode(code) {
    if (!code) return false;
    if (navigator.clipboard && navigator.clipboard.writeText) {
      await navigator.clipboard.writeText(code);
      return true;
    }
    const ta = document.createElement('textarea');
    ta.value = code;
    document.body.appendChild(ta);
    ta.select();
    document.execCommand('copy');
    document.body.removeChild(ta);
    return true;
  }

  window.PhonologyExporter = {
    downloadPng,
    downloadSvg,
    copyPngToClipboard,
    copyKatexCode
  };

})(window);
