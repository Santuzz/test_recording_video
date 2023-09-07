import os

ffmpeg_path = os.path.abspath("ffmpeg")
os.environ["IMAGEIO_FFMPEG_EXE"] = ffmpeg_path

from moviepy.editor import VideoFileClip, clips_array, concatenate_videoclips

# https://zulko.github.io/moviepy/getting_started/compositing.html#compositevideoclips

video1 = VideoFileClip("./server/uploads.nosync/145507.webm")
video2 = VideoFileClip("./server/uploads.nosync/145512.webm")
video3 = VideoFileClip("./server/uploads.nosync/145517.webm")
video4 = VideoFileClip("./server/uploads.nosync/145522.webm")
video5 = VideoFileClip("./server/uploads.nosync/145527.webm")
video6 = VideoFileClip("./server/uploads.nosync/145532.webm")
final_video = concatenate_videoclips([video1, video2, video3, video4, video5, video6])
final_video.write_videofile("final_video.webm")
