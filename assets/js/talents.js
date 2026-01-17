import { talentConfigs } from './talents_config.js';
import { talentConfigsFull } from './talents_config_full.js';
import { getManualConfig } from './talent_config_calc.js';

document.addEventListener('DOMContentLoaded', () => {
   // Event delegation for control buttons
   const controlsGrid = document.querySelector('.controls-grid');
   if (controlsGrid) {
      controlsGrid.addEventListener('click', (e) => {
         const btn = e.target.closest('.btn-control');
         if (btn && !btn.disabled) {
            // Update active state visual
            document.querySelectorAll('.btn-control').forEach(b => b.classList.remove('btn-control--active'));
            btn.classList.add('btn-control--active');

            if (btn.classList.contains('btn-control--reset')) {
               resetTalents();
            } else if (btn.classList.contains('btn-control--calc')) {
               openManualModal();
            } else if (btn.dataset.level) {
               const level = parseInt(btn.dataset.level);
               applyTalentConfig(level);
            }
         }
      });
   }

   // Reset Button Listener (ID-based, for new UI)
   const resetBtn = document.getElementById('btn-reset');
   if (resetBtn) {
      resetBtn.addEventListener('click', () => {
         resetTalents();
      });
   }

   // Manual Modal Logic
   const manualModal = document.getElementById('modal-manual-calc');
   if (manualModal) {
      const input = document.getElementById('manual-points-input');
      const submitBtn = document.getElementById('manual-calc-submit');
      const cancelBtn = document.getElementById('manual-calc-cancel');
      const errorDiv = document.getElementById('manual-calc-error');

      function showError(msg) {
         if (errorDiv) {
            errorDiv.textContent = msg;
            errorDiv.style.display = 'block';
         }
      }

      function hideError() {
         if (errorDiv) {
            errorDiv.style.display = 'none';
         }
      }

      if (submitBtn) {
         submitBtn.addEventListener('click', () => {
            hideError();
            const val = input.value.trim();
            if (!val) {
               showError('Please enter a number.');
               return;
            }
            const points = parseInt(val);

            if (isNaN(points)) {
               showError('Invalid number.');
               return;
            }

            if (points >= 80 && points <= 200) {
               // Determine mode
               const activeTab = document.querySelector('.tab-btn--active');
               const isFullHp = activeTab && activeTab.dataset.mode === 'full';

               // Manual Calculation
               const manualConfig = getManualConfig(points, isFullHp);

               if (manualConfig) {
                  applyTalentConfigData(manualConfig);
                  console.log(`Applied manual config for ${points} points`);

                  // Hide Modal
                  const manualModalEl = document.getElementById('modal-manual-calc');
                  const modal = window.bootstrap.Modal.getInstance(manualModalEl);
                  if (modal) {
                     modal.hide();
                  } else {
                     // Fallback check
                     manualModalEl.classList.remove('show');
                     document.body.classList.remove('modal-open');
                     const backdrop = document.querySelector('.modal-backdrop');
                     if (backdrop) backdrop.remove();
                  }
               } else {
                  showError("Configuration not found for this level in current mode.");
               }
            } else {
               showError('Please enter a value between 80 and 200.');
            }
         });
      }

      /* Cancel handled by Bootstrap data-bs-dismiss
      if (cancelBtn) {
         cancelBtn.addEventListener('click', () => {
            manualModal.classList.remove('modal--open');
            hideError();
         });
      }
      */
   }

   // Apply default config if 80 is active? 
   // Wait, tabs logic might have already set 80 as default.
   // Let's check if there's an active button on load.
   /* Default disabled per user request
   const activeBtn = document.querySelector('.btn-control--active[data-level]');
   if (activeBtn) {
      applyTalentConfig(parseInt(activeBtn.dataset.level));
   }
   */
});

/**
 * Applies a talent configuration by Level ID
 * @param {number} levelId 
 */
function applyTalentConfig(levelId, explicitMode = null) {
   let isFullHp = false;

   if (explicitMode) {
      isFullHp = (explicitMode === 'full');
   } else {
      // Fallback to DOM check (for legacy calls or reset)
      // With new UI, we might default to 'low' if not provided, or check the Modal state (if open?)
      // Checking Modal state is safer if it persists:
      isFullHp = (getActiveMode() === 'full');
   }

   const configs = isFullHp ? talentConfigsFull : talentConfigs;
   const config = configs[levelId];

   if (!config) {
      console.warn(`No configuration found for level ${levelId} in mode ${isFullHp ? 'Full' : 'Low'}`);
      return;
   }
   applyTalentConfigData(config);
}

