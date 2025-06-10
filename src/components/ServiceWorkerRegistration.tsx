// filepath: c:\Users\devan\Prog\react-reader-project\src\components\ServiceWorkerRegistration.tsx
import { useEffect, useState } from "react"

export function ServiceWorkerRegistration() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            // Wait for service worker to be ready
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg)
                
                // Listen for updates
                reg.addEventListener("updatefound", () => {
                    const newWorker = reg.installing
                    if (newWorker) {
                        newWorker.addEventListener("statechange", () => {
                            if (newWorker.state === "installed" && navigator.serviceWorker.controller) {
                                setUpdateAvailable(true)
                            }
                        })
                    }
                })
            })

            // Listen for messages from service worker
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data && event.data.type === "SW_UPDATE_READY") {
                    setUpdateAvailable(true)
                }
            })
        }
    }, [])

    const handleUpdate = () => {
        if (registration?.waiting) {
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
            window.location.reload()
        }
    }

    if (!updateAvailable) return null

    return (
        <div style={{
            position: "fixed",
            bottom: "20px",
            right: "20px",
            background: "#333",
            color: "white",
            padding: "12px 16px",
            borderRadius: "8px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            zIndex: 1000,
            maxWidth: "300px"
        }}>
            <p style={{ margin: "0 0 8px 0", fontSize: "14px" }}>
                New version available!
            </p>
            <button 
                onClick={handleUpdate} 
                style={{
                    background: "#007bff",
                    color: "white",
                    border: "none",
                    padding: "6px 12px",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontSize: "12px"
                }}
            >
                Update Now
            </button>
        </div>
    )
}