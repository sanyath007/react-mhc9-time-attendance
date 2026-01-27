import { useEffect, useRef, useState } from "react";
import { type Location } from "../lib/types";

export function useLiveLocation() {
    const [location, setLocation] = useState<Location | null>(null);
    const watchIdRef = useRef<number | null>(null);

    useEffect(() => {
        if (!navigator.geolocation) return;

        watchIdRef.current = navigator.geolocation.watchPosition(
            (position) => {
                setLocation({
                    latitude: position.coords.latitude,
                    longitude: position.coords.longitude,
                    accuracy: position.coords.accuracy,
                    speed: position.coords.speed,
                });
            },
            console.error,
            { enableHighAccuracy: true }
        );

        return () => {
            if (watchIdRef.current) {
                navigator.geolocation.clearWatch(watchIdRef.current);
            }
        };
    }, []);

    return location;
}