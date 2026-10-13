// S03 → S04 entering transition (Vox "pull out from a single photo → reveal the whole collage"):
// the old frame turns in place into a halftone photo on the desk — at p=0 the photo's inner frame exactly fills the frame (= the old frame as is); the camera pulls out with a long tail, revealing the desk, clippings and red string;
// frame by frame the old picture goes through a 45° halftone and gets an old-paper tint, and at p=1 it is pixel-identical to the photo cached inside segment s04. The camera and halftone are both in spacex/scenes/s04.js (S04X).
TRANSITIONS.deskPullOut = (c, A, B, p, o) => { c.drawImage(B, 0, 0); S04X.photoLive(c, A, o.lt, p); };
