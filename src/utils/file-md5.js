'use strict'

import './js-spark-md5'
import SparkMD5 from 'spark-md5'

export default function (file, callback, chunkSize, callback2) {
  const blobSlice =
    File.prototype.slice ||
    File.prototype.mozSlice ||
    File.prototype.webkitSlice
  // file = file // Read in chunks of 2MB
  const chunks = Math.ceil(file.size / chunkSize)
  let currentChunk = 0
  const spark = new SparkMD5.ArrayBuffer()
  const fileReader = new FileReader()

  fileReader.onload = function (e) {
    callback2(currentChunk + 1, chunks, e)
    console.log('read chunk nr', currentChunk + 1, 'of', chunks)
    spark.append(e.target.result) // Append array buffer
    currentChunk++

    if (currentChunk < chunks) {
      console.log(currentChunk, chunks)
      loadNext()
    } else {
      callback(null, spark.end())
      console.log('finished loading')
    }
  }

  fileReader.onerror = function (e) {
    console.log('upload file error: ')
    console.log(e)
    callback('oops, something went wrong.')
  }

  function loadNext() {
    const start = currentChunk * parseInt(chunkSize)
    const end =
      start + parseInt(chunkSize) >= file.size
        ? file.size
        : start + parseInt(chunkSize)
    fileReader.readAsArrayBuffer(blobSlice.call(file, start, end))
  }

  loadNext()
}
