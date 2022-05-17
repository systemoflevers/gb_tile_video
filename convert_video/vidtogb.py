import itertools
import ffmpeg
import base64


input_file = 'maybe_real06_01.mp4'

palette_file = 'gb_palette_green.png'
out_name = 'test_20'

width = 160
height = 144


input = ffmpeg.input(input_file)

processed_input = (
    input
    .filter('scale', height=height, width=-1)
    .filter('crop', width, height)
)

paletted_input = (
    ffmpeg.filter(
        [
            processed_input,
            ffmpeg.input(palette_file),
        ],
        'paletteuse',
        dither='bayer'
    )
)

raw_pipe_output_process = paletted_input.output(
    'pipe:',
    s=f'{width}x{height}',
    format='rawvideo',
    pix_fmt='gray',
    r=30
).run_async(pipe_stdout=True, pipe_stderr=True)

# row x column
tile_coordinates = list(itertools.product(range(18), range(20)))

def getTileBytes(r, c, frame):
    tile_values = []
    indexes = []
    start = 20*8*8*r + c*8
    for i in range(8):
        indexes.append(start)
        tile_values += frame[start:start+8]
        start += 20*8
    return bytes(tile_values)


def tileRowTo2bpp(row_bytes):
    """turns an 8 byte 2bpp (pixel per byte) row into 2 bytes of 2bpp format."""
    upper = 0
    lower = 0
    upper_bits = []
    lower_bits = []
    for b in row_bytes:
        upper <<= 1
        u = b >> 1
        upper_bits.append(u)
        upper |= u
        lower <<= 1
        l = b & 1
        lower_bits.append(l)
        lower |= l
    #return bytes([upper, lower])
    return bytes([lower, upper])

def makeTile(r, c, frame):
    tile_bytes = getTileBytes(r, c, frame)
    
    tile = bytes()
    for row in chunker(tile_bytes, 8):
        tile += tileRowTo2bpp(row)
    return tile

def frameToTiles(frame):
    tiles = bytes()
    for (r, c) in tile_coordinates:
        tiles += makeTile(r, c, frame)
    return tiles


def chunker(seq, size):
    return (seq[pos:pos + size] for pos in range(0, len(seq), size))

lookup = None
encoded_frames = []
raw_frames = []
while True:
    frame_bytes = raw_pipe_output_process.stdout.read(width * height)
    if not frame_bytes:
        break
    if not lookup:
        values = sorted([*set([*frame_bytes])], reverse=True)
        lookup = {v: i for i, v in enumerate(values)}

    
    #tbpp = bytes([lookup[v] for v in frame_bytes])
    #encoded_frames.append(base64.b64encode(tbpp))
    tbpp = [lookup[v] for v in frame_bytes]
    gb_tbpp = frameToTiles(tbpp)
    encoded_frames.append(base64.b64encode(gb_tbpp))
    raw_frames.append(gb_tbpp)
    if len(encoded_frames) % 1000 == 0:
        print(len(encoded_frames))

print(len(encoded_frames))

all_frames = '","'.join((frame.decode('utf-8') for frame in encoded_frames))
#print(all_frames)
print(len(all_frames))

with open('out_data2.js', 'w') as f:
    f.write(f"""
export const frameData = ["{all_frames}"];
""")

with open('raw_frame_data', 'wb') as f:
    for frame in raw_frames:
        f.write(frame)

raw_pipe_output_process.stdout.close()
raw_pipe_output_process.wait()
print('done')
