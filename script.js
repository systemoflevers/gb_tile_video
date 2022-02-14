
function doStuff() {
    const twoBitCanvas = document.querySelector('two-bit-canvas');
    twoBitCanvas.addEventListener('click', (event) => {
        console.log(event.clientX, event.clientY, twoBitCanvas.getBoundingClientRect());
    });
}