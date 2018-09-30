const crypto = require('crypto');
const { MerkleTree } = require('.');

const sha256 = preimage =>
  crypto
    .createHash('sha256')
    .update(preimage)
    .digest();

describe('Merkle Tree', () => {
  describe('Constructor error cases', () => {
    it('Errors if leaves are not an array', () => {
      expect(() => new MerkleTree()).toThrow();
    });
    it('Errors with no leaves', () => {
      expect(() => new MerkleTree([], sha256)).toThrow();
    });
    it('Errors if leaves are not buffers', () => {
      expect(() => new MerkleTree(['hello', 'world'], sha256)).toThrow();
      expect(
        () => new MerkleTree([Buffer.alloc(16), 'world'], sha256),
      ).toThrow();
    });
  });
  describe('Small Merkle Tree', () => {
    const unhashedLeaves = ['hello', 'world'];
    const hashedLeaves = unhashedLeaves.map(sha256);
    const smallMerkleTree = new MerkleTree(hashedLeaves, sha256);

    it('creates expected layers', () => {
      const rootInHex =
        '7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2';
      expect(smallMerkleTree.getPrettyLayers()).toEqual([
        [
          '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
          '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
        ],
        [rootInHex],
      ]);
      expect(smallMerkleTree.getPrettyRoot()).toEqual(rootInHex);

      expect(smallMerkleTree.toString()).toMatchInlineSnapshot(
        `"[[\\"2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824\\",\\"486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7\\"],[\\"7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2\\"]]"`,
      );
    });
    it('creates correct proofs', () => {
      const proof0 = smallMerkleTree.getPrettyProof(hashedLeaves[0]);
      expect(proof0).toEqual({
        leaf:
          '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
        root:
          '7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2',
        siblings: [
          {
            siblingHash:
              '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
            siblingPosition: 'right',
          },
        ],
      });
      const proof1 = smallMerkleTree.getPrettyProof(hashedLeaves[1]);
      expect(proof1).toEqual({
        leaf:
          '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
        root:
          '7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2',
        siblings: [
          {
            siblingHash:
              '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
            siblingPosition: 'left',
          },
        ],
      });
      const badProof = smallMerkleTree.getPrettyProof(Buffer.from('hi'));
      expect(badProof).toMatchInlineSnapshot(`
Object {
  "leaf": "6869",
  "root": "7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2",
  "siblings": Array [],
}
`);
    });
    it('can prove an item is in the tree', () => {
      const leaf = hashedLeaves[0];
      const proof = smallMerkleTree.getProof(leaf);
      expect(smallMerkleTree.verifyProof(proof)).toBe(true);

      const leaf2 = hashedLeaves[1];
      const proof2 = smallMerkleTree.getProof(leaf2);
      expect(smallMerkleTree.verifyProof(proof2)).toBe(true);
    });
  });
  describe('Edge cases', () => {
    describe('An uneven tree', () => {
      const unhashedLeaves = ['hello', 'world', 'foo'];
      const hashedLeaves = unhashedLeaves.map(sha256);
      const unevenTree = new MerkleTree(hashedLeaves, sha256);
      it('creates correct proofs', () => {
        const proof0 = unevenTree.getPrettyProof(hashedLeaves[0]);
        expect(proof0).toEqual({
          leaf:
            '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
          root:
            'ea150034b1804b2bddd35b65d55d675252f0d9ef4ba6d47f8f457895283eabdb',
          siblings: [
            {
              siblingHash:
                '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
              siblingPosition: 'right',
            },
            {
              siblingHash:
                '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
              siblingPosition: 'right',
            },
          ],
        });

        const proof1 = unevenTree.getPrettyProof(hashedLeaves[1]);
        expect(proof1).toEqual({
          leaf:
            '486ea46224d1bb4fb680f34f7c9ad96a8f24ec88be73ea8e5a6c65260e9cb8a7',
          root:
            'ea150034b1804b2bddd35b65d55d675252f0d9ef4ba6d47f8f457895283eabdb',
          siblings: [
            {
              siblingHash:
                '2cf24dba5fb0a30e26e83b2ac5b9e29e1b161e5c1fa7425e73043362938b9824',
              siblingPosition: 'left',
            },
            {
              siblingHash:
                '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',
              siblingPosition: 'right',
            },
          ],
        });

        const proof2 = unevenTree.getPrettyProof(hashedLeaves[2]);
        expect(proof2).toEqual({
          leaf:
            '2c26b46b68ffc68ff99b453c1d30413413422d706483bfa0f98a5e886266e7ae',

          root:
            'ea150034b1804b2bddd35b65d55d675252f0d9ef4ba6d47f8f457895283eabdb',
          siblings: [
            {
              siblingHash:
                '7305db9b2abccd706c256db3d97e5ff48d677cfe4d3a5904afb7da0e3950e1e2',
              siblingPosition: 'left',
            },
          ],
        });
      });
    });

    describe('collision attacks', () => {
      it('is vulnerable to a collision attack if the same hash function is used for leaves and inner nodes', () => {
        const tree1Preimages = ['hello', 'world', 'foo', 'bar'].map(
          Buffer.from,
        );
        const tree1Leaves = tree1Preimages.map(sha256);
        const tree1 = new MerkleTree(tree1Leaves, sha256);
        const tree1Root = tree1.getRoot();

        const tree2Preimages = [
          Buffer.concat([tree1Leaves[0], tree1Leaves[1]]),
          Buffer.concat([tree1Leaves[2], tree1Leaves[3]]),
        ];
        const tree2Leaves = tree2Preimages.map(sha256);
        const tree2 = new MerkleTree(tree2Leaves, sha256);
        const tree2Root = tree2.getRoot();

        // the two trees have the same root, despite having different leaves
        expect(tree1Root.equals(tree2Root)).toBeTruthy();
      });

      it('is is safe from collision attack if it uses a different hash function for leaves vs inner nodes', () => {
        const leafHashFunction = inputBuffer =>
          sha256(Buffer.concat([Buffer.alloc(1, 0), inputBuffer]));
        const innerHashFunction = inputBuffer =>
          sha256(Buffer.concat([Buffer.alloc(1, 1), inputBuffer]));

        const tree1Preimages = ['hello', 'world', 'foo', 'bar'].map(
          Buffer.from,
        );
        const tree1Leaves = tree1Preimages.map(leafHashFunction);
        const tree1 = new MerkleTree(tree1Leaves, innerHashFunction);
        const tree1Root = tree1.getRoot();

        const tree2Preimages = [
          Buffer.concat([tree1Leaves[0], tree1Leaves[1]]),
          Buffer.concat([tree1Leaves[2], tree1Leaves[3]]),
        ];
        const tree2Leaves = tree2Preimages.map(leafHashFunction);
        const tree2 = new MerkleTree(tree2Leaves, innerHashFunction);
        const tree2Root = tree2.getRoot();

        expect(tree1Root.equals(tree2Root)).toBeFalsy();
      });
    });
  });
});
