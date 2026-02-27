export default function MarqueeDivider() {
  const CONTENT =
    'SCREENPLAY  →  CHARACTERS  →  MOODBOARD  →  ADI  →  MCP  →  RAG  →  ';

  return (
    <div className="w-full overflow-hidden py-3">
      <div
        className="flex whitespace-nowrap [animation:marquee-scroll_18s_linear_infinite]"
      >
        <span className="font-display tracking-widest text-sm text-[#F06820]">
          {CONTENT}
          {CONTENT}
        </span>
      </div>
    </div>
  );
}
