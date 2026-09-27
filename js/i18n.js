/**
 * Phonological Rule Editor - Multilingual Localization (i18n)
 * Full Japanese (ja) and English (en) dictionary.
 */

window.PhonologyI18n = {
  ja: {
    // Document Meta
    docTitle: "音韻規則・音変化エディタ — PHONOLOGICAL RULE EDITOR",
    appTitle: "音韻規則・音変化エディタ",
    appSubtitle: "PHONOLOGICAL RULE EDITOR",

    // Masthead & Utility
    helpBtn: "HELP [ ? ]",
    helpBtnTitle: "操作説明 [ ? ]",
    statusDefault: "素性や音素にカーソルを合わせると名称と解説が表示されます",

    // Toolbar - Controls
    labelPreset: "PRESET",
    presetCustom: "カスタム (新規作成)",
    labelOperator: "OPERATOR",
    opToggleAria: "記号切り替え (共時的規則 または 通時的音変化)",
    opArrowTitle: "共時的音韻規則 (→)",
    opGreaterTitle: "通時的音変化 (>)",

    // Toolbar - Export
    labelExport: "EXPORT",
    btnCopyPng: "PNG コピー",
    btnCopyPngTitle: "高解像度PNG画像をクリップボードにコピー",
    btnDownloadPng: "PNG 保存",
    btnDownloadPngTitle: "高解像度PNG画像をダウンロード",
    btnDownloadSvg: "SVG 保存",
    btnDownloadSvgTitle: "ベクターSVG画像をダウンロード",
    btnCopyKatex: "KaTeX コピー",
    btnCopyKatexTitle: "LaTeX / KaTeX コードをコピー",

    // Section 1: Bidirectional Text Notation
    sectionTextNotation: "TEXT NOTATION (BIDIRECTIONAL)",
    secTextNotationSub: "リアルタイム双方向同期",
    badgeRealtimeSync: "リアルタイム双方向同期",
    syntaxGuidePill: "例: <code>[+syl] -> [+nas] / _ [+nas]</code> または <code>*p > f / # _</code>",
    btnToggleKatex: "KaTeX コード表示",
    inputPlaceholder: "音韻規則を入力 (例: [+syl] -> [+nas] / _ [+nas] または *p > f / # _)",
    drawerKatexTag: "GENERATED KATEX / LATEX CODE",
    btnCopyKatexInline: "COPY CODE",

    // Section 2: Preview
    sectionPreview: "PREVIEW (LIVE)",
    secPreviewSub: "リアルタイム組版レンダリング",
    fontSerif: "明朝",
    fontSerifTitle: "明朝体 / ローマン (論文・組版向け)",
    fontSans: "ゴシック",
    fontSansTitle: "ゴシック体 / サンセリフ (スライド・画面表示向け)",
    fontToggleAria: "フォント切り替え (明朝 または ゴシック)",
    zoomOutTitle: "縮小",
    zoomResetTitle: "リセット",
    zoomInTitle: "拡大",

    // Section 2: Rule Slots
    sectionRuleSlots: "RULE SLOTS (ACTIVE: <span id=\"active-slot-name\">A</span>)",
    secRuleSlotsSub: "構造化GUIビルダークリック編集",
    slotsHelpBadge: "直接タイピング または 下のパレットで入力",
    slotTargetTitle: "標的音 (Target)",
    slotChangeTitle: "変化後 (Change)",
    slotContextLeftTitle: "先行環境 (Left Context)",
    slotContextRightTitle: "後続環境 (Right Context)",
    slotUnderlineTitle: "標的音の生起位置 (環境下線)",
    slotOperatorTitle: "クリックで矢印 (→) と音変化 (>) を切り替え",
    addMatrixTitle: "素性行列 [ ± ] を追加",
    clearSlotTitle: "クリア",
    slotInputPlaceholder: "音素 (p, *p等)",
    removeFeatureTitle: "素性を削除",
    chipInsertTitle: "クリックして {val} を挿入",

    // Section 3: Palette
    sectionPalette: "QUICK PALETTE (CLICK TO INSERT INTO ACTIVE SLOT)",
    secPaletteSub: "記号・素性クイック挿入",
    paletteHint: "ワンクリックで選択中のスロットへ即座に挿入されます",

    groupCustomFeature: "カスタム素性作成",
    customFeaturePlaceholder: "任意の素性名を入力 (例: fortis, slack vc, CG)",
    btnAddCustomFeature: "+ 素性を追加",

    groupPhonemes: "よく使う音素",
    groupSymbols: "記号・境界",
    symNullTitle: "脱落 (Null / ゼロ)",
    symWordBoundaryTitle: "語境界 (Word Boundary)",
    symSyllableBoundaryTitle: "音節境界 (Syllable Boundary)",
    symReconstructedTitle: "再建記号 (Reconstructed)",
    symConsonantTitle: "任意の子音",
    symVowelTitle: "任意の母音",
    symFlapTitle: "弾音 (Flap)",
    symGlottalStopTitle: "声門閉鎖音",
    symPalatalizedTitle: "口蓋化記号",
    symLongTitle: "長音記号",

    groupMajorClass: "主要クラス素性",
    groupLaryngeal: "喉頭素性",
    groupManner: "調音様式素性",
    groupCoronal: "舌頂音 (Coronal)",
    groupDorsalVowel: "舌背・母音素性",
    groupLabial: "唇音 (Labial)",
    groupProsodic: "超分節・韻律素性",

    // Presets
    presetCatSynchronic: "共時的音韻規則 (Synchronic: →)",
    presetCatDiachronic: "通時的音変化 (Diachronic: >)",
    presetVowelNasalization: "母音鼻音化 (Vowel Nasalization: 英語・仏語)",
    presetFinalDevoicing: "語末無声化 (Final Devoicing: 独・露語)",
    presetFlapping: "英語 弾音化 (Flapping: writer / rider)",
    presetNasalAssimilation: "鼻音同化 (Nasal Place Assimilation: /np/ -> [mp])",
    presetPalatalization: "日本語 口蓋化 (Palatalization: /ti/ -> [tɕi])",
    presetVowelDeletion: "母音脱落 (Syncope / Vowel Deletion)",
    presetGrimmsLaw: "グリムの法則 (Grimm's Law: *p > f)",
    presetIntervocalicVoicing: "母音間有声化 (Intervocalic Voicing: *p > b)",
    presetHighGermanShift: "第二次子音推移 (High German Shift: *t > ts)",

    // Toasts
    toastLoadedPreset: "読込: ",
    toastAddedCustomFeature: "カスタム素性「{name}」を追加しました",
    toastKatexCopied: "KaTeXコードをコピーしました！",
    toastPngCopied: "PNG画像 ({font}) をクリップボードにコピーしました！",
    toastPngDownloaded: "高解像度PNG ({font}) をダウンロードしました！",
    toastPngFallback: "ブラウザ制限のためPNG画像をダウンロード保存しました",
    toastPngFailed: "画像コピーに失敗しました",
    toastSvgDownloaded: "ベクターSVG ({font}) をダウンロードしました！",
    toastSvgFailed: "SVG出力に失敗しました",
    toastNoCode: "コピーするコードがありません",
    fontNameSerif: "明朝",
    fontNameSans: "ゴシック",

    // Modal
    modalTitle: "操作説明 (OPERATING INSTRUCTIONS)",
    modalCloseAria: "閉じる",
    modalShortcutsTitle: "ショートカット (SHORTCUTS)",
    modalShortcut1: "<kbd>?</kbd> または <kbd>Shift</kbd> + <kbd>/</kbd> : 操作説明画面を開閉します。",
    modalShortcut2: "<kbd>Esc</kbd> : 操作説明画面を閉じます。",
    modalNotationTitle: "記法 (NOTATION)",
    modalNotation1: "<strong>音変化</strong>：<code>A -&gt; B / C _ D</code>（共時的規則）",
    modalNotation2: "<strong>通時的変化</strong>：<code>A &gt; B / C _ D</code>（再建形: <code>*p &gt; b</code>）",
    modalNotation3: "<strong>素性行列</strong>：<code>[+voice, -cont]</code>（カンマまたは空白区切り）",
    modalNotation4: "<strong>音素・記号</strong>：<code>k</code>, <code>p</code>, <code>∅</code>（脱落/0）, <code>#</code>（語境界）, <code>$</code>（音節境界）",
    modalNotation5: "<strong>環境省略</strong>：文脈自由規則は <code>/</code> 以降を省略（例: <code>A -&gt; B</code>）",
    modalControlsTitle: "操作方法 (CONTROLS)",
    modalControl1: "<strong>スロット編集</strong>：スロットをクリックして音素を直接入力、または下のパレットから素性を追加。",
    modalControl2: "<strong>記号切り替え</strong>：ヘッダーまたはスロット間の記号をクリックして <code>→</code> と <code>&gt;</code> を切り替え。",
    modalControl3: "<strong>フォント切り替え</strong>：プレビュー枠の「明朝 / ゴシック」で出力フォントを変更。",
    modalControl4: "<strong>カスタム素性</strong>：パレットの入力欄から任意の素性名を追加。",
    modalControl5: "<strong>エクスポート</strong>：",
    modalExportPngCopy: "<code>PNG コピー</code>：クリップボードに画像を格納。",
    modalExportPngSave: "<code>PNG / SVG</code>：高解像度画像ファイルを保存。",
    modalExportKatex: "<code>KaTeX コピー</code>：LaTeX数式コードを格納。",
    modalRepoTitle: "ソースコード & リポジトリ (REPOSITORY)"
  },

  en: {
    // Document Meta
    docTitle: "PHONOLOGICAL RULE EDITOR",
    appTitle: "PHONOLOGICAL RULE EDITOR",
    appSubtitle: "SYNCHRONIC RULES & DIACHRONIC SOUND CHANGE",

    // Masthead & Utility
    helpBtn: "HELP [ ? ]",
    helpBtnTitle: "Help & Instructions [ ? ]",
    statusDefault: "Hover over features or phonemes to see details and notation guide",

    // Toolbar - Controls
    labelPreset: "PRESET",
    presetCustom: "Custom (New Rule)",
    labelOperator: "OPERATOR",
    opToggleAria: "Operator toggle (Synchronic rule or Diachronic sound change)",
    opArrowTitle: "Synchronic Phonological Rule (→)",
    opGreaterTitle: "Diachronic Sound Change (>)",

    // Toolbar - Export
    labelExport: "EXPORT",
    btnCopyPng: "COPY PNG",
    btnCopyPngTitle: "Copy high-resolution PNG image to clipboard",
    btnDownloadPng: "SAVE PNG",
    btnDownloadPngTitle: "Download high-resolution PNG image",
    btnDownloadSvg: "SAVE SVG",
    btnDownloadSvgTitle: "Download vector SVG image",
    btnCopyKatex: "COPY KATEX",
    btnCopyKatexTitle: "Copy LaTeX / KaTeX math code",

    // Section 1: Bidirectional Text Notation
    sectionTextNotation: "TEXT NOTATION (BIDIRECTIONAL)",
    secTextNotationSub: "REAL-TIME BI-DIRECTIONAL SYNC",
    badgeRealtimeSync: "Real-time Bi-directional Sync",
    syntaxGuidePill: "e.g.: <code>[+syl] -> [+nas] / _ [+nas]</code> or <code>*p > f / # _</code>",
    btnToggleKatex: "View KaTeX Code",
    inputPlaceholder: "Enter rule (e.g., [+syl] -> [+nas] / _ [+nas] or *p > f / # _)",
    drawerKatexTag: "GENERATED KATEX / LATEX CODE",
    btnCopyKatexInline: "COPY CODE",

    // Section 2: Preview
    sectionPreview: "PREVIEW (LIVE)",
    secPreviewSub: "LIVE KATEX RENDERING",
    fontSerif: "Serif",
    fontSerifTitle: "Serif / Roman (Papers & Print)",
    fontSans: "Sans",
    fontSansTitle: "Sans-Serif / Gothic (Slides & Display)",
    fontToggleAria: "Font style toggle (Serif or Sans)",
    zoomOutTitle: "Zoom Out",
    zoomResetTitle: "Reset Zoom",
    zoomInTitle: "Zoom In",

    // Section 2: Rule Slots
    sectionRuleSlots: "RULE SLOTS (ACTIVE: <span id=\"active-slot-name\">A</span>)",
    secRuleSlotsSub: "STRUCTURED GUI BUILDER",
    slotsHelpBadge: "Type directly or click palette below",
    slotTargetTitle: "Target (A)",
    slotChangeTitle: "Output / Change (B)",
    slotContextLeftTitle: "Left Context (C)",
    slotContextRightTitle: "Right Context (D)",
    slotUnderlineTitle: "Target sound position (focus underline)",
    slotOperatorTitle: "Click to toggle arrow (→) and sound change (>)",
    addMatrixTitle: "Add feature matrix [ ± ]",
    clearSlotTitle: "Clear slot",
    slotInputPlaceholder: "Phoneme (e.g. p, *p)",
    removeFeatureTitle: "Remove feature",
    chipInsertTitle: "Click to insert {val}",

    // Section 3: Palette
    sectionPalette: "QUICK PALETTE (CLICK TO INSERT INTO ACTIVE SLOT)",
    secPaletteSub: "FAST SYMBOL & FEATURE INSERTER",
    paletteHint: "Clicking inserts immediately into active slot",

    groupCustomFeature: "Custom Features",
    customFeaturePlaceholder: "Enter feature name (e.g., fortis, slack vc, CG)",
    btnAddCustomFeature: "+ Add Feature",

    groupPhonemes: "Common Phonemes",
    groupSymbols: "Symbols & Boundaries",
    symNullTitle: "Deletion (Null / Zero)",
    symWordBoundaryTitle: "Word Boundary (#)",
    symSyllableBoundaryTitle: "Syllable Boundary ($)",
    symReconstructedTitle: "Reconstructed (*)",
    symConsonantTitle: "Any Consonant (C)",
    symVowelTitle: "Any Vowel (V)",
    symFlapTitle: "Alveolar Flap (ɾ)",
    symGlottalStopTitle: "Glottal Stop (ʔ)",
    symPalatalizedTitle: "Palatalized Diacritic (ʲ)",
    symLongTitle: "Length Mark (ː)",

    groupMajorClass: "Major Class",
    groupLaryngeal: "Laryngeal",
    groupManner: "Manner",
    groupCoronal: "Coronal",
    groupDorsalVowel: "Dorsal & Vowel",
    groupLabial: "Labial",
    groupProsodic: "Prosodic",

    // Presets
    presetCatSynchronic: "Synchronic Rules (→)",
    presetCatDiachronic: "Diachronic Sound Changes (>)",
    presetVowelNasalization: "Vowel Nasalization (English / French)",
    presetFinalDevoicing: "Final Devoicing (German / Russian)",
    presetFlapping: "Flapping (English: writer / rider)",
    presetNasalAssimilation: "Nasal Place Assimilation (/np/ -> [mp])",
    presetPalatalization: "Palatalization (Japanese: /ti/ -> [tɕi])",
    presetVowelDeletion: "Vowel Deletion / Syncope",
    presetGrimmsLaw: "Grimm's Law (*p > f)",
    presetIntervocalicVoicing: "Intervocalic Voicing (*p > b)",
    presetHighGermanShift: "High German Consonant Shift (*t > ts)",

    // Toasts
    toastLoadedPreset: "Loaded: ",
    toastAddedCustomFeature: "Added custom feature \"{name}\"",
    toastKatexCopied: "KaTeX code copied to clipboard!",
    toastPngCopied: "PNG image ({font}) copied to clipboard!",
    toastPngDownloaded: "High-resolution PNG ({font}) downloaded!",
    toastPngFallback: "Saved PNG as file download due to browser clipboard limits",
    toastPngFailed: "Failed to copy image",
    toastSvgDownloaded: "Vector SVG ({font}) downloaded!",
    toastSvgFailed: "Failed to export SVG",
    toastNoCode: "No code to copy",
    fontNameSerif: "Serif",
    fontNameSans: "Sans-Serif",

    // Modal
    modalTitle: "OPERATING INSTRUCTIONS",
    modalCloseAria: "Close modal",
    modalShortcutsTitle: "KEYBOARD SHORTCUTS",
    modalShortcut1: "<kbd>?</kbd> or <kbd>Shift</kbd> + <kbd>/</kbd> : Open / close instructions modal.",
    modalShortcut2: "<kbd>Esc</kbd> : Close modal.",
    modalNotationTitle: "NOTATION RULES",
    modalNotation1: "<strong>Sound Rule</strong>: <code>A -&gt; B / C _ D</code> (Synchronic phonological rule)",
    modalNotation2: "<strong>Sound Change</strong>: <code>A &gt; B / C _ D</code> (Diachronic change, e.g. <code>*p &gt; b</code>)",
    modalNotation3: "<strong>Feature Matrix</strong>: <code>[+voice, -cont]</code> (comma- or space-separated)",
    modalNotation4: "<strong>Symbols</strong>: <code>k</code>, <code>p</code>, <code>∅</code> (deletion/null), <code>#</code> (word boundary), <code>$</code> (syllable boundary)",
    modalNotation5: "<strong>Context-Free</strong>: Omit <code>/</code> and environment for context-free rules (e.g. <code>A -&gt; B</code>)",
    modalControlsTitle: "CONTROLS & SHORTCUTS",
    modalControl1: "<strong>Slot Editing</strong>: Click any slot to type directly or click buttons in the palette below.",
    modalControl2: "<strong>Operator Switch</strong>: Click the operator in the header or between slots to switch between <code>→</code> and <code>&gt;</code>.",
    modalControl3: "<strong>Font Switch</strong>: Use Serif / Sans toggle in the preview pane to change the export font.",
    modalControl4: "<strong>Custom Features</strong>: Add any custom distinctive feature in the palette input box.",
    modalControl5: "<strong>Export Options</strong>:",
    modalExportPngCopy: "<code>COPY PNG</code>: Copy high-resolution image to clipboard.",
    modalExportPngSave: "<code>SAVE PNG / SVG</code>: Download high-resolution image files.",
    modalExportKatex: "<code>COPY KATEX</code>: Copy LaTeX math equation code.",
    modalRepoTitle: "REPOSITORY & SOURCE CODE"
  }
};
