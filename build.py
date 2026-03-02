#!/usr/bin/env python3
"""
Build script for founder-skills multi-platform distribution.

Reads canonical SKILL.md + frameworks.md files and generates platform-specific
outputs for OpenAI GPTs, OpenAI Assistants, Gemini Gems, Gemini API, and
standalone per-framework files.

Usage:
    python3 build.py            # Build all platforms
    python3 build.py --clean    # Remove dist/ and rebuild

No external dependencies required (Python 3.8+).
"""

import json
import os
import re
import shutil
import sys
from pathlib import Path

ROOT = Path(__file__).parent
SKILLS_DIR = ROOT / "skills"
DIST_DIR = ROOT / "dist"

# Categories that have frameworks.md (all except founder)
CATEGORIES = sorted(
    d.name
    for d in SKILLS_DIR.iterdir()
    if d.is_dir() and (d / "SKILL.md").exists()
)

# Platform char limits (approximate safe limits)
GPT_INSTRUCTIONS_LIMIT = 8000
GEMINI_GEM_LIMIT = 8000


def strip_frontmatter(text: str) -> str:
    """Remove YAML frontmatter (---...---) from markdown."""
    m = re.match(r"^---\n.*?\n---\n?", text, re.DOTALL)
    if m:
        return text[m.end():].lstrip("\n")
    return text


def parse_frontmatter(text: str) -> dict:
    """Extract YAML frontmatter fields with simple regex parsing."""
    fm = {}
    m = re.match(r"^---\n(.*?)\n---", text, re.DOTALL)
    if m:
        for line in m.group(1).splitlines():
            kv = re.match(r'^(\w[\w-]*):\s*"?(.+?)"?\s*$', line)
            if kv:
                fm[kv.group(1)] = kv.group(2)
    return fm


def parse_frameworks(text: str) -> list[dict]:
    """Split frameworks.md into individual framework entries."""
    frameworks = []
    # Split by --- separator
    sections = re.split(r"\n---\n", text)
    for section in sections:
        section = section.strip()
        if not section:
            continue
        # Parse framework header
        slug_m = re.search(r"\*\*Slug\*\*:\s*`([^`]+)`", section)
        name_m = re.search(r"^##\s+(.+)$", section, re.MULTILINE)
        desc_m = re.search(r"\*\*Description\*\*:\s*(.+)", section)
        if not name_m:
            continue
        fw = {
            "name": name_m.group(1).strip(),
            "slug": slug_m.group(1) if slug_m else slugify(name_m.group(1)),
            "description": desc_m.group(1).strip() if desc_m else "",
            "body": section,
        }
        frameworks.append(fw)
    return frameworks


def slugify(text: str) -> str:
    """Convert text to URL-friendly slug."""
    text = text.lower().strip()
    text = re.sub(r"[^\w\s-]", "", text)
    text = re.sub(r"[\s_]+", "-", text)
    return text.strip("-")


def strip_claude_references(text: str) -> str:
    """Remove Claude Code-specific references from text."""
    # Remove Skill tool references
    text = re.sub(
        r"Use the Skill tool to invoke category skills[^\n]*\n",
        "",
        text,
    )
    # Remove /skill slash command references in prose (but keep framework lists)
    text = re.sub(r"`/(\w[\w-]*)`", r"\1", text)
    # Remove "see frameworks.md" link references
    text = re.sub(
        r"[Ss]ee \[frameworks\.md\]\(frameworks\.md\)\.?",
        "Refer to the detailed framework instructions in your knowledge files.",
        text,
    )
    text = re.sub(
        r"read the corresponding entry in frameworks\.md",
        "refer to the detailed framework instructions in your knowledge files",
        text,
    )
    # Remove framework reference section that points to frameworks.md
    text = re.sub(
        r"## Detailed framework instructions\n\n.*?(?=\n## |\Z)",
        "",
        text,
        flags=re.DOTALL,
    )
    return text