/**
 * Applies a raw configuration object to the DOM
 * @param {Object} config - The configuration object { id: [stars, ...], ... }
 */
function applyTalentConfigData(config) {
   // Iterate over all talent nodes in the DOM
   const talentNodes = document.querySelectorAll('.talent__node');

   // Pass 1: Reset and Apply Stars/Unlock state to ALL nodes
   talentNodes.forEach(node => {
      const id = parseInt(node.dataset.id);
      const talentData = config[id];

      // Reset state for this node (locks it, hides stars/connections)
      resetNodeState(node);

      if (talentData) {
         const stars = talentData[0]; // First element is stars count

         if (stars > 0) {
            // Unlock Node
            node.classList.remove('talent--locked');

            // Show Stars
            updateStarDisplay(node, stars);
         }
      }
   });

   // Pass 2: Update ALL connections (Vertical & Horizontal)
   // Now that all nodes have their correct 'locked/unlocked' state, we can safely check connections.
   talentNodes.forEach(node => {
      // Update Vertical/Diagonal connections
      updateVerticalConnections(node);
   });

   // Update horizontal connections
   updateHorizontalConnections();
}

function resetTalents() {
   const talentNodes = document.querySelectorAll('.talent__node');
   talentNodes.forEach(node => {
      resetNodeState(node);
   });

   // Also hide all horizontal connections explicitly
   const horizontalBars = document.querySelectorAll('.connection__horizontal__bar');
   horizontalBars.forEach(bar => {
      bar.style.display = 'none';
   });
}

function resetNodeState(node) {
   // Lock node
   node.classList.add('talent--locked');

   // Hide all stars (reset opacity/visibility)
   const starImgs = node.querySelectorAll('.talent__level-star');
   starImgs.forEach(img => {
      img.style.opacity = '0'; // Hide
   });

   // Hide all internal connection bars
   const connections = node.querySelectorAll(`
        .connection__vertical__bar,
        .connection__diagonal__left__bar,
        .connection__diagonal__right__bar
    `);
   connections.forEach(bar => {
      bar.style.display = 'none';
   });
}

function updateStarDisplay(node, count) {
   const starImgs = node.querySelectorAll('.talent__level-star');
   starImgs.forEach((img, index) => {
      if (index < count) {
         img.style.opacity = '1';
      } else {
         img.style.opacity = '0';
      }
   });
}

/**
 * Updates vertical and diagonal connections based on downstream node status.
 * Connection is shown ONLY if both the current node and the target node are unlocked.
 * @param {HTMLElement} node 
 */
function updateVerticalConnections(node) {
   const id = parseInt(node.dataset.id);
   const targetId = getDownstreamNodeId(id);

   if (targetId === null) return; // ID 0 has no downstream

   const targetNode = document.querySelector(`.talent__node[data-id="${targetId}"]`);

   if (targetNode) {
      // Check if both are unlocked
      const isCurrentUnlocked = !node.classList.contains('talent--locked');
      const isTargetUnlocked = !targetNode.classList.contains('talent--locked');

      const connections = node.querySelectorAll(`
            .connection__vertical__bar,
            .connection__diagonal__left__bar,
            .connection__diagonal__right__bar
        `);

      if (isCurrentUnlocked && isTargetUnlocked) {
         connections.forEach(bar => bar.style.display = 'block');
      } else {
         connections.forEach(bar => bar.style.display = 'none');
      }
   }
}

/**
 * Determines the ID of the node "below" the given ID in the tree topology.
 * @param {number} id 
 * @returns {number|null} Target ID or null if root
 */
function getDownstreamNodeId(id) {
   if (id === 0) return null; // Root
   if (id >= 1 && id <= 3) return 0; // Row 22 connects to Root

   // Standard 3-column grid logic: N connects to N-3
   return id - 3;
}

function updateHorizontalConnections() {
   // Iterate through all horizontal connection containers
   const horizontalBgs = document.querySelectorAll('.connection__horizontal__bg');

   horizontalBgs.forEach(bg => {
      const prev = bg.previousElementSibling;
      const next = bg.nextElementSibling;
      const bar = bg.querySelector('.connection__horizontal__bar');

      if (bar && prev && next &&
         prev.classList.contains('talent__node') &&
         next.classList.contains('talent__node')) {

         // Check if both neighbors are unlocked (not locked)
         // Note: Our logic uses 'talent--locked' class to indicate lock status.
         const isPrevUnlocked = !prev.classList.contains('talent--locked');
         const isNextUnlocked = !next.classList.contains('talent--locked');

         if (isPrevUnlocked && isNextUnlocked) {
            bar.style.display = 'block';
         } else {
            bar.style.display = 'none';
         }
      }
   });
}

