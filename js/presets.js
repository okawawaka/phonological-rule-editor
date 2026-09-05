/**
 * Phonological Rule Editor - Presets
 * Standard phonological rules from synchronic and diachronic linguistics.
 */

(function (window) {
  'use strict';

  const PRESETS = [
    {
      id: 'vowel-nasalization',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '母音鼻音化 (Vowel Nasalization: 英語・仏語)',
      operator: 'arrow',
      text: '[+syllabic] -> [+nasal] / _ [+consonantal, +nasal]'
    },
    {
      id: 'final-devoicing',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '語末無声化 (Final Devoicing: 独・露語)',
      operator: 'arrow',
      text: '[-sonorant, +voice] -> [-voice] / _ #'
    },
    {
      id: 'flapping',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '英語 弾音化 (Flapping: writer / rider)',
      operator: 'arrow',
      text: 't -> ɾ / [+syllabic, +stress] _ [+syllabic, -stress]'
    },
    {
      id: 'nasal-assimilation',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '鼻音同化 (Nasal Place Assimilation: /np/ -> [mp])',
      operator: 'arrow',
      text: '[+nasal] -> [+coronal, +anterior] / _ [+coronal, +anterior]'
    },
    {
      id: 'palatalization',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '日本語 口蓋化 (Palatalization: /ti/ -> [tɕi])',
      operator: 'arrow',
      text: '[+coronal, -continuant] -> [+high, -anterior] / _ [+syllabic, +high, -back]'
    },
    {
      id: 'vowel-deletion',
      category: '共時的音韻規則 (Synchronic: →)',
      name: '母音脱落 (Syncope / Vowel Deletion)',
      operator: 'arrow',
      text: '[+syllabic, -stress] -> ∅ / [+consonantal] _ [+consonantal]'
    },
    {
      id: 'grimms-law',
      category: '通時的音変化 (Diachronic: >)',
      name: 'グリムの法則 (Grimm\'s Law: *p > f)',
      operator: 'greater',
      text: '*p > f / # _'
    },
    {
      id: 'intervocalic-voicing',
      category: '通時的音変化 (Diachronic: >)',
      name: '母音間有声化 (Intervocalic Voicing: *p > b)',
      operator: 'greater',
      text: '*p > b / V _ V'
    },
    {
      id: 'high-german-consonant-shift',
      category: '通時的音変化 (Diachronic: >)',
      name: '第二次子音推移 (High German Shift: *t > ts)',
      operator: 'greater',
      text: '*t > ts / # _'
    }
  ];

  window.PhonologyPresets = PRESETS;

})(window);
