const VERSION = '1.0.0'

export function Footer() {
  return (
    <footer className="mt-auto border-t border-[#1a2540] bg-[#080b14]/60 px-5 sm:px-8 py-4 flex items-center justify-between gap-4">
      <span className="flex items-center gap-2 text-xs text-[#3d5070] font-mono">
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#121828] border border-[#1a2540] text-[#8899bb]">
          <span className="text-[#3d5070]">v</span>{VERSION}
        </span>
      </span>

      <span className="text-xs text-[#3d5070]">
        Made with{' '}
        <span className="text-rose-400">&#10084;&#65039;</span>
        {' '}by{' '}
        <a
          href="https://github.com/orangecoding"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#8899bb] hover:text-red-400 transition-colors duration-150 underline underline-offset-2 decoration-[#253660] hover:decoration-red-400/50"
        >
          Christian Kellner
        </a>
      </span>
    </footer>
  )
}
