import { createContext } from "react"
import { SyncService } from "../services/syncService"

export interface SyncContextType {
	syncService: SyncService | null
	lastSyncTime: number | null
	syncStatus: "idle" | "syncing" | "success" | "error"
}

export const SyncContext = createContext<SyncContextType>({
	syncService: null,
	lastSyncTime: null,
	syncStatus: "idle"
})
