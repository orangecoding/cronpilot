/*
 * Copyright (c) 2026 by Christian Kellner.
 * Licensed under Apache-2.0 with Commons Clause and Attribution/Naming Clause
 */

import { EventEmitter } from 'events'

export const eventBus = new EventEmitter()
eventBus.setMaxListeners(0)

