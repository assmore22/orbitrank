import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCircleNodes } from "@fortawesome/free-solid-svg-icons";

/**
 * Logo = ready-made FontAwesome icon (circle-nodes) + plain wordmark.
 * No custom SVG is drawn. Icon source documented in README.
 * https://fontawesome.com/icons/circle-nodes
 */
export function OrbitRankLogo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="flex items-center gap-2.5">
      <span className="grid h-9 w-9 place-items-center rounded-pill border border-primary/40 bg-primary/15 text-primary">
        <FontAwesomeIcon icon={faCircleNodes} className="h-[17px] w-[17px]" />
      </span>
      {!compact && <span className="text-[16px] font-semibold tracking-tight text-text">OrbitRank</span>}
    </span>
  );
}