def trim_for_char_limit(text: str, limit: int) -> str:
    """Trim instructions to fit within a character limit.

    Removes verbose sections in order of decreasing expendability:
    1. Assumptions/challenge/recommendations boilerplate
    2. Examples section
    3. Anti-patterns section
    """
    if len(text) <= limit:
        return text

    # Remove verbose assumptions/challenge/recommendations boilerplate
    text = re.sub(
        r"## Assumptions & intellectual honesty.*?(?=\n## |\Z)",
        "## After every analysis\n\nInclude: assumptions table, challenge (strongest counter-argument), "
        "and recommendations as testable hypotheses.\n\n",
        text,
        flags=re.DOTALL,
    )
    if len(text) <= limit:
        return text

    # Remove examples section
    text = re.sub(r"## Examples\n\n.*?(?=\n## |\Z)", "", text, flags=re.DOTALL)
    if len(text) <= limit:
        return text

    # Remove anti-patterns section
    text = re.sub(r"## Anti-patterns.*?(?=\n## |\Z)", "", text, flags=re.DOTALL)
    if len(text) <= limit:
        return text

    # Remove adversarial debate section
    text = re.sub(r"### Step 5: Adversarial debate.*?(?=\n### Step |\n## |\Z)", "", text, flags=re.DOTALL)
    if len(text) <= limit:
        return text

    # Compress action plan section
    text = re.sub(
        r"### Step 6: Action plan with validation gates\n\n.*?(?=\n## |\Z)",
        "### Step 6: Action plan\n\n"
        "Structure recommendations as hypotheses to test in 3 phases: "
        "Validate (week 1-2), Execute (week 3-8), Evaluate (week 8-12). "
        "Define specific pivot triggers, kill criteria, and escalation signals.\n\n",
        text,
        flags=re.DOTALL,
    )
    if len(text) <= limit:
        return text

    # Compress assumptions audit
    text = re.sub(
        r"### Step 4: Assumptions audit.*?(?=\n### Step |\n## |\Z)",
        "### Step 4: Assumptions audit\n\n"
        "List every assumption in a table: Assumption | Confidence | Impact if wrong | How to validate. "
        "Identify the 1-2 load-bearing assumptions that would flip the recommendation.\n\n",
        text,
        flags=re.DOTALL,
    )
    if len(text) <= limit:
        return text

    # Truncate framework descriptions to just name (remove ": description" part)
    text = re.sub(r"(- `[^`]+` — \*\*[^*]+\*\*): .+", r"\1", text)
    if len(text) <= limit:
        return text

    return text


def make_gpt_instructions(skill_body: str) -> str:
    """Create OpenAI GPT system instructions (catalog only, under 8K)."""
    text = strip_frontmatter(skill_body)
    text = strip_claude_references(text)
    # Add GPT-specific retrieval instruction
    text += (
        "\n\n## Knowledge files\n\n"
        "You have access to detailed framework instructions in your knowledge files. "
        "When applying a specific framework, search your knowledge files for the "
        "framework name to find the expert instructions, required inputs, and "
        "output structure.\n"
    )
    text = trim_for_char_limit(text, GPT_INSTRUCTIONS_LIMIT)
    return text


def make_assistant_instructions(skill_body: str) -> str:
    """Create OpenAI Assistant instructions (full SKILL.md body)."""
    text = strip_frontmatter(skill_body)
    text = strip_claude_references(text)
    text = text.replace(
        "Refer to the detailed framework instructions in your knowledge files.",
        "Search your vector store for the framework name to find detailed instructions.",
    )
    text += (
        "\n\n## File search\n\n"
        "You have framework details in your vector store. When applying a specific "
        "framework, use file_search to find the expert instructions for that framework.\n"
    )
    return text


def make_gem_instructions(skill_body: str) -> str:
    """Create Gemini Gem instructions (catalog only, under 8K)."""
    text = strip_frontmatter(skill_body)
    text = strip_claude_references(text)
    text += (
        "\n\n## Knowledge files\n\n"
        "You have access to detailed framework instructions in your knowledge files. "
        "When applying a specific framework, search your knowledge files for the "
        "framework name to find the expert instructions, required inputs, and "
        "output structure.\n"
    )
    text = trim_for_char_limit(text, GEMINI_GEM_LIMIT)
    return text


