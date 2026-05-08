
// Tab Switching Logic
document.addEventListener('DOMContentLoaded', () => {
   const tabs = document.querySelectorAll('.tab-btn');
   const controlsBar = document.querySelector('.controls-grid');

   if (!tabs.length || !controlsBar) {
      return;
   }

   const resetBtn = document.getElementById('btn-reset');
   // Select all level buttons (excluding reset)
   const levelBtns = Array.from(controlsBar.querySelectorAll('.btn-control:not(#btn-reset)'));

   function switchMode(mode) {
      // Update Tab Active State
      tabs.forEach(tab => {
         if (tab.dataset.mode === mode) {
            tab.classList.add('tab-btn--active');
         } else {
            tab.classList.remove('tab-btn--active');
         }
      });

      // Update Button States
      if (mode === 'low') {
         // Low HP Mode: Enable Reset and all level buttons
         if (resetBtn) resetBtn.disabled = false;

         levelBtns.forEach(btn => {
            btn.disabled = false;
         });
      } else if (mode === 'full') {
         // Full HP Mode: Enable Reset
         if (resetBtn) resetBtn.disabled = false;

         levelBtns.forEach(btn => {
            // Enable ONLY 120, 144, 190, and 200, disable others
            const level = btn.dataset.level;
            if (level === '200' || level === '190' || level === '120' || level === '144' || level === '80') {
               btn.disabled = false;
            } else {
               btn.disabled = true;
            }
         });
      }
   }

   // Event Listeners
   tabs.forEach(tab => {
      tab.addEventListener('click', () => {
         const mode = tab.dataset.mode;

         // Warning Modal logic removed per user request

         switchMode(mode);
      });
   });

   // Initialize with default mode (active tab)
   const activeTab = document.querySelector('.tab-btn--active');
   if (activeTab) {
      switchMode(activeTab.dataset.mode);
   }
});
