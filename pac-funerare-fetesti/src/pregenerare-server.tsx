/*
 * Folosit doar la „npm run build”: scrie pagina în HTML,
 * ca Google și telefoanele lente să vadă conținutul imediat.
 */
import { StrictMode } from "react";
import { renderToString } from "react-dom/server";
import Aplicatie from "./Aplicatie";

export function deseneaza(): string {
  return renderToString(
    <StrictMode>
      <Aplicatie />
    </StrictMode>,
  );
}
