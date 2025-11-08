// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "./AIZRegistry.sol";
import "./ConsciousDecisionLogger.sol";

/**
 * @title StrategyCandidate
 * @dev Contract for testing and graduating evolved strategies from the Genetic Evolution Engine
 */
contract StrategyCandidate is Ownable {
    struct StrategyGenome {
        bytes32 genomeId;
        string name;
        string description;
        address[] geneContracts;
        bytes4[] geneFunctions;
        uint256[] geneParameters;
        uint256 fitnessScore;
        uint256 createdAt;
        address creator;
    }

    struct StrategyTestResult {
        bytes32 testId;
        bytes32 genomeId;
        uint256 profitability;
        uint256 riskScore;
        uint256 stability;
        uint256 duration; // Test duration in seconds
        uint256 testedAt;
        bool passed;
    }

    struct GraduationProposal {
        bytes32 proposalId;
        bytes32 genomeId;
        address proposer;
        string rationale;
        uint256 proposedAt;
        uint256 votesFor;
        uint256 votesAgainst;
        bool executed;
        bool approved;
    }

    mapping(bytes32 => StrategyGenome) public strategyGenomes;
    mapping(bytes32 => StrategyTestResult) public testResults;
    mapping(bytes32 => GraduationProposal) public graduationProposals;
    mapping(bytes32 => bytes32[]) public genomeTestHistory;
    
    bytes32[] public genomeIds;
    bytes32[] public testIds;
    bytes32[] public proposalIds;
    
    uint256 public genomeCount;
    uint256 public testCount;
    uint256 public proposalCount;
    
    address public aizRegistryAddress;
    address public decisionLoggerAddress;
    uint256 public testBudgetLimit; // Maximum budget for testing in wei
    uint256 public testBudgetUsed;

    event GenomeRegistered(
        bytes32 indexed genomeId,
        string name,
        address indexed creator
    );
    
    event TestResultSubmitted(
        bytes32 indexed testId,
        bytes32 indexed genomeId,
        uint256 profitability,
        bool passed
    );
    
    event GraduationProposalCreated(
        bytes32 indexed proposalId,
        bytes32 indexed genomeId,
        address indexed proposer
    );
    
    event GraduationProposalVoted(
        bytes32 indexed proposalId,
        address indexed voter,
        bool support,
        uint256 weight
    );
    
    event StrategyGraduated(
        bytes32 indexed genomeId,
        address indexed newAIZAddress
    );

    constructor(
        address _aizRegistryAddress,
        address _decisionLoggerAddress,
        uint256 _testBudgetLimit
    ) {
        aizRegistryAddress = _aizRegistryAddress;
        decisionLoggerAddress = _decisionLoggerAddress;
        testBudgetLimit = _testBudgetLimit;
    }

    /**
     * @dev Register a new strategy genome from the Genetic Evolution Engine
     * @param _name The name of the strategy
     * @param _description The description of the strategy
     * @param _geneContracts Array of contract addresses for genes
     * @param _geneFunctions Array of function selectors for genes
     * @param _geneParameters Array of parameters for genes
     * @return bytes32 The ID of the registered genome
     */
    function registerGenome(
        string memory _name,
        string memory _description,
        address[] memory _geneContracts,
        bytes4[] memory _geneFunctions,
        uint256[] memory _geneParameters
    ) external onlyOwner returns (bytes32) {
        require(_geneContracts.length == _geneFunctions.length, "Contracts and functions length mismatch");
        require(_geneFunctions.length == _geneParameters.length, "Functions and parameters length mismatch");
        require(_geneContracts.length > 0, "Must have at least one gene");
        
        bytes32 genomeId = keccak256(abi.encodePacked(_name, msg.sender, block.timestamp));

        strategyGenomes[genomeId] = StrategyGenome({
            genomeId: genomeId,
            name: _name,
            description: _description,
            geneContracts: _geneContracts,
            geneFunctions: _geneFunctions,
            geneParameters: _geneParameters,
            fitnessScore: 0,
            createdAt: block.timestamp,
            creator: msg.sender
        });

        genomeIds.push(genomeId);
        genomeCount++;

        emit GenomeRegistered(genomeId, _name, msg.sender);

        return genomeId;
    }

    /**
     * @dev Submit test results for a strategy genome
     * @param _genomeId The ID of the genome
     * @param _profitability The profitability score (0-1000)
     * @param _riskScore The risk score (0-1000)
     * @param _stability The stability score (0-1000)
     * @param _duration The test duration in seconds
     * @return bytes32 The ID of the test result
     */
    function submitTestResult(
        bytes32 _genomeId,
        uint256 _profitability,
        uint256 _riskScore,
        uint256 _stability,
        uint256 _duration
    ) external onlyOwner returns (bytes32) {
        require(strategyGenomes[_genomeId].createdAt > 0, "Genome not registered");
        
        bytes32 testId = keccak256(abi.encodePacked(_genomeId, block.timestamp));

        // Calculate if the strategy passed (weighted average)
        // Higher profitability and stability are better, lower risk is better
        uint256 weightedScore = (_profitability * 40 + (1000 - _riskScore) * 30 + _stability * 30) / 1000;
        bool passed = weightedScore >= 700; // 70% threshold to pass

        testResults[testId] = StrategyTestResult({
            testId: testId,
            genomeId: _genomeId,
            profitability: _profitability,
            riskScore: _riskScore,
            stability: _stability,
            duration: _duration,
            testedAt: block.timestamp,
            passed: passed
        });

        genomeTestHistory[_genomeId].push(testId);
        testIds.push(testId);
        testCount++;

        // Update genome fitness score
        strategyGenomes[_genomeId].fitnessScore = weightedScore;

        emit TestResultSubmitted(testId, _genomeId, _profitability, passed);

        return testId;
    }

    /**
     * @dev Create a graduation proposal for a successful strategy
     * @param _genomeId The ID of the genome
     * @param _rationale The rationale for graduation
     * @return bytes32 The ID of the proposal
     */
    function createGraduationProposal(
        bytes32 _genomeId,
        string memory _rationale
    ) external returns (bytes32) {
        StrategyGenome storage genome = strategyGenomes[_genomeId];
        require(genome.createdAt > 0, "Genome not registered");
        require(genome.fitnessScore >= 700, "Genome fitness too low");
        
        bytes32 proposalId = keccak256(abi.encodePacked(_genomeId, msg.sender, block.timestamp));

        graduationProposals[proposalId] = GraduationProposal({
            proposalId: proposalId,
            genomeId: _genomeId,
            proposer: msg.sender,
            rationale: _rationale,
            proposedAt: block.timestamp,
            votesFor: 0,
            votesAgainst: 0,
            executed: false,
            approved: false
        });

        proposalIds.push(proposalId);
        proposalCount++;

        emit GraduationProposalCreated(proposalId, _genomeId, msg.sender);

        return proposalId;
    }

    /**
     * @dev Vote on a graduation proposal
     * @param _proposalId The ID of the proposal
     * @param _support Whether to support the proposal
     */
    function voteOnProposal(
        bytes32 _proposalId,
        bool _support
    ) external {
        GraduationProposal storage proposal = graduationProposals[_proposalId];
        require(proposal.proposedAt > 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        
        // In a real implementation, we would check the voter's reputation/weight
        uint256 voteWeight = 1;

        if (_support) {
            proposal.votesFor += voteWeight;
        } else {
            proposal.votesAgainst += voteWeight;
        }

        emit GraduationProposalVoted(_proposalId, msg.sender, _support, voteWeight);
    }

    /**
     * @dev Execute a graduation proposal if approved
     * @param _proposalId The ID of the proposal
     * @param _newAIZAddress The address of the new AIZ contract
     */
    function executeGraduation(
        bytes32 _proposalId,
        address _newAIZAddress
    ) external onlyOwner {
        GraduationProposal storage proposal = graduationProposals[_proposalId];
        require(proposal.proposedAt > 0, "Proposal not found");
        require(!proposal.executed, "Proposal already executed");
        require(proposal.votesFor > proposal.votesAgainst, "Proposal not approved");
        
        proposal.executed = true;
        proposal.approved = true;
        
        // In a real implementation, we would register the new AIZ with the AIZRegistry
        // AIZRegistry(aizRegistryAddress).registerAIZ(...);
        
        emit StrategyGraduated(proposal.genomeId, _newAIZAddress);
        
        // Log the conscious decision
        ConsciousDecisionLogger(decisionLoggerAddress).logDecision(
            "Strategy Graduated",
            abi.encodePacked("Genome ", vm.toString(proposal.genomeId), " graduated to AIZ"),
            abi.encodePacked("New AIZ Address: ", vm.toString(_newAIZAddress)),
            "evolution",
            "success"
        );
    }

    /**
     * @dev Get test history for a genome
     * @param _genomeId The genome ID
     * @return Array of test IDs
     */
    function getGenomeTestHistory(bytes32 _genomeId) external view returns (bytes32[] memory) {
        return genomeTestHistory[_genomeId];
    }

    /**
     * @dev Get strategy genome by ID
     * @param _genomeId The genome ID
     * @return StrategyGenome struct
     */
    function getStrategyGenome(bytes32 _genomeId) external view returns (StrategyGenome memory) {
        return strategyGenomes[_genomeId];
    }

    /**
     * @dev Get test result by ID
     * @param _testId The test ID
     * @return StrategyTestResult struct
     */
    function getTestResult(bytes32 _testId) external view returns (StrategyTestResult memory) {
        return testResults[_testId];
    }

    /**
     * @dev Get graduation proposal by ID
     * @param _proposalId The proposal ID
     * @return GraduationProposal struct
     */
    function getGraduationProposal(bytes32 _proposalId) external view returns (GraduationProposal memory) {
        return graduationProposals[_proposalId];
    }

    /**
     * @dev Get all genome IDs
     * @return Array of genome IDs
     */
    function getAllGenomeIds() external view returns (bytes32[] memory) {
        return genomeIds;
    }

    /**
     * @dev Get all test IDs
     * @return Array of test IDs
     */
    function getAllTestIds() external view returns (bytes32[] memory) {
        return testIds;
    }

    /**
     * @dev Get all proposal IDs
     * @return Array of proposal IDs
     */
    function getAllProposalIds() external view returns (bytes32[] memory) {
        return proposalIds;
    }
}