import React from 'react'
import { X } from 'lucide-react';

const ImageViewer = ({ isShow, onHide, image }: { isShow: boolean, onHide: any, image: string }) => {
    return (
        <>
            {isShow && (
                <div 
                    className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-8"
                    onClick={() => onHide(false)}
                >
                    <div className="relative max-w-3xl max-h-full">
                        <img src={image} alt="Preview" className="max-w-full max-h-full rounded-lg" />
                        <button
                            onClick={() => onHide(false)}
                            className="absolute top-4 right-4 p-2 bg-red-600 text-white rounded-full hover:bg-red-700"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>
            )}
        </>
    )
}

export default ImageViewer