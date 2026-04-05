import { PUBLICATIONS, VENUE_ALIASES } from "./data/publications.js";
import { ABOUT } from "./data/about.js";
import { TALKS, TEACHING, SERVICE } from "./data/activities.js";

const CATEGORY_ORDER = [
  { key: "conference", title: "Conference Proceedings" },
  { key: "journal", title: "Journals" },
  { key: "workshop", title: "Workshops" },
  { key: "preprint", title: "Preprints" },
];
const CONFERENCE_VENUE_ORDER = {
  neurips: 0,
  nips: 0,
  icml: 1,
  iclr: 2,
};

const VALID_CATEGORIES = new Set(CATEGORY_ORDER.map((item) => item.key));
const PUBLICATION_MAP = new Map(PUBLICATIONS.map((pub) => [getPublicationId(pub), pub]));

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderInlineMarkdown(text) {
  const raw = String(text || "");
  const regex = /\[([^\]]+)\]\((https?:\/\/[^)\s]+)\)/g;
  let output = "";
  let lastIndex = 0;
  let match = regex.exec(raw);

  while (match) {
    output += escapeHtml(raw.slice(lastIndex, match.index));
    const label = escapeHtml(match[1]);
    const url = match[2];
    output += `<a href="${escapeHtml(url)}" target="_blank" rel="noreferrer">${label}</a>`;
    lastIndex = regex.lastIndex;
    match = regex.exec(raw);
  }

  output += escapeHtml(raw.slice(lastIndex));
  return output;
}

function slugify(value) {
  return String(value)
    .toLowerCase()
    .replaceAll(/[^a-z0-9]+/g, "-")
    .replaceAll(/^-|-$/g, "")
    .slice(0, 40);
}

function getPublicationId(pub) {
  return pub.id || `${slugify(pub.title)}-${pub.year}`;
}

function getPlainAuthorName(author) {
  const raw = typeof author === "string" ? author : author?.name || "Unknown Author";
  return String(raw).replaceAll("\\", "").replaceAll("*", "").replaceAll("†", "").trim();
}

function isMyName(authorName) {
  const normalized = String(authorName || "")
    .toLowerCase()
    .replaceAll(/\s+/g, " ")
    .trim();
  return normalized === "juho lee";
}

function formatAuthorForBib(authorName) {
  const tokens = String(authorName)
    .trim()
    .split(/\s+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return "Unknown, U.";
  }
  const family = tokens[tokens.length - 1];
  const given = tokens.slice(0, -1);
  const initials = given.map((part) => `${part[0]?.toUpperCase() || ""}.`).join(" ");
  return `${family}, ${initials}`.trim();
}

function getPaperUrl(pub) {
  if (!Array.isArray(pub?.links) || pub.links.length === 0) {
    return "";
  }
  const preferred = pub.links.find((item) => /paper|preprint/i.test(item.label));
  return (preferred || pub.links[0]).url || "";
}

function ordinalSuffix(number) {
  const value = Number(number);
  if (value % 100 >= 11 && value % 100 <= 13) {
    return "th";
  }
  if (value % 10 === 1) {
    return "st";
  }
  if (value % 10 === 2) {
    return "nd";
  }
  if (value % 10 === 3) {
    return "rd";
  }
  return "th";
}

function getExpandedBooktitle(venue, year) {
  const y = Number(year);
  const key = String(venue || "").toLowerCase();
  if (key === "neurips") {
    const volume = y - 1987;
    const short = y < 2018 ? "NIPS" : "NeurIPS";
    return `Advances in Neural Information Processing Systems ${volume} (${short} ${y})`;
  }
  if (key === "icml") {
    const nth = y - 1983;
    return `Proceedings of The ${nth}${ordinalSuffix(nth)} International Conference on Machine Learning (ICML ${y})`;
  }
  if (key === "aistats") {
    const nth = y - 1997;
    return `Proceedings of The ${nth}${ordinalSuffix(nth)} International Conference on Artificial Intelligence and Statistics (AISTATS ${y})`;
  }
  if (key === "iclr") {
    const nth = y - 2012;
    return `Proceedings of The ${nth}${ordinalSuffix(nth)} International Conference on Learning Representations (ICLR ${y})`;
  }
  const alias = VENUE_ALIASES[key];
  return alias?.name || venue || "Unknown venue";
}

