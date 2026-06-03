type Feature = {
  title: string;
  body: string;
};

function esc(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

export function buildFeatureGridHtml(features: Feature[]) {
  return features
    .map(
      (feature, index) => `
        <article class="card hover-lift reveal stagger-${Math.min(index + 1, 4)}">
          <span class="kicker">0${index + 1}</span>
          <h3>${esc(feature.title)}</h3>
          <p>${esc(feature.body)}</p>
        </article>`
    )
    .join("");
}

export function buildStatsHtml(stats: Array<{ value: string; label: string }>) {
  return stats.map((item) => `<span><strong>${esc(item.value)}</strong> ${esc(item.label)}</span>`).join("");
}

export function buildTestimonialsHtml(quotes: string[]) {
  return quotes
    .map((quote, index) => `<div class="quote hover-lift reveal stagger-${Math.min(index + 1, 4)}"><p>${esc(quote)}</p></div>`)
    .join("");
}

export function buildLogosHtml(labels: string[]) {
  return labels.map((label) => `<span>${esc(label)}</span>`).join("");
}
