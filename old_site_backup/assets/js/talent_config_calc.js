import { talentConfigs } from './talents_config.js';
import { talentConfigsFull } from './talents_config_full.js';

// Priority sequences for manual point distribution (Low HP)
const diffSequencesLow = {
   80: [10, 12, 24, 24, 24, 24, 32, 32, 32, 32],
   90: [4, 12, 12, 12, 12, 52, 52, 52, 52, 52],
   100: [15, 15, 15, 15, 29, 57, 62, 62, 62, 62],
   110: [39, 39, 39, 39, 40, 40, 50, 50, 50, 50],
   120: [2, 2, 2, 2, 10, 10, 10, 10, 33, 40],
   130: [11, 11, 11, 11, 33, 33, 33, 33, 56, 56],
   140: [5, 5, 5, 5, 16, 17, 20, 29, 29, 29],
   150: [16, 16, 16, 16, 38, 38, 38, 38, 42, 42],
   160: [6, 20, 20, 20, 20, 20, 56, 56, 60, 60],
   170: [4, 4, 4, 4, 41, 41, 41, 41, 41, 57],
   180: [6, 6, 6, 6, 21, 21, 40, 40, 40, 40, 40, 42, 42, 42, 42, 42, 45, 45, 45, 45],
   190: [0, 0, 9, 30, 31, 48, 55, 55, 55, 63]
};

// Priority sequences for manual point distribution (Full HP)
// These define what to ADD to the base config to get to the next points.
// Since we generated the Full HP configs by *removing* points from the level above using the Low HP removal pattern,
// the "Growth" pattern (Full HP 80 -> 90) should be the REVERSE of the removal steps we found?
// Actually, `generate_full_hp.py` used `seqs[lvl]` to REMOVE points from `lvl`.
// So `seqs[190]` was used to go 200 -> 190.
// This means `diffSequencesFull[190]` (growth from 190 -> 200) should be EXACTLY `seqs[190]`.
// Yes. The Low HP logic was: 190 base + `diffSeq[190]` = 200.
// We assumed Full HP 200 - `diffSeq[190]` = Full HP 190.
// Thus Full HP 190 + `diffSeq[190]` = Full HP 200.
// So the sequences are identical!
// The "procedure" for manual calc is the same, using the same sequences, because the delta is the same.
const diffSequencesFull = diffSequencesLow;

/**
 * Generates a talent configuration for a specific point amount.
 * @param {number} points Target total points (80-200)
 * @param {boolean} isFullHpMode Whether we are in Full HP mode
 * @returns {Object} A config object mapping IDs to [stars]
 */
