// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

/**
 * @title RelationshipManager
 * @dev Manages sponsor-partner relationships with payment functionality
 */
contract RelationshipManager is Ownable, ReentrancyGuard {
    IERC20 public paymentToken;

    enum RelationshipStatus {
        PROPOSED,
        ACTIVE,
        PAUSED,
        EXPIRED,
        TERMINATED
    }

    enum PricingModel {
        DAILY,
        PER_MESSAGE
    }

    struct Relationship {
        address sponsor;
        address partner;
        RelationshipStatus status;
        PricingModel pricingModel;
        uint256 rate; // Amount in payment token (e.g., USDC with 6 decimals)
        uint256 startDate;
        uint256 lastPaymentDate;
        uint256 totalPaid;
        uint256 messageCount;
    }

    mapping(bytes32 => Relationship) public relationships;
    mapping(address => bytes32[]) public userRelationships;

    event RelationshipProposed(
        bytes32 indexed relationshipId,
        address indexed sponsor,
        address indexed partner,
        PricingModel pricingModel,
        uint256 rate
    );

    event RelationshipAccepted(bytes32 indexed relationshipId);
    event RelationshipPaused(bytes32 indexed relationshipId, address pausedBy);
    event RelationshipTerminated(bytes32 indexed relationshipId, address terminatedBy);
    event PaymentMade(
        bytes32 indexed relationshipId,
        address indexed from,
        address indexed to,
        uint256 amount
    );
    event MessageSent(bytes32 indexed relationshipId, uint256 messageCount);

    constructor(address _paymentToken) Ownable(msg.sender) {
        paymentToken = IERC20(_paymentToken);
    }

    /**
     * @dev Generate relationship ID from sponsor and partner addresses
     */
    function getRelationshipId(address sponsor, address partner) public pure returns (bytes32) {
        return keccak256(abi.encodePacked(sponsor, partner));
    }

    /**
     * @dev Sponsor proposes a relationship
     */
    function proposeRelationship(
        address partner,
        PricingModel pricingModel,
        uint256 rate
    ) external {
        require(partner != address(0), "Invalid partner address");
        require(partner != msg.sender, "Cannot propose to yourself");
        require(rate > 0, "Rate must be greater than 0");

        bytes32 relationshipId = getRelationshipId(msg.sender, partner);
        require(
            relationships[relationshipId].sponsor == address(0),
            "Relationship already exists"
        );

        relationships[relationshipId] = Relationship({
            sponsor: msg.sender,
            partner: partner,
            status: RelationshipStatus.PROPOSED,
            pricingModel: pricingModel,
            rate: rate,
            startDate: 0,
            lastPaymentDate: 0,
            totalPaid: 0,
            messageCount: 0
        });

        userRelationships[msg.sender].push(relationshipId);
        userRelationships[partner].push(relationshipId);

        emit RelationshipProposed(relationshipId, msg.sender, partner, pricingModel, rate);
    }

    /**
     * @dev Partner accepts the relationship
     */
    function acceptRelationship(bytes32 relationshipId) external {
        Relationship storage rel = relationships[relationshipId];
        require(rel.partner == msg.sender, "Only partner can accept");
        require(rel.status == RelationshipStatus.PROPOSED, "Invalid status");

        rel.status = RelationshipStatus.ACTIVE;
        rel.startDate = block.timestamp;
        rel.lastPaymentDate = block.timestamp;

        emit RelationshipAccepted(relationshipId);
    }

    /**
     * @dev Pause the relationship (either party can pause)
     */
    function pauseRelationship(bytes32 relationshipId) external {
        Relationship storage rel = relationships[relationshipId];
        require(
            rel.sponsor == msg.sender || rel.partner == msg.sender,
            "Not authorized"
        );
        require(rel.status == RelationshipStatus.ACTIVE, "Relationship not active");

        rel.status = RelationshipStatus.PAUSED;

        emit RelationshipPaused(relationshipId, msg.sender);
    }

    /**
     * @dev Resume a paused relationship
     */
    function resumeRelationship(bytes32 relationshipId) external {
        Relationship storage rel = relationships[relationshipId];
        require(
            rel.sponsor == msg.sender || rel.partner == msg.sender,
            "Not authorized"
        );
        require(rel.status == RelationshipStatus.PAUSED, "Relationship not paused");

        rel.status = RelationshipStatus.ACTIVE;
    }

    /**
     * @dev Terminate the relationship (either party can terminate)
     */
    function terminateRelationship(bytes32 relationshipId) external {
        Relationship storage rel = relationships[relationshipId];
        require(
            rel.sponsor == msg.sender || rel.partner == msg.sender,
            "Not authorized"
        );
        require(
            rel.status == RelationshipStatus.ACTIVE ||
                rel.status == RelationshipStatus.PAUSED,
            "Invalid status"
        );

        rel.status = RelationshipStatus.TERMINATED;

        emit RelationshipTerminated(relationshipId, msg.sender);
    }

    /**
     * @dev Make a payment for the relationship
     */
    function makePayment(bytes32 relationshipId, uint256 amount) external nonReentrant {
        Relationship storage rel = relationships[relationshipId];
        require(rel.sponsor == msg.sender, "Only sponsor can make payment");
        require(rel.status == RelationshipStatus.ACTIVE, "Relationship not active");
        require(amount > 0, "Amount must be greater than 0");

        // For DAILY model, calculate days since last payment
        if (rel.pricingModel == PricingModel.DAILY) {
            uint256 daysSinceLastPayment = (block.timestamp - rel.lastPaymentDate) / 1 days;
            require(daysSinceLastPayment > 0, "Payment not due yet");
            uint256 expectedAmount = daysSinceLastPayment * rel.rate;
            require(amount >= expectedAmount, "Insufficient payment amount");
        }

        // Transfer payment token from sponsor to partner
        require(
            paymentToken.transferFrom(msg.sender, rel.partner, amount),
            "Payment transfer failed"
        );

        rel.totalPaid += amount;
        rel.lastPaymentDate = block.timestamp;

        emit PaymentMade(relationshipId, msg.sender, rel.partner, amount);
    }

    /**
     * @dev Record a message sent (for PER_MESSAGE pricing)
     */
    function recordMessage(bytes32 relationshipId) external {
        Relationship storage rel = relationships[relationshipId];
        require(
            rel.sponsor == msg.sender || rel.partner == msg.sender,
            "Not authorized"
        );
        require(rel.status == RelationshipStatus.ACTIVE, "Relationship not active");
        require(rel.pricingModel == PricingModel.PER_MESSAGE, "Not per-message pricing");

        rel.messageCount++;

        emit MessageSent(relationshipId, rel.messageCount);
    }

    /**
     * @dev Calculate payment due for PER_MESSAGE model
     */
    function calculatePaymentDue(bytes32 relationshipId) external view returns (uint256) {
        Relationship storage rel = relationships[relationshipId];
        
        if (rel.pricingModel == PricingModel.DAILY) {
            uint256 daysSinceLastPayment = (block.timestamp - rel.lastPaymentDate) / 1 days;
            return daysSinceLastPayment * rel.rate;
        } else {
            // For PER_MESSAGE, return unpaid messages * rate
            // This is simplified - in production you'd track paid vs unpaid messages
            return rel.messageCount * rel.rate;
        }
    }

    /**
     * @dev Get all relationships for a user
     */
    function getUserRelationships(address user) external view returns (bytes32[] memory) {
        return userRelationships[user];
    }

    /**
     * @dev Get relationship details
     */
    function getRelationship(bytes32 relationshipId)
        external
        view
        returns (
            address sponsor,
            address partner,
            RelationshipStatus status,
            PricingModel pricingModel,
            uint256 rate,
            uint256 startDate,
            uint256 totalPaid,
            uint256 messageCount
        )
    {
        Relationship storage rel = relationships[relationshipId];
        return (
            rel.sponsor,
            rel.partner,
            rel.status,
            rel.pricingModel,
            rel.rate,
            rel.startDate,
            rel.totalPaid,
            rel.messageCount
        );
    }
}
