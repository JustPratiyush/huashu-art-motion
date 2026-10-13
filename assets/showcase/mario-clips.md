# Huashu beats Super Mario · GIF clips

Cut directly from the 65.02-second film *Huashu Beats Super Mario*, keeping the CRT look. Only the showcase GIFs are included here, not the level's project or the full video.

- `mario-claude.gif`: 00:06.30–00:11.80, 5.5 seconds, 800×450. Subscription choice → Claude starburst → grows bigger.
- `mario-combo.gif`: 00:28.60–00:32.60, 4 seconds, 640×360. Stomps an enemy → kicks it flying → breaks a brick overhead.
- `mario-pipe.gif`: 00:17.00–00:24.70, 7.7 seconds, 640×360. Down the pipe → coin chamber → whip pan back above ground.

All three keep the original speed, 20fps, silent, infinite loop; each clip gets its own 192-color palette, with Bayer dithering to control size, then lossless optimization with `gifsicle -O3`. The loop returns to the start after the clip ends; it isn't a seamless loop.

Export example (requires ffmpeg; bring your own source film):

```sh
ffmpeg -ss 6.3 -t 5.5 -i input.mp4 -filter_complex "fps=20,scale=800:-1:flags=lanczos,split[a][b];[a]palettegen=stats_mode=diff:max_colors=192[p];[b][p]paletteuse=dither=bayer:bayer_scale=3:diff_mode=rectangle" -loop 0 mario-claude.gif
```

Huashu's likeness in the GIFs follows the demonstration-only usage restriction in the repository README.
