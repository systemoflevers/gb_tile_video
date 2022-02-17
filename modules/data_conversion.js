function ArrayBufferToBase64(buffer) {
    let bytes = new Uint8Array(buffer);
    let stringEncodedBinary = ''
    for (const b of bytes) {
        stringEncodedBinary += String.fromCharCode(b);
    }
    return window.btoa(stringEncodedBinary);
}

export {
    ArrayBufferToBase64,
}