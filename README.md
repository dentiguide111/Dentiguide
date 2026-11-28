# DentiGuide website (standard edition)

A free, plain-files website: 3 languages, 44 topic pages, 6 age-group pages, quizzes, anonymous statistics.

## The files (all in the main folder)
| File | What it is | Who edits it |
|---|---|---|
| content-en.json, content-ms.json, content-zh.json | All topics and age pages, one file per language | You, in the editing dashboard |
| quiz.json | All quizzes and questions | You, in the editing dashboard |
| settings.json | Statistics code and the "MEDIA TO BE ADDED" switch | You, in the editing dashboard |
| site.json | Menu and button texts in three languages | Advanced (edit in GitHub) |
| visuals.json | The drawings and animations | Not edited by hand |
| build.js | The program that turns the files above into the website | Never |
| style.css, quiz.js, package.json | Design, quiz program, settings for the host | Never |
| media (folder, created on first upload) | Your photos, GIFs and small videos | You, via the dashboard |

## How publishing works
Whenever a file changes in GitHub, Cloudflare Pages runs `node build.js` and publishes the result (folder `dist`) after one to two minutes. Nothing else is needed.

Cloudflare Pages settings: Framework preset = None, Build command = `node build.js`, Build output directory = `dist`.

## Rules to remember
- Never change a topic's number (id). The three languages are linked by that number.
- Save a topic as status "draft" to hide it. "published" shows it.
- A new topic: add it to the English file first (new number, a web address name, a section), then add the same number in the Malay and Chinese files. If a translation is missing, the page shows the English text with a notice.
- Videos: upload to YouTube (unlisted) and paste the link. Photos: keep each under 1 MB.
- Backup: GitHub keeps every version. Once a month, download the repository as a ZIP and keep a copy in Google Drive.
