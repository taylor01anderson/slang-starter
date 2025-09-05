const hre = require('hardhat');

async function main() {
  console.log('Deploying Audio NFT contracts...');

  // Deploy AudioNFT contract
  const AudioNFT = await hre.ethers.getContractFactory('AudioNFT');
  const audioNFT = await AudioNFT.deploy();
  await audioNFT.deployed();

  console.log(`AudioNFT deployed to: ${audioNFT.address}`);

  // Deploy AudioNFTMarketplace contract
  const AudioNFTMarketplace = await hre.ethers.getContractFactory(
    'AudioNFTMarketplace'
  );
  const marketplace = await AudioNFTMarketplace.deploy(audioNFT.address);
  await marketplace.deployed();

  console.log(`AudioNFTMarketplace deployed to: ${marketplace.address}`);

  // Save deployment addresses
  const deploymentData = {
    network: hre.network.name,
    audioNFT: audioNFT.address,
    marketplace: marketplace.address,
    deployedAt: new Date().toISOString(),
  };

  console.log('\nDeployment Summary:');
  console.log('==================');
  console.log(`Network: ${deploymentData.network}`);
  console.log(`AudioNFT Contract: ${deploymentData.audioNFT}`);
  console.log(`Marketplace Contract: ${deploymentData.marketplace}`);
  console.log(`Deployed At: ${deploymentData.deployedAt}`);

  // Wait for block confirmations on testnets/mainnet
  if (hre.network.name !== 'localhost' && hre.network.name !== 'hardhat') {
    console.log('\nWaiting for block confirmations...');
    await audioNFT.deployTransaction.wait(6);
    await marketplace.deployTransaction.wait(6);

    console.log('\nVerifying contracts on Etherscan...');

    try {
      await hre.run('verify:verify', {
        address: audioNFT.address,
        constructorArguments: [],
      });
      console.log('AudioNFT contract verified');
    } catch (error) {
      console.log('AudioNFT verification failed:', error.message);
    }

    try {
      await hre.run('verify:verify', {
        address: marketplace.address,
        constructorArguments: [audioNFT.address],
      });
      console.log('AudioNFTMarketplace contract verified');
    } catch (error) {
      console.log('AudioNFTMarketplace verification failed:', error.message);
    }
  }

  console.log('\nDeployment completed successfully!');

  // Save to file for frontend integration
  const fs = require('fs');
  const path = require('path');

  const deploymentPath = path.join(__dirname, '../deployments');
  if (!fs.existsSync(deploymentPath)) {
    fs.mkdirSync(deploymentPath, { recursive: true });
  }

  fs.writeFileSync(
    path.join(deploymentPath, `${hre.network.name}.json`),
    JSON.stringify(deploymentData, null, 2)
  );

  console.log(`Deployment data saved to deployments/${hre.network.name}.json`);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
