import uuid

MOCK_GENERATE = {
    "project_id": str(uuid.uuid4()),
    "screenplay": """INT. POLICE STATION - NIGHT

The fluorescent lights buzz overhead. INSPECTOR ARYAN (40s, weary) stares at the corkboard.

                    ARYAN
          It's always the same pattern.
          They never leave a trace.

CONSTABLE RAO enters, holding a file.

                    RAO
          Sir, another one. Same MO.

Aryan slams his fist on the desk.

                    ARYAN
          Not tonight.

EXT. HYDERABAD STREETS - LATER

Rain pours down as Aryan's jeep speeds through the neon-lit streets.""",
    "scene_count": 2,
    "characters": [
        {
            "name": "ARYAN",
            "role": "PROTAGONIST",
            "bio": "A hardened inspector with a troubled past. Haunted by the cases he couldn't solve.",
            "arc": "REDEMPTION ARC"
        },
        {
            "name": "RAO",
            "role": "SUPPORTING",
            "bio": "Young and idealistic constable. Still believes in the system.",
            "arc": "COMING OF AGE"
        }
    ]
}

MOCK_ANALYZE = {
    "health_score": 74,
    "pacing_score": 68,
    "balance_score": 81,
    "tension_score": 72,
    "tension_curve": [
        { "scene": 1, "score": 45 },
        { "scene": 2, "score": 85 }
    ],
    "character_heatmap": {
        "ARYAN": { "act1": 90, "act2": 85, "act3": 95 },
        "RAO": { "act1": 60, "act2": 80, "act3": 40 }
    },
    "pacing_blocks": [
        { "scene": 1,  "speed": "slow" },
        { "scene": 2,  "speed": "fast" }
    ],
    "flags": [
        {
            "scene_range": "1-1",
            "issue": "Slow opening",
            "suggestion": "Start with more action, maybe the crime scene."
        }
    ]
}

MOCK_MOODBOARD = {
    "image_url": "https://image.pollinations.ai/prompt/cinematic+dark+film+still?width=1024&height=576&nologo=true",
    "caption": "ACT 1 — ESTABLISH"
}

MOCK_TRANSLATE = {
    "translated_screenplay": """INT. POLICE STATION - NIGHT

The fluorescent lights buzz overhead. INSPECTOR ARYAN (40s, weary) stares at the corkboard.

                    ARYAN
          hamesha ek hi pattern hota hai.
          kabhi koi nishaan nahi chhodte.

CONSTABLE RAO enters, holding a file.

                    RAO
          Sir, ek aur. Same MO.

Aryan slams his fist on the desk.

                    ARYAN
          aaj raat nahi.

EXT. HYDERABAD STREETS - LATER

Rain pours down as Aryan's jeep speeds through the neon-lit streets.""",
    "language": "Hindi",
    "note": "Culturally Generated — Not Translated"
}
