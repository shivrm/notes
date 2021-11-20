import { micromark } from "micromark";
import { gfm, gfmHtml } from "micromark-extension-gfm";

function sanitizeHtml(text) {
    var sanitized = text.replace('&', '&amp;')
                    .replace('<', '&lt;')
                    .replace('>', '&gt;')
                    .replace('"', '&quot;')
                    .replace("'", '&#39;');

    return sanitized;
}

export function markdown(text) {
    return  micromark(
        sanitizeHtml(text), {
            extensions: [gfm()],
            htmlExtensions: [gfmHtml()]
        }
    )
}