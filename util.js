const request = require('request')
const quirc = require('node-quirc')

const urlToBuffer = (url) => {
  return new Promise((resolve) => {
    request({
      url,
      encoding: null
    }, (err, res, buffer) => {
      if (err) {
        // something happen when downloading file buffer
        console.error(err)
        return resolve(false)
      }
      return resolve(buffer)
    })
  })
}

const qrDecode = (fileBuffer) => {
  return new Promise((resolve) => {
    quirc.decode(fileBuffer, (err, codes) => {
      if (err) {
        // something happen when decoding file buffer
        console.error(err)
        return resolve(false)
      }
      const result = codes.map(x => x.data.toString('utf-8'))
      return result.length
        ? resolve(result[0])
        : resolve(false)
    })
  })
}

module.exports = {
  urlToBuffer,
  qrDecode
}