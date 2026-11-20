const https = require('https');
const sizeOf = require('image-size');

const url = 'https://res.cloudinary.com/dcduoocev/image/upload/image3_pmvvzf.jpg';

https.get(url, function(response) {
  const chunks = [];
  response.on('data', function(chunk) {
    chunks.push(chunk);
  }).on('end', function() {
    const buffer = Buffer.concat(chunks);
    let dimensions;
    try {
        dimensions = sizeOf.imageSize(buffer);
    } catch(e) {
        dimensions = sizeOf(buffer);
    }
    console.log(dimensions);
    
    // Check aspect ratio
    const ratio = dimensions.width / dimensions.height;
    console.log('Aspect Ratio:', ratio);
    
    if (ratio < 0.8 || ratio > 1.91) {
        console.log('WARNING: Aspect ratio is outside Instagram allowed range (4:5 to 1.91:1) -> (0.8 to 1.91)');
    } else {
        console.log('Aspect ratio is OK');
    }
  });
});
