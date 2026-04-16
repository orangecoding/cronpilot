/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { useEffect, useState } from 'react'
import { api } from '../../api/client.js'
import { Header } from './Header.jsx'
import { Footer } from './Footer.jsx'

export function AppShell({ onNew, sidebar, onCloseSidebar, children }) {
  const [version, setVersion] = useState(null)

  useEffect(() => {
    api.getVersion().then(data => setVersion(data.version)).catch(() => {})
  }, [])
  return (
    <div className="min-h-screen flex flex-col">
      <Header onNew={onNew} />
      <div className="flex flex-1">
        {sidebar && (
          <>
            <aside className="hidden lg:flex flex-col w-80 shrink-0 border-r border-[#2a2a2a] bg-[#161616] min-h-[calc(100vh-57px)] sticky top-[57px] overflow-y-auto">
              {sidebar}
            </aside>
            <div className="fixed inset-0 z-40 lg:hidden">
              <div
                className="absolute inset-0 bg-black/70 backdrop-blur-sm"
                onClick={onCloseSidebar}
              />
              <div className="absolute bottom-0 left-0 right-0 max-h-[80vh] rounded-t-2xl overflow-hidden border-t border-[#383838] shadow-2xl">
                {sidebar}
              </div>
            </div>
          </>
        )}
        <main className="flex-1 px-4 sm:px-6 py-6 max-w-4xl mx-auto w-full">
          {children}
        </main>
      </div>
      <Footer version={version} />
    </div>
  )
}
