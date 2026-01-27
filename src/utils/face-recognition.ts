import * as faceapi from 'face-api.js';

export const loadModels = async (onLoaded: () => void) => {
    const vdir = import.meta.env.DEV ? '' : 'check-in';

    try {
        console.log('Loading face-api.js models...');

        await faceapi.nets.ssdMobilenetv1.loadFromUri(`/${vdir}/models`);
        await faceapi.nets.tinyFaceDetector.loadFromUri(`/${vdir}/models`);
        await faceapi.nets.faceLandmark68Net.loadFromUri(`/${vdir}/models`);
        await faceapi.nets.faceRecognitionNet.loadFromUri(`/${vdir}/models`);
        await faceapi.nets.faceExpressionNet.loadFromUri(`/${vdir}/models`);

        onLoaded();
    } catch (err) {
        console.error('Error loading models:', err);
        alert('Failed to load face recognition models');
    }
};