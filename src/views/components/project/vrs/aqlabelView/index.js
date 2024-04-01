export const dataImg =
  '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'
export const dataImgList = [
  { value: 1, id: 1, type: 'NG', select: true },
  { value: 2, id: 2, type: 'OK' },
  { value: 3, id: 3, type: 'OK' },
  { value: 4, id: 4, type: 'NG' },
  { value: 5, id: 5, type: 'OK' },
  { value: 6, id: 6, type: 'NG' },
]
export const checkImgTypeByBase64 = (baseInfo = '') => {
  if (!baseInfo) return `data:image/png;base64,`
  const _sliceStr = baseInfo.slice(0, 3)
  const imgTypeMap = new Map()
  imgTypeMap.set('/9j', 'jpg')
  imgTypeMap.set('iVB', 'png')
  imgTypeMap.set('Qk0', 'bmp')
  imgTypeMap.set('SUk', 'tiff')
  imgTypeMap.set('JVB', 'pdf')
  imgTypeMap.set('UEs', 'ofd')
  // console.log('ccccccccccc', imgTypeMap.get(_sliceStr))
  return `data:image/${imgTypeMap.get(_sliceStr)};base64,`
}

export const colorTag = {
  0: '#8ec67b',
  1: '#19c13c',
  2: '#ffbc45',
  3: '#7d73ff',
  4: '#ff7b7b',
  5: '#c347ee',
  6: '#cab310',
  7: '#33d173',
  8: '#f91dff',
  9: '#ff9c82',
}
