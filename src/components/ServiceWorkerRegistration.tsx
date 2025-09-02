import { useEffect, useState } from "react"
import { Button } from "react-aria-components"
import styles from "./ServiceWorkerRegistration.module.css"

export function ServiceWorkerRegistration() {
    const [updateAvailable, setUpdateAvailable] = useState(false)
    const [registration, setRegistration] = useState<ServiceWorkerRegistration | null>(null)

    useEffect(() => {
        if ("serviceWorker" in navigator) {
            // Wait for service worker to be ready
            navigator.serviceWorker.ready.then((reg) => {
                setRegistration(reg)
                
                // Listen for updates - Workbox specific handling
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

            // Listen for messages from service worker - Workbox sends different messages
            navigator.serviceWorker.addEventListener("message", (event) => {
                if (event.data && (event.data.type === "SW_UPDATE_READY" || event.data.type === "WORKBOX_WAITING")) {
                    setUpdateAvailable(true)
                }
            })

            // Check if there's already a waiting service worker
            navigator.serviceWorker.ready.then((reg) => {
                if (reg.waiting) {
                    setUpdateAvailable(true)
                }
            })
        }
    }, [])

    const handleUpdate = () => {
        if (registration?.waiting) {
            // For Workbox, send SKIP_WAITING message
            registration.waiting.postMessage({ type: "SKIP_WAITING" })
            
            // Listen for controllerchange to reload when new SW takes control
            navigator.serviceWorker.addEventListener("controllerchange", () => {
                window.location.reload()
            }, { once: true })
        } else {
            // Fallback: just reload
            window.location.reload()
        }
    }

    if (!updateAvailable) return null

    return (
        <div className={styles.updateNotification}>
            <p className={styles.message}>
                New version available!
            </p>
            <Button 
                onPress={handleUpdate}
                className={`react-aria-Button ${styles.updateButton}`}
            >
                Update Now
            </Button>
        </div>
    )
}