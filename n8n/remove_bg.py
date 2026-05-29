from PIL import Image
import glob
import os

for path in glob.glob('public/rocket_frames/*.png'):
    img = Image.open(path).convert("RGBA")
    data = img.getdata()
    new_data = []
    for item in data:
        # Check if it's very close to white
        if item[0] > 240 and item[1] > 240 and item[2] > 240:
            new_data.append((255, 255, 255, 0)) # transparent
        else:
            new_data.append(item)
    img.putdata(new_data)
    img.save(path, "PNG")
    print(f"Processed {path}")
