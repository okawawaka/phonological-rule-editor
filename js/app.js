/**
 * Phonological Rule Editor - Main Application Controller
 * Manages state, bi-directional sync, font style (Serif / Sans), custom features, and exports.
 */

(function () {
  'use strict';

  class PhonologyApp {
    constructor() {
      // Application State
      this.currentAst = {
        operator: 'arrow', // 'arrow' (→) or 'greater' (>)
        target: [],
        change: [],
        contextLeft: [],
        contextRight: []
      };

      this.activeSlot = 'target'; // 'target' | 'change' | 'contextLeft' | 'contextRight'
      this.operatorMode = 'arrow';
      this.fontStyle = 'serif'; // 'serif' (明朝/LaTeXローマン) or 'sans' (ゴシック/サンセリフ)
      this.zoomLevel = 1.0;
      this.toastTimeout = null;
      this.isComposing = false; // IME composition tracker
      this.customFeaturePrefix = '+';
      this.customFeatures = []; // User-created custom features

      // DOM Elements
      this.katexDisplay = document.getElementById('katex-display');
      this.rawInput = document.getElementById('raw-notation-input');
      this.katexOutput = document.getElementById('katex-code-output');
      this.katexDrawer = document.getElementById('katex-drawer');
      this.presetSelect = document.getElementById('preset-select');
      this.operatorDisplay = document.getElementById('operator-display');
      this.operatorToggle = document.getElementById('operator-toggle');
      this.fontToggle = document.getElementById('font-toggle');
      this.toast = document.getElementById('toast');
      this.activeSlotNameLabel = document.getElementById('active-slot-name');

      // Custom feature maker elements
      this.customValToggle = document.getElementById('custom-val-toggle');
      this.customFeatureInput = document.getElementById('custom-feature-input');
      this.btnAddCustomFeature = document.getElementById('btn-add-custom-feature');
      this.chipsCustomContainer = document.getElementById('chips-custom');

      // Help modal elements
      this.helpModal = document.getElementById('help-modal');
      this.btnShowHelp = document.getElementById('btn-show-help');
      this.btnCloseHelp = document.getElementById('btn-close-help');

      this.slots = {
        target: document.getElementById('slot-target'),
        change: document.getElementById('slot-change'),
        contextLeft: document.getElementById('slot-contextLeft'),
        contextRight: document.getElementById('slot-contextRight')
      };

      this.slotBodies = {
        target: document.getElementById('slot-body-target'),
        change: document.getElementById('slot-body-change'),
        contextLeft: document.getElementById('slot-body-contextLeft'),
        contextRight: document.getElementById('slot-body-contextRight')
      };

      this.init();
    }

    init() {
      this.populatePresets();
      this.setupEventListeners();
      this.loadSavedState();
      this.renderCustomFeatureChips();
    }

    populatePresets() {
      if (!window.PhonologyPresets || !this.presetSelect) return;

      const categories = {};
      window.PhonologyPresets.forEach(preset => {
        if (!categories[preset.category]) {
          categories[preset.category] = [];
        }
        categories[preset.category].push(preset);
      });

      Object.keys(categories).forEach(cat => {
        const group = document.createElement('optgroup');
        group.label = cat;
        categories[cat].forEach(p => {
          const opt = document.createElement('option');
          opt.value = p.id;
          opt.textContent = p.name;
          group.appendChild(opt);
        });
        this.presetSelect.appendChild(group);
      });
    }

    setupEventListeners() {
      // 1. Slot selection & focus
      Object.keys(this.slots).forEach(slotKey => {
        const el = this.slots[slotKey];
        if (!el) return;

        el.addEventListener('click', (e) => {
          if (e.target.closest('.mini-btn')) return;
          this.setActiveSlot(slotKey);
          const input = el.querySelector('.slot-direct-input');
          if (input && e.target !== input) {
            input.focus();
          }
        });

        // Add matrix button [ ± ]
        const addMatrixBtn = el.querySelector('.add-matrix-btn');
        if (addMatrixBtn) {
          addMatrixBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setActiveSlot(slotKey);
            this.addMatrixToSlot(slotKey);
          });
        }

        // Clear slot button (×)
        const clearBtn = el.querySelector('.clear-slot-btn');
        if (clearBtn) {
          clearBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.setActiveSlot(slotKey);
            this.clearSlot(slotKey);
          });
        }
      });

      // 2. Operator toggle (Toolbar buttons: → vs >)
      this.operatorToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const op = btn.getAttribute('data-op');
          this.setOperatorMode(op);
        });
      });

      // 3. Middle operator symbol click
      this.operatorDisplay?.addEventListener('click', () => {
        const nextOp = this.operatorMode === 'arrow' ? 'greater' : 'arrow';
        this.setOperatorMode(nextOp);
      });

      // 4. Font Style toggle (Serif / 明朝 vs Sans / ゴシック)
      this.fontToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          const font = btn.getAttribute('data-font');
          this.setFontStyle(font);
        });
      });

      // 5. Raw Notation Input (Bi-directional text editing with full IME support)
      let debounceTimer = null;
      if (this.rawInput) {
        this.rawInput.addEventListener('compositionstart', () => {
          this.isComposing = true;
        });

        this.rawInput.addEventListener('compositionend', (e) => {
          this.isComposing = false;
          this.parseFromText(e.target.value, false);
        });

        this.rawInput.addEventListener('input', (e) => {
          if (this.isComposing) return;
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            this.parseFromText(e.target.value, false);
          }, 80);
        });
      }

      // 6. Toggle KaTeX Drawer
      document.getElementById('btn-toggle-katex-code')?.addEventListener('click', () => {
        if (this.katexDrawer) {
          this.katexDrawer.classList.toggle('open');
        }
      });

      // 7. Preset selection
      this.presetSelect?.addEventListener('change', (e) => {
        const presetId = e.target.value;
        if (!presetId) return;

        const preset = window.PhonologyPresets.find(p => p.id === presetId);
        if (preset) {
          if (preset.operator) {
            this.operatorMode = preset.operator;
          }
          this.parseFromText(preset.text, true);
          this.showToast(`読込: ${preset.name}`);
        }
      });

      // 8. Custom Feature Creator Widget
      this.customValToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.addEventListener('click', () => {
          this.customValToggle.querySelectorAll('.toggle-btn').forEach(b => b.classList.remove('active'));
          btn.classList.add('active');
          this.customFeaturePrefix = btn.getAttribute('data-val') || '+';
        });
      });

      const handleAddCustomFeature = () => {
        if (!this.customFeatureInput) return;
        const rawName = this.customFeatureInput.value.trim();
        if (!rawName) return;

        // Clean feature name (remove leading +/- if user typed it)
        const cleanName = rawName.replace(/^[+\-±∓]/, '').trim();
        if (!cleanName) return;

        const fullFeature = `${this.customFeaturePrefix}${cleanName}`;
        this.insertPaletteItem(fullFeature, true);

        // Save to user custom features list if not already present
        if (!this.customFeatures.includes(fullFeature)) {
          this.customFeatures.push(fullFeature);
          this.saveCustomFeatures();
          this.renderCustomFeatureChips();
        }

        this.customFeatureInput.value = '';
        this.showToast(`カスタム素性「${fullFeature}」を追加しました`);
      };

      this.btnAddCustomFeature?.addEventListener('click', handleAddCustomFeature);
      this.customFeatureInput?.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          e.preventDefault();
          handleAddCustomFeature();
        }
      });

      // 9. Quick Palette Insertion (Chips: Phonemes, Symbols, Features)
      document.querySelectorAll('.chip').forEach(chip => {
        chip.addEventListener('click', () => {
          const val = chip.getAttribute('data-insert');
          const isFeature = chip.classList.contains('chip-feature') || chip.classList.contains('chip-custom');
          this.insertPaletteItem(val, isFeature);
        });
      });

      // 10. Zoom buttons
      document.getElementById('btn-zoom-in')?.addEventListener('click', () => this.adjustZoom(0.15));
      document.getElementById('btn-zoom-out')?.addEventListener('click', () => this.adjustZoom(-0.15));
      document.getElementById('btn-zoom-reset')?.addEventListener('click', () => this.adjustZoom(0, true));

      // 11. Export Actions
      document.getElementById('btn-copy-katex')?.addEventListener('click', () => this.copyKatex());
      document.getElementById('btn-copy-katex-inline')?.addEventListener('click', () => this.copyKatex());
      document.getElementById('btn-download-png')?.addEventListener('click', () => this.exportPng());
      document.getElementById('btn-copy-png')?.addEventListener('click', () => this.copyPng());
      document.getElementById('btn-download-svg')?.addEventListener('click', () => this.exportSvg());

      // 12. Help Modal & Keyboard Shortcut [ ? ]
      this.btnShowHelp?.addEventListener('click', () => this.toggleHelp());
      this.btnCloseHelp?.addEventListener('click', () => this.closeHelp());
      this.helpModal?.addEventListener('click', (e) => {
        if (e.target === this.helpModal) this.closeHelp();
      });

      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
          if (this.helpModal && this.helpModal.classList.contains('open')) {
            this.closeHelp();
            return;
          }
        }

        const activeEl = document.activeElement;
        const isInputActive = activeEl && (activeEl.tagName === 'INPUT' || activeEl.tagName === 'TEXTAREA');

        if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
          if (!isInputActive) {
            e.preventDefault();
            this.toggleHelp();
          }
        }
      });
    }

    openHelp() {
      if (this.helpModal) this.helpModal.classList.add('open');
    }

    closeHelp() {
      if (this.helpModal) this.helpModal.classList.remove('open');
    }

    toggleHelp() {
      if (this.helpModal) this.helpModal.classList.toggle('open');
    }

    setActiveSlot(slotKey) {
      this.activeSlot = slotKey;
      Object.keys(this.slots).forEach(k => {
        if (this.slots[k]) {
          this.slots[k].classList.toggle('active', k === slotKey);
        }
      });

      const slotLabels = {
        target: 'A',
        change: 'B',
        contextLeft: 'C',
        contextRight: 'D'
      };

      if (this.activeSlotNameLabel) {
        this.activeSlotNameLabel.textContent = slotLabels[slotKey] || slotKey;
      }
    }

    setOperatorMode(op) {
      if (op !== 'arrow' && op !== 'greater') return;
      this.operatorMode = op;
      this.currentAst.operator = op;

      this.operatorToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-op') === op);
      });

      if (this.operatorDisplay) {
        const symbolSpan = this.operatorDisplay.querySelector('.operator-symbol');
        if (symbolSpan) {
          symbolSpan.textContent = op === 'greater' ? '>' : '→';
        }
      }

      this.syncAndRender(true);
      this.showToast(op === 'greater' ? '通時的音変化 (>) に切り替えました' : '共時的規則 (→) に切り替えました');
    }

    setFontStyle(font) {
      if (font !== 'serif' && font !== 'sans') return;
      this.fontStyle = font;

      this.fontToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
        btn.classList.toggle('active', btn.getAttribute('data-font') === font);
      });

      if (this.katexDisplay) {
        this.katexDisplay.classList.toggle('font-sans', font === 'sans');
        this.katexDisplay.classList.toggle('font-serif', font === 'serif');
      }

      this.saveState();
      this.showToast(font === 'serif' ? 'フォント: 明朝体 / ローマン (Serif) に設定' : 'フォント: ゴシック体 / サンセリフ (Sans) に設定');
    }

    insertPaletteItem(val, isFeature) {
      const slotList = this.currentAst[this.activeSlot];
      if (!slotList) return;

      if (isFeature) {
        let matrix = slotList.find(el => el.type === 'matrix');
        if (!matrix) {
          matrix = { type: 'matrix', features: [] };
          slotList.push(matrix);
        }
        const featBase = val.replace(/^[+\-±∓]/, '');
        const existingIdx = matrix.features.findIndex(f => f.replace(/^[+\-±∓]/, '') === featBase);
        if (existingIdx !== -1) {
          matrix.features[existingIdx] = val;
        } else {
          matrix.features.push(val);
        }
      } else {
        if (val === '∅' || val === '#' || val === '$') {
          slotList.push({ type: 'symbol', value: val });
        } else {
          const seg = slotList.find(el => el.type === 'segment');
          if (seg) {
            seg.value += val;
          } else {
            slotList.push({ type: 'segment', value: val });
          }
        }
      }

      this.syncAndRender(true);
    }

    renderCustomFeatureChips() {
      if (!this.chipsCustomContainer) return;
      this.chipsCustomContainer.innerHTML = '';

      this.customFeatures.forEach(feat => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = 'chip chip-custom';
        chip.setAttribute('data-insert', feat);
        chip.textContent = feat;
        chip.title = `クリックして ${feat} を挿入`;
        chip.addEventListener('click', () => {
          this.insertPaletteItem(feat, true);
        });
        this.chipsCustomContainer.appendChild(chip);
      });
    }

    addMatrixToSlot(slotKey) {
      const slotList = this.currentAst[slotKey];
      if (!slotList) return;

      const hasMatrix = slotList.some(el => el.type === 'matrix');
      if (!hasMatrix) {
        slotList.push({ type: 'matrix', features: ['+syllabic'] });
        this.syncAndRender(true);
      }
    }

    clearSlot(slotKey) {
      if (this.currentAst[slotKey]) {
        this.currentAst[slotKey] = [];
        this.syncAndRender(true);
      }
    }

    removeFeatureFromMatrix(slotKey, matrixIdx, featIdx) {
      const slotList = this.currentAst[slotKey];
      if (!slotList) return;

      const matrices = slotList.filter(el => el.type === 'matrix');
      const matrix = matrices[matrixIdx];
      if (matrix && matrix.features) {
        matrix.features.splice(featIdx, 1);
        if (matrix.features.length === 0) {
          const overallIdx = slotList.indexOf(matrix);
          if (overallIdx !== -1) {
            slotList.splice(overallIdx, 1);
          }
        }
        this.syncAndRender(true);
      }
    }

    parseFromText(text, updateTextInput = false) {
      if (!window.PhonologyParser) return;

      const ast = window.PhonologyParser.parseRule(text);
      if (ast.operator) {
        this.operatorMode = ast.operator;
        this.operatorToggle?.querySelectorAll('.toggle-btn').forEach(btn => {
          btn.classList.toggle('active', btn.getAttribute('data-op') === ast.operator);
        });
        if (this.operatorDisplay) {
          const sym = this.operatorDisplay.querySelector('.operator-symbol');
          if (sym) sym.textContent = ast.operator === 'greater' ? '>' : '→';
        }
      }

      this.currentAst = ast;
      this.syncAndRender(updateTextInput);
    }

    syncAndRender(updateTextInput = true) {
      // 1. Render KaTeX
      const katexCode = window.PhonologyKatex.generateKatex(this.currentAst, this.operatorMode);
      if (this.katexOutput) {
        this.katexOutput.value = katexCode;
      }

      if (this.katexDisplay && window.katex) {
        try {
          window.katex.render(katexCode, this.katexDisplay, {
            displayMode: true,
            throwOnError: false
          });
        } catch (e) {
          console.warn('KaTeX rendering error', e);
        }
      }

      // 2. Sync to raw text input if requested (and not actively composing IME)
      if (updateTextInput && this.rawInput && !this.isComposing && window.PhonologyParser) {
        const serialized = window.PhonologyParser.serializeRule(this.currentAst, this.operatorMode);
        this.rawInput.value = serialized;
      }

      // 3. Render GUI Slots
      this.renderSlotsGUI();

      // 4. Save state
      this.saveState();
    }

    renderSlotsGUI() {
      Object.keys(this.slotBodies).forEach(slotKey => {
        const bodyEl = this.slotBodies[slotKey];
        if (!bodyEl) return;

        bodyEl.innerHTML = '';
        const elements = this.currentAst[slotKey] || [];

        // 1. Render existing matrices
        let matrixCount = 0;
        elements.forEach((el) => {
          if (el.type === 'matrix') {
            const mIdx = matrixCount++;
            const matrixBox = document.createElement('div');
            matrixBox.className = 'slot-matrix-box';

            el.features.forEach((feat, fIdx) => {
              const row = document.createElement('div');
              row.className = 'matrix-feature-row';

              const nameSpan = document.createElement('span');
              nameSpan.className = 'matrix-feature-name';
              nameSpan.textContent = feat;

              const delBtn = document.createElement('span');
              delBtn.className = 'matrix-feature-del';
              delBtn.textContent = '×';
              delBtn.title = '素性を削除';
              delBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.removeFeatureFromMatrix(slotKey, mIdx, fIdx);
              });

              row.appendChild(nameSpan);
              row.appendChild(delBtn);
              matrixBox.appendChild(row);
            });

            bodyEl.appendChild(matrixBox);
          }
        });

        // 2. Direct Input for Segment / Phonemes (supports *p, ɾ, ∅, etc.)
        const segEl = elements.find(el => el.type === 'segment' || el.type === 'symbol');
        const input = document.createElement('input');
        input.type = 'text';
        input.className = 'slot-direct-input';
        input.placeholder = '音素 (p, *p等)';
        input.value = segEl ? segEl.value : '';
        input.spellcheck = false;

        let inputComposing = false;
        input.addEventListener('compositionstart', () => { inputComposing = true; });
        input.addEventListener('compositionend', (e) => {
          inputComposing = false;
          this.handleDirectSlotInput(slotKey, e.target.value);
        });
        input.addEventListener('input', (e) => {
          if (inputComposing) return;
          this.handleDirectSlotInput(slotKey, e.target.value);
        });

        bodyEl.appendChild(input);
      });
    }

    handleDirectSlotInput(slotKey, val) {
      const slotList = this.currentAst[slotKey];
      if (!slotList) return;

      const trimmed = val.trim();
      const segIdx = slotList.findIndex(el => el.type === 'segment' || el.type === 'symbol');

      if (!trimmed) {
        if (segIdx !== -1) {
          slotList.splice(segIdx, 1);
        }
      } else {
        const type = (trimmed === '∅' || trimmed === '#' || trimmed === '$') ? 'symbol' : 'segment';
        if (segIdx !== -1) {
          slotList[segIdx].type = type;
          slotList[segIdx].value = trimmed;
        } else {
          slotList.push({ type, value: trimmed });
        }
      }

      this.syncAndRender(true);
    }

    adjustZoom(delta, reset = false) {
      if (reset) {
        this.zoomLevel = 1.0;
      } else {
        this.zoomLevel = Math.max(0.5, Math.min(2.5, this.zoomLevel + delta));
      }

      if (this.katexDisplay) {
        this.katexDisplay.style.transform = `scale(${this.zoomLevel})`;
      }

      const resetBtn = document.getElementById('btn-zoom-reset');
      if (resetBtn) {
        resetBtn.textContent = `${Math.round(this.zoomLevel * 100)}%`;
      }
    }

    async copyKatex() {
      const code = this.katexOutput ? this.katexOutput.value : '';
      if (!code) {
        this.showToast('コピーするコードがありません');
        return;
      }
      try {
        await window.PhonologyExporter.copyKatexCode(code);
        this.showToast('KaTeXコードをコピーしました！');
      } catch (err) {
        console.error('KaTeX copy error', err);
        this.showToast('KaTeXコードのコピーに失敗しました');
      }
    }

    async exportPng() {
      try {
        await window.PhonologyExporter.downloadPng(this.currentAst, this.operatorMode, 'phonological-rule.png', {
          fontStyle: this.fontStyle
        });
        this.showToast(`高解像度PNG (${this.fontStyle === 'serif' ? '明朝' : 'ゴシック'}) をダウンロードしました！`);
      } catch (err) {
        console.error('PNG export error', err);
        this.showToast('PNGダウンロードに失敗しました');
      }
    }

    async copyPng() {
      try {
        await window.PhonologyExporter.copyPngToClipboard(this.currentAst, this.operatorMode, {
          fontStyle: this.fontStyle
        });
        this.showToast(`PNG画像 (${this.fontStyle === 'serif' ? '明朝' : 'ゴシック'}) をクリップボードにコピーしました！`);
      } catch (err) {
        console.warn('Direct image clipboard copy failed, falling back to download...', err);
        try {
          await this.exportPng();
          this.showToast('ブラウザ制限のためPNG画像をダウンロード保存しました');
        } catch (e) {
          this.showToast('画像コピーに失敗しました');
        }
      }
    }

    async exportSvg() {
      try {
        await window.PhonologyExporter.downloadSvg(this.currentAst, this.operatorMode, 'phonological-rule.svg', {
          fontStyle: this.fontStyle
        });
        this.showToast(`ベクターSVG (${this.fontStyle === 'serif' ? '明朝' : 'ゴシック'}) をダウンロードしました！`);
      } catch (err) {
        console.error('SVG export error', err);
        this.showToast('SVG出力に失敗しました');
      }
    }

    showToast(msg) {
      if (!this.toast) return;
      this.toast.textContent = msg;
      this.toast.classList.add('show');
      clearTimeout(this.toastTimeout);
      this.toastTimeout = setTimeout(() => {
        this.toast.classList.remove('show');
      }, 2500);
    }

    saveCustomFeatures() {
      try {
        localStorage.setItem('phonology_custom_features', JSON.stringify(this.customFeatures));
      } catch (e) {
        console.warn('Custom feature save failed', e);
      }
    }

    saveState() {
      try {
        const state = {
          ruleText: this.rawInput ? this.rawInput.value : '',
          operator: this.operatorMode,
          fontStyle: this.fontStyle
        };
        localStorage.setItem('phonology_editor_state', JSON.stringify(state));
      } catch (e) {
        console.warn('Storage save failed', e);
      }
    }

    loadSavedState() {
      try {
        // Load custom features
        const customFeats = localStorage.getItem('phonology_custom_features');
        if (customFeats) {
          this.customFeatures = JSON.parse(customFeats) || [];
        }

        // Load editor state
        const saved = localStorage.getItem('phonology_editor_state');
        if (saved) {
          const state = JSON.parse(saved);
          if (state.operator) {
            this.operatorMode = state.operator;
          }
          if (state.fontStyle) {
            this.setFontStyle(state.fontStyle);
          }
          if (state.ruleText) {
            this.parseFromText(state.ruleText, true);
            return;
          }
        }
      } catch (e) {
        console.warn('Storage load failed', e);
      }

      // Default initial rule
      const defaultRule = '[+syllabic] -> [+nasal] / _ [+consonantal, +nasal]';
      this.parseFromText(defaultRule, true);
    }
  }

  // Initialize on DOM load
  document.addEventListener('DOMContentLoaded', () => {
    window.app = new PhonologyApp();
  });

})();
