// Podcast data for Early Christian Podcasts app
window.podcastData = {
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
                    "perspectives": ["scholarly", "moderate", "traditional"], // Available to all perspectives
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
                    "perspectives": ["scholarly"], // Only available to scholarly perspective
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly"], // Only available to scholarly perspective
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly"], // Only available to scholarly perspective
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate"], // Not available to traditional perspective
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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
                    "perspectives": ["scholarly", "moderate", "traditional"],
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