function applySentenceCaseWithBraces(rawTitle) {
  if (typeof rawTitle !== "string") {
    return "";
  }

  const preserved = [];
  const marker = (index) => `§${index}§`;

  const withoutBraces = rawTitle.replace(/\{([^{}]*)\}/g, (_, text) => {
    preserved.push(text);
    return marker(preserved.length - 1);
  });

  const lower = withoutBraces.toLowerCase();
  const chars = [...lower];

  for (let i = 0; i < chars.length; i += 1) {
    if (/[a-z]/.test(chars[i])) {
      chars[i] = chars[i].toUpperCase();
      break;
    }
  }

  const cased = chars.join("").replace(/(:\s+)([a-z])/g, (_, prefix, letter) => {
    return `${prefix}${letter.toUpperCase()}`;
  });

  return cased.replace(/§(\d+)§/g, (_, index) => preserved[Number(index)] || "");
}

function formatTitle(pub) {
  const raw = pub?.title || "Untitled";
  if (pub?.titleSentenceCase === false) {
    return escapeHtml(raw);
  }
  return escapeHtml(applySentenceCaseWithBraces(raw));
}

function formatVenue(venueKey, year) {
  const alias = VENUE_ALIASES[venueKey?.toLowerCase?.()] || null;
  if (!alias) {
    return `${escapeHtml(venueKey || "Unknown venue")} ${escapeHtml(year)}`;
  }

  return `${escapeHtml(alias.short)} ${escapeHtml(year)}`;
}

function formatLinks(links = []) {
  if (!Array.isArray(links) || links.length === 0) {
    return "";
  }

  const parts = links
    .filter((item) => item?.label && item?.url)
    .map(
      (item) =>
        `<a href="${escapeHtml(item.url)}" target="_blank" rel="noreferrer">${escapeHtml(item.label)}</a>`
    );

  return parts.join(' <span class="dot">·</span> ');
}

function formatAuthors(authors = []) {
  if (!Array.isArray(authors)) {
    return "";
  }

  const correspondingCount = authors.filter(
    (author) => typeof author === "object" && author?.corresponding
  ).length;

  return authors
    .map((author) => {
      const plainName = getPlainAuthorName(author);
      if (typeof author === "string") {
        const renderedName = escapeHtml(plainName);
        return isMyName(plainName) ? `<span class="author-self">${renderedName}</span>` : renderedName;
      }

      const name = escapeHtml(plainName);
      const formattedName = isMyName(plainName) ? `<span class="author-self">${name}</span>` : name;
      let markers = "";
      if (author?.equalContribution) {
        markers += "<sup>*</sup>";
      }
      if (author?.corresponding && correspondingCount > 1) {
        markers += "<sup>†</sup>";
      }
      return `${formattedName}${markers}`;
    })
    .join(", ");
}

function sortPublications(items) {
  return [...items].sort((a, b) => {
    const byYear = Number(b.year) - Number(a.year);
    if (byYear !== 0) {
      return byYear;
    }

    if (a.category === "conference" && b.category === "conference") {
      const aVenue = String(a.venue || "").toLowerCase();
      const bVenue = String(b.venue || "").toLowerCase();
      const aOrder = CONFERENCE_VENUE_ORDER[aVenue] ?? 99;
      const bOrder = CONFERENCE_VENUE_ORDER[bVenue] ?? 99;
      if (aOrder !== bOrder) {
        return aOrder - bOrder;
      }
      if (aVenue !== bVenue) {
        return aVenue.localeCompare(bVenue);
      }
    }

    return String(a.title).localeCompare(String(b.title));
  });
}

function renderAbout() {
  const container = document.getElementById("about-content");
  if (!container) {
    return;
  }

  const bioHtml = (ABOUT.bio || [])
    .map((paragraph) => `<p>${renderInlineMarkdown(paragraph)}</p>`)
    .join("");

  const interestsHtml = (ABOUT.researchInterests || [])
    .map((item) => `<li>${escapeHtml(item)}</li>`)
    .join("");

  const studentsHtml = (ABOUT.prospectiveStudents || [])
    .map((paragraph) => `<p>${renderInlineMarkdown(paragraph)}</p>`)
    .join("");

  container.innerHTML = `
    <div class="about-block">
      <h3>Brief Bio</h3>
      ${bioHtml}
    </div>
    <div class="about-block">
      <h3>Research Interests</h3>
      <ul class="about-list">
        ${interestsHtml}
      </ul>
    </div>
    <div class="about-block">
      <h3>For Prospective Students</h3>
      ${studentsHtml}
    </div>
  `;
}