// Open the new Configuration Modal
window.openConfigModal = function () {
   const modalEl = document.getElementById('modal-talent-config');
   if (modalEl) {
      let modal = window.bootstrap.Modal.getInstance(modalEl);
      if (!modal) {
         modal = new window.bootstrap.Modal(modalEl);
      }

      // Clear any previous errors and inputs
      const errorDiv = document.getElementById('manual-calc-error');
      if (errorDiv) {
         errorDiv.classList.remove('show', 'shake');
         errorDiv.textContent = '';
      }

      const input = document.getElementById('manual-points-input');
      if (input) input.value = '';

      // Initialize state when opening
      updateModalButtonState();
      modal.show();

      // Focus input?
      setTimeout(() => {
         if (input) input.focus();
      }, 500);
   }
};

function getActiveMode() {
   // We can simply query for the checked radio input
   const checkedRadio = document.querySelector('input[name="hpMode"]:checked');
   if (checkedRadio) return checkedRadio.value;
   return 'low'; // Default
}

function updateModalButtonState() {
   const mode = getActiveMode();
   const presetBtns = document.querySelectorAll('.btn-preset');

   presetBtns.forEach(btn => {
      const level = btn.dataset.level;
      if (mode === 'low') {
         btn.disabled = false;
      } else {
         // Full HP Mode Rules
         // 80, 120, 144 (if exists), 190, 200 are valid
         // 90, 100, 110, 130, 150-180 are currently not implemented or disabled?
         // Per previous tabs.js logic: 200, 190, 120, 144, 80 were enabled.
         const validLevels = ['80', '120', '144', '190', '200'];
         if (validLevels.includes(level)) {
            btn.disabled = false;
         } else {
            btn.disabled = true;
         }
      }
   });
}

function closeConfigModal() {
   const modalEl = document.getElementById('modal-talent-config');
   const modal = window.bootstrap.Modal.getInstance(modalEl);
   if (modal) modal.hide();
}

document.addEventListener('DOMContentLoaded', () => {
   // ... (existing initialization) ...

   // Mode Switcher Listener
   const modeRadios = document.querySelectorAll('input[name="hpMode"]');
   modeRadios.forEach(radio => {
      radio.addEventListener('change', (e) => {
         // Visual Update for Custom Radio Buttons
         document.querySelectorAll('.btn-mode').forEach(label => label.classList.remove('active'));
         e.target.closest('.btn-mode').classList.add('active');

         updateModalButtonState();
      });
   });

   // Preset Button Listeners
   document.querySelectorAll('.btn-preset').forEach(btn => {
      btn.addEventListener('click', () => {
         const level = btn.dataset.level;
         const mode = getActiveMode();
         applyTalentConfig(level, mode);
         closeConfigModal();
      });
   });

   // Manual Submit Listener
   const manualSubmitBtn = document.getElementById('btn-manual-submit');
   const errorDiv = document.getElementById('manual-calc-error');

   function showError(msg) {
      if (errorDiv) {
         errorDiv.textContent = msg;
         errorDiv.classList.add('show');

         // Remove shake class if present to re-trigger
         errorDiv.classList.remove('shake');

         // Trigger reflow
         void errorDiv.offsetWidth;

         // Add shake class
         errorDiv.classList.add('shake');
      }
   }

   function hideError() {
      if (errorDiv) {
         errorDiv.classList.remove('show', 'shake');
      }
   }

   if (manualSubmitBtn) {
      manualSubmitBtn.addEventListener('click', () => {
         hideError();
         const input = document.getElementById('manual-points-input');
         const val = input.value.trim();

         if (!val) {
            showError('Please enter a number.');
            return;
         }

         const points = parseInt(val);

         if (isNaN(points)) {
            showError('Invalid number.');
            return;
         }

         if (points >= 80 && points <= 200) {
            const mode = getActiveMode();
            const isFullHp = (mode === 'full');

            if (isFullHp) {
               const allowed = [80, 120, 190, 200];
               if (!allowed.includes(points)) {
                  showError('For Full HP, only levels 80, 120, 190, 200 are supported.');
                  return;
               }
            }

            const manualConfig = getManualConfig(points, isFullHp);

            if (manualConfig) {
               applyTalentConfigData(manualConfig);
               closeConfigModal();
            } else {
               showError("Configuration not found.");
            }
         } else {
            showError('Please enter a value between 80 and 200.');
         }
      });
   }
});
