import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const MockAllowlistModule = buildModule("MockAllowlistModule", (m) => {
  
  const mockAllowlist = m.contract("MockAllowlistReceiver");

  return { mockAllowlist };
});

export default MockAllowlistModule;