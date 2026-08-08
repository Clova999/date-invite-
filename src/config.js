// Drop all image files into /public/media
// Reference them here by filename only.
//
// Every media field is optional. Leave it as "" and that card falls back to a
// clean text only layout in the accent colour. A filename that is not in
// /public/media yet does the same, so nothing breaks while you gather them.

export const askHeadline =
  "Will you go on a date with me this Thursday?";

export const askMedia = "ask.gif";

export const askCaptions = [
  "are you sure?",
  "think again",
  "the button is getting bigger for a reason",
  "still no?",
  "we both know how this ends",
  "just tap the big one",
];

// Short line on the welcome screen, after she says yes.
export const welcomeIntro =
  "You said yes, so now you get to build the evening. A few taps and it is planned.";

export const activities = [
  {
    name: "Arcade",
    media: "arcade.jpg",
    teaser: "",
  },
  {
    name: "Art gallery",
    media: "art-gallery.jpg",
    teaser: "",
  },
  {
    name: "Shooting range",
    media: "shooting-range.jpg",
    teaser: "",
  },
  {
    name: "Mystery option",
    media: "mystery.jpg",
    teaser: "trust me",
  },
];

export const restaurants = [
  { name: "Date night", media: "date-night.jpg" },
  { name: "Burgers", media: "burgers.jpg" },
  { name: "Mexican", media: "mexican.jpg" },
  { name: "Korean", media: "korean.jpg" },
];

export const whatsappNumber = "27XXXXXXXXX"; // no + and no spaces
