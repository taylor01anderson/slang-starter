// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title AudioNFT
 * @dev ERC721 contract for minting audio NFTs with metadata stored on IPFS
 */
contract AudioNFT is ERC721, ERC721URIStorage, Ownable, ReentrancyGuard {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIds;
    
    // Mapping from token ID to creator address
    mapping(uint256 => address) public tokenCreators;
    
    // Mapping from token ID to royalty percentage (in basis points, e.g., 500 = 5%)
    mapping(uint256 => uint256) public tokenRoyalties;
    
    // Platform fee percentage (in basis points)
    uint256 public platformFee = 250; // 2.5%
    
    // Maximum royalty percentage (10%)
    uint256 public constant MAX_ROYALTY = 1000;
    
    // Events
    event AudioNFTMinted(
        uint256 indexed tokenId,
        address indexed creator,
        address indexed owner,
        string tokenURI,
        uint256 royalty
    );
    
    event RoyaltyUpdated(uint256 indexed tokenId, uint256 newRoyalty);
    event PlatformFeeUpdated(uint256 newFee);

    constructor() ERC721("AudioNFT", "ANFT") {}

    /**
     * @dev Mint a new audio NFT
     * @param to Address to mint the NFT to
     * @param tokenURI IPFS URI containing the metadata
     * @param royalty Royalty percentage for the creator (in basis points)
     */
    function mintAudioNFT(
        address to,
        string memory tokenURI,
        uint256 royalty
    ) public nonReentrant returns (uint256) {
        require(royalty <= MAX_ROYALTY, "Royalty too high");
        require(bytes(tokenURI).length > 0, "Token URI cannot be empty");
        
        _tokenIds.increment();
        uint256 newTokenId = _tokenIds.current();
        
        _mint(to, newTokenId);
        _setTokenURI(newTokenId, tokenURI);
        
        tokenCreators[newTokenId] = msg.sender;
        tokenRoyalties[newTokenId] = royalty;
        
        emit AudioNFTMinted(newTokenId, msg.sender, to, tokenURI, royalty);
        
        return newTokenId;
    }

    /**
     * @dev Get the creator of a token
     */
    function getTokenCreator(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Token does not exist");
        return tokenCreators[tokenId];
    }

    /**
     * @dev Get the royalty percentage for a token
     */
    function getTokenRoyalty(uint256 tokenId) public view returns (uint256) {
        require(_exists(tokenId), "Token does not exist");
        return tokenRoyalties[tokenId];
    }

    /**
     * @dev Update royalty for a token (only creator can update)
     */
    function updateTokenRoyalty(uint256 tokenId, uint256 newRoyalty) 
        public 
    {
        require(_exists(tokenId), "Token does not exist");
        require(msg.sender == tokenCreators[tokenId], "Only creator can update royalty");
        require(newRoyalty <= MAX_ROYALTY, "Royalty too high");
        
        tokenRoyalties[tokenId] = newRoyalty;
        emit RoyaltyUpdated(tokenId, newRoyalty);
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = newFee;
        emit PlatformFeeUpdated(newFee);
    }

    /**
     * @dev Calculate royalty amount for a sale
     */
    function calculateRoyalty(uint256 tokenId, uint256 salePrice) 
        public 
        view 
        returns (address creator, uint256 royaltyAmount) 
    {
        require(_exists(tokenId), "Token does not exist");
        creator = tokenCreators[tokenId];
        royaltyAmount = (salePrice * tokenRoyalties[tokenId]) / 10000;
    }

    /**
     * @dev Calculate platform fee for a sale
     */
    function calculatePlatformFee(uint256 salePrice) 
        public 
        view 
        returns (uint256) 
    {
        return (salePrice * platformFee) / 10000;
    }

    /**
     * @dev Get total supply of minted tokens
     */
    function totalSupply() public view returns (uint256) {
        return _tokenIds.current();
    }

    /**
     * @dev Check if a token exists
     */
    function exists(uint256 tokenId) public view returns (bool) {
        return _exists(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function _burn(uint256 tokenId) internal override(ERC721, ERC721URIStorage) {
        super._burn(tokenId);
    }

    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }

    /**
     * @dev Override to support ERC165 interface detection
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }

    /**
     * @dev Withdraw contract balance (only owner)
     */
    function withdraw() public onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No funds to withdraw");
        
        (bool success, ) = payable(owner()).call{value: balance}("");
        require(success, "Withdrawal failed");
    }
}