def make_gemini_api(skill_body: str, frameworks_body: str) -> str:
    """Create Gemini API prompt (full merge: SKILL.md + frameworks.md)."""
    text = strip_frontmatter(skill_body)
    text = strip_claude_references(text)
    # Replace knowledge file references with inline note
    text = text.replace(
        "Refer to the detailed framework instructions in your knowledge files.",
        "See the detailed framework instructions below.",
    )
    # Append full frameworks
    fw_text = strip_frontmatter(frameworks_body)
    text += "\n\n---\n\n" + fw_text
    return text


def make_standalone(framework: dict, category: str) -> str:
    """Create a standalone per-framework prompt."""
    lines = [
        f"# {framework['name']}",
        "",
        f"**Category**: {category}",
        f"**Framework**: {framework['name']}",
        "",
    ]
    if framework["description"]:
        lines.append(framework["description"])
        lines.append("")

    # Extract expert instructions from the body
    expert_m = re.search(
        r"\*\*Expert instructions\*\*:\n```\n(.*?)```",
        framework["body"],
        re.DOTALL,
    )
    if expert_m:
        lines.append("## Instructions")
        lines.append("")
        lines.append(expert_m.group(1).strip())
        lines.append("")

    # Extract inputs
    inputs = re.findall(
        r"- \*\*(.+?)\*\*\s*\*\((\w+)\)\*:\s*\w+\s*—\s*(.+)",
        framework["body"],
    )
    if inputs:
        lines.append("## Inputs")
        lines.append("")
        for name, req, desc in inputs:
            lines.append(f"- **{name}** ({req}): {desc}")
        lines.append("")

    # Extract when to use
    when_m = re.search(r"\*\*When to use\*\*:\s*(.+)", framework["body"])
    if when_m:
        lines.append(f"**When to use**: {when_m.group(1)}")
        lines.append("")

    # Extract origin
    origin_m = re.search(r"\*\*Origin\*\*:\s*(.+)", framework["body"])
    if origin_m:
        lines.append(f"**Origin**: {origin_m.group(1)}")
        lines.append("")

    return "\n".join(lines)


def make_founder_for_platform(
    founder_skill: str, all_categories: dict, compact: bool = False
) -> str:
    """Create a condensed founder skill for non-Claude platforms.

    Since other platforms can't invoke sub-skills, include a condensed
    all-framework catalog inline.

    If compact=True, use a minimal catalog (category + count only) to fit
    within GPT/Gem instruction limits.
    """
    text = strip_frontmatter(founder_skill)
    text = strip_claude_references(text)

    # Remove the category table that references /skill commands
    text = re.sub(
        r"\| Category \| Skill \| Frameworks \| Best for \|\n"
        r"\|[-| ]+\|\n"
        r"(?:\|[^\n]+\|\n)+",
        "",
        text,
    )

    if compact:
        # For GPTs/Gems: just list categories with counts
        catalog_lines = [
            "\n## Available frameworks (568 across 16 categories)\n",
        ]
        for cat_name, cat_data in sorted(all_categories.items()):
            if cat_name == "founder":
                continue
            fm = parse_frontmatter(cat_data["skill"])
            cat_title = fm.get("name", cat_name).replace("-", " ").title()
            fw_list = re.findall(
                r"- `([^`]+)` — \*\*([^*]+)\*\*",
                cat_data["skill"],
            )
            count = len(fw_list)
            # Pick first 3 framework names as examples
            examples = ", ".join(name for _, name in fw_list[:3])
            if examples:
                catalog_lines.append(f"- **{cat_title}** ({count}): {examples}, ...")
            else:
                catalog_lines.append(f"- **{cat_title}** ({count})")
        text += "\n".join(catalog_lines)
    else:
        # For Assistants/API: full framework listing
        catalog_lines = [
            "\n## All frameworks by category\n",
        ]
        for cat_name, cat_data in sorted(all_categories.items()):
            if cat_name == "founder":
                continue
            fm = parse_frontmatter(cat_data["skill"])
            cat_title = fm.get("name", cat_name).title()
            catalog_lines.append(f"\n### {cat_title}")
            catalog_lines.append("")
            fw_list = re.findall(
                r"- `([^`]+)` — \*\*([^*]+)\*\*: (.+)",
                cat_data["skill"],
            )
            for slug, name, desc in fw_list:
                catalog_lines.append(f"- **{name}**: {desc}")
            if not fw_list:
                if cat_data.get("frameworks"):
                    for fw in parse_frameworks(cat_data["frameworks"]):
                        catalog_lines.append(
                            f"- **{fw['name']}**: {fw['description']}"
                        )
        text += "\n".join(catalog_lines)

    text += (
        "\n\n## Knowledge files\n\n"
        "When applying a specific framework, search your knowledge files for the "
        "framework name to find the detailed expert instructions, required inputs, "
        "and output structure.\n"
    )
    return text


