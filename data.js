// Content lives here. Edit freely.
const GH = 'zchris07';

// Each project: title, theme (page colors while it is open), summary, links, media (assets/ captured from the running apps).
const PROJECTS = [
  { id: 'sidequest', title: 'sidequest planner',
    theme: { bg: '#caaf93', fg: '#2e2a26', muted: '#62594f', accent: '#4f4943', panel: '#f5efe5' },
    summary: 'Your own calendar that pulls in events from anywhere. It collects events from websites, feeds, documents, flyers, email and social accounts, turns them into clean entries, merges duplicates and keeps track of where each event came from. Everything shows in one calendar, agenda and map alongside your own appointments and reminders. The captures use the app\'s built-in demo sources, which are fictional.',
    media: { video: 'assets/sidequest.mp4', shots: ['assets/sidequest-1.webp', 'assets/sidequest-2.webp', 'assets/sidequest-3.webp'] },
    play: 'https://sidequestplanner.cc', code: null },
  { id: 'football', title: 'football explained.',
    theme: { bg: '#e8dac5', fg: '#2e2a26', muted: '#62594f', accent: '#d9a900', panel: '#ddcbb3' },
    summary: 'A plain-language guide to American football for new and international fans. The basics are told step by step on an animated field, with every NFL team and roster, rankings and a glossary, in seven languages including right-to-left Arabic.',
    media: { video: 'assets/football.mp4', shots: ['assets/football-1.webp', 'assets/football-2.webp', 'assets/football-3.webp'] },
    play: `https://${GH}.github.io/football-explained/`, code: `https://github.com/${GH}/football-explained` },
  { id: 'freestyle', title: 'freestyle.wtf',
    theme: { bg: '#121212', fg: '#ffffff', muted: '#b3b3b3', accent: '#1ed760', panel: '#181818' },
    summary: 'A rap freestyle rhyme trainer. Pick a rhyme scheme and a beat; the game scrolls two prep bars and 32 bars, with rhyme words landing on your chosen beat, synced to the track by an in-browser beat-grid detector.',
    media: { video: 'assets/freestyle.mp4', shots: ['assets/freestyle-1.webp', 'assets/freestyle-2.webp', 'assets/freestyle-3.webp'] },
    play: 'https://freestyle.wtf', code: `https://github.com/${GH}/freestyle` },
  { id: 'jade', title: 'jade mandarin',
    theme: { bg: '#2b9b70', fg: '#ffffff', muted: 'rgba(255,255,255,0.72)', accent: '#fff3a6', panel: '#258560' },
    summary: 'A Mandarin reader on a jade-green screen. One sentence at a time; hover and click to zoom from sentence to word to character, with pinyin, simplified and traditional, English translation and five difficulty tiers.',
    media: { video: 'assets/jade.mp4', shots: ['assets/jade-1.webp', 'assets/jade-2.webp', 'assets/jade-3.webp'] },
    play: `https://${GH}.github.io/chinese/`, code: `https://github.com/${GH}/chinese` },
  { id: 'manhunt', title: 'manhunt',
    theme: { bg: '#060605', fg: '#d9d3c1', muted: '#8a8574', accent: '#b3121b', panel: '#11110f' },
    summary: 'A top-down asymmetric horror game for up to 10 friends: Darkwood-style light and fog, Dead by Daylight-style chases, generators to repair and a killer who can be stunned but never killed. No accounts: the host\'s browser is the server, and friends join with a four-letter code. A Unity remake is in progress.',
    media: { video: 'assets/manhunt.mp4', shots: ['assets/manhunt-1.webp', 'assets/manhunt-2.webp', 'assets/manhunt-3.webp'] },
    play: `https://${GH}.github.io/play/manhunt/`, playLabel: 'Play', code: `https://github.com/${GH}/manhunt` },
  { id: 'deadblock', title: 'deadblock',
    theme: { bg: '#1c1f21', fg: '#f1e6d6', muted: '#b9ad9d', accent: '#e8833a', panel: '#2a2e31' },
    summary: 'A Roblox hero shooter in the style of Deadlock: heroes with abilities, a combat system and a minimap. In development.',
    media: { video: null, shots: ['assets/deadblock-1.webp', 'assets/deadblock-2.webp'] },
    play: null, playNote: 'In development', code: null },
  { id: 'stroop', title: 'stroop',
    theme: { bg: '#0b0c11', fg: '#eef0f6', muted: '#7b8096', accent: '#eef0f6', panel: '#1b1e29' },
    summary: 'A reaction game built on the Stroop effect: a color word appears printed in a different ink, and you pick the ink, not the word, before the clock runs out. It escalates from 3 choices to 5 to a 9-choice grid with flashing color and a voice calling the wrong answer, then a boss fight in solo with eleven challenge layouts. Solo has 3 lives; multiplayer lobbies show everyone the same word at the same moment and score the fastest correct answer highest. Built for the web and as a Roblox experience.',
    media: { video: 'assets/stroop.mp4', shots: ['assets/stroop-1.webp', 'assets/stroop-2.webp', 'assets/stroop-3.webp'] },
    play: `https://${GH}.github.io/play/stroop/`, playLabel: 'Play', code: `https://github.com/${GH}/stroop` },
  { id: 'twentyfour', title: '24',
    theme: { bg: '#4169e1', fg: '#f6f3ea', muted: '#c8d4f7', accent: '#c8d4f7', panel: '#3558c4' },
    summary: 'A fast arithmetic card game. You are dealt four cards and combine all four, each exactly once, with + − × ÷ and any parentheses to make exactly 24. Build the equation by tapping cards, drag a box around cards to group them in nested parentheses, and see every distinct solution after each hand. Solo is untimed; multiplayer lobbies deal everyone the same hand and the first correct answer takes the round. Built for the web and as a Roblox experience.',
    media: { video: 'assets/twentyfour.mp4', shots: ['assets/twentyfour-1.webp', 'assets/twentyfour-2.webp', 'assets/twentyfour-3.webp'] },
    play: `https://${GH}.github.io/play/24/`, playLabel: 'Play', code: `https://github.com/${GH}/24` },
];

// Page themes by scroll position: Latte 2.0 (from the calendar app), then white on Meta blue.
const THEMES = {
  hero: { bg: '#caaf93', fg: '#2e2a26', muted: '#62594f', accent: '#4f4943', panel: '#f5efe5' },
  projects: { bg: '#0064e0', fg: '#ffffff', muted: 'rgba(255,255,255,0.78)', accent: '#ffffff', panel: '#0057c4' },
};
