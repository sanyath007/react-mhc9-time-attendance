import { type RefObject } from "react";

export const startCamera = async (
    videoRef: RefObject<HTMLVideoElement | null>,
    detectFaces: () => void,
    onStream: (mediaStream: MediaStream) => void,
    videoOptions?: MediaTrackConstraints | null,
) => {
    try {
        const isMobile = window.innerWidth < 768;
        const defaultConstraints: MediaTrackConstraints = {
            width: { ideal: isMobile ? 480 : 640 },
            height: { ideal: isMobile ? 640 : 480 },
            facingMode: 'user'
        };

        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: videoOptions || defaultConstraints
        });

        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            onStream(mediaStream);

            videoRef.current.onplay = () => {
                detectFaces();
            };
        }
    } catch (err) {
        console.error('Error accessing camera:', err);
        alert('Unable to access camera. Please check permissions.');
    }
};

export const stopCamera = (stream: MediaStream, onStop: () => void) => {
    if (stream) {
        stream.getTracks().forEach(track => track.stop());

        onStop();
    }
};