#!/usr/bin/env python3
"""Sync publications from markdown source into data/publications.js.

Usage:
  python3 scripts/sync_publications.py \
    --source data/publications_source.md \
    --output data/publications.js
"""

from __future__ import annotations

import argparse
import pathlib
import re
from collections import Counter

CATEGORY_MAP = {
    "Preprints": "preprint",
    "Journals": "journal",
    "Conferences": "conference",
    "Workshops": "workshop",
}

VENUE_ALIAS = {
    "NeurIPS": "neurips",
    "NIPS": "neurips",
    "ICML": "icml",
    "ICLR": "iclr",
    "AISTATS": "aistats",
    "AAAI": "aaai",
    "ACL": "acl",
    "CVPR": "cvpr",
    "ICCV": "iccv",
    "ECCV": "eccv",
    "IJCAI": "ijcai",
    "Journal of Machine Learning Research": "jmlr",
    "Transactions on Machine Learning Research": "tmlr",
}

ALIASES_JS = """export const VENUE_ALIASES = {
  neurips: {
    name: \"Advances in Neural Information Processing Systems\",
    short: \"NeurIPS\",
  },
  icml: {
    name: \"International Conference on Machine Learning\",
    short: \"ICML\",
  },
  iclr: {
    name: \"International Conference on Learning Representations\",
    short: \"ICLR\",
  },
  aistats: {
    name: \"International Conference on Artificial Intelligence and Statistics\",
    short: \"AISTATS\",
  },
  jmlr: {
    name: \"Journal of Machine Learning Research\",
    short: \"JMLR\",
  },
  tmlr: {
    name: \"Transactions on Machine Learning Research\",
    short: \"TMLR\",
  },
  aaai: {
    name: \"AAAI Conference on Artificial Intelligence\",
    short: \"AAAI\",
  },
  acl: {
    name: \"Annual Meeting of the Association for Computational Linguistics\",
    short: \"ACL\",
  },
  cvpr: {
    name: \"IEEE/CVF Conference on Computer Vision and Pattern Recognition\",
    short: \"CVPR\",
  },
  iccv: {
    name: \"IEEE/CVF International Conference on Computer Vision\",
    short: \"ICCV\",
  },
  eccv: {
    name: \"European Conference on Computer Vision\",
    short: \"ECCV\",
  },
  ijcai: {
    name: \"International Joint Conference on Artificial Intelligence\",
    short: \"IJCAI\",
  },
};
"""


def clean(line: str) -> str:
    return line.strip().replace("\\\\", "").strip()


def parse_title(line: str):
    line = clean(line)
    m = re.match(r"^\[(.*?)\]\((https?://[^)]+)\)\)?\s*$", line)
    if m:
        return m.group(1).strip(), m.group(2).strip()
    return line, ""


def parse_authors(line: str):
    line = clean(line).replace("**", "").replace("\\*", "*").replace("\\†", "†")
    line = re.sub(r"\s+and\s+", ", ", line)
    parts = [p.strip() for p in line.split(",") if p.strip()]
    authors = []
    for part in parts:
        equal = "*" in part
        corresponding = "†" in part
        name = part.replace("*", "").replace("†", "").replace("\\", "").strip()
        if equal or corresponding:
            obj = {"name": name}
            if equal:
                obj["equalContribution"] = True
            if corresponding:
                obj["corresponding"] = True
            authors.append(obj)
        else:
            authors.append(name)
    return authors


def parse_venue(line: str, category: str, paper_url: str):
    status = ""
    note = ""

    if not line:
        if category == "preprint":
            m = re.search(r"/abs/(\d{2})(\d{2})\.", paper_url)
            if m:
                yy = int(m.group(1))
                year = 2000 + yy if yy < 50 else 1900 + yy
            else:
                year = 0
            return "arXiv", year, status, note
        return "Unknown venue", 0, status, note

    line = clean(line)
    note_match = re.search(r"\(\*\*(.*?)\*\*\)", line)
    if note_match:
        note = note_match.group(1)
        line = re.sub(r"\(\*\*.*?\*\*\)", "", line).strip()

    m_to_appear = re.match(r"^To appear in\s+(.+?)\s+(\d{4})$", line)
    if m_to_appear:
        status = "to_appear"
        venue = VENUE_ALIAS.get(m_to_appear.group(1), m_to_appear.group(1))
        return venue, int(m_to_appear.group(2)), status, note

    m_year = re.search(r"(\d{4})", line)
    year = int(m_year.group(1)) if m_year else 0

    if "," in line and category in {"journal", "workshop"}:
        venue = line.split(",")[0].strip()
    else:
        venue = line[: m_year.start()].strip().rstrip(",") if m_year else line

    venue = VENUE_ALIAS.get(venue, venue)
    return venue, year, status, note


def js_str(value: str) -> str:
    return '"' + str(value).replace("\\", "\\\\").replace('"', '\\"') + '"'


