import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
gsap.registerPlugin(ScrollTrigger);

// ========== CUSTOM CURSOR ==========
const cursor = document.querySelector(".cursor");
let cursorX = 0;
let cursorY = 0;

// Create a hidden canvas to sample background colors
const canvas = document.createElement("canvas");
canvas.width = 1;
canvas.height = 1;
const ctx = canvas.getContext("2d");

function getBackgroundColor(x, y) {
  try {
    // Draw a 1x1 pixel from the screen at the cursor position
    ctx.drawImage(document.documentElement, x, y, 1, 1, 0, 0, 1, 1);
    const imageData = ctx.getImageData(0, 0, 1, 1);
    const [r, g, b] = imageData.data;
    return { r, g, b };
  } catch (e) {
    // If canvas tainting occurs, default to black
    return { r: 0, g: 0, b: 0 };
  }
}

function getPerceivedBrightness(r, g, b) {
  // Use relative luminance formula (WCAG)
  return (r * 299 + g * 587 + b * 114) / 1000;
}

function updateCursorColor(x, y) {
  if (!cursor) return;

  const bgColor = getBackgroundColor(x, y);
  const brightness = getPerceivedBrightness(bgColor.r, bgColor.g, bgColor.b);

  // If background is darker than mid-gray (128), use white; otherwise use black
  if (brightness < 128) {
    cursor.style.backgroundColor = "#ffffff";
  } else {
    cursor.style.backgroundColor = "#000000";
  }
}

// Track mouse movement
document.addEventListener("mousemove", (e) => {
  cursorX = e.clientX;
  cursorY = e.clientY;

  if (cursor) {
    cursor.style.left = cursorX + "px";
    cursor.style.top = cursorY + "px";
    updateCursorColor(cursorX, cursorY);
  }
});

// Detect hover on interactive elements
const interactiveElements = document.querySelectorAll("a, button");
interactiveElements.forEach((element) => {
  element.addEventListener("mouseenter", () => {
    if (cursor) cursor.classList.add("hovered");
  });

  element.addEventListener("mouseleave", () => {
    if (cursor) cursor.classList.remove("hovered");
  });
});

// Hide cursor when mouse leaves window
document.addEventListener("mouseleave", () => {
  if (cursor) cursor.style.opacity = "0";
});

document.addEventListener("mouseenter", () => {
  if (cursor) cursor.style.opacity = "1";
});

const loadingWrapper =
  document.querySelector(".deletion") ||
  document.querySelector(".loading-bar-progress");

let hideTimeout = null;

// ensure a smooth opacity transition
if (loadingWrapper) loadingWrapper.style.transition = "opacity 0.2s ease";

const deleteMessage = document.querySelector(".imageandbubble-text");

// ensure a smooth opacity transition for delete message
if (deleteMessage) deleteMessage.style.transition = "opacity 0.2s ease";

function showLoading() {
  if (!loadingWrapper) return;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  loadingWrapper.style.display = "";
  // ensure layout applied before changing opacity
  requestAnimationFrame(() => {
    loadingWrapper.style.opacity = "1";
    loadingWrapper.style.pointerEvents = "";
  });
}

function hideLoading() {
  if (!loadingWrapper) return;
  if (hideTimeout) {
    clearTimeout(hideTimeout);
    hideTimeout = null;
  }
  loadingWrapper.style.opacity = "0";
  loadingWrapper.style.pointerEvents = "none";
  // delay setting display none to avoid flashes while scrub animates opacity
  hideTimeout = setTimeout(() => {
    if (loadingWrapper && loadingWrapper.style.opacity === "0")
      loadingWrapper.style.display = "none";
  }, 500); // 0.5s delay
}

function showDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.display = "";
  // ensure layout applied before changing opacity
  requestAnimationFrame(() => {
    deleteMessage.style.opacity = "1";
  });
}

function hideDeleteMessage() {
  if (!deleteMessage) return;
  deleteMessage.style.opacity = "0";
  // delay setting display none
}

// start hidden before trigger
hideLoading();
hideDeleteMessage();

gsap.fromTo(
  ".loading-bar-progress",
  { width: "0%" },
  {
    width: "100%",
    ease: "none",
    scrollTrigger: {
      trigger: "#trigger2",
      start: "center 40%",
      end: "center top",
      scrub: true,
      pin: true,
      onUpdate: (self) => {
        const percent = (self.progress * 100).toFixed(2);
        const el = document.querySelector(".loading-percentage");
        if (el) el.textContent = `${percent}%`;

        // show while between start and end, hide at the very start or at the end
        if (self.progress > 0 && self.progress < 1) {
          showLoading();
        } else {
          hideLoading();
        }
      },
      onEnter: () => {
        showLoading();
        hideDeleteMessage();
      },
      onEnterBack: () => {
        showLoading();
        hideDeleteMessage();
      },
      onLeave: hideLoading,
      onLeaveBack: hideLoading,
    },
  }
);

