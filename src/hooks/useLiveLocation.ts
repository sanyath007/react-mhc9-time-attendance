import { useEffect, useRef, useState } from "react";

export function useLiveLocation() {
    const [location, setLocation] = useState(null);
    const watchIdRef = useRef(null);

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