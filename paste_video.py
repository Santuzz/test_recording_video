import os

path = './server/uploads.nosync/'
file_ext = 'webm'

files = [filename for filename in os.listdir(path) if
         filename.endswith(f".{file_ext}") and not filename.startswith("output")]
# Ordina i nomi dei file per data di creazione
files.sort(key=lambda x: os.path.getctime(os.path.join(path, x)))

with open(path + 'video_list.txt', 'w') as file:
    for filename in files:
        file.write(f"file './{filename}'\n")

os.system(f'ffmpeg -y -f concat -safe 0 -i {path}video_list.txt -c copy {path}output.{file_ext}')
"""

import sys

# Ottieni il nome del file ffmpeg in base al sistema operativo
if sys.platform == "win32":
    ffmpeg_filename = "ffmpeg_win/bin/ffmpeg.exe"
elif sys.platform == "darwin":
    ffmpeg_filename = "ffmpeg_macos"
else:
    raise Exception("Sistema operativo non supportato")

ffmpeg_path = os.path.abspath(ffmpeg_filename)
os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_path

from moviepy.editor import VideoFileClip, clips_array, concatenate_videoclips

# https://zulko.github.io/moviepy/getting_started/compositing.html#compositevideoclips

video1 = VideoFileClip("./server/uploads.nosync/095210.webm")
video2 = VideoFileClip("./server/uploads.nosync/095215.webm")
#video3 = VideoFileClip("./server/uploads.nosync/100003.webm")
#video4 = VideoFileClip("./server/uploads.nosync/100008.webm")
#video5 = VideoFileClip("./server/uploads.nosync/100013.webm")
#video6 = VideoFileClip("./server/uploads.nosync/100018.webm")
final_video = concatenate_videoclips([video1, video2])
final_video.write_videofile("final_video.webm")
"""
