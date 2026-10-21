# Scope & Add-ons demo videos

Put your video files in this folder with these exact, lowercase names:

| Feature | Filename |
| --- | --- |
| Small fire detection | `fire.mp4` |
| Smoke detection | `smoke.mp4` |
| PPE compliance | `ppe.mp4` |
| Restricted area monitoring | `restricted.mp4` |
| Sugar bag weight monitoring | `weight.mp4` |

Use browser-compatible MP4 files (H.264 video and AAC audio is a widely
compatible choice). Simply renaming another video format to .mp4 does not
convert it. Keep clips short and compressed for faster downloads.

Both cards and detail previews load the matching video. Playback starts only
when the user presses Play. Native controls provide pause, seeking, volume
and fullscreen where the browser supports them; mobile browsers may use
system volume controls. Missing or unsupported videos fall back to the
existing photo. Only one add-on video plays at a time; opening a detail
preview pauses card videos.

For local preview, run `npm run dev` from `sugarMill-frontend-deploy`.
Refresh the browser after adding or replacing a video. The original full-stack
project in `sugarMill/sugarMill` is a separate copy and was not changed.

To update the deployed frontend, commit/push the video files and source changes
to the connected frontend repository and allow the hosting build to finish.
A local file change alone does not update the deployed site. These clips
remain demo previews; uploading them does not run detection or measure weight.
