// Lets mouse users drag horizontal rows (".chips": specialties, filters, doctor
// carousels, date pickers…) sideways instead of needing a trackpad / shift+wheel.
// Touch devices already swipe natively, so only mouse pointers are handled.
// A drag never triggers the click on the chip/link where it started.

const THRESHOLD = 5; // px before a press counts as a drag

export function enableDragScroll() {
  let row: HTMLElement | null = null;
  let startX = 0;
  let startScroll = 0;
  let dragged = false;

  document.addEventListener('pointerdown', (e) => {
    if (e.pointerType !== 'mouse' || e.button !== 0) return;
    const el = (e.target as HTMLElement).closest<HTMLElement>('.chips');
    if (!el || el.scrollWidth <= el.clientWidth) return;
    // Leave form fields usable.
    if ((e.target as HTMLElement).closest('input, select, textarea')) return;
    row = el; startX = e.clientX; startScroll = el.scrollLeft; dragged = false;
  });

  document.addEventListener('pointermove', (e) => {
    if (!row) return;
    const dx = e.clientX - startX;
    if (!dragged && Math.abs(dx) < THRESHOLD) return;
    if (!dragged) { dragged = true; row.classList.add('dragging'); }
    row.scrollLeft = startScroll - dx;
    e.preventDefault();
  });

  const end = () => {
    if (!row) return;
    row.classList.remove('dragging');
    row = null;
    // Reset after the click event that follows pointerup has been swallowed.
    setTimeout(() => { dragged = false; }, 0);
  };
  document.addEventListener('pointerup', end);
  document.addEventListener('pointercancel', end);

  // Swallow the click that ends a drag so it doesn't open a doctor / toggle a filter.
  document.addEventListener('click', (e) => {
    if (dragged) { e.preventDefault(); e.stopPropagation(); dragged = false; }
  }, true);

  // Stop the browser's native "drag the link/image" ghost inside rows.
  document.addEventListener('dragstart', (e) => {
    if ((e.target as HTMLElement).closest?.('.chips')) e.preventDefault();
  });
}
