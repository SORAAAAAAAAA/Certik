// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title CertificateNFT
 * @dev NFT contract for issuing blockchain-based certificates on Base L2
 * Each certificate is a unique NFT with metadata stored on IPFS (via Pinata)
 */
contract CertificateNFT is ERC721, ERC721URIStorage, Ownable {
    // Token ID counter
    uint256 private _nextTokenId;
    
    // Mapping from token ID to issuer address
    mapping(uint256 => address) private _certificateIssuers;
    
    // Mapping from token ID to revocation status
    mapping(uint256 => bool) private _revokedCertificates;
    
    // Mapping from token ID to issue timestamp
    mapping(uint256 => uint256) private _issueTimestamps;
    
    // Events
    event CertificateMinted(
        uint256 indexed tokenId,
        address indexed recipient,
        address indexed issuer,
        string metadataURI,
        uint256 timestamp
    );
    
    event CertificateRevoked(
        uint256 indexed tokenId,
        address indexed revokedBy,
        uint256 timestamp
    );
    
    constructor() ERC721("Certificate", "CERT") Ownable(msg.sender) {
        // Start token IDs at 1
        _nextTokenId = 1;
    }
    
    /**
     * @dev Mint a new certificate NFT
     * @param recipient Address that will receive the certificate
     * @param metadataURI IPFS URI pointing to certificate metadata (from Pinata)
     * @return tokenId The ID of the newly minted certificate
     */
    function mintCertificate(
        address recipient,
        string memory metadataURI
    ) public onlyOwner returns (uint256) {
        require(recipient != address(0), "Invalid recipient address");
        require(bytes(metadataURI).length > 0, "Metadata URI cannot be empty");
        
        uint256 tokenId = _nextTokenId++;
        
        _safeMint(recipient, tokenId);
        _setTokenURI(tokenId, metadataURI);
        
        _certificateIssuers[tokenId] = msg.sender;
        _issueTimestamps[tokenId] = block.timestamp;
        
        emit CertificateMinted(
            tokenId,
            recipient,
            msg.sender,
            metadataURI,
            block.timestamp
        );
        
        return tokenId;
    }
    
    /**
     * @dev Batch mint multiple certificates
     * @param recipients Array of recipient addresses
     * @param metadataURIs Array of IPFS URIs for each certificate
     * @return tokenIds Array of minted token IDs
     */
    function batchMintCertificates(
        address[] memory recipients,
        string[] memory metadataURIs
    ) public onlyOwner returns (uint256[] memory) {
        require(
            recipients.length == metadataURIs.length,
            "Recipients and URIs length mismatch"
        );
        require(recipients.length > 0, "Empty arrays provided");
        
        uint256[] memory tokenIds = new uint256[](recipients.length);
        
        for (uint256 i = 0; i < recipients.length; i++) {
            tokenIds[i] = mintCertificate(recipients[i], metadataURIs[i]);
        }
        
        return tokenIds;
    }
    
    /**
     * @dev Revoke a certificate (marks it as invalid)
     * @param tokenId The ID of the certificate to revoke
     */
    function revokeCertificate(uint256 tokenId) public onlyOwner {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        require(!_revokedCertificates[tokenId], "Certificate already revoked");
        
        _revokedCertificates[tokenId] = true;
        
        emit CertificateRevoked(tokenId, msg.sender, block.timestamp);
    }
    
    /**
     * @dev Check if a certificate is valid (exists and not revoked)
     * @param tokenId The ID of the certificate to check
     * @return bool True if certificate is valid, false otherwise
     */
    function isCertificateValid(uint256 tokenId) public view returns (bool) {
        return _ownerOf(tokenId) != address(0) && !_revokedCertificates[tokenId];
    }
    
    /**
     * @dev Get the issuer of a certificate
     * @param tokenId The ID of the certificate
     * @return address The address that issued the certificate
     */
    function getCertificateIssuer(uint256 tokenId) public view returns (address) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return _certificateIssuers[tokenId];
    }
    
    /**
     * @dev Get the issue timestamp of a certificate
     * @param tokenId The ID of the certificate
     * @return uint256 The timestamp when the certificate was issued
     */
    function getIssueTimestamp(uint256 tokenId) public view returns (uint256) {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        return _issueTimestamps[tokenId];
    }
    
    /**
     * @dev Check if a certificate has been revoked
     * @param tokenId The ID of the certificate
     * @return bool True if revoked, false otherwise
     */
    function isRevoked(uint256 tokenId) public view returns (bool) {
        return _revokedCertificates[tokenId];
    }
    
    /**
     * @dev Get comprehensive certificate information
     * @param tokenId The ID of the certificate
     * @return owner Address of the certificate owner
     * @return issuer Address that issued the certificate
     * @return metadataURI IPFS URI of the certificate metadata
     * @return issuedAt Timestamp when certificate was issued
     * @return isValid Whether the certificate is currently valid
     * @return revoked Whether the certificate has been revoked
     */
    function getCertificateInfo(uint256 tokenId) 
        public 
        view 
        returns (
            address owner,
            address issuer,
            string memory metadataURI,
            uint256 issuedAt,
            bool isValid,
            bool revoked
        ) 
    {
        require(_ownerOf(tokenId) != address(0), "Certificate does not exist");
        
        return (
            ownerOf(tokenId),
            _certificateIssuers[tokenId],
            tokenURI(tokenId),
            _issueTimestamps[tokenId],
            isCertificateValid(tokenId),
            _revokedCertificates[tokenId]
        );
    }
    
    /**
     * @dev Get the total number of certificates minted
     * @return uint256 Total number of certificates
     */
    function getTotalCertificates() public view returns (uint256) {
        return _nextTokenId - 1;
    }
    
    // Required overrides
    function tokenURI(uint256 tokenId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (string memory)
    {
        return super.tokenURI(tokenId);
    }
    
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721, ERC721URIStorage)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
