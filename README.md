# DentiGuide: export package (Stage 1)

This folder is a snapshot of the DentiGuide **prototype**, prepared so that you own it.

| Folder | What it is |
|---|---|
| source/denti-guide-prototype.html | The complete working prototype in one file. Open it in any browser. All code, styles and illustrations are inside. |
| content/content-en.json, content-ms.json, content-zh.json | Every page, in each language, as structured data. This is what will be imported into the new website. |
| audit/page-audit.csv | One row per page and language: counts of bullets, warnings, media slots, illustrations, source links. |
| audit/media-needed.csv | Every photo, GIF and video still to be supplied, with the suggested filename. |
| docs/ | The audit, platform recommendation and migration plan (Word). |

## Put this in a private GitHub repository you control
1. Create a GitHub account in your own name (or your organisation's) and turn on two-factor authentication.
2. Create a new repository named `dentiguide`, set to **Private**.
3. Upload this whole folder (GitHub: Add file > Upload files).
4. Add any developer you hire as a collaborator. Remove them when they finish. Never share your password.
5. Decide who owns the content licence (recommend: your name or organisation) and add a LICENSE file.

## Important
- This is a prototype. The new, editable website (with admin dashboard, quizzes and backups) has NOT been built yet.
- Clinical content is flagged where it still needs review against MOH Malaysia guidance. Do not publish publicly before that review.
