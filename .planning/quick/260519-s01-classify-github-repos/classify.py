#!/usr/bin/env python3
"""Classify all 101 Kaleb-Nim repos into categories.

Heuristics-first, with manual overrides for known hackathon repos.
"""
import json
import re
from pathlib import Path

HERE = Path(__file__).parent
RAW = HERE / "repos-raw.json"
EXISTING_HACKATHONS = Path(__file__).parents[2] / "research/hackathons/hackathons.json"

# Map repo_name → hackathon (devpost slug or new). Used to mark known hackathons.
# Sources: repo descriptions, existing hackathons.json, naming patterns.
KNOWN_HACKATHON_REPOS = {
    # repo_name: { devpost_slug | None if new, event_name, notes }
    "jtac-trainer": {"devpost_slug": None, "event": "AIE Open Hackathon", "notes": "Voice-first JTAC CAS 9-line trainer"},
    "hackomania_contextguard": {"devpost_slug": None, "event": "HackOMania 2026", "notes": "Winner team"},
    "foodr-smu-dot-hack": {"devpost_slug": "foodr-ihad3c", "event": "SMU .Hack", "notes": "Possible re-build of Foodr"},
    "smu-hack-food-tinder": {"devpost_slug": "foodr-ihad3c", "event": "SMU .Hack", "notes": "Foodr precursor — food-tinder"},
    "art-tificial-failure-hackandroll": {"devpost_slug": "art-ificial-failure", "event": "NUS HackAndRoll 2025", "notes": "Starter repo"},
    "Art-ificialFailure-backend": {"devpost_slug": "art-ificial-failure", "event": "NUS HackAndRoll 2025", "notes": "Backend (o1 + fly.io)"},
    "art-ificialfailure-hackroll-beta": {"devpost_slug": "art-ificial-failure", "event": "NUS HackAndRoll 2025", "notes": "Beta build"},
    "lifehack2023": {"devpost_slug": None, "event": "LifeHack 2023", "notes": "Empty repo — likely abandoned submission"},
    "ntuHackathon2023": {"devpost_slug": None, "event": "NTU Hackathon 2023", "notes": "Private repo"},
    "SingLife-Polyfintech2023": {"devpost_slug": None, "event": "Singlife PolyFinTech 2023", "notes": "Public, 1 star"},
    "st_llms_arena": {"devpost_slug": None, "event": "Streamlit LLMs Hackathon Sep 2023", "notes": "Fork of arena starter"},
}

# Clear "delete / archive" candidates: empty, tiny, test, playground.
ARCHIVE_NAME_HINTS = (
    "test_html", "nextjs-boilerplate", "qwenimage", "form-versation",
    "playing-with-excalidraw", "discord-testing", "valentine",
    "DevOps-Lab4", "Back-End-Dev-Project", "SUTD_RAD-neRF", "SUTD-RAD_neRF",
    "Handwritten-Charater-Recognition", "webScraping", "lifehack2023",
    "customized_chatGPT", "MirXes-Dataprocessing", "Kaleb-Nim",
    "devopsdaaa_-ca2-daaa2b02-p2100829-kaleb",
)

# Personal portfolio / infra repos
PORTFOLIO_INFRA_NAMES = {
    "nim-kaleb", "nim-clone", "CV", "Front_end_Personal_website",
}

