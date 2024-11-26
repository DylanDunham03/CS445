import GIF from 'gif.js';

export const convertToGif = async (videoBlob: Blob): Promise<Blob> => {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.src = URL.createObjectURL(videoBlob);
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d')!;
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: 320,
      height: 320
    });

    video.onloadedmetadata = () => {
      canvas.width = 320;
      canvas.height = 320;
      
      const totalFrames = 30; // Number of frames we want in our GIF
      const frameInterval = video.duration / totalFrames;
      let currentFrame = 0;

      const captureFrame = () => {
        if (currentFrame < totalFrames) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          gif.addFrame(ctx, { copy: true, delay: 100 });
          currentFrame++;
          
          // Calculate next frame time
          const nextTime = currentFrame * frameInterval;
          if (nextTime < video.duration) {
            video.currentTime = nextTime;
          } else {
            gif.render();
          }
        }
      };

      // Handle frame capture
      video.onseeked = captureFrame;
      
      // Start capturing frames
      video.currentTime = 0;
    };

    gif.on('finished', (blob: Blob) => {
      URL.revokeObjectURL(video.src); // Clean up
      resolve(blob);
    });

    video.onerror = (e) => {
      URL.revokeObjectURL(video.src); // Clean up
      reject(e);
    };
  });
};
