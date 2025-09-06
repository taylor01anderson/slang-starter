import { NFTStorage, File } from 'nft.storage';
import dotenv from 'dotenv';
dotenv.config();

const nftStorage = new NFTStorage({ token: process.env.NFT_STORAGE_KEY });

export async function uploadFile(buffer, filename, mimetype) {
  const file = new File([buffer], filename, { type: mimetype });
  const cid = await nftStorage.storeBlob(file);
  return {
    path: cid,
    url: `https://ipfs.io/ipfs/${cid}`,
    filename,
  };
}