def write_file(path: Path, content: str):
    """Write content to file, creating parent directories."""
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(content, encoding="utf-8")


def build():
    """Main build function."""
    if "--clean" in sys.argv:
        if DIST_DIR.exists():
            shutil.rmtree(DIST_DIR)
            print("Cleaned dist/")

    if DIST_DIR.exists():
        shutil.rmtree(DIST_DIR)

    # Load all category data
    all_categories = {}
    for cat in CATEGORIES:
        cat_dir = SKILLS_DIR / cat
        skill_path = cat_dir / "SKILL.md"
        fw_path = cat_dir / "frameworks.md"

        skill_text = skill_path.read_text(encoding="utf-8")
        fw_text = fw_path.read_text(encoding="utf-8") if fw_path.exists() else ""

        all_categories[cat] = {
            "skill": skill_text,
            "frameworks": fw_text,
        }

    manifest = {
        "version": "1.0.0",
        "categories": [],
        "platforms": ["openai-gpts", "openai-assistants", "gemini-gems", "gemini-api", "standalone"],
        "warnings": {},
    }

    for cat in CATEGORIES:
        data = all_categories[cat]
        skill_text = data["skill"]
        fw_text = data["frameworks"]
        fm = parse_frontmatter(skill_text)
        cat_entry = {"name": cat, "description": fm.get("description", ""), "files": {}}

        # --- OpenAI GPTs ---
        if cat == "founder":
            gpt_instructions = make_founder_for_platform(
                skill_text, all_categories, compact=True
            )
            gpt_instructions = trim_for_char_limit(
                gpt_instructions, GPT_INSTRUCTIONS_LIMIT
            )
        else:
            gpt_instructions = make_gpt_instructions(skill_text)

        gpt_path = DIST_DIR / "openai" / "gpts" / cat / "instructions.md"
        write_file(gpt_path, gpt_instructions)
        cat_entry["files"]["openai-gpts-instructions"] = str(gpt_path.relative_to(DIST_DIR))

        if fw_text:
            gpt_knowledge = DIST_DIR / "openai" / "gpts" / cat / "knowledge" / "frameworks.md"
            write_file(gpt_knowledge, fw_text)
            cat_entry["files"]["openai-gpts-knowledge"] = str(gpt_knowledge.relative_to(DIST_DIR))

        # Check GPT size limit
        if len(gpt_instructions) > GPT_INSTRUCTIONS_LIMIT:
            manifest.setdefault("warnings", {})[f"openai-gpts/{cat}"] = (
                f"Instructions are {len(gpt_instructions)} chars "
                f"(limit ~{GPT_INSTRUCTIONS_LIMIT}). May need trimming."
            )

        # --- OpenAI Assistants ---
        if cat == "founder":
            asst_instructions = make_founder_for_platform(skill_text, all_categories)
            asst_instructions = asst_instructions.replace(
                "search your knowledge files",
                "use file_search in your vector store",
            )
        else:
            asst_instructions = make_assistant_instructions(skill_text)

        asst_json_path = DIST_DIR / "openai" / "assistants" / f"{cat}.json"
        asst_config = {
            "name": fm.get("name", cat),
            "description": fm.get("description", ""),
            "instructions": asst_instructions,
            "model": "gpt-4o",
            "tools": [{"type": "file_search"}] if fw_text else [],
        }
        write_file(asst_json_path, json.dumps(asst_config, indent=2, ensure_ascii=False))
        cat_entry["files"]["openai-assistants-config"] = str(asst_json_path.relative_to(DIST_DIR))

        if fw_text:
            asst_fw = DIST_DIR / "openai" / "assistants" / "files" / f"{cat}-frameworks.md"
            write_file(asst_fw, fw_text)
            cat_entry["files"]["openai-assistants-knowledge"] = str(asst_fw.relative_to(DIST_DIR))

        # --- Gemini Gems ---
        if cat == "founder":
            gem_instructions = make_founder_for_platform(
                skill_text, all_categories, compact=True
            )
            gem_instructions = trim_for_char_limit(
                gem_instructions, GEMINI_GEM_LIMIT
            )
        else:
            gem_instructions = make_gem_instructions(skill_text)

        gem_path = DIST_DIR / "gemini" / "gems" / cat / "instructions.md"
        write_file(gem_path, gem_instructions)
        cat_entry["files"]["gemini-gems-instructions"] = str(gem_path.relative_to(DIST_DIR))

        if fw_text:
            gem_knowledge = DIST_DIR / "gemini" / "gems" / cat / "knowledge" / "frameworks.md"
            write_file(gem_knowledge, fw_text)
            cat_entry["files"]["gemini-gems-knowledge"] = str(gem_knowledge.relative_to(DIST_DIR))

        if len(gem_instructions) > GEMINI_GEM_LIMIT:
            manifest.setdefault("warnings", {})[f"gemini-gems/{cat}"] = (
                f"Instructions are {len(gem_instructions)} chars "
                f"(limit ~{GEMINI_GEM_LIMIT}). May need trimming."
            )

        # --- Gemini API ---
        if cat == "founder":
            api_text = make_founder_for_platform(skill_text, all_categories)
            api_text = api_text.replace(
                "search your knowledge files",
                "use the detailed framework instructions provided below",
            )
            # For founder, we can't inline all frameworks (too big), so just use the catalog
        else:
            if fw_text:
                api_text = make_gemini_api(skill_text, fw_text)
            else:
                api_text = strip_frontmatter(skill_text)
                api_text = strip_claude_references(api_text)

        api_path = DIST_DIR / "gemini" / "api" / f"{cat}.md"
        write_file(api_path, api_text)
        cat_entry["files"]["gemini-api"] = str(api_path.relative_to(DIST_DIR))

        # --- Standalone per-framework files ---
        if fw_text:
            frameworks = parse_frameworks(fw_text)
            standalone_files = []
            for fw in frameworks:
                standalone = make_standalone(fw, cat)
                fw_path = DIST_DIR / "standalone" / cat / f"{fw['slug']}.md"
                write_file(fw_path, standalone)
                standalone_files.append(str(fw_path.relative_to(DIST_DIR)))
            cat_entry["files"]["standalone"] = standalone_files
            cat_entry["framework_count"] = len(frameworks)

        manifest["categories"].append(cat_entry)

    # Write manifest
    manifest_path = DIST_DIR / "manifest.json"
    write_file(manifest_path, json.dumps(manifest, indent=2, ensure_ascii=False))

    # Print summary
    total_files = sum(
        1 for _ in DIST_DIR.rglob("*") if _.is_file()
    )
    total_frameworks = sum(
        c.get("framework_count", 0) for c in manifest["categories"]
    )
    print(f"Built {total_files} files across {len(manifest['platforms'])} platforms")
    print(f"  Categories: {len(CATEGORIES)}")
    print(f"  Frameworks: {total_frameworks}")
    print(f"  Output: {DIST_DIR}/")

    if manifest.get("warnings"):
        print(f"\nWarnings ({len(manifest['warnings'])}):")
        for key, msg in manifest["warnings"].items():
            print(f"  {key}: {msg}")


if __name__ == "__main__":
    build()
