import { type RefObject } from "react";

export const startCamera = async (
    videoRef: RefObject<HTMLVideoElement>,
    detectFaces: () => void,
    onStream: (mediaStream: MediaStream) => void,
    videoOptions?: {width: number, height: number, facingMode: string} | null,
) => {
    try {
        const mediaStream = await navigator.mediaDevices.getUserMedia({
            video: { width: 640, height: 480, facingMode: 'user' }
        });

        if (videoRef.current) {
            videoRef.current.srcObject = mediaStream;
            onStream(mediaStream);

            videoRef.current.addEventListener('play', () => {
                detectFaces();
            });
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