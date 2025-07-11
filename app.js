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
        checkTimelineProgress();
        
        // Don't auto-restore podcast on page load
        // Users can manually select what they want to play
    }
    
    function updateUIControls() {
        // Set the perspective buttons
        $('.perspective-btn').removeClass('active');
        $(`.perspective-btn[data-perspective="${appState.datePerspective}"]`).addClass('active');
        
        // Set the sort selector
        $('#sortBy').val(appState.sortBy);
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
        
        // Sort selector
        $('#sortBy').on('change', function() {
            appState.sortBy = $(this).val();
            saveStateToStorage();
            renderPodcasts();
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

    function initializeSlider() {
        $("#year-slider").slider({
            range: "min",
            value: appState.currentYear,
            min: 32,
            max: 432,
            slide: function(event, ui) {
                if (appState.timeline.isActive) {
                    return false; // Prevent slider interaction when timeline is active
                }
                updateYear(ui.value);
            }
        });
        
        updateYear(appState.currentYear);
        updateTimelineUI();
    }

    function updateYear(year) {
        appState.currentYear = year;
        $('.current-year').text(year);
        $("#year-slider").slider("value", year);
        filterPodcastsByYear();
        saveStateToStorage();
    }

    function loadPodcasts() {
        // Embed podcast data with multiple dating perspectives
        const podcastData = {
            "podcasts": [
                {
                    "id": "didache",
                    "title": "The Didache",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Unknown (Apostolic Community)",
                        "moderate": "The Twelve Apostles",
                        "traditional": "The Twelve Apostles"
                    },
                    "versions": [
                        {
                            "versionId": "didache-v1",
                            "dates": {
                                "scholarly": 70,
                                "moderate": 60,
                                "traditional": 50
                            },
                            "description": "Teaching of the Twelve Apostles - early Christian manual on morality and church organization",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 3600,
                            "versionNote": "Original manuscript discovery"
                        },
                        {
                            "versionId": "didache-v2",
                            "dates": {
                                "scholarly": 200,
                                "moderate": 180,
                                "traditional": 160
                            },
                            "description": "Teaching of the Twelve Apostles - expanded edition with liturgical commentary",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 4800,
                            "versionNote": "With scholarly commentary"
                        }
                    ]
                },
                {
                    "id": "gospel-john",
                    "title": "The Gospel of John",
                    "isCanon": true,
                    "authors": {
                        "scholarly": "Johannine Community",
                        "moderate": "John the Apostle (school)",
                        "traditional": "John the Apostle"
                    },
                    "versions": [
                        {
                            "versionId": "gospel-john-v1",
                            "dates": {
                                "scholarly": 100,
                                "moderate": 95,
                                "traditional": 85
                            },
                            "description": "The fourth gospel, emphasizing Jesus as the Word of God",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 7200,
                            "versionNote": "Original text"
                        }
                    ]
                },
                {
                    "id": "clement-rome",
                    "title": "First Letter of Clement",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Clement of Rome",
                        "moderate": "Clement of Rome",
                        "traditional": "Clement of Rome"
                    },
                    "versions": [
                        {
                            "versionId": "clement-rome-v1",
                            "dates": {
                                "scholarly": 96,
                                "moderate": 96,
                                "traditional": 96
                            },
                            "description": "Letter to the Corinthians from the Bishop of Rome addressing church divisions",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 5400,
                            "versionNote": "Original letter"
                        },
                        {
                            "versionId": "clement-rome-v2",
                            "dates": {
                                "scholarly": 150,
                                "moderate": 145,
                                "traditional": 140
                            },
                            "description": "First Letter of Clement - annotated edition with historical context",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 6900,
                            "versionNote": "With historical annotations"
                        }
                    ]
                },
                {
                    "id": "ignatius-letters",
                    "title": "Letters of Ignatius",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Ignatius of Antioch",
                        "moderate": "Ignatius of Antioch",
                        "traditional": "Ignatius of Antioch"
                    },
                    "versions": [
                        {
                            "versionId": "ignatius-letters-v1",
                            "dates": {
                                "scholarly": 110,
                                "moderate": 108,
                                "traditional": 105
                            },
                            "description": "Seven letters written on the way to martyrdom, emphasizing episcopal authority",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 6300,
                            "versionNote": "Original collection"
                        }
                    ]
                },
                {
                    "id": "justin-apology",
                    "title": "First Apology of Justin Martyr",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Justin Martyr",
                        "moderate": "Justin Martyr",
                        "traditional": "Justin Martyr"
                    },
                    "versions": [
                        {
                            "versionId": "justin-apology-v1",
                            "dates": {
                                "scholarly": 155,
                                "moderate": 155,
                                "traditional": 155
                            },
                            "description": "Defense of Christian faith to Emperor Antoninus Pius",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 8100,
                            "versionNote": "Original apology"
                        }
                    ]
                },
                {
                    "id": "polycarp-martyrdom",
                    "title": "Martyrdom of Polycarp",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Church of Smyrna",
                        "moderate": "Church of Smyrna",
                        "traditional": "Church of Smyrna"
                    },
                    "versions": [
                        {
                            "versionId": "polycarp-martyrdom-v1",
                            "dates": {
                                "scholarly": 156,
                                "moderate": 156,
                                "traditional": 156
                            },
                            "description": "Eyewitness account of the martyrdom of Bishop Polycarp",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 2700,
                            "versionNote": "Eyewitness account"
                        }
                    ]
                },
                {
                    "id": "irenaeus-heresies",
                    "title": "Against Heresies",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Irenaeus of Lyon",
                        "moderate": "Irenaeus of Lyon",
                        "traditional": "Irenaeus of Lyon"
                    },
                    "versions": [
                        {
                            "versionId": "irenaeus-heresies-v1",
                            "dates": {
                                "scholarly": 180,
                                "moderate": 180,
                                "traditional": 180
                            },
                            "description": "Comprehensive refutation of Gnostic teachings and defense of orthodox Christianity",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 12600,
                            "versionNote": "Original work"
                        },
                        {
                            "versionId": "irenaeus-heresies-v2",
                            "dates": {
                                "scholarly": 250,
                                "moderate": 245,
                                "traditional": 240
                            },
                            "description": "Against Heresies - complete edition with newly discovered fragments",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 15300,
                            "versionNote": "Complete edition with fragments"
                        }
                    ]
                },
                {
                    "id": "tertullian-apologeticus",
                    "title": "Apologeticus",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Tertullian",
                        "moderate": "Tertullian",
                        "traditional": "Tertullian"
                    },
                    "versions": [
                        {
                            "versionId": "tertullian-apologeticus-v1",
                            "dates": {
                                "scholarly": 197,
                                "moderate": 197,
                                "traditional": 197
                            },
                            "description": "Passionate defense of Christians against Roman accusations and persecution",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 6900,
                            "versionNote": "Original defense"
                        }
                    ]
                },
                {
                    "id": "clement-alexandria",
                    "title": "The Stromata",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Clement of Alexandria",
                        "moderate": "Clement of Alexandria",
                        "traditional": "Clement of Alexandria"
                    },
                    "versions": [
                        {
                            "versionId": "clement-alexandria-v1",
                            "dates": {
                                "scholarly": 208,
                                "moderate": 205,
                                "traditional": 200
                            },
                            "description": "Miscellanies on Christian philosophy, culture, and the relationship between faith and reason",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 14400,
                            "versionNote": "Original collection"
                        }
                    ]
                },
                {
                    "id": "origen-principles",
                    "title": "On First Principles",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Origen",
                        "moderate": "Origen",
                        "traditional": "Origen"
                    },
                    "versions": [
                        {
                            "versionId": "origen-principles-v1",
                            "dates": {
                                "scholarly": 230,
                                "moderate": 230,
                                "traditional": 230
                            },
                            "description": "Systematic theology and biblical interpretation methodology",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 16200,
                            "versionNote": "Original work"
                        },
                        {
                            "versionId": "origen-principles-v2",
                            "dates": {
                                "scholarly": 300,
                                "moderate": 295,
                                "traditional": 290
                            },
                            "description": "On First Principles - revised edition with additional theological insights",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 19800,
                            "versionNote": "Expanded theological edition"
                        }
                    ]
                },
                {
                    "id": "cyprian-unity",
                    "title": "On the Unity of the Church",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Cyprian of Carthage",
                        "moderate": "Cyprian of Carthage",
                        "traditional": "Cyprian of Carthage"
                    },
                    "versions": [
                        {
                            "versionId": "cyprian-unity-v1",
                            "dates": {
                                "scholarly": 251,
                                "moderate": 251,
                                "traditional": 251
                            },
                            "description": "Treatise on church unity and episcopal authority during the Decian persecution",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 4500,
                            "versionNote": "Original treatise"
                        }
                    ]
                },
                {
                    "id": "athanasius-incarnation",
                    "title": "On the Incarnation",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Athanasius of Alexandria",
                        "moderate": "Athanasius of Alexandria",
                        "traditional": "Athanasius of Alexandria"
                    },
                    "versions": [
                        {
                            "versionId": "athanasius-incarnation-v1",
                            "dates": {
                                "scholarly": 318,
                                "moderate": 320,
                                "traditional": 315
                            },
                            "description": "Classic theological work on the incarnation of Christ and its necessity for salvation",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 7800,
                            "versionNote": "Original work"
                        }
                    ]
                },
                {
                    "id": "chrysostom-homilies",
                    "title": "Homilies on Matthew",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "John Chrysostom",
                        "moderate": "John Chrysostom",
                        "traditional": "John Chrysostom"
                    },
                    "versions": [
                        {
                            "versionId": "chrysostom-homilies-v1",
                            "dates": {
                                "scholarly": 390,
                                "moderate": 390,
                                "traditional": 390
                            },
                            "description": "Eloquent sermons on the Gospel of Matthew, known for their practical application",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 18000,
                            "versionNote": "Original sermon collection"
                        }
                    ]
                },
                {
                    "id": "augustine-confessions",
                    "title": "The Confessions",
                    "isCanon": false,
                    "authors": {
                        "scholarly": "Augustine of Hippo",
                        "moderate": "Augustine of Hippo",
                        "traditional": "Augustine of Hippo"
                    },
                    "versions": [
                        {
                            "versionId": "augustine-confessions-v1",
                            "dates": {
                                "scholarly": 400,
                                "moderate": 400,
                                "traditional": 400
                            },
                            "description": "Autobiographical work detailing spiritual journey and theological reflections",
                            "audioUrl": "https://www.soundjay.com/misc/sounds/bell-ringing-05.wav",
                            "duration": 21600,
                            "versionNote": "Original autobiography"
                        }
                    ]
                }
            ]
        };
        
        appState.podcasts = podcastData.podcasts;
        updatePodcastStatus();
        filterPodcastsByYear();
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
                showNotification(`Resumed from ${formatTime(savedPosition)}`);
            }
        });
        
        // Set initial speed
        const currentSpeed = parseFloat($('#speedBtn').text()) || 1.0;
        appState.audio.playbackRate = currentSpeed;
        
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
        $('#playPauseBtn').text(appState.isPlaying ? '⏸' : '▶');
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
        
        // Save position every 10 seconds during playback
        if (appState.isPlaying && Math.floor(appState.audio.currentTime) % 10 === 0) {
            savePlaybackPosition();
        }
    }

    function onAudioEnded() {
        appState.isPlaying = false;
        updatePlayButton();
        // Don't auto-play next track - let user decide
    }

    function onAudioLoaded() {
        $('#totalTime').text(formatTime(appState.audio.duration));
    }

    function formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return mins + ':' + (secs < 10 ? '0' : '') + secs;
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
        const slider = $('#year-slider');
        
        if (isActive) {
            button.html('<span class="play-icon">🔓</span> Unlock Timeline');
            button.addClass('timeline-active');
            slider.slider('disable');
            $('.slider-container').addClass('disabled');
        } else {
            button.html('<span class="play-icon">▶</span> Play Timeline');
            button.removeClass('timeline-active');
            slider.slider('enable');
            $('.slider-container').removeClass('disabled');
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
            // Find the most recent version available in the current year
            const availableVersions = podcast.versions.filter(v => 
                v.dates[appState.datePerspective] <= appState.currentYear
            );
            
            if (availableVersions.length > 0) {
                // Get the most recent version based on selected date perspective
                const latestVersion = availableVersions.reduce((latest, current) => 
                    current.dates[appState.datePerspective] > latest.dates[appState.datePerspective] ? current : latest
                );
                
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
                    primaryDate: latestVersion.dates[appState.datePerspective],
                    versionId: latestVersion.versionId,
                    versionNote: latestVersion.versionNote,
                    versions: availableVersions,
                    isCanon: podcast.isCanon
                };
                
                // Determine badge status
                const versionKey = `${podcast.id}-${latestVersion.versionId}`;
                const hasPlayedCurrentVersion = appState.playedPodcasts.has(versionKey);
                const hasPlayedAnyVersion = podcast.versions.some(v => 
                    appState.playedPodcasts.has(`${podcast.id}-${v.versionId}`)
                );
                
                if (!hasPlayedAnyVersion) {
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
                    return titleCompare !== 0 ? titleCompare : b.primaryDate - a.primaryDate;
                case 'author':
                    const authorCompare = a.primaryAuthor.localeCompare(b.primaryAuthor);
                    return authorCompare !== 0 ? authorCompare : b.primaryDate - a.primaryDate;
                case 'oldest':
                    return a.primaryDate - b.primaryDate;
                case 'newest':
                default:
                    return b.primaryDate - a.primaryDate;
            }
        });
        
        sortedPodcasts.forEach(podcast => {
            const isCurrentlyPlaying = appState.currentPodcast && 
                                     appState.currentPodcast.id === podcast.id &&
                                     appState.currentPodcast.versionId === podcast.versionId;
            
            const badgeHtml = podcast.badge ? `<span class="badge ${podcast.badge}">${podcast.badge}</span>` : '';
            const canonBadge = podcast.isCanon ? `<span class="badge canon">Canon</span>` : '';
            const playingClass = isCurrentlyPlaying ? 'playing' : '';
            
            // Create combined author and date display for alternative perspectives
            const alternativeDisplay = createAlternativeDisplay(podcast.authors, podcast.dates, appState.datePerspective);
            
            const card = $(`
                <div class="podcast-card ${playingClass}" data-id="${podcast.id}" data-version-id="${podcast.versionId}">
                    <div class="badge-container">
                        ${badgeHtml}
                        ${canonBadge}
                    </div>
                    <div class="podcast-info">
                        <h3 class="podcast-title">${podcast.title}</h3>
                        <div class="podcast-authorship">
                            <div class="primary-info">
                                <span class="primary-author">${podcast.primaryAuthor}</span>
                                <span class="primary-date">${podcast.primaryDate} AD</span>
                            </div>
                            <div class="alternative-info">
                                ${alternativeDisplay}
                            </div>
                        </div>
                        <p class="podcast-description">${podcast.description}</p>
                        <div class="podcast-meta">
                            <span class="podcast-duration">${formatTime(podcast.duration)}</span>
                        </div>
                        ${podcast.versionNote ? `<p class="version-note">${podcast.versionNote}</p>` : ''}
                    </div>
                </div>
            `);
            
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
    
    function createAlternativeDisplay(authors, dates, primaryPerspective) {
        const perspectives = ['scholarly', 'moderate', 'traditional'];
        const otherPerspectives = perspectives.filter(p => p !== primaryPerspective);
        
        return otherPerspectives.map(perspective => {
            const label = perspective.charAt(0).toUpperCase() + perspective.slice(1);
            return `<span class="alt-perspective">${label}: ${authors[perspective]} • ${dates[perspective]} AD</span>`;
        }).join('<br>');
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
    setInterval(checkTimelineProgress, 60000);
    
    // Keyboard shortcuts
    $(document).on('keydown', function(e) {
        if (!appState.audio) return;
        
        switch(e.key) {
            case ' ':
                e.preventDefault();
                togglePlayPause();
                break;
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
