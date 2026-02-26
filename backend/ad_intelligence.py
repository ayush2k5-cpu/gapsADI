def build_analysis_prompt(screenplay: str, characters: list) -> str:
    character_names = [c.get("name") for c in characters] if characters else []
    scene_count = screenplay.count("INT.") + screenplay.count("EXT.")
    if scene_count == 0:
        scene_count = 1  # Fallback

    return f"""
You are an expert Assistant Director analyzing a screenplay for a film production.

Analyze the following screenplay and return ONLY valid JSON matching this exact schema:
{{
  "pacing_score": <integer 0-100>,
  "balance_score": <integer 0-100>,
  "tension_score": <integer 0-100>,
  "tension_curve": [{{"scene": <int>, "score": <int 0-100>}} for each of {scene_count} scenes],
  "character_heatmap": {{
    "<character_name>": {{"act1": <int 0-100>, "act2": <int 0-100>, "act3": <int 0-100>}}
    for each of these characters: {character_names}
  }},
  "pacing_blocks": [{{"scene": <int>, "speed": "fast|medium|slow"}} for each of {scene_count} scenes],
  "flags": [{{"scene_range": "<X-Y>", "issue": "<description>", "suggestion": "<fix>"}}]
            (empty array [] if no issues found)
}}

Scoring guidelines:
- pacing_score: 100 = perfect rhythm throughout, 0 = severe pacing issues
- balance_score: 100 = all major characters well distributed, 0 = protagonist dominates every scene
- tension_score: 100 = perfect dramatic arc, natural peak-valley-resolution, 0 = flat tension throughout
- tension_curve: each scene gets a score — reflect natural rise/fall of dramatic tension
- character_heatmap: intensity of presence in each act (100 = central to every scene in that act)
- pacing_blocks: fast = action/revelation scenes, medium = dialogue, slow = setup/exposition
- flags: only flag real problems (5+ consecutive slow scenes, character absent from entire act, etc.)

Return ONLY the JSON object. No explanation, no markdown, no code blocks.

SCREENPLAY:
{screenplay}
"""
