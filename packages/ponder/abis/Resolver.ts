export const ResolverAbi = [
  // Read
  {
    name: 'addr',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'node', type: 'bytes32' }],
    outputs: [{ name: '', type: 'address' }],
  },
  {
    name: 'text',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
    ],
    outputs: [{ name: '', type: 'string' }],
  },
  // Write
  {
    name: 'setAddr',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'newAddr', type: 'address' },
    ],
    outputs: [],
  },
  {
    name: 'setText',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'node', type: 'bytes32' },
      { name: 'key', type: 'string' },
      { name: 'value', type: 'string' },
    ],
    outputs: [],
  },
  // Events
  {
    name: 'AddrChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'addr', type: 'address', indexed: false },
    ],
  },
  {
    name: 'TextChanged',
    type: 'event',
    inputs: [
      { name: 'node', type: 'bytes32', indexed: true },
      { name: 'key', type: 'string', indexed: false },
      { name: 'value', type: 'string', indexed: false },
    ],
  },
] as const;
