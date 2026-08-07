/*
  All the content lives here. Edit this file and nothing else.

  Media:
    Drop image or GIF files into /public/media and reference them by
    filename only, for example media: 'sunset-rooftop.gif'.
    Leave media as '' (or drop the field) and that card falls back to a
    clean text only layout in the accent colour. Nothing breaks.

  Arrays:
    vibes and restaurants can hold any number of entries. Add or remove
    them freely, the screens render whatever they find.
*/

const config = {
  // Where her picks get sent. Digits only, with country code, no plus sign
  // and no spaces. Example for the UK: '447700900123'.
  // Leave it as '' and the Send step opens WhatsApp with the message ready
  // but lets her choose the chat.
  myWhatsAppNumber: '',

  // Optional GIF or image above the headline on the ask screen. '' hides it.
  askMedia: '',

  askHeadline: 'Will you go on a date with me this Thursday?',

  // Optional line under the headline. '' hides it.
  askSubline: 'One tap and you get to plan the whole thing.',

  // Rotates one per press of "Absolutely not". Add as many as you like.
  askCaptions: [
    'are you sure?',
    'think again',
    'the button is getting bigger for a reason',
    'it is not going to stop growing',
    'that little one is running out of room',
    'the big one is right there',
    'take your time, it will wait',
  ],

  welcomeIntro:
    'You said yes, so now you get to build the evening. A few taps and it is planned.',

  // ---------------------------------------------------------------------
  // Replace these three with your own vibes.
  // ---------------------------------------------------------------------
  vibes: [
    {
      name: 'Golden hour rooftop',
      description: 'Drinks up high while the light goes orange.',
      media: '',
    },
    {
      name: 'Candlelit and slow',
      description: 'Small room, long dinner, no rush at all.',
      media: '',
    },
    {
      name: 'Wander then eat',
      description: 'Walk the streets first, decide with our feet.',
      media: '',
    },
  ],

  // ---------------------------------------------------------------------
  // Replace these with the restaurants you actually want on the list.
  // ---------------------------------------------------------------------
  restaurants: [
    {
      name: 'Little Olive',
      area: 'Soho',
      description: 'Tiny Greek plates and very good bread.',
      media: '',
    },
    {
      name: 'Casa Nera',
      area: 'Shoreditch',
      description: 'Wood fired pasta, low light, loud in a good way.',
      media: '',
    },
    {
      name: 'Kin Izakaya',
      area: 'Fitzrovia',
      description: 'Skewers, sake and a counter to sit at.',
      media: '',
    },
    {
      name: 'The Garden Room',
      area: 'Notting Hill',
      description: 'Plants everywhere and a long dessert list.',
      media: '',
    },
  ],
}

export default config
