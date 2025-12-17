import * as faceapi from 'face-api.js';

export const loadModels = async (onLoaded: () => void) => {
    try {
        console.log('Loading face-api.js models...');

        await faceapi.nets.ssdMobilenetv1.loadFromUri('/models');
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
        await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
        await faceapi.nets.faceRecognitionNet.loadFromUri('/models');
        await faceapi.nets.faceExpressionNet.loadFromUri('/models');

        onLoaded();
    } catch (err) {
        console.error('Error loading models:', err);
        alert('Failed to load face recognition models');
    }
};