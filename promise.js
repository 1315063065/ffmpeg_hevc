let packet = beamcoder.packet({ data: Buffer.from(message.data) });
dec.decode(packet).then((decResult) => {
  // if (decResult.frames.length === 0) // Frame may be buffered, so flush it out
  //   decResult = await dec.flush();
  let enc = beamcoder.encoder({ // Create an encoder for JPEG data
    name: 'mjpeg', // FFmpeg does not have an encoder called 'jpeg'
    width: dec.width,
    height: dec.height,
    pix_fmt: dec.pix_fmt.indexOf('422') >= 0 ? 'yuvj422p' : 'yuvj420p',
    time_base: [1, 1]

  });
  enc.encode(decResult.frames[0]).then(() => {
    enc.flush().then(() => {
      let body = jpegResult.packets[0].data;
      console.log(body)
      enc.encode(decResult.frames[0]).then((jpegResult) => {
        let body = jpegResult.packets[0].data;
        console.log(body)
      })
    })
  })
});

// let jpegResult = await enc.encode(decResult.frames[0]); // Encode the frame
// await enc.flush(); // Tidy the encoder


let packet = beamcoder.packet({ data: Buffer.from(message.data) });
let decResult = await dec.decode(packet);
if (decResult.frames.length === 0) // Frame may be buffered, so flush it out
  decResult = await dec.flush();
let enc = beamcoder.encoder({ // Create an encoder for JPEG data
  name: 'mjpeg', // FFmpeg does not have an encoder called 'jpeg'
  width: dec.width,
  height: dec.height,
  pix_fmt: dec.pix_fmt.indexOf('422') >= 0 ? 'yuvj422p' : 'yuvj420p',
  time_base: [1, 1]
});
let jpegResult = await enc.encode(decResult.frames[0]); // Encode the frame
await enc.flush(); // Tidy the encoder
let body = jpegResult.packets[0].data;
console.log(body)