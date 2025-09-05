// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./AudioNFT.sol";

/**
 * @title AudioNFTMarketplace
 * @dev Marketplace contract for trading audio NFTs
 */
contract AudioNFTMarketplace is ReentrancyGuard, Ownable {
    
    struct Listing {
        uint256 tokenId;
        address seller;
        uint256 price;
        bool active;
        uint256 listedAt;
    }

    struct Offer {
        uint256 tokenId;
        address buyer;
        uint256 amount;
        uint256 expiresAt;
        bool active;
    }

    AudioNFT public audioNFTContract;
    
    // Mapping from token ID to listing
    mapping(uint256 => Listing) public listings;
    
    // Mapping from token ID to array of offers
    mapping(uint256 => Offer[]) public tokenOffers;
    
    // Platform fee percentage (in basis points)
    uint256 public platformFee = 250; // 2.5%
    
    // Minimum listing duration
    uint256 public constant MIN_LISTING_DURATION = 1 hours;
    
    // Maximum listing duration
    uint256 public constant MAX_LISTING_DURATION = 365 days;

    // Events
    event TokenListed(
        uint256 indexed tokenId,
        address indexed seller,
        uint256 price,
        uint256 listedAt
    );
    
    event TokenSold(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 price,
        uint256 soldAt
    );
    
    event ListingCancelled(
        uint256 indexed tokenId,
        address indexed seller
    );
    
    event OfferMade(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount,
        uint256 expiresAt
    );
    
    event OfferAccepted(
        uint256 indexed tokenId,
        address indexed seller,
        address indexed buyer,
        uint256 amount
    );
    
    event OfferCancelled(
        uint256 indexed tokenId,
        address indexed buyer,
        uint256 amount
    );

    constructor(address _audioNFTContract) {
        audioNFTContract = AudioNFT(_audioNFTContract);
    }

    /**
     * @dev List a token for sale
     */
    function listToken(uint256 tokenId, uint256 price) 
        public 
        nonReentrant 
    {
        require(price > 0, "Price must be greater than 0");
        require(audioNFTContract.ownerOf(tokenId) == msg.sender, "You don't own this token");
        require(audioNFTContract.getApproved(tokenId) == address(this) || 
                audioNFTContract.isApprovedForAll(msg.sender, address(this)), 
                "Contract not approved to transfer token");
        require(!listings[tokenId].active, "Token already listed");

        listings[tokenId] = Listing({
            tokenId: tokenId,
            seller: msg.sender,
            price: price,
            active: true,
            listedAt: block.timestamp
        });

        emit TokenListed(tokenId, msg.sender, price, block.timestamp);
    }

    /**
     * @dev Cancel a listing
     */
    function cancelListing(uint256 tokenId) public nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Token not listed");
        require(listing.seller == msg.sender, "You didn't list this token");

        listing.active = false;
        
        emit ListingCancelled(tokenId, msg.sender);
    }

    /**
     * @dev Buy a listed token
     */
    function buyToken(uint256 tokenId) public payable nonReentrant {
        Listing storage listing = listings[tokenId];
        require(listing.active, "Token not listed");
        require(msg.value >= listing.price, "Insufficient payment");
        require(msg.sender != listing.seller, "Cannot buy your own token");

        address seller = listing.seller;
        uint256 price = listing.price;
        
        // Mark as sold
        listing.active = false;

        // Calculate fees
        uint256 platformFeeAmount = calculatePlatformFee(price);
        (address creator, uint256 royaltyAmount) = audioNFTContract.calculateRoyalty(tokenId, price);
        uint256 sellerAmount = price - platformFeeAmount - royaltyAmount;

        // Transfer NFT
        audioNFTContract.safeTransferFrom(seller, msg.sender, tokenId);

        // Distribute payments
        if (royaltyAmount > 0 && creator != seller) {
            payable(creator).transfer(royaltyAmount);
        } else {
            sellerAmount += royaltyAmount; // If creator is seller, add royalty to seller amount
        }
        
        payable(seller).transfer(sellerAmount);
        
        if (platformFeeAmount > 0) {
            payable(owner()).transfer(platformFeeAmount);
        }

        // Refund excess payment
        if (msg.value > price) {
            payable(msg.sender).transfer(msg.value - price);
        }

        emit TokenSold(tokenId, seller, msg.sender, price, block.timestamp);
    }

    /**
     * @dev Make an offer on a token
     */
    function makeOffer(uint256 tokenId, uint256 duration) 
        public 
        payable 
        nonReentrant 
    {
        require(msg.value > 0, "Offer must be greater than 0");
        require(duration >= MIN_LISTING_DURATION && duration <= MAX_LISTING_DURATION, 
                "Invalid offer duration");
        require(audioNFTContract.exists(tokenId), "Token does not exist");
        require(audioNFTContract.ownerOf(tokenId) != msg.sender, "Cannot offer on your own token");

        uint256 expiresAt = block.timestamp + duration;
        
        tokenOffers[tokenId].push(Offer({
            tokenId: tokenId,
            buyer: msg.sender,
            amount: msg.value,
            expiresAt: expiresAt,
            active: true
        }));

        emit OfferMade(tokenId, msg.sender, msg.value, expiresAt);
    }

    /**
     * @dev Accept an offer
     */
    function acceptOffer(uint256 tokenId, uint256 offerIndex) 
        public 
        nonReentrant 
    {
        require(audioNFTContract.ownerOf(tokenId) == msg.sender, "You don't own this token");
        require(offerIndex < tokenOffers[tokenId].length, "Invalid offer index");
        
        Offer storage offer = tokenOffers[tokenId][offerIndex];
        require(offer.active, "Offer not active");
        require(offer.expiresAt > block.timestamp, "Offer expired");

        address buyer = offer.buyer;
        uint256 amount = offer.amount;
        
        // Mark offer as inactive
        offer.active = false;

        // If token is listed, cancel the listing
        if (listings[tokenId].active) {
            listings[tokenId].active = false;
        }

        // Calculate fees
        uint256 platformFeeAmount = calculatePlatformFee(amount);
        (address creator, uint256 royaltyAmount) = audioNFTContract.calculateRoyalty(tokenId, amount);
        uint256 sellerAmount = amount - platformFeeAmount - royaltyAmount;

        // Transfer NFT
        audioNFTContract.safeTransferFrom(msg.sender, buyer, tokenId);

        // Distribute payments
        if (royaltyAmount > 0 && creator != msg.sender) {
            payable(creator).transfer(royaltyAmount);
        } else {
            sellerAmount += royaltyAmount;
        }
        
        payable(msg.sender).transfer(sellerAmount);
        
        if (platformFeeAmount > 0) {
            payable(owner()).transfer(platformFeeAmount);
        }

        emit OfferAccepted(tokenId, msg.sender, buyer, amount);
        emit TokenSold(tokenId, msg.sender, buyer, amount, block.timestamp);
    }

    /**
     * @dev Cancel an offer
     */
    function cancelOffer(uint256 tokenId, uint256 offerIndex) 
        public 
        nonReentrant 
    {
        require(offerIndex < tokenOffers[tokenId].length, "Invalid offer index");
        
        Offer storage offer = tokenOffers[tokenId][offerIndex];
        require(offer.active, "Offer not active");
        require(offer.buyer == msg.sender, "You didn't make this offer");

        uint256 amount = offer.amount;
        offer.active = false;

        // Refund the offer amount
        payable(msg.sender).transfer(amount);

        emit OfferCancelled(tokenId, msg.sender, amount);
    }

    /**
     * @dev Get active offers for a token
     */
    function getActiveOffers(uint256 tokenId) 
        public 
        view 
        returns (Offer[] memory) 
    {
        Offer[] memory allOffers = new Offer[](tokenOffers[tokenId].length);
        uint256 activeCount = 0;

        for (uint256 i = 0; i < tokenOffers[tokenId].length; i++) {
            if (tokenOffers[tokenId][i].active && 
                tokenOffers[tokenId][i].expiresAt > block.timestamp) {
                allOffers[activeCount] = tokenOffers[tokenId][i];
                activeCount++;
            }
        }

        // Create array with only active offers
        Offer[] memory activeOffers = new Offer[](activeCount);
        for (uint256 i = 0; i < activeCount; i++) {
            activeOffers[i] = allOffers[i];
        }

        return activeOffers;
    }

    /**
     * @dev Calculate platform fee
     */
    function calculatePlatformFee(uint256 price) public view returns (uint256) {
        return (price * platformFee) / 10000;
    }

    /**
     * @dev Update platform fee (only owner)
     */
    function updatePlatformFee(uint256 newFee) public onlyOwner {
        require(newFee <= 1000, "Platform fee too high"); // Max 10%
        platformFee = newFee;
    }

    /**
     * @dev Get listing details
     */
    function getListing(uint256 tokenId) public view returns (Listing memory) {
        return listings[tokenId];
    }

    /**
     * @dev Check if token is listed
     */
    function isTokenListed(uint256 tokenId) public view returns (bool) {
        return listings[tokenId].active;
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

    /**
     * @dev Emergency function to clean up expired offers
     */
    function cleanupExpiredOffers(uint256 tokenId) public {
        for (uint256 i = 0; i < tokenOffers[tokenId].length; i++) {
            if (tokenOffers[tokenId][i].active && 
                tokenOffers[tokenId][i].expiresAt <= block.timestamp) {
                
                Offer storage offer = tokenOffers[tokenId][i];
                offer.active = false;
                
                // Refund expired offer
                payable(offer.buyer).transfer(offer.amount);
                
                emit OfferCancelled(tokenId, offer.buyer, offer.amount);
            }
        }
    }
}