# School coursework patterns (CA, lab, course code prefixes)
SCHOOL_PATTERNS = re.compile(
    r"^(DSA_|CA1-|DENG_|DEN_|DevOps$|DevOps-Lab|Cifar|GAN-RL|Deep-Learning|Prac-AI|"
    r"DataStructuresAlgo|Personal-Learning|EDA-on-Singapore|RPA_grp|"
    r"Tableau-data|Back-End-Dev-Project|Back-End$|ST0503|Machine-Learning-Journey|"
    r"PublicProjects|Task-Manager|Hands-On-Transfer|sklearn_compile|"
    r"seaborn-data|Machine-Learning-with-R-datasets|messaging-chat-parser|"
    r"pistoBot|cs329s-ml-deployment-tutorial|Site-Sn33k|GPT-is-you|"
    r"msdocs-python-fastapi-webapp-quickstart|snake-typescript|"
    r"ai-hedge-fund-agentic|Deep-Live-Cam|infinite-agentic-loop|"
    r"Hands-On-|RL-Job-Shop-Scheduling|L2D|sk2torch|autogen|"
    r"google-form-script|aes-learnet-booking|aes-bot|Parade-State-Bot|"
    r"parade-state-auto|LDR|attendance|UFA-sim|telegram-monetization-platform|"
    r"higgsfield-automation|cqc-map-generator)",
    re.IGNORECASE
)

# Work / org-affiliated
WORK_NAMES = {
    "Coke-Cognitive-Chatbot", "medical-chatbot-artc", "Mointor-Disruption-Events",
    "ARTC_Projects_kaleb", "RAG-frontend", "RAG-orchestrator", "RAG-Ingestion",
    "A_starCRP10", "CustomWhatsAppChatbot", "AssistantsAPI", "Medi-API",
    "LLM-Portfolio-", "Streamlit-News-Article-Analysis",
    "aes-learnet-booking", "aes-bot", "Parade-State-Bot", "parade-state-auto",
    "attendance", "cqc-map-generator", "higgsfield-automation",
    "telegram-monetization-platform", "google-form-script",
}


def categorize(repo: dict) -> dict:
    name = repo["name"]
    desc = (repo.get("description") or "").lower()
    is_fork = repo["isFork"]
    is_empty = repo["isEmpty"]
    is_archived = repo["isArchived"]
    is_private = repo["isPrivate"]
    disk = repo.get("diskUsage") or 0

    # Order: most-specific first
    if name in KNOWN_HACKATHON_REPOS:
        meta = KNOWN_HACKATHON_REPOS[name]
        return {
            "category": "hackathon",
            "confidence": "high",
            "reason": f"Known hackathon repo: {meta['event']}",
            "hackathon_event": meta["event"],
            "matches_existing_slug": meta["devpost_slug"],
        }

    # Hackathon keywords in description
    if any(k in desc for k in ("hackathon", "devpost", "hackandroll", "polyfintech", "lifehack")):
        return {
            "category": "hackathon",
            "confidence": "medium",
            "reason": f"Description mentions hackathon: {desc[:80]}",
        }

    if name in PORTFOLIO_INFRA_NAMES:
        return {"category": "portfolio-infra", "confidence": "high", "reason": "Portfolio site / personal infra"}

    if is_fork:
        return {"category": "fork-or-clone", "confidence": "high", "reason": "Forked repo"}

    if is_empty:
        return {"category": "archive-candidate", "confidence": "high", "reason": "Empty repo"}

    if disk <= 5 and not is_fork:
        return {"category": "archive-candidate", "confidence": "high", "reason": f"Disk usage {disk}KB — essentially empty"}

    if name in WORK_NAMES:
        return {"category": "work-or-collab", "confidence": "high", "reason": "Work / internship / org project"}

    if SCHOOL_PATTERNS.match(name) or "ca2" in name.lower() or "ca1" in name.lower():
        return {"category": "learning", "confidence": "high", "reason": "School coursework / tutorial / module"}

    if any(name == n for n in ARCHIVE_NAME_HINTS):
        return {"category": "archive-candidate", "confidence": "medium", "reason": "Playground / test repo"}

    if any(k in desc for k in ("playground", "tutorial", "learn", "module", "course", "ca2", "ca1", "starter")):
        return {"category": "learning", "confidence": "medium", "reason": f"Description suggests learning: {desc[:80]}"}

    # Side-project signals: longer-lived, real desc, not forked, > 1MB
    if disk > 1000 and (repo.get("description") or "").strip():
        return {"category": "side-project", "confidence": "medium", "reason": "Substantial repo with description"}

    return {"category": "other", "confidence": "low", "reason": "Unclassified — needs manual review"}


