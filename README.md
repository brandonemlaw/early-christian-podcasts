# Early Christian Podcasts - Timeline Player

A beautiful, interactive web application for exploring early Christian literature through a timeline-based podcast player. Experience the evolution of Christian thought by navigating through different scholarly dating perspectives and listening to podcasts that appear as they become historically available.

## Features

### 🎛️ Timeline Navigation
- **Year Slider**: Navigate through years 32-432 AD with a smooth, responsive slider
- **Auto-Play Timeline**: Set a pace (1 week per decade to 2 months per decade) and let the timeline advance automatically
- **Dynamic Background**: Beautiful color transitions that evolve from dark (early period) to light (later period)
- **Content Filtering**: Only shows podcasts available for the selected time period and scholarly perspective

### 📚 Multiple Scholarly Perspectives
- **Scholarly**: Critical scholarship dating (some letters considered pseudepigraphic)
- **Moderate**: Balanced position between traditional and critical views
- **Traditional**: Conservative dating assuming Pauline authorship for all attributed letters
- **Dynamic Content**: Different versions of split letters (2 Corinthians, Philippians) appear based on perspective

### 🎵 Full-Featured Audio Player
- **Complete Controls**: Play, pause, rewind 15s, forward 30s, speed control (0.5x - 2x)
- **Progress Tracking**: Saves your position in each podcast version separately
- **Play Counter**: Tracks how many times you've completed each episode with headphone icon
- **Visual Feedback**: Currently playing podcast is highlighted with special border

### 🏷️ Smart Content Management
- **New Badge**: Shows on podcasts that haven't been played yet
- **Updated Badge**: Indicates when a newer version of a split letter becomes available
- **Canon Badge**: Highlights canonical New Testament books
- **Version Notes**: Shows differences between versions (e.g., "with interpolation", "without parenthetical tone")
- **Play Count Sorting**: Sort by least played episodes first

### 💾 Persistent State
- **Local Storage**: All settings, progress, timeline state, and play history saved locally
- **Timeline Memory**: Remembers your pace and automatically advances when you return
- **Position Memory**: Resumes each podcast from where you left off
- **Cross-Session**: Data persists across browser sessions

### 🎨 Modern UI/UX
- **Glassmorphism Design**: Beautiful frosted glass effects with backdrop blur
- **Responsive Layout**: Optimized for desktop and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Authorship Color Coding**: Paul's letters have gold accents, others have teal
- **Keyboard Shortcuts**: 
  - Space: Play/Pause
  - Left Arrow: Rewind 15 seconds
  - Right Arrow: Forward 30 seconds

## File Structure

```
early-christian-podcasts/
├── index.html              # Main HTML structure
├── styles.css              # Modern glassmorphism styling
├── app.js                  # Core application logic
├── data/
│   └── podcasts.js         # Podcast data with multiple perspectives
├── audio/                  # Audio files directory
│   ├── galatians-v1.mp3
│   ├── 1-thessalonians-v1.mp3
│   └── ...                 # Other podcast audio files
└── README.md               # This file
```

## Getting Started

### For Users

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No server required - runs completely client-side

2. **Choose Your Perspective**
   - Select from Scholarly, Moderate, or Traditional dating perspectives
   - This affects which letters appear when and their attributed authorship

3. **Navigate the Timeline**
   - Use the year slider to explore different time periods
   - Click "Play Timeline" to set automatic advancement and watch content appear over time

4. **Listen to Podcasts**
   - Click any podcast card to start listening
   - Your progress is automatically saved for each version
   - Sort by play count to find episodes you haven't heard yet

### For Developers/Cloners

1. **Clone or Download**
   ```bash
   git clone [repository-url]
   cd early-christian-podcasts
   ```

2. **Add Audio Files**
   - Create an `audio/` directory
   - Add MP3 files matching the `versionId` names from `data/podcasts.js`
   - Format: `/audio/{versionId}.mp3`

3. **Serve Locally** (recommended for audio file access)
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Python 2
   python -m SimpleHTTPServer 8000
   
   # Node.js (if you have http-server installed)
   npx http-server
   ```

4. **Open in Browser**
   - Navigate to `http://localhost:8000`

## Data Format

The `data/podcasts.js` file contains podcast objects with the following structure:

```javascript
{
  "id": "unique-identifier",
  "title": "Podcast Title",
  "isCanon": true,
  "sortIndex": 1,
  "authors": {
    "scholarly": "Author Name",
    "moderate": "Author Name", 
    "traditional": "Author Name"
  },
  "versions": [
    {
      "versionId": "unique-version-id",
      "perspectives": ["scholarly", "moderate", "traditional"],
      "dates": {
        "scholarly": 85,
        "moderate": 61,
        "traditional": 61
      },
      "updateDates": {  // Optional - for versions that appear later
        "scholarly": 100
      },
      "description": "Episode description",
      "audioUrl": "/audio/unique-version-id.mp3",
      "duration": 3600,
      "versionNote": "Special notes about this version"
    }
  ]
}
```

## Customization

### Adding New Podcasts
1. Edit `data/podcasts.js`
2. Add new podcast objects following the format above
3. Set appropriate date ranges for each scholarly perspective
4. Add corresponding audio files to `/audio/` directory

### Modifying Timeline
- **Date Range**: Change `min` and `max` values in the slider initialization
- **Pace Options**: Modify the `#paceSelect` dropdown options in `index.html`
- **Background Transitions**: Adjust year breakpoints in `updateDynamicBackground()` function

### Styling
- **Color Themes**: Modify CSS custom properties in `:root`
- **Glassmorphism**: Adjust `backdrop-filter` and opacity values
- **Authorship Colors**: Modify the color schemes in `renderPodcasts()` function

## Technical Requirements

### Browser Compatibility
- **Modern Browsers**: Chrome 88+, Firefox 78+, Safari 14+, Edge 88+
- **Required Features**: 
  - CSS `backdrop-filter` support
  - ES6+ JavaScript (arrow functions, template literals, etc.)
  - HTML5 Audio API
  - Local Storage API
  - CSS Grid and Flexbox

### Audio Requirements
- **Formats**: MP3 (recommended), WAV, OGG
- **Hosting**: Can be local files or streaming URLs
- **CORS**: If using external URLs, ensure proper CORS headers

### Dependencies
- **jQuery**: 3.6.0 (loaded from CDN)
- **jQuery UI**: 1.13.2 (for slider functionality)
- **Font Awesome**: 6.0.0 (for icons)

## Development Notes

- **No Build Process**: Pure HTML/CSS/JS - no compilation needed
- **Local Storage Schema**: Uses `earlyChristianPodcasts` key with structured data
- **State Management**: All application state managed in a single `appState` object
- **Audio Handling**: Creates new Audio objects for each podcast to avoid conflicts
- **Mobile Optimized**: Touch-friendly controls and responsive breakpoints

## Educational Context

This application demonstrates several scholarly approaches to dating early Christian literature:

- **Traditional View**: Accepts traditional authorship and early dating
- **Critical Scholarship**: Questions authorship of some letters, dates them later
- **Moderate Position**: Attempts to balance both perspectives

The different versions of split letters (like 2 Corinthians and Philippians) reflect actual scholarly theories about how these texts were compiled from multiple original letters.

## License

This project is provided as-is for educational and personal use. Please respect any copyright restrictions on audio content.
