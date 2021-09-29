const beamcoder = require('beamcoder');
const fs = require('fs');
async function run() {
  let demuxer = await beamcoder.demuxer('file:./1.mp4'); // Create a demuxer for a file

  // let decoder = beamcoder.decoder({ name: 'h264' }); // Codec asserted. Can pass in demuxer.
  let videoParams = demuxer.streams.find(x => x.codecpar.codec_type === 'video').codecpar;
  // demuxer.streams.map((x) => {
  //   console.log(x.index, x.type, x.codecpar.codec_type)
  // })
  // console.log(demuxer.streams)
  // Set up a decoder using demuxer stream parameters
  let decoder = beamcoder.decoder({ params: videoParams, stream_index: 0 });
  let packet = await demuxer.read();
  for (let x = 0; x < 1000 && packet != null; x++) {
    packet = await demuxer.read(); // Read next frame. Note: returns null for EOF,)
    console.log(x, packet.stream_index)
    if (packet && packet.stream_index === 0) { // Check demuxer to find index of video stream

      let decResult = await decoder.decode(packet);
      // Do something with the frame data
      // console.log('flush', decResult);

    }
  }
  // for (; packet.stream_index !== 0; packet = await demuxer.read());

  let decResult = await decoder.flush();
  // let decResult = await decoder.flush(); // Must tell the decoder when we are done

  let enc = beamcoder.encoder({ // Create an encoder for JPEG data
    name: 'mjpeg', // FFmpeg does not have an encoder called 'jpeg'
    width: decoder.width,
    height: decoder.height,
    pix_fmt: decoder.pix_fmt.indexOf('422') >= 0 ? 'yuvj422p' : 'yuvj420p',
    time_base: [1, 1]
  });


  for (let i = 0; i < decResult.frames.length; i++) {
    let jpegResult = await enc.encode(decResult.frames[i]);
    // console.log('jpegResult.packets[0].data:', jpegResult.packets[0].data)
    fs.writeFile(`./pic/${i}.jpeg`, jpegResult.packets[0].data, err => {
      if (err) {
        console.log(err)
        return
      }
    })
  }
  await enc.flush(); // Tidy the encoder


  // jpegResult.packets.map(x => {
  //   console.log(x.data)
  // })

  // fs.writeFile(`./${x}.jpeg`, jpegResult.packets[0].data, err => {
  //   if (err) {
  //     console.log(err)
  //     return
  //   }
  // })

}

run();
