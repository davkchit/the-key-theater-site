interface TornEdgeProps {
  className?: string
}

/**
 * Ragged strip of colour, meant to sit directly above a solid block so the
 * block's edge reads as torn paper rather than a ruler-straight rectangle.
 * Rotate it 180° for the bottom edge of the same block.
 *
 * The viewBox is only 12 units tall and the element is given a fixed CSS
 * height, so `preserveAspectRatio="none"` stretches it horizontally only --
 * the jaggedness stays the same depth no matter how wide the block gets.
 * Filled path, no stroke, so stretching can't corrupt the geometry.
 */
export function TornEdge({ className }: TornEdgeProps) {
  return (
    <svg viewBox="0 0 1200 12" preserveAspectRatio="none" className={className} aria-hidden="true">
      <path
        d="M0,12 L0,5 L38,2 L74,9 L112,3 L150,10 L190,2 L228,8 L268,1 L306,9 L346,3 L384,10 L424,2 L462,8 L502,1 L540,9 L580,3 L618,10 L658,2 L696,8 L736,1 L774,9 L814,3 L852,10 L892,2 L930,8 L970,1 L1008,9 L1048,3 L1086,10 L1126,2 L1164,8 L1200,4 L1200,12 Z"
        fill="currentColor"
      />
    </svg>
  )
}