// Separate ScrollTrigger for .delete-message
ScrollTrigger.create({
  trigger: "#trigger2",
  start: "center bottom",
  end: "center top",
  onEnter: showDeleteMessage,
  onLeave: hideDeleteMessage,
  onEnterBack: showDeleteMessage,
  onLeaveBack: hideDeleteMessage,
});

// ========== ANIMATIONS PARALLAX & TRANSLATIONS ==========

// Home section - Titre principal
gsap.fromTo(
  ".home-title",
  { y: 20, opacity: 1 },
  {
    y: -60,
    opacity: 0,
    scrollTrigger: {
      trigger: ".home",
      start: "center center",
      end: "bottom center",
      scrub: 1,
      markers: false,
    },
  }
);

// Home section - Bulles et éléments flottants
gsap.fromTo(
  ".home-bubble",
  { y: 0, rotation: -20 },
  {
    y: -120,
    rotation: 10,
    scrollTrigger: {
      trigger: ".home",
      start: "top center",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".home-bubble2",
  { y: 0, rotation: 10 },
  {
    y: -90,
    rotation: -20,
    scrollTrigger: {
      trigger: ".home",
      start: "top center",
      end: "bottom center",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".home-moving-thing",
  { y: 50 },
  {
    y: -100,
    scrollTrigger: {
      trigger: ".home",
      start: "center 50%",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

// ========== Section 1: imageandbubble-section1 ==========
gsap.fromTo(
  ".imageandbubble-image",
  { y: -400 },
  {
    y: 0,
    scrollTrigger: {
      trigger: ".imageandbubble-image",
      start: "top bottom",
      end: "200% top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble3",
  { y: 0, rotation: 0 },
  {
    y: -105,
    rotation: 35,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble3",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

// ========== Section 2: imageandbubble-section2 ==========
gsap.fromTo(
  ".imageandbubble-image1",
  { x: 0 },
  {
    x: -75,
    scrollTrigger: {
      trigger: ".imageandbubble-image1",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble4",
  { y: 0, rotation: 24 },
  {
    rotation: -24,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble4",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble5",
  { y: 30, rotation: 30 },
  {
    y: -50,
    rotation: -15,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble5",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

// ========== Section 3: imageandbubble-section3 ==========
gsap.fromTo(
  ".imageandbubble-image2",
  { x: 0 },
  {
    x: -100,
    scrollTrigger: {
      trigger: ".imageandbubble-image2",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image3",
  { x: 0 },
  {
    x: 100,
    scrollTrigger: {
      trigger: ".imageandbubble-image3",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image4",
  { x: 0 },
  {
    x: -125,
    scrollTrigger: {
      trigger: ".imageandbubble-image4",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image5",
  { x: 0 },
  {
    x: 45,
    scrollTrigger: {
      trigger: ".imageandbubble-image5",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image6",
  { x: 0 },
  {
    x: -60,

    scrollTrigger: {
      trigger: ".imageandbubble-image6",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image7",
  { x: 0 },
  {
    x: 75,
    scrollTrigger: {
      trigger: ".imageandbubble-image7",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-image8",
  { x: 0 },
  {
    x: -45,
    scrollTrigger: {
      trigger: ".imageandbubble-image8",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

// Bulles section 3
gsap.fromTo(
  ".imageandbubble-bubble6",
  { y: 0, rotation: 0 },
  {
    y: 120,
    x: 120,
    rotation: 30,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble6",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble7",
  { y: 0, rotation: 0 },
  {
    y: 105,
    rotation: 10,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble7",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble8",
  { y: 0, rotation: 0 },
  {
    y: 70,
    rotation: 24,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble8",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble9",
  { y: 0, rotation: -20 },
  {
    y: 90,
    rotation: 16,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble9",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

gsap.fromTo(
  ".imageandbubble-bubble10",
  { y: 500, rotation: 0 },
  {
    y: -50,
    rotation: 18,
    scrollTrigger: {
      trigger: ".imageandbubble-bubble10",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);

// ========== Section Book Details - Titre et image ==========
gsap.fromTo(
  ".bookdetails h2",
  { y: 0 },
  {
    y: 45,
    scrollTrigger: {
      trigger: ".bookdetails h2",
      start: "top bottom",
      end: "bottom top",
      scrub: 1,
      markers: false,
    },
  }
);
gsap.fromTo(
  ".bookdetails h2",
  { opacity: 0 },
  {
    opacity: 1,
    scrollTrigger: {
      trigger: ".bookdetails h2",
      start: "bottom bottom",
      end: "bottom 80%",
      scrub: 1,
      markers: false,
    },
  }
);

// ========== Footer ==========
gsap.fromTo(
  ".footer-logo",
  { y: 0, opacity: 0 },
  {
    opacity: 1,
    scrollTrigger: {
      trigger: ".footer-logo",
      start: "bottom bottom",
      end: "bottom 80%",
      scrub: 1,
      markers: false,
    },
  }
);
