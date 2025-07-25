$(document).ready(function() {
    // Application state
    let appState = {
        currentYear: 32,
        podcasts: [],
        filteredPodcasts: [],
        currentPodcast: null,
        isPlaying: false,
        timeline: {
            isActive: false,
            pace: 1, // weeks per decade
            lastUpdate: null,
            startYear: 32
        },
        playedPodcasts: new Set(),
        podcastPositions: {}, // Store position for each podcast version
        playCounters: {}, // Store play counts for each podcast version
        audio: null,
        datePerspective: 'scholarly', // 'scholarly', 'moderate', 'traditional'
        sortBy: 'newest' // 'newest', 'oldest', 'author', 'title'
    };

    // Initialize app
    init();

    function init() {
        loadStateFromStorage();
        setupEventListeners();
        loadPodcasts();
        initializeSlider();
        updateTimelineUI();
        updateUIControls();
        updateDynamicBackground(appState.currentYear);
        checkTimelineProgress();
        
        // Don't auto-restore podcast on page load
        // Users can manually select what they want to play
    }
    
    function updateUIControls() {
        // Set the perspective buttons
        $('.perspective-btn').removeClass('active');
        $(`.perspective-btn[data-perspective="${appState.datePerspective}"]`).addClass('active');
        
        // Set the sort buttons
        $('.sort-btn').removeClass('active');
        $(`.sort-btn[data-sort="${appState.sortBy}"]`).addClass('active');
    }

    function loadStateFromStorage() {
        const saved = localStorage.getItem('earlyChristianPodcasts');
        if (saved) {
            try {
                const savedState = JSON.parse(saved);
                appState.currentYear = savedState.currentYear || 32;
                appState.timeline = savedState.timeline || appState.timeline;
                appState.playedPodcasts = new Set(savedState.playedPodcasts || []);
                appState.podcastPositions = savedState.podcastPositions || {};
                appState.playCounters = savedState.playCounters || {};
                appState.datePerspective = savedState.datePerspective || 'scholarly';
                appState.sortBy = savedState.sortBy || 'newest';
                
                // Store the last active podcast info but don't auto-restore
                if (savedState.lastActivePodcast) {
                    appState.lastActivePodcast = savedState.lastActivePodcast;
                }
            } catch (e) {
                console.error('Error loading saved state:', e);
            }
        }
    }

    function saveStateToStorage() {
        const stateToSave = {
            currentYear: appState.currentYear,
            timeline: appState.timeline,
            playedPodcasts: Array.from(appState.playedPodcasts),
            podcastPositions: appState.podcastPositions,
            playCounters: appState.playCounters,
            datePerspective: appState.datePerspective,
            sortBy: appState.sortBy,
            lastActivePodcast: appState.currentPodcast ? {
                id: appState.currentPodcast.id,
                versionId: appState.currentPodcast.versionId
            } : null
        };
        localStorage.setItem('earlyChristianPodcasts', JSON.stringify(stateToSave));
    }

    function setupEventListeners() {
        // Perspective buttons
        $('.perspective-btn').on('click', function() {
            const perspective = $(this).data('perspective');
            appState.datePerspective = perspective;
            
            // Update button states
            $('.perspective-btn').removeClass('active');
            $(this).addClass('active');
            
            saveStateToStorage();
            filterPodcastsByYear();
        });
        
        // Sort buttons
        $('.sort-btn').on('click', function() {
            const sortBy = $(this).data('sort');
            appState.sortBy = sortBy;
            
            // Update button states
            $('.sort-btn').removeClass('active');
            $(this).addClass('active');
            
            saveStateToStorage();
            renderPodcasts();
        });
        
        // Remove old dropdown handlers
        // Custom dropdown handlers
        $('#dropdownSelected').on('click', function(e) {
            e.stopPropagation();
            toggleDropdown();
        });
        
        $('.dropdown-option').on('click', function() {
            const value = $(this).data('value');
            const text = $(this).text();
            selectDropdownOption(value, text);
        });
        
        // Close dropdown when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.custom-dropdown').length) {
                closeDropdown();
            }
        });
        
        // Timeline play button - dynamic handler
        $('#playTimelineBtn').on('click', function() {
            if (appState.timeline.isActive) {
                unlockTimeline();
            } else {
                showTimelineModal();
            }
        });
        
        // Modal controls
        $('#closeModal').on('click', hideTimelineModal);
        $('#cancelTimeline').on('click', hideTimelineModal);
        $('#startTimeline').on('click', startTimeline);
        
        // Audio player controls
        $('#closePlayer').on('click', closePlayer);
        $('#playPauseBtn').on('click', togglePlayPause);
        $('#rewind15').on('click', () => seekRelative(-15));
        $('#forward30').on('click', () => seekRelative(30));
        
        // Speed control
        $('#speedBtn').on('click', function(e) {
            e.stopPropagation();
            $('#speedOptions').toggleClass('active');
        });
        
        $('.speed-option').on('click', function() {
            const speed = parseFloat($(this).data('speed'));
            $('#speedBtn').text(speed.toFixed(1) + 'x');
            $('.speed-option').removeClass('active');
            $(this).addClass('active');
            $('#speedOptions').removeClass('active');
            
            if (appState.audio) {
                appState.audio.playbackRate = speed;
            }
        });
        
        // Close speed options when clicking outside
        $(document).on('click', function(e) {
            if (!$(e.target).closest('.speed-control').length) {
                $('#speedOptions').removeClass('active');
            }
        });
        
        // Progress bar
        $('#progressBar').on('click', function(e) {
            if (appState.audio) {
                const rect = this.getBoundingClientRect();
                const percent = (e.clientX - rect.left) / rect.width;
                appState.audio.currentTime = percent * appState.audio.duration;
            }
        });
        
        // Modal backdrop click
        $('.modal').on('click', function(e) {
            if (e.target === this) {
                hideTimelineModal();
            }
        });
    }

    function toggleDropdown() {
        const options = $('#dropdownOptions');
        const selected = $('#dropdownSelected');
        const arrow = $('#dropdownArrow');
        
        if (options.hasClass('active')) {
            closeDropdown();
        } else {
            options.addClass('active');
            selected.addClass('active');
            arrow.addClass('active');
        }
    }

    function closeDropdown() {
        $('#dropdownOptions').removeClass('active');
        $('#dropdownSelected').removeClass('active');
        $('#dropdownArrow').removeClass('active');
    }

    function selectDropdownOption(value, text) {
        // Update the visual display
        $('#dropdownSelected .dropdown-text').text(text);
        
        // Update the hidden select
        $('#sortBy').val(value);
        
        // Update option states
        $('.dropdown-option').removeClass('selected');
        $(`.dropdown-option[data-value="${value}"]`).addClass('selected');
        
        // Close dropdown
        closeDropdown();
        
        // Update app state and re-render
        appState.sortBy = value;
        saveStateToStorage();
        renderPodcasts();
    }

    function initializeSlider() {
        const slider = document.getElementById('year-slider');
        const handle = document.getElementById('slider-handle');
        const fill = document.getElementById('slider-fill');
        const track = slider.querySelector('.slider-track');
        
        let isDragging = false;
        let startX = 0;
        let currentX = 0;
        let sliderRect = null;
        let animationId = null;
        
        const minYear = 32;
        const maxYear = 432;
        const yearRange = maxYear - minYear;
        
        // Set initial position
        updateSliderPosition(appState.currentYear);
        
        // Cache slider rect and update on resize
        function updateSliderRect() {
            sliderRect = slider.getBoundingClientRect();
        }
        
        updateSliderRect();
        window.addEventListener('resize', updateSliderRect);
        
        // Mouse events
        handle.addEventListener('mousedown', startDrag);
        document.addEventListener('mousemove', drag);
        document.addEventListener('mouseup', endDrag);
        
        // Touch events
        handle.addEventListener('touchstart', startDrag, { passive: false });
        document.addEventListener('touchmove', drag, { passive: false });
        document.addEventListener('touchend', endDrag);
        document.addEventListener('touchcancel', endDrag);
        
        // Click on track to jump
        track.addEventListener('click', jumpToPosition);
        track.addEventListener('touchstart', jumpToPosition, { passive: false });
        
        function startDrag(e) {
            if (appState.timeline.isActive) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            isDragging = true;
            handle.classList.add('dragging');
            
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            startX = clientX;
            currentX = clientX;
            
            updateSliderRect();
            document.body.style.userSelect = 'none';
            document.body.style.webkitUserSelect = 'none';
            document.body.style.touchAction = 'none';
        }
        
        function drag(e) {
            if (!isDragging || appState.timeline.isActive) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const clientX = e.type === 'touchmove' ? e.touches[0].clientX : e.clientX;
            currentX = clientX;
            
            // Cancel previous animation frame
            if (animationId) {
                cancelAnimationFrame(animationId);
            }
            
            // Use requestAnimationFrame for smooth updates
            animationId = requestAnimationFrame(() => {
                updateSliderFromDrag(currentX);
            });
        }
        
        function endDrag(e) {
            if (!isDragging) return;
            
            e.preventDefault();
            isDragging = false;
            handle.classList.remove('dragging');
            
            document.body.style.userSelect = '';
            document.body.style.webkitUserSelect = '';
            document.body.style.touchAction = '';
            
            if (animationId) {
                cancelAnimationFrame(animationId);
                animationId = null;
            }
        }
        
        function jumpToPosition(e) {
            if (appState.timeline.isActive || e.target === handle) return;
            
            e.preventDefault();
            e.stopPropagation();
            
            const clientX = e.type === 'touchstart' ? e.touches[0].clientX : e.clientX;
            updateSliderFromDrag(clientX);
        }
        
        function updateSliderFromDrag(clientX) {
            if (!sliderRect) updateSliderRect();
            
            const offsetX = clientX - sliderRect.left;
            const percentage = Math.max(0, Math.min(100, (offsetX / sliderRect.width) * 100));
            const newYear = Math.round(minYear + (percentage / 100) * yearRange);
            
            // Update visual position immediately for smooth dragging
            handle.style.left = `${percentage}%`;
            fill.style.width = `${percentage}%`;
            
            // Update year display immediately
            $('.current-year').text(newYear);
            
            // Only update app state if year actually changed
            if (newYear !== appState.currentYear) {
                appState.currentYear = newYear;
                updateDynamicBackground(newYear);
                
                // Throttle the expensive operations
                clearTimeout(updateSliderFromDrag.timeout);
                updateSliderFromDrag.timeout = setTimeout(() => {
                    filterPodcastsByYear();
                    saveStateToStorage();
                }, 100);
            }
        }
        
        function updateSliderPosition(year) {
            const percentage = ((year - minYear) / yearRange) * 100;
            handle.style.left = `${percentage}%`;
            fill.style.width = `${percentage}%`;
        }
        
        // Store the update function for external use
        slider.updatePosition = updateSliderPosition;
        
        updateTimelineUI();
    }

    function updateYear(year) {
        appState.currentYear = year;
        $('.current-year').text(year);
        
        // Update slider position
        const slider = document.getElementById('year-slider');
        if (slider && slider.updatePosition) {
            slider.updatePosition(year);
        }
        
        updateDynamicBackground(year);
        filterPodcastsByYear();
        saveStateToStorage();
    }

    function updateDynamicBackground(year) {
        // Calculate progress from 32 AD to 432 AD (400 years total)
        const startYear = 32;
        const endYear = 432;
        const totalYears = endYear - startYear;
        const progress = Math.max(0, Math.min(1, (year - startYear) / totalYears));
        
        // Convert to actual year breakpoints
        const preDawnPoint = 50; // Pre-dawn (dark period)
        const dawnPoint = 120; // Dawn/sunrise
        const middayPoint = 170; // Deep sky/midday  
        const skyBluePoint = 320; // Sky blue
        const overcastPoint = 550; // Overcast (extends past 432)
        
        let gradient;
        let backgroundBrightness = 0; // 0 = dark, 1 = light
        
        if (year <= preDawnPoint) {
            // Pre-dawn: Very subtle shift in dark colors
            const localProgress = Math.max(0, Math.min(1, (year - startYear) / (preDawnPoint - startYear)));
            gradient = `linear-gradient(135deg, 
                ${interpolateColor('#1a1a2e', '#2a1b3d', localProgress)} 0%, 
                ${interpolateColor('#16213e', '#1f2742', localProgress)} 25%, 
                ${interpolateColor('#0f3460', '#1a3a65', localProgress)} 50%, 
                ${interpolateColor('#533483', '#5e3a8a', localProgress)} 75%, 
                ${interpolateColor('#7209b7', '#7c2d92', localProgress)} 100%)`;
            backgroundBrightness = 0.1 + (localProgress * 0.1); // Very dark
        } else if (year <= dawnPoint) {
            // Dark to Peach (pre-dawn to dawn)
            const localProgress = (year - preDawnPoint) / (dawnPoint - preDawnPoint);
            gradient = `linear-gradient(135deg, 
                ${interpolateColor('#2a1b3d', '#ffb38a', localProgress)} 0%, 
                ${interpolateColor('#1f2742', '#ffa366', localProgress)} 25%, 
                ${interpolateColor('#1a3a65', '#ff9a56', localProgress)} 50%, 
                ${interpolateColor('#5e3a8a', '#ff8c42', localProgress)} 75%, 
                ${interpolateColor('#7c2d92', '#ff7c33', localProgress)} 100%)`;
            backgroundBrightness = 0.2 + (localProgress * 0.3); // Dark to medium
        } else if (year <= middayPoint) {
            // Peach to Deep Blue (sunrise to deep sky)
            const localProgress = (year - dawnPoint) / (middayPoint - dawnPoint);
            gradient = `linear-gradient(135deg, 
                ${interpolateColor('#ffb38a', '#1e3a8a', localProgress)} 0%, 
                ${interpolateColor('#ffa366', '#1e40af', localProgress)} 25%, 
                ${interpolateColor('#ff9a56', '#2563eb', localProgress)} 50%, 
                ${interpolateColor('#ff8c42', '#3b82f6', localProgress)} 75%, 
                ${interpolateColor('#ff7c33', '#60a5fa', localProgress)} 100%)`;
            backgroundBrightness = 0.5 + (localProgress * 0.2); // Medium to bright
        } else if (year <= skyBluePoint) {
            // Deep Blue to Sky Blue (midday to afternoon)
            const localProgress = (year - middayPoint) / (skyBluePoint - middayPoint);
            gradient = `linear-gradient(135deg, 
                ${interpolateColor('#1e3a8a', '#0ea5e9', localProgress)} 0%, 
                ${interpolateColor('#1e40af', '#38bdf8', localProgress)} 25%, 
                ${interpolateColor('#2563eb', '#7dd3fc', localProgress)} 50%, 
                ${interpolateColor('#3b82f6', '#bae6fd', localProgress)} 75%, 
                ${interpolateColor('#60a5fa', '#e0f2fe', localProgress)} 100%)`;
            backgroundBrightness = 0.7 + (localProgress * 0.2); // Bright to very bright
        } else {
            // Sky Blue to Light Blue/Grey (afternoon to overcast)
            const localProgress = Math.min(1, (year - skyBluePoint) / (overcastPoint - skyBluePoint));
            gradient = `linear-gradient(135deg, 
                ${interpolateColor('#0ea5e9', '#cbd5e1', localProgress)} 0%, 
                ${interpolateColor('#38bdf8', '#e2e8f0', localProgress)} 25%, 
                ${interpolateColor('#7dd3fc', '#f1f5f9', localProgress)} 50%, 
                ${interpolateColor('#bae6fd', '#f8fafc', localProgress)} 75%, 
                ${interpolateColor('#e0f2fe', '#f0f9ff', localProgress)} 100%)`;
            backgroundBrightness = 0.9 + (localProgress * 0.1); // Very bright
        }
        
        // Update dynamic gradient
        document.documentElement.style.setProperty('--dynamic-gradient', gradient);
        
        // Update frost colors based on background brightness
        updateFrostColors(backgroundBrightness);
    }

    function updateFrostColors(brightness) {
        // Invert the frost opacity - darker background = lighter frost, lighter background = darker frost
        const frostOpacity = Math.max(0.05, Math.min(0.25, 0.25 - (brightness * 0.15)));
        const borderOpacity = Math.max(0.1, Math.min(0.5, 0.5 - (brightness * 0.35)));
        const backdropOpacity = Math.max(0.08, Math.min(0.35, 0.35 - (brightness * 0.25)));
        
        // For very bright backgrounds, use much darker frost
        if (brightness > 0.8) {
            document.documentElement.style.setProperty('--frost-color', `rgba(0, 0, 0, ${frostOpacity * 1.8})`);
            document.documentElement.style.setProperty('--frost-border', `rgba(0, 0, 0, ${borderOpacity * 1.5})`);
            document.documentElement.style.setProperty('--frost-backdrop', `rgba(0, 0, 0, ${backdropOpacity * 1.6})`);
        } else {
            // For darker backgrounds, use white frost
            document.documentElement.style.setProperty('--frost-color', `rgba(255, 255, 255, ${frostOpacity})`);
            document.documentElement.style.setProperty('--frost-border', `rgba(255, 255, 255, ${borderOpacity})`);
            document.documentElement.style.setProperty('--frost-backdrop', `rgba(255, 255, 255, ${backdropOpacity})`);
        }
    }

    function interpolateColor(color1, color2, factor) {
        // Convert hex colors to RGB
        const hex1 = color1.replace('#', '');
        const hex2 = color2.replace('#', '');
        
        const r1 = parseInt(hex1.substr(0, 2), 16);
        const g1 = parseInt(hex1.substr(2, 2), 16);
        const b1 = parseInt(hex1.substr(4, 2), 16);
        
        const r2 = parseInt(hex2.substr(0, 2), 16);
        const g2 = parseInt(hex2.substr(2, 2), 16);
        const b2 = parseInt(hex2.substr(4, 2), 16);
        
        // Interpolate
        const r = Math.round(r1 + (r2 - r1) * factor);
        const g = Math.round(g1 + (g2 - g1) * factor);
        const b = Math.round(b1 + (b2 - b1) * factor);
        
        // Convert back to hex
        const toHex = (n) => {
            const hex = n.toString(16);
            return hex.length === 1 ? '0' + hex : hex;
        };
        
        return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
    }

    function loadPodcasts() {
        // Load podcast data from global variable set by podcasts.js
        if (window.podcastData && window.podcastData.podcasts) {
            appState.podcasts = window.podcastData.podcasts;
            updatePodcastStatus();
            filterPodcastsByYear();
        } else {
            console.error('Podcast data not available. Make sure podcasts.js is loaded.');
            showError('Podcast data not available. Please refresh the page.');
            
            // Fallback: show empty state
            appState.podcasts = [];
            appState.filteredPodcasts = [];
            renderPodcasts();
        }
    }

    function setupAudioPlayer(podcast) {
        $('#playerTitle').text(podcast.title);
        $('#playerAuthor').text(podcast.primaryAuthor);
        
        // Create or update audio element
        if (appState.audio) {
            appState.audio.pause();
            appState.audio.removeEventListener('timeupdate', updateProgress);
            appState.audio.removeEventListener('ended', onAudioEnded);
            appState.audio.removeEventListener('loadedmetadata', onAudioLoaded);
        }
        
        appState.audio = new Audio(podcast.audioUrl);
        appState.audio.addEventListener('timeupdate', updateProgress);
        appState.audio.addEventListener('ended', onAudioEnded);
        appState.audio.addEventListener('loadedmetadata', function() {
            onAudioLoaded();
            // Restore saved position for this specific podcast version
            const savedPosition = appState.podcastPositions[podcast.versionId];
            if (savedPosition && savedPosition > 0) {
                appState.audio.currentTime = savedPosition;
                // No longer show notification for resume
            }
        });
        
        // Set initial speed
        const currentSpeed = parseFloat($('#speedBtn').text()) || 1.0;
        appState.audio.playbackRate = currentSpeed;
        
        // Set up Media Session API for iOS/mobile media controls
        if ('mediaSession' in navigator) {
            navigator.mediaSession.metadata = new MediaMetadata({
                title: podcast.title,
                artist: podcast.primaryAuthor,
                album: 'Early Christian Podcasts',
                artwork: [
                    {
                        src: '/icons/icon.svg',
                        sizes: '512x512',
                        type: 'image/svg+xml'
                    }
                ]
            });
            
            // Set up action handlers for media controls
            navigator.mediaSession.setActionHandler('play', () => {
                if (appState.audio && !appState.isPlaying) {
                    togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('pause', () => {
                if (appState.audio && appState.isPlaying) {
                    togglePlayPause();
                }
            });
            
            navigator.mediaSession.setActionHandler('seekbackward', () => {
                seekRelative(-15);
            });
            
            navigator.mediaSession.setActionHandler('seekforward', () => {
                seekRelative(30);
            });
            
            navigator.mediaSession.setActionHandler('previoustrack', null);
            navigator.mediaSession.setActionHandler('nexttrack', null);
        }
        
        // Reset play state
        appState.isPlaying = false;
        updatePlayButton();
    }

    function showAudioPlayer() {
        $('#audioPlayer').addClass('active');
    }

    function closePlayer() {
        $('#audioPlayer').removeClass('active');
        if (appState.audio) {
            // Save current position before closing
            if (appState.currentPodcast) {
                appState.podcastPositions[appState.currentPodcast.versionId] = appState.audio.currentTime;
            }
            appState.audio.pause();
            appState.isPlaying = false;
        }
        $('.podcast-card').removeClass('playing');
        appState.currentPodcast = null;
        updatePlayButton();
        saveStateToStorage();
    }

    function togglePlayPause() {
        if (!appState.audio) return;
        
        if (appState.isPlaying) {
            appState.audio.pause();
            appState.isPlaying = false;
            // Save position when pausing
            savePlaybackPosition();
        } else {
            appState.audio.play();
            appState.isPlaying = true;
        }
        updatePlayButton();
        
        // Save state whenever playback starts or stops
        saveStateToStorage();
    }

    function updatePlayButton() {
        $('#playPauseBtn').html(appState.isPlaying ? '<i class="fas fa-pause"></i>' : '<i class="fas fa-play"></i>');
    }

    function seekRelative(seconds) {
        if (appState.audio) {
            appState.audio.currentTime = Math.max(0, 
                Math.min(appState.audio.duration, appState.audio.currentTime + seconds));
        }
    }

    function updateProgress() {
        if (!appState.audio) return;
        
        const percent = (appState.audio.currentTime / appState.audio.duration) * 100;
        $('#progressFill').css('width', percent + '%');
        
        $('#currentTime').text(formatTime(appState.audio.currentTime));
        $('#totalTime').text(formatTime(appState.audio.duration));
        
        // Update Media Session API position state for iOS controls
        if ('mediaSession' in navigator && 'setPositionState' in navigator.mediaSession) {
            navigator.mediaSession.setPositionState({
                duration: appState.audio.duration,
                playbackRate: appState.audio.playbackRate,
                position: appState.audio.currentTime
            });
        }
        
        // Save position every 10 seconds during playback
        if (appState.isPlaying && Math.floor(appState.audio.currentTime) % 10 === 0) {
            savePlaybackPosition();
        }
    }

    function onAudioEnded() {
        appState.isPlaying = false;
        updatePlayButton();
        
        // Increment play counter when audio reaches the end
        if (appState.currentPodcast) {
            const versionId = appState.currentPodcast.versionId;
            appState.playCounters[versionId] = (appState.playCounters[versionId] || 0) + 1;
            saveStateToStorage();
            
            // Update the display immediately
            renderPodcasts();
        }
        
        // Don't auto-play next track - let user decide
    }

    function onAudioLoaded() {
        $('#totalTime').text(formatTime(appState.audio.duration));
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0 mins';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds - hours * 3600) / 60);
        const secs = Math.floor((seconds - hours * 3600) % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
    }

    function formatTimeSummary(seconds) {
        if (isNaN(seconds)) return '0';
        const hours = Math.floor(seconds / 3600);
        const mins = Math.floor((seconds - hours * 3600) / 60);
        if (hours > 0) {
            return `${hours}:${mins}`;
        } else {
            return `${mins}`;
        }
    }


    function showTimelineModal() {
        $('#timelineModal').addClass('active');
    }

    function hideTimelineModal() {
        $('#timelineModal').removeClass('active');
    }

    function startTimeline() {
        const pace = parseInt($('#paceSelect').val());
        
        appState.timeline = {
            isActive: true,
            pace: pace,
            lastUpdate: Date.now(),
            startYear: appState.currentYear
        };
        
        saveStateToStorage();
        hideTimelineModal();
        updateTimelineUI();
        
        // Show confirmation
        showNotification('Timeline started! Your year will advance automatically based on your selected pace.');
    }

    function unlockTimeline() {
        appState.timeline.isActive = false;
        saveStateToStorage();
        updateTimelineUI();
        showNotification('Timeline unlocked! You can now manually control the year slider.');
    }

    function updateTimelineUI() {
        const isActive = appState.timeline.isActive;
        const button = $('#playTimelineBtn');
        const sliderContainer = $('.slider-container');
        
        if (isActive) {
            button.html('<span class="play-icon">🔓</span> Unlock Timeline');
            button.addClass('timeline-active');
            sliderContainer.addClass('disabled');
        } else {
            button.html('<span class="play-icon">▶</span> Play Timeline');
            button.removeClass('timeline-active');
            sliderContainer.removeClass('disabled');
        }
    }

    function checkTimelineProgress() {
        if (!appState.timeline.isActive || !appState.timeline.lastUpdate) return;
        
        const now = Date.now();
        const timeSinceLastUpdate = now - appState.timeline.lastUpdate;
        const weeksPerDecade = appState.timeline.pace;
        const millisecondsPerWeek = 7 * 24 * 60 * 60 * 1000;
        const decadesPerWeek = 1 / weeksPerDecade;
        const yearsPerWeek = decadesPerWeek * 10;
        
        const weeksPassed = timeSinceLastUpdate / millisecondsPerWeek;
        const yearsToAdvance = Math.floor(weeksPassed * yearsPerWeek);
        
        if (yearsToAdvance > 0) {
            const newYear = Math.min(432, appState.currentYear + yearsToAdvance);
            if (newYear !== appState.currentYear) {
                updateYear(newYear);
                appState.timeline.lastUpdate = now;
                saveStateToStorage();
                
                // Check for new content
                const newPodcasts = appState.filteredPodcasts.filter(p => p.isNew).length;
                if (newPodcasts > 0) {
                    showNotification(`Timeline advanced to ${newYear} AD! ${newPodcasts} new podcast(s) available.`);
                }
            }
        }
    }

    function showNotification(message) {
        // Create a simple notification
        const notification = $(`
            <div class="notification" style="
                position: fixed;
                top: 20px;
                right: 20px;
                background: rgba(255, 255, 255, 0.9);
                color: #333;
                padding: 15px 20px;
                border-radius: 10px;
                box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
                z-index: 3000;
                max-width: 300px;
                opacity: 0;
                transform: translateX(100%);
                transition: all 0.3s ease;
            ">
                ${message}
            </div>
        `);
        
        $('body').append(notification);
        
        // Animate in
        setTimeout(() => {
            notification.css({
                opacity: 1,
                transform: 'translateX(0)'
            });
        }, 100);
        
        // Remove after 5 seconds
        setTimeout(() => {
            notification.css({
                opacity: 0,
                transform: 'translateX(100%)'
            });
            setTimeout(() => notification.remove(), 300);
        }, 5000);
    }

    function showError(message) {
        console.error(message);
        showNotification('Error: ' + message);
    }

    function updatePodcastStatus() {
        // Update podcast status based on play history
        appState.podcasts.forEach(podcast => {
            podcast.versions.forEach(version => {
                const versionKey = `${podcast.id}-${version.versionId}`;
                version.isPlayed = appState.playedPodcasts.has(versionKey);
            });
        });
    }

    function filterPodcastsByYear() {
        appState.filteredPodcasts = [];
        
        appState.podcasts.forEach(podcast => {
            // Find versions available to current perspective and within current year
            const availableVersions = podcast.versions.filter(v => {
                // Check if version is available to current perspective
                const perspectiveAllowed = !v.perspectives || v.perspectives.includes(appState.datePerspective);
                
                // Check if version is within current year - use updateDates if available, otherwise use regular dates
                const effectiveDate = v.updateDates && v.updateDates[appState.datePerspective] 
                    ? v.updateDates[appState.datePerspective] 
                    : v.dates[appState.datePerspective];
                const dateAllowed = effectiveDate <= appState.currentYear;
                
                return perspectiveAllowed && dateAllowed;
            });
            
            if (availableVersions.length > 0) {
                // Get the most recent version based on effective dates (updateDates or regular dates)
                const latestVersion = availableVersions.reduce((latest, current) => {
                    const latestEffectiveDate = latest.updateDates && latest.updateDates[appState.datePerspective]
                        ? latest.updateDates[appState.datePerspective]
                        : latest.dates[appState.datePerspective];
                    const currentEffectiveDate = current.updateDates && current.updateDates[appState.datePerspective]
                        ? current.updateDates[appState.datePerspective] 
                        : current.dates[appState.datePerspective];
                    
                    return currentEffectiveDate > latestEffectiveDate ? current : latest;
                });
                
                // Create a combined podcast object for display
                const displayPodcast = {
                    id: podcast.id,
                    title: podcast.title,
                    authors: podcast.authors,
                    primaryAuthor: podcast.authors[appState.datePerspective],
                    description: latestVersion.description,
                    audioUrl: latestVersion.audioUrl,
                    duration: latestVersion.duration,
                    dates: latestVersion.dates,
                    primaryDate: latestVersion.dates[appState.datePerspective], // Always use original dates for display
                    versionId: latestVersion.versionId,
                    versionNote: latestVersion.versionNote,
                    versions: availableVersions,
                    isCanon: podcast.isCanon,
                    sortIndex: podcast.sortIndex
                };
                
                // Determine badge status - only consider versions available to current perspective
                const versionKey = `${podcast.id}-${latestVersion.versionId}`;
                const hasPlayedCurrentVersion = appState.playedPodcasts.has(versionKey);
                
                // Check if user has played any version available to current perspective
                const hasPlayedAnyAvailableVersion = availableVersions.some(v => 
                    appState.playedPodcasts.has(`${podcast.id}-${v.versionId}`)
                );
                
                if (!hasPlayedAnyAvailableVersion) {
                    displayPodcast.badge = 'new';
                } else if (!hasPlayedCurrentVersion) {
                    displayPodcast.badge = 'updated';
                } else {
                    displayPodcast.badge = null;
                }
                
                appState.filteredPodcasts.push(displayPodcast);
            }
        });
        
        renderPodcasts();
    }

    function renderPodcasts() {
        const container = $('#podcast-list');
        container.empty();
        
        if (appState.filteredPodcasts.length === 0) {
            container.html('<p class="no-podcasts">No podcasts available for this year.</p>');
            return;
        }
        
        // Sort podcasts based on selected criteria
        const sortedPodcasts = [...appState.filteredPodcasts].sort((a, b) => {
            switch (appState.sortBy) {
                case 'title':
                    const titleCompare = a.title.localeCompare(b.title);
                    return titleCompare !== 0 ? titleCompare : (a.sortIndex || 0) - (b.sortIndex || 0);
                case 'author':
                    const authorCompare = a.primaryAuthor.localeCompare(b.primaryAuthor);
                    return authorCompare !== 0 ? authorCompare : (a.sortIndex || 0) - (b.sortIndex || 0);
                case 'oldest':
                    const oldestDateCompare = a.primaryDate - b.primaryDate;
                    return oldestDateCompare !== 0 ? oldestDateCompare : (a.sortIndex || 0) - (b.sortIndex || 0);
                case 'plays':
                    const aPlayCount = appState.playCounters[a.versionId] || 0;
                    const bPlayCount = appState.playCounters[b.versionId] || 0;
                    const playCountCompare = aPlayCount - bPlayCount; // Least played first
                    return playCountCompare !== 0 ? playCountCompare : (a.sortIndex || 0) - (b.sortIndex || 0);
                case 'newest':
                default:
                    const newestDateCompare = b.primaryDate - a.primaryDate;
                    return newestDateCompare !== 0 ? newestDateCompare : (b.sortIndex || 0) - (a.sortIndex || 0);
            }
        });
        
        sortedPodcasts.forEach(podcast => {
            const isCurrentlyPlaying = appState.currentPodcast && 
                             appState.currentPodcast.id === podcast.id &&
                             appState.currentPodcast.versionId === podcast.versionId;
            
            const badgeHtml = podcast.badge ? `<span class="badge ${podcast.badge}">${podcast.badge}</span>` : '';
            const canonBadge = podcast.isCanon ? `<span class="badge canon">Canon</span>` : '';
            const playingClass = isCurrentlyPlaying ? 'playing' : '';
            
            // Determine authorship colors based on current perspective
            const isPaulAuthor = podcast.primaryAuthor === 'Paul the Apostle';
            let authorshipColors;
            
            if (isPaulAuthor) {
                // Gold/amber tones for Paul
                authorshipColors = {
                    background: 'linear-gradient(135deg, rgba(255, 193, 7, 0.15) 0%, rgba(255, 171, 0, 0.1) 100%), var(--frost-color)',
                    border: 'rgba(255, 193, 7, 0.25)',
                    hoverBackground: 'linear-gradient(135deg, rgba(255, 193, 7, 0.2) 0%, rgba(255, 171, 0, 0.15) 100%), rgba(255, 255, 255, 0.12)',
                    hoverBorder: 'rgba(255, 193, 7, 0.35)',
                    hoverShadow: '0 8px 32px rgba(255, 193, 7, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                };
            } else {
                // Teal/cyan tones for non-Paul
                authorshipColors = {
                    background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.15) 0%, rgba(6, 182, 212, 0.1) 100%), var(--frost-color)',
                    border: 'rgba(20, 184, 166, 0.25)',
                    hoverBackground: 'linear-gradient(135deg, rgba(20, 184, 166, 0.2) 0%, rgba(6, 182, 212, 0.15) 100%), rgba(255, 255, 255, 0.12)',
                    hoverBorder: 'rgba(20, 184, 166, 0.35)',
                    hoverShadow: '0 8px 32px rgba(20, 184, 166, 0.2), inset 0 1px 0 rgba(255, 255, 255, 0.2)'
                };
            }
            
            // Create compact alternative display for other perspectives
            const alternativeDisplay = createCompactAlternativeDisplay(podcast.authors, podcast.dates, appState.datePerspective);
            
            // Get progress time for this podcast version
            const savedPosition = appState.podcastPositions[podcast.versionId] || 0;
            const durationDisplay = getDurationDisplay(savedPosition, podcast.duration);
            const playCountDisplay = getPlayCountDisplay(podcast.versionId);
            
            const card = $(`
                <div class="podcast-card ${playingClass}" 
                     data-id="${podcast.id}" 
                     data-version-id="${podcast.versionId}"
                     style="background: ${authorshipColors.background}; border-color: ${authorshipColors.border};">
                    <div class="badge-container">
                        ${badgeHtml}
                        ${canonBadge}
                    </div>
                    <div class="podcast-info">
                        <h3 class="podcast-title">${podcast.title}</h3>
                        <div class="podcast-authorship">
                            <div class="primary-info">
                                <span class="primary-author">${podcast.primaryAuthor}</span>
                                <span class="date-separator">•</span>
                                <span class="primary-date">${podcast.primaryDate} AD</span>
                            </div>
                            <div class="alternative-info">
                                ${alternativeDisplay}
                            </div>
                        </div>
                        <p class="podcast-description">${podcast.description}</p>
                        ${podcast.versionNote && podcast.versionNote.trim() ? `<p class="version-note">${podcast.versionNote}</p>` : ''}
                    </div>
                    <div class="podcast-meta">
                        ${playCountDisplay ? `<div class="play-count">${playCountDisplay}</div>` : ''}
                        <span class="podcast-duration">${durationDisplay}</span>
                    </div>
                </div>
            `);
            
            // Add hover effects with authorship colors
            card.hover(
                function() {
                    if (!$(this).hasClass('playing')) {
                        $(this).css({
                            'background': authorshipColors.hoverBackground,
                            'border-color': authorshipColors.hoverBorder,
                            'box-shadow': authorshipColors.hoverShadow
                        });
                    }
                },
                function() {
                    if (!$(this).hasClass('playing')) {
                        $(this).css({
                            'background': authorshipColors.background,
                            'border-color': authorshipColors.border,
                            'box-shadow': '0 4px 16px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.15)'
                        });
                    }
                }
            );
            
            container.append(card);
        });
        
        // Add click handlers
        $('.podcast-card').on('click', function() {
            const podcastId = $(this).data('id');
            const versionId = $(this).data('version-id');
            const podcast = appState.filteredPodcasts.find(p => p.id === podcastId && p.versionId === versionId);
            
            if (podcast) {
                selectPodcast(podcast);
            }
        });
    }

    function getDurationDisplay(currentTime, totalDuration) {
        // Show progress if at least 1 minute in and at least 1 minute from the end
        const minThreshold = 60; // 1 minute
        const maxThreshold = totalDuration - 60; // 1 minute from end
        
        if (currentTime >= minThreshold && currentTime <= maxThreshold) {
            return `${formatTimeSummary(currentTime)} / ${formatTimeSummary(totalDuration)} mins`;
        }
        
        // Otherwise just show total duration
        return `${formatTimeSummary(totalDuration)} mins`;
    }

    function getPlayCountDisplay(versionId) {
        const playCount = appState.playCounters[versionId] || 0;
        return playCount > 0 ? `<i class="fas fa-headphones"></i> ${playCount}` : '';
    }

    function createCompactAlternativeDisplay(authors, dates, primaryPerspective) {
        const perspectives = ['scholarly', 'moderate', 'traditional'];
        const otherPerspectives = perspectives.filter(p => p !== primaryPerspective);
        
        return otherPerspectives.map(perspective => {
            const label = perspective.charAt(0).toUpperCase() + perspective.slice(1);
            return `<span class="alt-perspective">${label}: ${authors[perspective]} • ${dates[perspective]} AD</span>`;
        }).join('');
    }

    function selectPodcast(podcast) {
        // Mark podcast as played immediately when selected
        const versionKey = `${podcast.id}-${podcast.versionId}`;
        appState.playedPodcasts.add(versionKey);
        
        // Save the current position of the previous podcast if it exists
        if (appState.currentPodcast && appState.audio) {
            appState.podcastPositions[appState.currentPodcast.versionId] = appState.audio.currentTime;
        }
        
        // Update current podcast
        appState.currentPodcast = podcast;
        
        // Update UI
        $('.podcast-card').removeClass('playing');
        $(`.podcast-card[data-id="${podcast.id}"][data-version-id="${podcast.versionId}"]`).addClass('playing');
        
        // Remove new/updated badges immediately (but keep canon badge)
        const cardElement = $(`.podcast-card[data-id="${podcast.id}"][data-version-id="${podcast.versionId}"]`);
        cardElement.find('.badge.new, .badge.updated').remove();
        
        // Setup audio player
        setupAudioPlayer(podcast);
        showAudioPlayer();
        
        // Auto-play the podcast immediately
        if (appState.audio) {
            appState.audio.play().then(() => {
                appState.isPlaying = true;
                updatePlayButton();
            }).catch(error => {
                console.error('Auto-play failed:', error);
                // Auto-play might be blocked by browser policy, user can manually click play
            });
        }
        
        // Save state
        saveStateToStorage();
    }

    // Update the save position logic to save for each podcast version
    function savePlaybackPosition() {
        if (appState.currentPodcast && appState.audio) {
            appState.podcastPositions[appState.currentPodcast.versionId] = appState.audio.currentTime;
            saveStateToStorage();
        }
    }
// Ensure positions are saved when the page is about to close
    $(window).on('beforeunload', function() {
        savePlaybackPosition();
    });

    // Also save positions when the page loses focus
    $(window).on('blur', function() {
        savePlaybackPosition();
    });

    // Check timeline progress every minute
    setInterval(checkTimelineProgress, 60000);// Check timeline progress every minute

    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        if (!appState.audio) return;

        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;se();
            case 'ArrowLeft':
                e.preventDefault();
                seekRelative(-15);
                break;
            case 'ArrowRight':
                e.preventDefault();
                seekRelative(30);
                break;
        }
    });     
});