export function getManualConfig(points, isFullHpMode = false) {
   const currentConfigs = isFullHpMode ? talentConfigsFull : talentConfigs;
   const currentSequences = isFullHpMode ? diffSequencesFull : diffSequencesLow;

   // 1. Check if exact config exists
   if (currentConfigs[points]) {
      return currentConfigs[points];
   }

   // 2. Determine Base Level (previous multiple of 10)
   const baseLevel = Math.floor(points / 10) * 10;
   // Special handling for 144? user input 'points' is integer.
   // If points is 147, base is 140. (Or 144?)
   // The 'growth' logic usually assumes base 140 + 7 points.
   // But we have a config for 144.
   // The manual calc logic above assumes base is always multiple of 10.
   // If we want to support 144 as a base, we'd need a sequence for 144->150 (6 points).
   // But `diffSequences` for 140 covers 140->150 (10 points).
   // If the user enters 144, it's exact match.
   // If user enters 147, logic will use 140 base + 7 points.
   // Does the 140->150 sequence pass through 144 correctly?
   // 140 seq: [5, 5, 5, 5, 16, 17, 20, 29, 29, 29]
   // Base 140 + 7 pts adds: IDs [5, 5, 5, 5, 16, 17, 20].
   // Config 144 was formed by removing points? No, 144 was hardcoded by snippet.
   // The Generated 140 was formed by removing 4 points from 144? Or from 150?
   // Our `generate_full_hp.py` generated 140 from 150.
   // And 144 matches user snippet.
   // Does 140->150 pass through 144?
   // 144 snippet points sum to 144.
   // Generated 140 sum to 140.
   // The sequence we used to generate 140 from 150 is `diffSequencesLow[140]`.
   // So 140 + `diffSeqLow[140]`[0..3] = 144 points.
   // IDs added: 5, 5, 5, 5.
   // Does 140 config + 4 points (5,5,5,5) equal 144 config?
   // 140 config has ID 5 (Charge Shield) at what level?
   // From Generated 140: ID 5 is [1].
   // From 144 Snippet: ID 5 is [1].
   // Wait. 140->144 adds points to ID 5?
   // Sequence 140 says add to ID 5?
   // Yes `140: [5, 5, 5, 5, ...]`
   // So 140->144 adds 4 stars to ID 5.
   // If 140 starts with ID 5 at [1], adding 4 makes it [5].
   // Does 144 config have ID 5 at [5]?
   // Let's check `talents_config_full.js` (from verify step).
   // Config 144: "5: [1]". (Row 21: 015 -> 0,1,5). ID 5 is middle one. Row 21 middle is ID 5.
   // Wait snippet for 144 Row 21 is "015". ID 4=0, 5=1, 6=5.
   // So ID 5 is [1].
   // If 140 has ID 5 at [1].
   // Then adding 4 to ID 5 makes it [5].
   // But 144 has ID 5 at [1].
   // Contradiction?
   // Let's re-read snippet 144 for Row 21. "015".
   // IDs 4,5,6.
   // Config 144 generated: "5": [1].
   // If we manually calc 144 from 140 using `diffSeq[140]`:
   // We add to ID 5 four times.
   // So 140 must have ID 5 at [1] - 4 = [-3]?? Impossible.
   // Ah, `generate_full_hp.py` derived 140 from 150 using `diffSeq[140]`.
   // 150 config Row 21 is "150" (from snippet 150. Wait, snippet 150? No, Low HP 150).
   // Low HP 150 Row 21 is "1,5,0". ID 5 is [5].
   // 140 from Low HP is derived by removing 10 pts.
   // The Sequence says remove 4 pts from ID 5. So ID 5 becomes [1].
   // This matches 144's ID 5 [1]? Yes.
   // So Generated 140 has ID 5 at [1].
   // But Manual Calc 140+4 (to get 144) will ADD 4 points to ID 5.
   // So 140 (ID 5=[1]) + 4 = ID 5=[5].
   // But Target 144 (Snippet) has ID 5=[1]?
   // Wait. Why did I think 144 should match the sequence?
   // 144 is a CUSTOM snippet. It might not follow the Low HP sequence.
   // If Manual Calc 144 yields ID 5=[5], but "Real" 144 is ID 5=[1], then Manual Calc for 144 is "Wrong" compared to the snippet.
   // But the user asked to "hacemos el mismo procedimiento para el calculo manual".
   // "Base calculation on Low HP patterns".
   // If strict adherence to Low HP pattern yields a different 144 than the one snippet provided, then Manual Calc differs from Preset.
   // This is acceptable for "Manual Calculation" which estimates points between presets.
   // The existence of a Preset 144 that defies the pattern is fine (it's a special build).
   // But if user types "144", they get the preset.
   // If they type "143", they get 140 + 3.
   // 140 + 3 adds 3 points to ID 5 -> ID 5=[4].
   // Valid.

   // Summary: We update `getManualConfig` to use `isFullHpMode` param and switch data sources.

   if (points < 80 || points > 200) {
      console.warn("Manual calc only supported for 80-200.");
      if (currentConfigs[baseLevel]) return currentConfigs[baseLevel];
      return currentConfigs[80];
   }

   const baseConfig = currentConfigs[baseLevel];
   if (!baseConfig) {
      console.error(`Base config for ${baseLevel} not found!`);
      return null;
   }

   // 3. Deep Copy Base Config
   const newConfig = JSON.parse(JSON.stringify(baseConfig));

   // 4. Calculate Points to Add
   const pointsToAdd = points - baseLevel;
   const sequence = currentSequences[baseLevel];

   if (!sequence) {
      console.warn(`No diff sequence defined for base ${baseLevel}`);
      return newConfig;
   }

   // 5. Apply Points
   for (let i = 0; i < pointsToAdd; i++) {
      if (i < sequence.length) {
         const talentId = sequence[i];
         if (!newConfig[talentId]) newConfig[talentId] = [0];
         newConfig[talentId][0]++;
      }
   }

   return newConfig;
}