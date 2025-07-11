# Early Christian Podcasts - Timeline Player

A beautiful, interactive web application for exploring early Christian literature through a timeline-based podcast player.

## Features

### 🎛️ Timeline Navigation
- **Year Slider**: Navigate through years 1-400 AD with a smooth, responsive slider
- **Auto-Play Timeline**: Set a pace (1 week per decade to 2 months per decade) and let the timeline advance automatically
- **Content Filtering**: Only shows podcasts available for the selected time period

### 🎵 Full-Featured Audio Player
- **Complete Controls**: Play, pause, previous/next track, speed control (0.5x - 2x)
- **Seek Functions**: Jump backward 15 seconds or forward 30 seconds
- **Progress Bar**: Click to seek to any position in the audio
- **Visual Feedback**: Currently playing podcast is highlighted

### 🏷️ Smart Content Management
- **New Badge**: Shows on podcasts that haven't been played yet
- **Updated Badge**: Indicates podcasts with newer versions available
- **Played History**: Tracks which podcasts have been listened to
- **Album Art**: Beautiful artwork for each podcast

### 💾 Persistent State
- **Local Storage**: All settings, progress, and timeline state saved locally
- **Timeline Memory**: Remembers your pace and automatically advances when you return
- **Play History**: Keeps track of what you've listened to

### 🎨 Modern UI/UX
- **Glassy Design**: Beautiful glassmorphism effects with backdrop blur
- **Responsive Layout**: Works on desktop and mobile devices
- **Smooth Animations**: Elegant transitions and hover effects
- **Keyboard Shortcuts**: 
  - Space: Play/Pause
  - Arrow Keys: Seek, Previous/Next track

## File Structure

```
early-christian-podcasts/
├── index.html          # Main HTML structure
├── styles.css          # Modern glassmorphism styling
├── app.js             # Core application logic
├── podcasts.json      # Podcast data and metadata
└── README.md          # This file
```

## Getting Started

1. **Open the Application**
   - Simply open `index.html` in any modern web browser
   - No server required - runs completely client-side

2. **Navigate the Timeline**
   - Use the year slider to explore different time periods
   - Click "Play Timeline" to set automatic advancement

3. **Listen to Podcasts**
   - Click any podcast card to start listening
   - Use the full-featured player controls at the bottom

## Data Format

The `podcasts.json` file contains an array of podcast objects with the following structure:

```json
{
  "id": "unique-identifier",
  "title": "Podcast Title",
  "author": "Author Name",
  "description": "Brief description",
  "year": 123,
  "audioUrl": "https://example.com/audio.mp3",
  "artwork": "https://example.com/artwork.jpg",
  "duration": 3600,
  "isNew": true,
  "isUpdated": false,
  "lastPlayed": null,
  "tags": ["tag1", "tag2"]
}
```

## Customization

### Adding New Podcasts
1. Edit `podcasts.json`
2. Add new podcast objects following the format above
3. Set appropriate `year` values for timeline filtering

### Modifying Timeline Pace
The timeline pace options can be customized in the `#paceSelect` dropdown in `index.html`:
- Value represents weeks per decade
- Current options: 1, 3, 4, 8 weeks per decade

### Styling Changes
- Modify `styles.css` for visual customization
- Uses CSS custom properties for easy theme changes
- Glassmorphism effects use `backdrop-filter` (with Safari prefixes)

## Browser Compatibility

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest versions)
- **Features Used**: 
  - CSS Grid and Flexbox
  - Backdrop-filter (with webkit prefix)
  - ES6+ JavaScript features
  - HTML5 Audio API
  - Local Storage

## Audio Requirements

- Supports all HTML5 audio formats (MP3, WAV, OGG, etc.)
- Streaming audio URLs work best
- For local files, place in the same directory and use relative paths

## Development Notes

- **jQuery**: Uses jQuery 3.6.0 and jQuery UI for slider functionality
- **No Build Process**: Pure HTML/CSS/JS - no compilation needed
- **Local Storage**: All data persisted in browser's local storage
- **Responsive**: Mobile-friendly design with touch support

## License

This project is provided as-is for educational and personal use.
