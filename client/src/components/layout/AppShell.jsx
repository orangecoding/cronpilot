import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export function AppShell({ onNew, sidebar, onCloseSidebar, children }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header onNew={onNew} />
      <div className="flex flex-1">
        {sidebar && (
          <>
            {/* Desktop: sticky sidebar panel */}
            <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[#1a2540] bg-[#0d1120] min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
              {sidebar}
            </aside>

            {/* Mobile: bottom-sheet drawer */}
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCloseSidebar}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl overflow-hidden border-t border-[#253660] shadow-2xl">
                {sidebar}
              </div>
            </div>
          </>
        )}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer />
    </div>
  )
}
