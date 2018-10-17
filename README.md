# merkletreejs

[![npm (scoped)](https://img.shields.io/npm/v/@sinasabet81/merkletreejs.svg)](https://www.npmjs.com/package/@sinasabet81/merkletreejs)
[![npm bundle size (minified)](https://img.shields.io/bundlephobia/min/@sinasabet81/merkletreejs.svg)](https://www.npmjs.com/package/@sinasabet81/merkletreejs)

## usage
```js
const crypto = require('crypto');
const MerkleTree = require('merkletreejs');

const sha256 = preimage =>
  crypto
    .createHash('sha256')
    .update(preimage)
    .digest();

const preimages = ['hello', 'world'];
const leaves = preimages.map(sha256);

const merkleTree = new MerkleTree(leaves, sha256);

console.log(merkleTree.getPrettyLayers());
// [
//   [
//     '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
//     '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
//   ],
//   ['7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2'],
// ];
```
