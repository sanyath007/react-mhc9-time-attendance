import { useState, useCallback, useRef } from 'react';

export interface LocationData {
    latitude: number;
    longitude: number;
    accuracy: number;
    timestamp: number;
}

// ✅ เพิ่ม interface สำหรับ Location (รองรับทั้ง User และ Department locations)
export interface LocationPoint {
    id?: number;
    locationName?: string;
    latitude: string | number;
    longitude: string | number;
    radius?: number;
}

// ✅ เพิ่ม interface สำหรับผลลัพธ์การเช็ค
export interface LocationCheckResult {
    isWithin: boolean;
    location: LocationPoint | null;
    distance: number;
    nearestLocation?: LocationPoint;
    nearestDistance?: number;
}

interface GeolocationOptions {
    threshold?: number; // ระยะห่างขั้นต่ำ (เมตร) ที่จะถือว่าเป็นตำแหน่งใหม่
    maxAge?: number;    // อายุสูงสุดของ cache (มิลลิวินาที)
    timeout?: number;   // timeout สำหรับ getCurrentPosition
}

export function useGeolocation(options: GeolocationOptions = {}) {
    const {
        threshold = 5, // 5 เมตร
        maxAge = 300000, // 5 นาที
        timeout = 15000
    } = options;

    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    
    // เก็บตำแหน่งล่าสุดเพื่อเปรียบเทียบ
    const lastLocationRef = useRef<LocationData | null>(null);

    // ✅ ฟังก์ชันคำนวณระยะห่างระหว่างจุดสองจุด (Haversine formula) - Export เป็น public
    const calculateDistance = useCallback((lat1: number, lon1: number, lat2: number, lon2: number): number => {
        const R = 6371e3; // รัศมีของโลกเป็นเมตร
        const φ1 = lat1 * Math.PI / 180;
        const φ2 = lat2 * Math.PI / 180;
        const Δφ = (lat2 - lat1) * Math.PI / 180;
        const Δλ = (lon2 - lon1) * Math.PI / 180;

        const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

        return R * c;
    }, []);

    // ตรวจสอบว่าตำแหน่งใหม่แตกต่างจากเดิมมากพอหรือไม่
    const shouldUpdateLocation = useCallback((newLocation: LocationData): boolean => {
        const lastLocation = lastLocationRef.current;
        
        // ถ้าไม่มีตำแหน่งเดิม ให้ update
        if (!lastLocation) return true;
        
        // ถ้า cache หมดอายุแล้ว ให้ update
        if (Date.now() - lastLocation.timestamp > maxAge) return true;
        
        // คำนวณระยะห่าง
        const distance = calculateDistance(
            lastLocation.latitude,
            lastLocation.longitude,
            newLocation.latitude,
            newLocation.longitude
        );

        // ถ้าระยะห่างมากกว่า threshold ให้ update
        return distance > threshold;
    }, [calculateDistance, maxAge, threshold]);

    const getCurrentLocation = useCallback(async (): Promise<LocationData> => {
        return new Promise((resolve, reject) => {
            setIsLoading(true);
            setError(null);

            if (!navigator.geolocation) {
                const error = 'Geolocation is not supported by this browser.';
                setError(error);
                setIsLoading(false);
                reject(new Error(error));
                return;
            }

            // ถ้ามี location ที่ยังไม่หมดอายุ ให้ใช้ cache
            const currentLocation = lastLocationRef.current;
            if (currentLocation && (Date.now() - currentLocation.timestamp) < maxAge) {
                setIsLoading(false);
                resolve(currentLocation);
                return;
            }

            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const newLocationData: LocationData = {
                        latitude: position.coords.latitude,
                        longitude: position.coords.longitude,
                        accuracy: position.coords.accuracy,
                        timestamp: Date.now(),
                    };

                    // ตรวจสอบว่าควร update หรือไม่
                    if (shouldUpdateLocation(newLocationData)) {
                        lastLocationRef.current = newLocationData;
                        setLocation(newLocationData);
                    } else {
                        // ใช้ตำแหน่งเดิม แต่ update timestamp
                        const stableLocation = {
                            ...lastLocationRef.current!,
                            timestamp: Date.now(),
                        };
                        setLocation(stableLocation);
                        newLocationData.latitude = stableLocation.latitude;
                        newLocationData.longitude = stableLocation.longitude;
                    }

                    setIsLoading(false);
                    resolve(newLocationData);
                }, (error) => {
                    let errorMessage = 'Unable to retrieve location.';
                    switch (error.code) {
                        case error.PERMISSION_DENIED:
                            errorMessage = 'Location access denied by user.';
                            break;
                        case error.POSITION_UNAVAILABLE:
                            errorMessage = 'Location information is unavailable.';
                            break;
                        case error.TIMEOUT:
                            errorMessage = 'Location request timed out.';
                            break;
                    }
                    setError(errorMessage);
                    setIsLoading(false);
                    reject(new Error(errorMessage));
                }, {
                    enableHighAccuracy: true,
                    timeout,
                    maximumAge: maxAge,
                }
            );
        });
    }, [shouldUpdateLocation, maxAge, timeout]);

    // ฟังก์ชันบังคับให้ดึงตำแหน่งใหม่
    const forceRefresh = useCallback(async (): Promise<LocationData> => {
        lastLocationRef.current = null;
        return getCurrentLocation();
    }, [getCurrentLocation]);

    // ฟังก์ชันล้าง cache
    const clearCache = useCallback(() => {
        lastLocationRef.current = null;
        setLocation(null);
        setError(null);
    }, []);

    // ✅ ฟังก์ชันหา location ใกล้ที่สุดจาก array
    const findNearestLocation = useCallback((
        userLat: number,
        userLon: number,
        locations: LocationPoint[]
    ): { location: LocationPoint | null; distance: number } => {
        if (locations.length === 0) {
            return { location: null, distance: Infinity };
        }

        let nearestLocation: LocationPoint | null = null;
        let minDistance = Infinity;

        locations.forEach((loc) => {
            const locLat = typeof loc.latitude === 'string' ? parseFloat(loc.latitude) : loc.latitude;
            const locLon = typeof loc.longitude === 'string' ? parseFloat(loc.longitude) : loc.longitude;

            if (isNaN(locLat) || isNaN(locLon)) return;

            const distance = calculateDistance(userLat, userLon, locLat, locLon);

            if (distance < minDistance) {
                minDistance = distance;
                nearestLocation = loc;
            }
        });

        return { location: nearestLocation, distance: minDistance };
    }, [calculateDistance]);

    // ✅ ฟังก์ชันเช็คว่าอยู่ในรัศมีของ location ใดๆ หรือไม่
    const checkLocationRadius = useCallback((
        userLat: number,
        userLon: number,
        locations: LocationPoint[],
        defaultRadius: number = 100
    ): LocationCheckResult => {
        const { location: nearestLocation, distance: nearestDistance } = findNearestLocation(
            userLat,
            userLon,
            locations
        );

        if (!nearestLocation) {
        return {
            isWithin: false,
            location: null,
            distance: Infinity,
            nearestLocation: undefined,
            nearestDistance: Infinity,
        };
        }

        const radius = nearestLocation.radius || defaultRadius;
        const isWithin = nearestDistance <= radius;

        return {
            isWithin,
            location: isWithin ? nearestLocation : null,
            distance: nearestDistance,
            nearestLocation,
            nearestDistance,
        };
    }, [findNearestLocation]);

    // ✅ ฟังก์ชันเช็คว่าอยู่ในรัศมีของ location ใดๆ โดยใช้ตำแหน่งปัจจุบัน
    const checkCurrentLocationRadius = useCallback(async (
        locations: LocationPoint[],
        defaultRadius: number = 100
    ): Promise<LocationCheckResult> => {
        const currentLoc = await getCurrentLocation();
        return checkLocationRadius(
            currentLoc.latitude,
            currentLoc.longitude,
            locations,
            defaultRadius
        );
    }, [getCurrentLocation, checkLocationRadius]);

    // ✅ ฟังก์ชันหา location ใกล้ที่สุดโดยใช้ตำแหน่งปัจจุบัน
    const findNearestFromCurrent = useCallback(async (
        locations: LocationPoint[]
    ): Promise<{ location: LocationPoint | null; distance: number }> => {
        const currentLoc = await getCurrentLocation();
        return findNearestLocation(currentLoc.latitude, currentLoc.longitude, locations);
    }, [getCurrentLocation, findNearestLocation]);

    return {
        location,
        isLoading,
        error,
        getCurrentLocation,
        forceRefresh,
        clearCache,
        // ✅ Export helper functions
        calculateDistance,
        findNearestLocation,
        checkLocationRadius,
        checkCurrentLocationRadius,
        findNearestFromCurrent,
    };
}