def emit_publication(pub: dict[str, object]) -> str:
    out = ["  {"]
    out.append(f"    title: {js_str(pub['title'])},")
    out.append("    titleSentenceCase: false,")
    out.append(f"    category: {js_str(pub['category'])},")
    out.append("    authors: [")
    for author in pub["authors"]:
        if isinstance(author, str):
            out.append(f"      {js_str(author)},")
        else:
            bits = [f"name: {js_str(author['name'])}"]
            if author.get("equalContribution"):
                bits.append("equalContribution: true")
            if author.get("corresponding"):
                bits.append("corresponding: true")
            out.append("      { " + ", ".join(bits) + " },")
    out.append("    ],")
    out.append(f"    year: {int(pub['year'])},")
    out.append(f"    venue: {js_str(pub['venue'])},")
    if pub.get("status"):
        out.append(f"    status: {js_str(pub['status'])},")
    if pub.get("note"):
        out.append(f"    note: {js_str(pub['note'])},")
    if pub.get("links"):
        out.append("    links: [")
        for link in pub["links"]:
            out.append(f"      {{ label: {js_str(link['label'])}, url: {js_str(link['url'])} }},")
        out.append("    ],")
    out.append("  },")
    return "\n".join(out)


def validate_publications(publications: list[dict[str, object]]) -> list[str]:
    issues: list[str] = []
    seen: set[tuple[str, int]] = set()
    valid_categories = set(CATEGORY_MAP.values())

    for pub in publications:
        label = f"{pub.get('title', 'Untitled')} ({pub.get('year', '?')})"

        if not pub.get("title") or not pub.get("year") or not pub.get("venue"):
            issues.append(f"{label}: missing title/year/venue")
        if pub.get("category") not in valid_categories:
            issues.append(f"{label}: invalid category {pub.get('category')}")

        authors = pub.get("authors") or []
        if not isinstance(authors, list) or len(authors) == 0:
            issues.append(f"{label}: missing authors")
        corresponding = [a for a in authors if isinstance(a, dict) and a.get("corresponding")]
        if len(corresponding) == 1:
            issues.append(f"{label}: only one corresponding author marked (dagger is for co-corresponding)")

        key = (str(pub.get("title", "")), int(pub.get("year", 0) or 0))
        if key in seen:
            issues.append(f"{label}: duplicated title/year")
        seen.add(key)

    return issues


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--source", default="data/publications_source.md")
    parser.add_argument("--output", default="data/publications.js")
    parser.add_argument("--check", action="store_true", help="validate only, do not write output file")
    args = parser.parse_args()

    text = pathlib.Path(args.source).read_text()
    lines = text.splitlines()

    publications = []
    category = ""
    i = 0
    while i < len(lines):
        line = lines[i].rstrip()
        heading = re.match(r"^##\s+(.*)$", line)
        if heading:
            category = CATEGORY_MAP.get(heading.group(1).strip(), "")
            i += 1
            continue

        if category and line.startswith("- "):
            block = [line[2:]]
            i += 1
            while i < len(lines):
                nxt = lines[i]
                if nxt.startswith("- ") or nxt.startswith("## "):
                    break
                block.append(nxt)
                i += 1

            logical = []
            for raw in block:
                if not raw.strip():
                    continue
                if logical and not logical[-1].endswith("\\\\") and not raw.strip().startswith("["):
                    logical[-1] += " " + raw.strip()
                else:
                    logical.append(raw.strip())

            title, paper_url = parse_title(logical[0])
            links = []
            if paper_url:
                links.append({"label": "Paper", "url": paper_url})

            authors = parse_authors(logical[1]) if len(logical) > 1 else []
            venue_line = ""

            for extra in logical[2:]:
                value = clean(extra)
                m_code = re.match(r"^\[Code\]\((.*?)\)", value)
                if m_code:
                    links.append({"label": "Code", "url": m_code.group(1).strip()})
                    continue
                if not venue_line and (re.search(r"\d{4}", value) or value.startswith("To appear in")):
                    venue_line = value

            venue, year, status, note = parse_venue(venue_line, category, paper_url)

            pub = {
                "title": title,
                "category": category,
                "authors": authors,
                "year": year,
                "venue": venue,
                "status": status,
                "note": note,
                "links": links,
            }
            publications.append(pub)
            continue

        i += 1

    # Hand-tuned patch for preprint note line in source.
    for pub in publications:
        if pub["title"] == "Deep amortized clustering" and pub["category"] == "preprint":
            pub["venue"] = "arXiv"
            pub["note"] = "Preliminary version accepted at NeurIPS 2019 Sets & Partitions Workshop (oral)"
            pub["links"].append({"label": "Workshop", "url": "https://www.sets.parts"})

    publications.sort(key=lambda p: (p["category"], -int(p["year"]), p["title"]))

    issues = validate_publications(publications)
    if issues:
        print(f"Validation issues: {len(issues)}")
        for issue in issues[:30]:
            print(f"- {issue}")
        if args.check:
            raise SystemExit(1)

    if not args.check:
        content = [ALIASES_JS, "", "export const PUBLICATIONS = ["]
        content.extend(emit_publication(pub) for pub in publications)
        content.append("];\n")
        content.append("/*")
        content.append("AUTOGENERATED FILE")
        content.append("- Edit data/publications_source.md")
        content.append("- Rebuild: python3 scripts/sync_publications.py")
        content.append("- Validate: python3 scripts/sync_publications.py --check")
        content.append("*/")

        pathlib.Path(args.output).write_text("\n".join(content))

    counts = Counter(pub["category"] for pub in publications)
    if args.check:
        print(f"Validated {len(publications)} publications from {args.source}")
    else:
        print(f"Wrote {len(publications)} publications -> {args.output}")
    print(dict(counts))


if __name__ == "__main__":
    main()
