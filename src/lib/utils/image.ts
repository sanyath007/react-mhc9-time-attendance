export function dataURLtoBlob(dataUrl: string) {
    // Split the dataurl into the mime type part and the base64 data part
    const arr: string[] = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const b64 = arr[1];

    // Decode the base64 string into a binary string
    var bstr = atob(b64);
    var n = bstr.length;
    // Create an 8-bit unsigned integer array from the binary string
    var u8arr = new Uint8Array(n);

    // Populate the Uint8Array with the binary data
    while(n--){
        u8arr[n] = bstr.charCodeAt(n);
    }

    // Create and return the Blob object
    return new Blob([u8arr], {type: mime});
}
