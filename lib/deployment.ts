/** Static deployment facts (public hashes only). */
export const DEPLOYMENT = {
  network: "GenLayer Studionet",
  chainId: 61999,
  deployer: "0xe5F9A704EB8fb5dB4D476e76d16AB3984257037D",
  contractAddress: "0x51F7F3076383D85dca90E243f2Ae78DF3f096366",
  deployTxHash: "0xec18eef51060f015447d8c1e7fce05af56cdc3d7b55a6d1836aab2827fb0daf7",
  faucetTxHash: "0xa1a19db586150e450b8a3cc78915ad5fb90c1bf222258a666324dfc6ce423f2a",
  smoke: [
    { label: "register_project", hash: "0xd37df703eccd7104a03275d80b61e0a269fc1eae49bbfc1304d0d75b078adeab" },
    { label: "activate_project", hash: "0xc56955518497b07922160f3d61847336effc915b8f21fb97b16990d29cad37a7" },
    { label: "submit_contribution", hash: "0xa976507f5280b494e56b044cf7b2935f7b6775a3fa0dd6a86eff1bd7c0e9f294" },
    { label: "assess_contribution (rejected/q10/gaming85)", hash: "0xcb39b0e7320abc251a0de85e743257a76beeff51a156aba4c8a5e9429c8e5b20" },
    { label: "challenge_contribution", hash: "0x9b0002142e2b87ad5b69515731de3968551c92bc4f75cfa37f14ee7f22214c9b" },
    { label: "file_appeal", hash: "0x7be43059bb8104135fbb5282d4edeceeb384f222f310f24f5e7dd29a97bc0e9c" },
    { label: "resolve_challenge (dismissed)", hash: "0x954fbed26faeaf31f81a8e7f34bf8cbf8af48080c29ee21276dda8698df10c06" },
    { label: "resolve_appeal (denied)", hash: "0xf26f8607f5d8744c21a2e89842811a2d680407f059e8b7accb9171d11f3cebc7" },
    { label: "finalize_project_rank (ranked)", hash: "0x9b2a35fdf5ae3f9e27c9409ec47c3b3d056e7cca463a29dc1e8f08d6cacdf50d" },
    { label: "archive_project", hash: "0x07ef06fdd586848d394d5f024f700a8164677ff9bae43926fec3390747ab09b3" },
  ],
} as const;