def main():
    repos = json.loads(RAW.read_text())
    existing = json.loads(EXISTING_HACKATHONS.read_text())
    existing_slugs = {p["slug"] for p in existing["projects"]}

    classified = []
    for r in repos:
        verdict = categorize(r)
        classified.append({
            "name": r["name"],
            "url": r["url"],
            "private": r["isPrivate"],
            "fork": r["isFork"],
            "archived": r["isArchived"],
            "empty": r["isEmpty"],
            "created": r["createdAt"][:10],
            "pushed": r["pushedAt"][:10],
            "size_kb": r.get("diskUsage") or 0,
            "stars": r["stargazerCount"],
            "language": (r.get("primaryLanguage") or {}).get("name"),
            "topics": [t["name"] for t in (r.get("repositoryTopics") or [])],
            "description": r.get("description") or "",
            "homepage": r.get("homepageUrl"),
            **verdict,
        })

    # Sort by category, then pushed desc
    classified.sort(key=lambda x: (x["category"], x["pushed"]), reverse=False)
    (HERE / "repos-classified.json").write_text(json.dumps(classified, indent=2))

    # Counts
    from collections import Counter
    counts = Counter(c["category"] for c in classified)

    # Hackathon candidates — entries that are NEW (not in existing hackathons.json)
    hackathons = [c for c in classified if c["category"] == "hackathon"]
    new_candidates = []
    likely_dup = []
    for h in hackathons:
        meta = KNOWN_HACKATHON_REPOS.get(h["name"], {})
        existing_slug = meta.get("devpost_slug")
        if existing_slug and existing_slug in existing_slugs:
            likely_dup.append({**h, "merges_into_slug": existing_slug,
                               "merge_action": "append_to_extra_links",
                               "notes": meta.get("notes", "")})
        else:
            new_candidates.append({
                "repo_name": h["name"],
                "repo_url": h["url"],
                "event_name": meta.get("event") or "Unknown",
                "notes": meta.get("notes") or h.get("reason"),
                "created": h["created"],
                "pushed": h["pushed"],
                "size_kb": h["size_kb"],
                "private": h["private"],
                "description": h["description"],
                # Schema stub matching existing hackathons.json — to be filled out manually:
                "stub": {
                    "slug": h["name"].lower(),
                    "project_url": None,
                    "title": h["name"],
                    "tagline": h["description"] or None,
                    "thumbnail_url": None,
                    "thumbnail_local": None,
                    "event_name": meta.get("event"),
                    "event_url": None,
                    "organizer": None,
                    "prizes": [],
                    "team": [],
                    "built_with": [],
                    "description_md": None,
                    "gallery": [],
                    "is_winner": "winner" in h["description"].lower(),
                    "extra_links": [h["url"]],
                    "extra_images": [],
                    "sources": ["github"],
                },
            })

    (HERE / "hackathon-candidates.json").write_text(json.dumps({
        "generated_at": "2026-05-19",
        "existing_in_hackathons_json": len(existing_slugs),
        "new_candidates_count": len(new_candidates),
        "github_repos_matching_existing_devpost_count": len(likely_dup),
        "new_candidates": new_candidates,
        "github_repos_matching_existing_devpost_entries": likely_dup,
    }, indent=2))

    print("CATEGORY COUNTS:")
    for cat, n in sorted(counts.items(), key=lambda x: -x[1]):
        print(f"  {cat:<22} {n}")
    print()
    print(f"Total repos: {len(classified)}")
    print(f"Hackathon repos: {len(hackathons)}")
    print(f"  → NEW candidates (not in hackathons.json): {len(new_candidates)}")
    print(f"  → matches existing devpost entry: {len(likely_dup)}")


if __name__ == "__main__":
    main()
