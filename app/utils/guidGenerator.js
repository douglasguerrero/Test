import uuidV1 from 'uuid/v1';

export function generateGUID() {
  return uuidV1({
    node: [0x01, 0x23, 0x45, 0x67, 0x89, 0xab],
    msecs: new Date().getTime(),
  });
}