function renderActivities() {
  const container = document.getElementById("activities-content");
  if (!container) {
    return;
  }

  const talksHtml = [...TALKS]
    .sort((a, b) => Number(b.year) - Number(a.year))
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.title)}</strong><br>${escapeHtml(item.event)}, ${escapeHtml(
          item.location
        )} (${escapeHtml(item.month || "")}${item.month ? " " : ""}${escapeHtml(item.year)})</li>`
    )
    .join("");

  const teachingHtml = [...TEACHING]
    .map(
      (item) =>
        `<li><strong>${escapeHtml(item.course)}</strong>${
          item.code ? ` (${escapeHtml(item.code)})` : ""
        }, ${escapeHtml(item.institution)}${item.term ? `, ${escapeHtml(item.term)}` : ""} (${escapeHtml(
          item.years
        )})</li>`
    )
    .join("");

  const serviceHtml = [...SERVICE]
    .map((item) => `<li><strong>${escapeHtml(item.role)}:</strong> ${escapeHtml(item.details)}</li>`)
    .join("");

  container.innerHTML = `
    <div class="about-block">
      <h3>Invited Talks</h3>
      <ul class="about-list">${talksHtml}</ul>
    </div>
    <div class="about-block">
      <h3>Teaching</h3>
      <ul class="about-list">${teachingHtml}</ul>
    </div>
    <div class="about-block">
      <h3>Academic Service</h3>
      <ul class="about-list">${serviceHtml}</ul>
    </div>
  `;
}

function getBibKey(pub) {
  if (pub.bibkey) {
    return pub.bibkey;
  }
  const firstAuthor = getPlainAuthorName(pub.authors?.[0] || "author")
    .split(/\s+/)
    .slice(-1)[0]
    .toLowerCase();
  const titleTokens = String(pub.title || "")
    .toLowerCase()
    .replaceAll(/[^a-z0-9\s-]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
  const stopwords = new Set(["a", "an", "the", "of", "for", "on", "in", "with", "to", "and"]);
  const firstContent = titleTokens.find((token) => !stopwords.has(token)) || "paper";
  return `${slugify(firstAuthor)}${pub.year}${slugify(firstContent)}`;
}

function formatBibTeX(pub) {
  const type = pub.category === "journal" ? "article" : pub.category === "preprint" ? "misc" : "inproceedings";
  const key = getBibKey(pub);
  const lines = [`@${type}{${key},`];

  const authors = (pub.authors || []).map(getPlainAuthorName).map(formatAuthorForBib).join(" and ");
  lines.push(`  author = {${authors}},`);
  lines.push(`  title = {${pub.title}},`);
  lines.push(`  year = {${pub.year}},`);

  if (type === "article") {
    const alias = VENUE_ALIASES[String(pub.venue || "").toLowerCase()];
    lines.push(`  journal = {${alias?.name || pub.venue}},`);
  } else if (type === "inproceedings") {
    lines.push(`  booktitle = {${getExpandedBooktitle(pub.venue, pub.year)}},`);
  } else {
    lines.push("  archivePrefix = {arXiv},");
    const paperUrl = getPaperUrl(pub);
    const arxivMatch = String(paperUrl).match(/arxiv\.org\/abs\/([^\/?]+)/);
    if (arxivMatch) {
      lines.push(`  eprint = {${arxivMatch[1]}},`);
    }
  }

  if (pub.status === "to_appear") {
    lines.push("  note = {To appear},");
  }

  const paperUrl = getPaperUrl(pub);
  if (paperUrl) {
    lines.push(`  url = {${paperUrl}},`);
  }

  lines.push("}");
  return lines.join("\n");
}

function setupExportActions() {
  const container = document.getElementById("publication-sections");
  if (!container) {
    return;
  }

  container.addEventListener("click", (event) => {
    const button = event.target.closest("button[data-action]");
    if (!button) {
      return;
    }

    const id = button.getAttribute("data-pub-id");
    const action = button.getAttribute("data-action");
    const pub = PUBLICATION_MAP.get(id);
    if (!pub) {
      return;
    }

    if (action === "toggle-bibtex") {
      const block = container.querySelector(`[data-bibtex-block="${CSS.escape(id)}"]`);
      if (!block) {
        return;
      }
      const expanded = button.getAttribute("aria-expanded") === "true";
      button.setAttribute("aria-expanded", String(!expanded));
      button.textContent = expanded ? "BibTeX" : "Hide BibTeX";
      block.hidden = expanded;
      return;
    }

    if (action === "copy-bibtex") {
      const block = container.querySelector(`[data-bibtex-block="${CSS.escape(id)}"] code`);
      const text = block?.textContent || "";
      navigator.clipboard.writeText(text).then(() => {
        button.textContent = "Copied!";
        setTimeout(() => { button.textContent = "Copy BibTeX"; }, 2000);
      });
      return;
    }
  });
}

function validatePublications() {
  const issues = [];
  const seen = new Set();

  PUBLICATIONS.forEach((pub, index) => {
    const id = `${index + 1}: ${pub.title || "Untitled"}`;
    if (!pub.title || !pub.year || !pub.venue || !Array.isArray(pub.authors)) {
      issues.push(`${id} -> missing one of title/year/venue/authors`);
    }
    if (!VALID_CATEGORIES.has(pub.category)) {
      issues.push(`${id} -> invalid category: ${pub.category}`);
    }
    if (!Number.isInteger(pub.year) || pub.year < 1900 || pub.year > 2100) {
      issues.push(`${id} -> suspicious year: ${pub.year}`);
    }

    const correspondingCount = (pub.authors || []).filter(
      (author) => typeof author === "object" && author?.corresponding
    ).length;
    if (correspondingCount === 1) {
      issues.push(`${id} -> only one corresponding author marked (dagger is reserved for co-corresponding)`);
    }

    for (const link of pub.links || []) {
      if (!/^https?:\/\//.test(String(link?.url || ""))) {
        issues.push(`${id} -> invalid URL: ${link?.url || "(empty)"}`);
      }
    }

    const key = `${pub.title}__${pub.year}`;
    if (seen.has(key)) {
      issues.push(`${id} -> duplicated title/year`);
    }
    seen.add(key);
  });

  if (issues.length > 0) {
    console.warn(`[Publication Validator] ${issues.length} issue(s) found.`);
    issues.slice(0, 30).forEach((issue) => console.warn(`- ${issue}`));
  } else {
    console.info("[Publication Validator] no issues found.");
  }
}

function setupToTopButton() {
  const button = document.getElementById("to-top-button");
  if (!button) {
    return;
  }

  const updateVisibility = () => {
    const show = window.scrollY > 240;
    button.classList.toggle("visible", show);
  };

  window.addEventListener("scroll", updateVisibility, { passive: true });
  button.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  updateVisibility();
}

function renderPublications() {
  const container = document.getElementById("publication-sections");
  const legend = document.getElementById("author-legend");
  if (!container) {
    return;
  }

  if (legend) {
    legend.innerHTML = "Legend: <sup>*</sup> equal contribution, <sup>†</sup> co-corresponding authors";
  }

  const sections = CATEGORY_ORDER.map((category) => {
    const grouped = PUBLICATIONS.filter((pub) => pub.category === category.key);
    const sorted = sortPublications(grouped);
    if (sorted.length === 0) {
      return "";
    }

    const items = sorted
      .map((pub) => {
        const authors = formatAuthors(pub.authors);
        const links = formatLinks(pub.links);
        const note = pub.note ? `<span class="badge">${escapeHtml(pub.note)}</span>` : "";
        const statusPrefix =
          pub.status === "to_appear" ? '<span class="pub-status">To appear in</span> ' : "";
        const pubId = getPublicationId(pub);
        const bibtexBlock = escapeHtml(formatBibTeX(pub));
        const exportButtons = `<button class="action-link" type="button" data-action="toggle-bibtex" data-pub-id="${escapeHtml(pubId)}" aria-expanded="false">BibTeX</button>`;

        return `
          <li class="publication-item">
            <div class="pub-title">${formatTitle(pub)}</div>
            <div class="pub-authors">${authors}</div>
            <div class="pub-venue">${statusPrefix}${formatVenue(pub.venue, pub.year)} ${note}</div>
            <div class="pub-links">${links ? `${links} <span class="dot">·</span> ` : ""}${exportButtons}</div>
            <div class="bibtex-wrapper" data-bibtex-block="${escapeHtml(pubId)}" hidden>
              <button class="action-link bibtex-copy-btn" type="button" data-action="copy-bibtex" data-pub-id="${escapeHtml(pubId)}">Copy</button>
              <pre class="bibtex-block"><code>${bibtexBlock}</code></pre>
            </div>
          </li>
        `;
      })
      .join("");

    return `
      <section class="publication-group">
        <h3>${escapeHtml(category.title)}</h3>
        <ol class="publication-list" reversed start="${sorted.length}">
          ${items}
        </ol>
      </section>
    `;
  });

  container.innerHTML = sections.join("");
}

renderAbout();
renderPublications();
renderActivities();
setupExportActions();
if (location.hostname === "localhost" || location.hostname === "127.0.0.1") {
  validatePublications();
}
setupToTopButton();
