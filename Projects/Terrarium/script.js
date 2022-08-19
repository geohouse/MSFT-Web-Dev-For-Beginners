for (let counter = 1; counter < 15; counter++) {
  dragElement(document.querySelector(`#plant${counter}`));
}

function dragElement(terrariumElement) {
  // set 4 positions for setting the plant correctly on the screen
  let pos1 = 0,
    pos2 = 0,
    pos3 = 0,
    pos4 = 0;
  terrariumElement.onpointerdown = pointerDrag;

  function pointerDrag(event) {
    event.preventDefault();
    console.log(event);
    pos3 = event.clientX;
    pos4 = event.clientY;
    document.onpointermove = elementDrag;
    document.onpointerup = stopElementDrag;
  }

  function elementDrag(dragEvent) {
    pos1 = pos3 - dragEvent.clientX;
    pos2 = pos4 - dragEvent.clientY;
    pos3 = dragEvent.clientX;
    pos4 = dragEvent.clientY;
    console.log(pos1, pos2, pos3, pos4);
    terrariumElement.style.top = terrariumElement.offsetTop - pos2 + "px";
    terrariumElement.style.left = terrariumElement.offsetLeft - pos1 + "px";
  }

  function stopElementDrag() {
    document.onpointerup = null;
    document.onpointermove = null;
  }
}
