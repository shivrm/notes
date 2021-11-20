function sanitizeHtml(text) {
    var sanitized = text.replace('&', '&amp;')
                    .replace('<', '&lt;')
                    .replace('>', '&gt;')
                    .replace('"', '&quot;')
                    .replace("'", '&#39;');

    return sanitized;
}
